#!/usr/bin/env python3
"""
import_books.py — Importa libros en español desde Open Library a la BD de bookshell.
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
import json
import os
import re
import subprocess
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

# ── Géneros → términos de búsqueda (q=) para Open Library en español ─────────
GENEROS = {
    "novela":          ["novela ficcion", "literatura contemporanea"],
    "fantasia":        ["fantasia novela", "magia aventura"],
    "ciencia_ficcion": ["ciencia ficcion", "ficcion cientifica"],
    "terror":          ["terror novela", "horror suspense"],
    "misterio":        ["misterio policial", "novela policiaca"],
    "romance":         ["romance novela", "novela romantica"],
    "historia":        ["novela historica", "historia ficcion"],
    "biografia":       ["biografia", "autobiografia memorias"],
    "poesia":          ["poesia", "poemas lirica"],
    "ensayo":          ["ensayo filosofia", "ensayo literario"],
    "otro":            ["aventura novela", "cuentos relatos"],
}

OL_SEARCH = "https://openlibrary.org/search.json"
OL_COVER  = "https://covers.openlibrary.org/b/id/{}-L.jpg"

ENV_FILE      = "/var/www/back/.env"
DEFAULT_IMG   = "/var/www/back/public/libros"
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


def ensure_writable(img_dir: Path) -> bool:
    """Intenta que img_dir sea escribible; usa sudo si hace falta."""
    try:
        img_dir.mkdir(parents=True, exist_ok=True)
    except PermissionError:
        subprocess.run(["sudo", "mkdir", "-p", str(img_dir)], capture_output=True)

    if os.access(img_dir, os.W_OK):
        return True

    result = subprocess.run(["sudo", "chmod", "777", str(img_dir)], capture_output=True, text=True)
    if result.returncode == 0:
        print(f"[i] Permisos ajustados en {img_dir}")
        return os.access(img_dir, os.W_OK)

    print(f"[!] Sin acceso a {img_dir}. Ejecuta manualmente: sudo chmod 777 {img_dir}")
    return False


def download_cover(url: str, dest: Path) -> bool:
    try:
        r = requests.get(url, timeout=(5, 15))
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


def fetch_ol(query: str, limit: int = 100, offset: int = 0) -> list:
    """Busca en Open Library con q= + language=spa para obtener títulos en español."""
    params = {
        "q":        query,
        "language": "spa",
        "limit":    min(limit, 100),
        "offset":   offset,
        "fields":   "title,author_name,publisher,first_publish_year,cover_i,first_sentence",
    }
    try:
        r = requests.get(OL_SEARCH, params=params, timeout=25)
        r.raise_for_status()
        return r.json().get("docs", [])
    except Exception as e:
        print(f"  [!] Open Library error ({query}): {e}")
        return []


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Importar libros en español desde Open Library")
    parser.add_argument("--total",   type=int, default=DEFAULT_TOTAL,
                        help="Número total de libros a importar (default: 1000)")
    parser.add_argument("--img-dir", default=DEFAULT_IMG,
                        help="Directorio donde guardar las portadas")
    parser.add_argument("--env",     default=ENV_FILE,
                        help="Ruta al fichero .env de Laravel")
    parser.add_argument("--skip-covers", action="store_true",
                        help="No descargar portadas (mas rapido, foto queda NULL)")
    args = parser.parse_args()

    img_dir = Path(args.img_dir)
    covers_enabled = not args.skip_covers
    if covers_enabled:
        covers_enabled = ensure_writable(img_dir)
        if not covers_enabled:
            print("[!] Portadas desactivadas — continuando sin descargar imagenes")

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

    cur.execute("SHOW COLUMNS FROM libros")
    db_columns = {row[0] for row in cur.fetchall()}
    has_anio = "anio_publicacion" in db_columns
    if not has_anio:
        print("[!] Columna anio_publicacion no existe en la BD — se omitira del INSERT")

    cur.execute("SELECT LOWER(titulo) FROM libros")
    existing = {row[0] for row in cur.fetchall()}
    print(f"[i] Libros ya en BD: {len(existing)}")

    per_genre   = max(10, args.total // len(GENEROS))
    inserted    = 0
    sin_portada = 0
    pendientes  = []

    for genero, queries in GENEROS.items():
        if inserted >= args.total:
            break
        genre_inserted = 0

        for query in queries:
            if inserted >= args.total or genre_inserted >= per_genre:
                break
            print(f"\n[→] {genero}: buscando '{query}'...")
            offset = 0

            while inserted < args.total and genre_inserted < per_genre:
                docs = fetch_ol(query, limit=100, offset=offset)
                if not docs:
                    break

                for doc in docs:
                    if inserted >= args.total or genre_inserted >= per_genre:
                        break

                    titulo = (doc.get("title") or "").strip()
                    if not titulo or titulo.lower() in existing:
                        continue

                    autor    = ", ".join((doc.get("author_name") or [])[:2]) or "Desconocido"
                    anio     = str(doc.get("first_publish_year") or "")
                    cover_id = doc.get("cover_i")
                    fs       = doc.get("first_sentence") or ""
                    if isinstance(fs, dict):
                        fs = fs.get("value", "")
                    descripcion = str(fs).strip()[:1000]

                    # ── Portada ───────────────────────────────────────────────
                    foto_path = None
                    if covers_enabled:
                        if cover_id:
                            ext      = ".webp" if PIL_AVAILABLE else ".jpg"
                            filename = sanitize(titulo) + ext
                            dest     = img_dir / filename
                            if dest.exists() or download_cover(OL_COVER.format(cover_id), dest):
                                foto_path = f"libros/{filename}"
                        if foto_path is None:
                            pendientes.append({
                                "titulo": titulo,
                                "autor":  autor,
                                "anio_publicacion": anio if has_anio else None,
                                "genero": genero,
                            })
                            sin_portada += 1
                            print(f"  · sin portada → pendiente: {titulo[:65]}")
                            continue

                    # ── Insertar ──────────────────────────────────────────────
                    try:
                        if has_anio:
                            cur.execute(
                                "INSERT INTO libros (titulo, autor, anio_publicacion, genero, descripcion, foto, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())",
                                (titulo, autor, anio, genero, descripcion, foto_path),
                            )
                        else:
                            cur.execute(
                                "INSERT INTO libros (titulo, autor, genero, descripcion, foto, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, NOW(), NOW())",
                                (titulo, autor, genero, descripcion, foto_path),
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

                offset += len(docs)
                time.sleep(0.3)

    cur.close()
    conn.close()

    if pendientes:
        pendientes_path = img_dir / "lista_libros_pendientes.json"
        if pendientes_path.exists():
            try:
                with open(pendientes_path, encoding="utf-8") as f:
                    prev = json.load(f)
                titulos_prev = {p["titulo"].lower() for p in prev}
                pendientes = prev + [p for p in pendientes if p["titulo"].lower() not in titulos_prev]
            except Exception:
                pass
        with open(pendientes_path, "w", encoding="utf-8") as f:
            json.dump(pendientes, f, ensure_ascii=False, indent=2)
        print(f"[i] {len(pendientes)} pendientes guardados en {pendientes_path}")

    print(f"\n{'='*60}")
    print(f"✅  Libros insertados : {inserted}")
    print(f"⚠   Sin portada       : {sin_portada}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
