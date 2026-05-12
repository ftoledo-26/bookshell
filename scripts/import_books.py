#!/usr/bin/env python3
"""
import_books.py — Importa libros en español desde Google Books a la BD de bookshell.
Las portadas se descargan y convierten a WebP con el nombre del titulo.

Requiere:
    pip3 install requests Pillow pymysql

Uso:
    python3 scripts/import_books.py
    python3 scripts/import_books.py --total 500
    python3 scripts/import_books.py --total 1000 --img-dir /var/www/back/public/libros
    python3 scripts/import_books.py --env /ruta/.env --total 200
"""

import argparse
import re
import time
import unicodedata
from io import BytesIO
from pathlib import Path

import pymysql
import requests

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("[!] Pillow no instalado — portadas se guardan como JPG sin convertir")

# ── Géneros del enum → términos de búsqueda en español ───────────────────────
GENEROS = {
    "novela":          ["novela ficción", "novela contemporánea"],
    "fantasia":        ["fantasía novela", "magia aventura fantasía"],
    "ciencia_ficcion": ["ciencia ficción", "ficción científica"],
    "terror":          ["terror novela", "horror suspense"],
    "misterio":        ["misterio novela", "novela policíaca crimen"],
    "romance":         ["romance novela", "novela romántica amor"],
    "historia":        ["historia novela", "novela histórica"],
    "biografia":       ["biografía", "autobiografía memorias"],
    "poesia":          ["poesía", "poemas lírica"],
    "ensayo":          ["ensayo filosófico", "filosofía ensayo"],
    "otro":            ["aventura novela", "cuentos relatos"],
}

GB_SEARCH    = "https://www.googleapis.com/books/v1/volumes"
ENV_FILE     = "/var/www/back/.env"
DEFAULT_IMG  = "/var/www/back/public/libros"
DEFAULT_TOTAL = 1000


# ── Helpers ───────────────────────────────────────────────────────────────────

def parse_env(path: str) -> dict:
    env = {}
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            env[key.strip()] = val.strip().strip('"').strip("'")
    return env


def sanitize(title: str) -> str:
    """Título → nombre de fichero seguro, sin acentos ni caracteres raros."""
    nfkd = unicodedata.normalize("NFKD", title)
    ascii_str = "".join(c for c in nfkd if not unicodedata.combining(c))
    lower = ascii_str.lower()
    clean = re.sub(r"[^a-z0-9\s_-]", "", lower)
    slug  = re.sub(r"[\s-]+", "_", clean.strip())
    return slug[:120] or "libro"


def download_cover(url: str, dest: Path) -> bool:
    try:
        r = requests.get(url, timeout=15)
        if r.status_code != 200 or len(r.content) < 600:
            return False
        if PIL_AVAILABLE:
            img = Image.open(BytesIO(r.content)).convert("RGB")
            img.save(dest, "WEBP", quality=85)
        else:
            dest.write_bytes(r.content)
        return True
    except Exception as e:
        print(f"    [!] Portada error: {e}")
        return False


def fetch_gb(query: str, max_results: int = 40, start_index: int = 0) -> list:
    params = {
        "q":           query,
        "langRestrict": "es",
        "maxResults":  min(max_results, 40),
        "startIndex":  start_index,
        "printType":   "books",
        "orderBy":     "relevance",
    }
    try:
        r = requests.get(GB_SEARCH, params=params, timeout=25)
        r.raise_for_status()
        return r.json().get("items", [])
    except Exception as e:
        print(f"  [!] Google Books error ({query}): {e}")
        return []


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Importar libros en español desde Google Books")
    parser.add_argument("--total",   type=int, default=DEFAULT_TOTAL,
                        help="Número total de libros a importar (default: 1000)")
    parser.add_argument("--img-dir", default=DEFAULT_IMG,
                        help="Directorio donde guardar las portadas")
    parser.add_argument("--env",     default=ENV_FILE,
                        help="Ruta al fichero .env de Laravel")
    args = parser.parse_args()

    img_dir = Path(args.img_dir)
    img_dir.mkdir(parents=True, exist_ok=True)

    # ── Conexión BD ───────────────────────────────────────────────────────────
    print(f"[i] Leyendo credenciales de {args.env}")
    env = parse_env(args.env)
    conn = pymysql.connect(
        host=env["DB_HOST"],
        port=int(env.get("DB_PORT", 3306)),
        user=env["DB_USERNAME"],
        password=env["DB_PASSWORD"],
        database=env["DB_DATABASE"],
        charset="utf8mb4",
        autocommit=False,
    )
    cur = conn.cursor()

    cur.execute("SELECT LOWER(titulo) FROM libros")
    existing = {row[0] for row in cur.fetchall()}
    print(f"[i] Libros ya en BD: {len(existing)}")

    per_genre   = max(10, args.total // len(GENEROS))
    inserted    = 0
    sin_portada = 0

    for genero, queries in GENEROS.items():
        if inserted >= args.total:
            break
        genre_inserted = 0

        for query in queries:
            if inserted >= args.total or genre_inserted >= per_genre:
                break
            print(f"\n[→] {genero}: buscando '{query}'...")
            start_index = 0

            while inserted < args.total and genre_inserted < per_genre:
                items = fetch_gb(query, max_results=40, start_index=start_index)
                if not items:
                    break

                for item in items:
                    if inserted >= args.total or genre_inserted >= per_genre:
                        break

                    vi     = item.get("volumeInfo", {})
                    titulo = (vi.get("title") or "").strip()
                    if not titulo or titulo.lower() in existing:
                        continue

                    autor       = ", ".join((vi.get("authors") or [])[:2]) or "Desconocido"
                    editorial   = (vi.get("publisher") or "")[:255]
                    pub_date    = vi.get("publishedDate") or ""
                    anio        = pub_date[:4] if pub_date else ""
                    descripcion = (vi.get("description") or "")[:2000]

                    # ── Portada ───────────────────────────────────────────────
                    foto_path  = None
                    img_links  = vi.get("imageLinks", {})
                    cover_url  = img_links.get("thumbnail") or img_links.get("smallThumbnail")
                    if cover_url:
                        cover_url = (cover_url
                                     .replace("zoom=1", "zoom=2")
                                     .replace("&edge=curl", "")
                                     .replace("http://", "https://"))
                        ext      = ".webp" if PIL_AVAILABLE else ".jpg"
                        filename = sanitize(titulo) + ext
                        dest     = img_dir / filename
                        if dest.exists() or download_cover(cover_url, dest):
                            foto_path = f"libros/{filename}"
                        else:
                            sin_portada += 1
                    else:
                        sin_portada += 1

                    # ── Insertar ──────────────────────────────────────────────
                    try:
                        cur.execute(
                            """
                            INSERT INTO libros
                                (titulo, autor, editorial, anio_publicacion,
                                 genero, descripcion, foto, created_at, updated_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                            """,
                            (titulo, autor, editorial, anio,
                             genero, descripcion, foto_path),
                        )
                        conn.commit()
                        existing.add(titulo.lower())
                        inserted += 1
                        genre_inserted += 1
                        icon = "🖼" if foto_path else "·"
                        print(f"  {icon} [{inserted:04d}] {titulo[:65]}")
                    except Exception as e:
                        conn.rollback()
                        print(f"  [!] Error inserting '{titulo[:40]}': {e}")

                start_index += len(items)
                time.sleep(0.3)   # respetar rate-limit de Google Books

    cur.close()
    conn.close()

    print(f"\n{'='*60}")
    print(f"✅  Libros insertados : {inserted}")
    print(f"⚠   Sin portada       : {sin_portada}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
