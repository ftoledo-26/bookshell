#!/usr/bin/env python3
"""
seed_books.py — Importa libros desde Open Library API a la base de datos de Bookshell.
Las portadas se descargan, convierten a WEBP y se guardan como "{titulo}.webp".

Dependencias:
    pip install requests Pillow pymysql

Uso básico:
    python seed_books.py --db-password tu_password

Ejemplos:
    python seed_books.py --subject fantasy --limit 20 --db-password secret
    python seed_books.py --subject "science fiction" --limit 15 --db-password root \\
        --images-dir /var/www/back/storage/app/public/portadas
    python seed_books.py --subject historia --limit 10 --db-host 127.0.0.1 \\
        --db-name laravel --db-user laravel --db-password secret
"""

import argparse
import io
import re
import sys
import time
import unicodedata
from pathlib import Path

try:
    import pymysql
except ImportError:
    sys.exit("Falta pymysql. Instálalo con:  pip install pymysql")

try:
    import requests
except ImportError:
    sys.exit("Falta requests. Instálalo con:  pip install requests")

try:
    from PIL import Image
except ImportError:
    sys.exit("Falta Pillow. Instálalo con:  pip install Pillow")


SEARCH_URL = "https://openlibrary.org/search.json"
WORK_URL   = "https://openlibrary.org{key}.json"
COVER_URL  = "https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"

# Mapeo de subjects de Open Library → enum de la BD
GENRE_MAP = {
    "fantasy fiction":       "fantasia",
    "fantasy":               "fantasia",
    "magic":                 "fantasia",
    "dragons":               "fantasia",
    "science fiction":       "ciencia_ficcion",
    "cyberpunk":             "ciencia_ficcion",
    "dystopian":             "ciencia_ficcion",
    "dystopia":              "ciencia_ficcion",
    "space opera":           "ciencia_ficcion",
    "horror fiction":        "terror",
    "horror":                "terror",
    "gothic fiction":        "terror",
    "vampires":              "terror",
    "ghost stories":         "terror",
    "mystery fiction":       "misterio",
    "mystery":               "misterio",
    "detective":             "misterio",
    "crime fiction":         "misterio",
    "thriller":              "misterio",
    "suspense":              "misterio",
    "romance":               "romance",
    "love stories":          "romance",
    "historical fiction":    "historia",
    "history":               "historia",
    "world war":             "historia",
    "biography":             "biografia",
    "autobiography":         "biografia",
    "memoirs":               "biografia",
    "poetry":                "poesia",
    "poems":                 "poesia",
    "essays":                "ensayo",
    "philosophy":            "ensayo",
    "self-help":             "ensayo",
    "literary fiction":      "novela",
    "fiction":               "novela",
    "classic literature":    "novela",
    "novels":                "novela",
}


def sanitize_filename(title: str) -> str:
    """Elimina caracteres inválidos del título para usarlo como nombre de archivo."""
    normalized = unicodedata.normalize("NFKC", title)
    sanitized  = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", normalized)
    sanitized  = sanitized.strip(". ")
    return sanitized[:180] or "libro_sin_titulo"


def detect_genre(subjects: list) -> str:
    """Devuelve el valor de enum más apropiado para los subjects de Open Library."""
    if not subjects:
        return "otro"
    subjects_lower = [s.lower() for s in subjects]
    for keyword, genre in GENRE_MAP.items():
        if any(keyword in s for s in subjects_lower):
            return genre
    return "otro"


def fetch_description(key: str, session: requests.Session) -> str:
    """Obtiene la descripción de la obra desde el endpoint de Open Library Works."""
    try:
        resp = session.get(WORK_URL.format(key=key), timeout=10)
        if resp.status_code != 200:
            return ""
        data = resp.json()
        desc = data.get("description", "")
        if isinstance(desc, dict):
            desc = desc.get("value", "")
        return (desc or "").strip()[:2000]
    except Exception:
        return ""


def download_and_convert_cover(
    cover_id: int,
    title: str,
    images_dir: Path,
    session: requests.Session,
) -> str | None:
    """
    Descarga la portada de Open Library, la convierte a WEBP y la guarda
    como {titulo_sanitizado}.webp en images_dir.
    Devuelve el nombre del archivo o None si falla.
    """
    filename  = sanitize_filename(title) + ".webp"
    dest_path = images_dir / filename

    if dest_path.exists():
        print(f"  [imagen] Ya existe: {filename}")
        return filename

    try:
        url  = COVER_URL.format(cover_id=cover_id)
        resp = session.get(url, timeout=20)
        if resp.status_code != 200 or len(resp.content) < 512:
            print(f"  [imagen] Sin portada disponible (cover_id={cover_id})")
            return None
        img = Image.open(io.BytesIO(resp.content)).convert("RGB")
        img.save(dest_path, "WEBP", quality=85, method=4)
        print(f"  [imagen] Guardada: {filename}")
        return filename
    except Exception as exc:
        print(f"  [imagen] Error al procesar la portada: {exc}")
        return None


def book_exists(cursor, titulo: str) -> bool:
    cursor.execute("SELECT 1 FROM libros WHERE titulo = %s LIMIT 1", (titulo,))
    return cursor.fetchone() is not None


def get_portada_column(cursor, db_name: str) -> str | None:
    """Devuelve 'portada' o 'foto' según cuál columna exista en la tabla libros."""
    cursor.execute(
        """
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'libros'
          AND COLUMN_NAME IN ('portada', 'foto')
        LIMIT 1
        """,
        (db_name,),
    )
    row = cursor.fetchone()
    return row[0] if row else None


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Importa libros desde Open Library a la BD de Bookshell",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    # Conexión a la BD
    parser.add_argument("--db-host",     default="127.0.0.1", help="Host MySQL")
    parser.add_argument("--db-port",     default=3306, type=int, help="Puerto MySQL")
    parser.add_argument("--db-name",     default="laravel",    help="Nombre de la BD")
    parser.add_argument("--db-user",     default="laravel",    help="Usuario de la BD")
    parser.add_argument("--db-password", default="secret",     help="Contraseña de la BD")
    # Búsqueda en la API
    parser.add_argument("--subject", default="fiction",
                        help="Materia/género a buscar (ej: fantasy, history, romance)")
    parser.add_argument("--limit", default=20, type=int,
                        help="Máximo de libros a importar")
    parser.add_argument("--language", default="",
                        help="Filtrar por idioma (ej: spa, eng). Vacío = todos")
    # Imágenes
    parser.add_argument(
        "--images-dir",
        default="./storage/app/public/portadas",
        help="Directorio donde guardar las imágenes .webp",
    )
    args = parser.parse_args()

    images_dir = Path(args.images_dir)
    images_dir.mkdir(parents=True, exist_ok=True)
    print(f"Directorio de imágenes: {images_dir.resolve()}")

    # ── Conexión a la BD ──────────────────────────────────────────────────────
    try:
        conn = pymysql.connect(
            host=args.db_host,
            port=args.db_port,
            db=args.db_name,
            user=args.db_user,
            password=args.db_password,
            charset="utf8mb4",
        )
    except pymysql.Error as exc:
        sys.exit(f"Error conectando a la BD: {exc}")

    print(f"Conectado a MySQL: {args.db_host}:{args.db_port}/{args.db_name}")

    with conn.cursor() as cur:
        portada_col = get_portada_column(cur, args.db_name)

    if portada_col:
        print(f"Columna de portada detectada: '{portada_col}'")
    else:
        print("Aviso: no se encontró columna 'portada' ni 'foto' — las imágenes se "
              "descargarán pero no se registrarán en la BD.")

    # ── Petición a Open Library ───────────────────────────────────────────────
    session = requests.Session()
    session.headers["User-Agent"] = (
        "Bookshell-TFG/1.0 (franciscomanueltoledo@gmail.com)"
    )

    print(f"\nBuscando '{args.subject}' en Open Library (objetivo: {args.limit} libros)…")
    params: dict = {
        "subject": args.subject,
        "limit":   min(args.limit * 3, 150),  # pedimos más por si algunos no tienen portada
        "fields":  "key,title,author_name,first_publish_year,cover_i,subject,publisher",
    }
    if args.language:
        params["language"] = args.language

    try:
        resp = session.get(SEARCH_URL, params=params, timeout=20)
        resp.raise_for_status()
        raw_books = resp.json().get("docs", [])
    except requests.RequestException as exc:
        conn.close()
        sys.exit(f"Error contactando Open Library: {exc}")

    print(f"  {len(raw_books)} resultados devueltos por la API.\n")

    # ── Procesado e inserción ─────────────────────────────────────────────────
    inserted = 0
    skipped  = 0

    with conn.cursor() as cursor:
        for raw in raw_books:
            if inserted >= args.limit:
                break

            titulo = (raw.get("title") or "").strip()
            if not titulo:
                skipped += 1
                continue

            if book_exists(cursor, titulo):
                print(f"[skip] '{titulo}' ya existe en la BD.")
                skipped += 1
                continue

            print(f"[{inserted + 1:>3}] {titulo}")

            autor_list = raw.get("author_name") or []
            autor      = ", ".join(autor_list[:2]) if autor_list else "Desconocido"

            publishers = raw.get("publisher") or []
            editorial  = publishers[0][:255] if publishers else None

            anio_raw = raw.get("first_publish_year")
            anio     = str(anio_raw) if anio_raw else None

            subjects = raw.get("subject") or []
            genero   = detect_genre(subjects)

            # Descripción desde el endpoint de la obra (llamada extra)
            key         = raw.get("key", "")
            descripcion = fetch_description(key, session) if key else ""
            if key:
                time.sleep(0.25)  # respetar el rate limit de Open Library

            # Portada
            cover_id    = raw.get("cover_i")
            portada_url = None
            if cover_id:
                filename = download_and_convert_cover(
                    cover_id, titulo, images_dir, session
                )
                if filename:
                    portada_url = f"/storage/portadas/{filename}"
                time.sleep(0.2)

            # INSERT
            try:
                if portada_col:
                    cursor.execute(
                        f"""
                        INSERT INTO libros
                            (titulo, autor, editorial, anio_publicacion, genero,
                             descripcion, {portada_col}, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                        """,
                        (titulo, autor, editorial, anio, genero,
                         descripcion or None, portada_url),
                    )
                else:
                    cursor.execute(
                        """
                        INSERT INTO libros
                            (titulo, autor, editorial, anio_publicacion, genero,
                             descripcion, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
                        """,
                        (titulo, autor, editorial, anio, genero, descripcion or None),
                    )
                conn.commit()
                print(f"       → BD: insertado  |  género: {genero}")
                inserted += 1
            except pymysql.Error as exc:
                conn.rollback()
                print(f"       → BD: error — {exc}")
                skipped += 1

    conn.close()
    print(f"\n✓ Completado: {inserted} libros importados, {skipped} omitidos.")


if __name__ == "__main__":
    main()
