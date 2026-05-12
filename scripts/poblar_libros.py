#!/usr/bin/env python3
"""
Pobla la base de datos con libros desde Open Library.
Uso: python3 poblar_libros.py [limite]
     python3 poblar_libros.py 1000   (default: 1000)
"""

import os, sys, io, re, time, subprocess, unicodedata
import requests

# ── Auto-install dependencies ──────────────────────────────────────────
def pip_install(*pkgs):
    subprocess.run(
        [sys.executable, '-m', 'pip', 'install', '--quiet', '--break-system-packages', *pkgs],
        check=False, capture_output=True
    )
    subprocess.run(
        [sys.executable, '-m', 'pip', 'install', '--quiet', *pkgs],
        check=False, capture_output=True
    )

try:
    import pymysql
except ImportError:
    print("Instalando pymysql...")
    pip_install('pymysql')
    import pymysql

try:
    from PIL import Image
except ImportError:
    print("Instalando Pillow...")
    pip_install('Pillow')
    from PIL import Image

# ── Config ─────────────────────────────────────────────────────────────
LIMITE = int(sys.argv[1]) if len(sys.argv) > 1 else 1000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.join(BASE_DIR, '..')
ENV_PATH = os.path.join(ROOT_DIR, '.env')
OUTPUT_DIR = os.path.join(ROOT_DIR, 'public', 'libros')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Read .env ──────────────────────────────────────────────────────────
def read_env(path):
    env = {}
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if '=' in line and not line.startswith('#'):
                    k, _, v = line.partition('=')
                    env[k.strip()] = v.strip().strip('"').strip("'")
    except FileNotFoundError:
        print(f"ERROR: .env no encontrado en {path}")
        sys.exit(1)
    return env

env = read_env(ENV_PATH)
DB_HOST = env.get('DB_HOST', '127.0.0.1')
DB_PORT = int(env.get('DB_PORT', 3306))
DB_NAME = env.get('DB_DATABASE', 'laravel')
DB_USER = env.get('DB_USERNAME', 'laravel')
DB_PASS = env.get('DB_PASSWORD', '')

# ── Connect DB ─────────────────────────────────────────────────────────
print(f"Conectando a MySQL {DB_HOST}:{DB_PORT}/{DB_NAME}...")
try:
    conn = pymysql.connect(
        host=DB_HOST, port=DB_PORT,
        user=DB_USER, password=DB_PASS,
        database=DB_NAME, charset='utf8mb4',
        autocommit=False,
        connect_timeout=10,
    )
except Exception as e:
    print(f"ERROR de conexion: {e}")
    sys.exit(1)

cursor = conn.cursor()

cursor.execute("SELECT LOWER(titulo) FROM libros")
existing = {row[0] for row in cursor.fetchall()}
print(f"  {len(existing)} libros ya en BD. Objetivo: +{LIMITE}")

# ── Helpers ────────────────────────────────────────────────────────────
def to_slug(text):
    text = unicodedata.normalize('NFD', str(text))
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text).strip('-')
    return text[:80]

def download_cover(cover_id, dest_path):
    url = f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"
    try:
        r = requests.get(url, timeout=20)
        r.raise_for_status()
        if len(r.content) < 1000:
            return False
        img = Image.open(io.BytesIO(r.content)).convert("RGB")
        img.save(dest_path, "WEBP", quality=85)
        return True
    except Exception:
        return False

def map_genero(subjects):
    if not subjects:
        return 'otro'
    s = ' '.join(str(x) for x in subjects).lower()
    if any(x in s for x in ['fantasy', 'fantasia', 'magic', 'magia', 'wizard']):
        return 'fantasia'
    if any(x in s for x in ['science fiction', 'sci-fi', 'dystop', 'space opera', 'cyberpunk']):
        return 'ciencia_ficcion'
    if any(x in s for x in ['mystery', 'detective', 'crime fiction', 'thriller', 'noir']):
        return 'misterio'
    if any(x in s for x in ['romance', 'love stories', 'chick lit', 'amor']):
        return 'romance'
    if any(x in s for x in ['horror', 'terror', 'ghost', 'vampire', 'supernatural fiction']):
        return 'terror'
    if any(x in s for x in ['fiction', 'novel', 'novela', 'literary']):
        return 'novela'
    return 'otro'

# ── Subjects a consultar (subject → genero_default) ────────────────────
SUBJECTS = [
    ('fiction',                         'novela'),
    ('fantasy',                         'fantasia'),
    ('science_fiction',                 'ciencia_ficcion'),
    ('mystery_and_detective_stories',   'misterio'),
    ('romance',                         'romance'),
    ('horror_tales',                    'terror'),
    ('historical_fiction',              'novela'),
    ('adventure_stories',               'novela'),
    ('dystopian_fiction',               'ciencia_ficcion'),
    ('classics',                        'novela'),
    ('thrillers',                       'misterio'),
    ('epic_fantasy',                    'fantasia'),
    ('young_adult_fiction',             'novela'),
    ('literary_fiction',                'novela'),
    ('spy_stories',                     'misterio'),
    ('graphic_novels',                  'otro'),
    ('short_stories',                   'otro'),
    ('mythology',                       'otro'),
    ('western_stories',                 'novela'),
    ('love_stories',                    'romance'),
]

SESSION = requests.Session()
SESSION.headers['User-Agent'] = 'BookshellSeeder/1.0 (educational project; contact franciscomanueltoledo@gmail.com)'

# ── Main loop ──────────────────────────────────────────────────────────
inserted = 0
per_subject = max(50, LIMITE // len(SUBJECTS) + 1)

for subject, genero_default in SUBJECTS:
    if inserted >= LIMITE:
        break

    offset = 0
    subject_count = 0
    print(f"\n── {subject} (objetivo: {per_subject}) ──")

    while inserted < LIMITE and subject_count < per_subject:
        try:
            r = SESSION.get(
                f"https://openlibrary.org/subjects/{subject}.json",
                params={'limit': 100, 'offset': offset},
                timeout=20
            )
            r.raise_for_status()
            works = r.json().get('works', [])
        except Exception as e:
            print(f"  API error ({subject} offset={offset}): {e}")
            break

        if not works:
            break

        for work in works:
            if inserted >= LIMITE or subject_count >= per_subject:
                break

            titulo = (work.get('title') or '').strip()
            if not titulo or titulo.lower() in existing:
                continue

            authors = work.get('authors', [])
            autor = authors[0]['name'].strip() if authors else 'Desconocido'

            year = work.get('first_publish_year')
            anio = str(year)[:4] if year and str(year).isdigit() else None

            subjects_list = work.get('subject', [])
            genero = map_genero(subjects_list) if subjects_list else genero_default

            cover_id = work.get('cover_id')
            foto = None
            if cover_id:
                fn = to_slug(titulo) + '.webp'
                dest = os.path.join(OUTPUT_DIR, fn)
                if os.path.exists(dest):
                    foto = '/libros/' + fn
                else:
                    if download_cover(cover_id, dest):
                        foto = '/libros/' + fn
                    time.sleep(0.25)

            try:
                cursor.execute(
                    """INSERT INTO libros
                       (titulo, autor, editorial, anio_publicacion, genero, descripcion, foto, created_at, updated_at)
                       VALUES (%s, %s, NULL, %s, %s, NULL, %s, NOW(), NOW())""",
                    (titulo[:255], autor[:255], anio, genero, foto)
                )
                conn.commit()
                existing.add(titulo.lower())
                inserted += 1
                subject_count += 1
                cover_mark = '🖼' if foto else ' '
                print(f"  [{inserted:>5}/{LIMITE}] {cover_mark} {titulo[:60]}")
            except Exception as e:
                conn.rollback()

        offset += 100
        time.sleep(1.0)

cursor.close()
conn.close()
print(f"\n✓ Total insertados: {inserted} libros nuevos")
print(f"  Portadas guardadas en: {os.path.abspath(OUTPUT_DIR)}")
