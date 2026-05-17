#!/usr/bin/env python3
"""Descarga portadas de libros desde Open Library y las guarda como WebP en public/libros/"""

import os, sys, io, time, requests

try:
    from PIL import Image
except ImportError:
    os.system("pip3 install Pillow --quiet --break-system-packages 2>/dev/null || pip3 install Pillow --quiet")
    from PIL import Image

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'libros')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# slug (nombre del archivo) + términos de búsqueda en Open Library
LIBROS = [
    {"slug": "el-gran-gatsby",                    "buscar": "The Great Gatsby Fitzgerald"},
    {"slug": "cien-anos-de-soledad",              "buscar": "Cien años de soledad Garcia Marquez"},
    {"slug": "1984",                               "buscar": "1984 George Orwell"},
    {"slug": "el-senor-de-los-anillos",           "buscar": "The Lord of the Rings Tolkien"},
    {"slug": "don-quijote-de-la-mancha",          "buscar": "Don Quixote Cervantes"},
    {"slug": "harry-potter-y-la-piedra-filosofal","buscar": "Harry Potter Philosopher Stone Rowling"},
    {"slug": "el-nombre-de-la-rosa",              "buscar": "The Name of the Rose Umberto Eco"},
    {"slug": "la-sombra-del-viento",              "buscar": "La Sombra del Viento Ruiz Zafon"},
    {"slug": "el-principito",                     "buscar": "The Little Prince Saint-Exupery"},
    {"slug": "crimen-y-castigo",                  "buscar": "Crime and Punishment Dostoevsky"},
    {"slug": "orgullo-y-prejuicio",               "buscar": "Pride and Prejudice Jane Austen"},
    {"slug": "el-alquimista",                     "buscar": "The Alchemist Paulo Coelho"},
    {"slug": "matar-un-ruisenor",                 "buscar": "To Kill a Mockingbird Harper Lee"},
    {"slug": "el-hobbit",                         "buscar": "The Hobbit Tolkien"},
    {"slug": "frankenstein",                      "buscar": "Frankenstein Mary Shelley"},
    {"slug": "dracula",                           "buscar": "Dracula Bram Stoker"},
    {"slug": "los-juegos-del-hambre",             "buscar": "The Hunger Games Suzanne Collins"},
    {"slug": "el-codigo-da-vinci",                "buscar": "The Da Vinci Code Dan Brown"},
    {"slug": "el-retrato-de-dorian-gray",         "buscar": "The Picture of Dorian Gray Oscar Wilde"},
    {"slug": "hamlet",                            "buscar": "Hamlet Shakespeare"},
]

def buscar_portada(query):
    url = "https://openlibrary.org/search.json"
    try:
        r = requests.get(url, params={"q": query, "limit": 5}, timeout=10)
        docs = r.json().get("docs", [])
        for doc in docs:
            if doc.get("cover_i"):
                return f"https://covers.openlibrary.org/b/id/{doc['cover_i']}-L.jpg"
    except Exception as e:
        print(f"  Error buscando: {e}")
    return None

def descargar_y_guardar(cover_url, output_path):
    try:
        r = requests.get(cover_url, timeout=15)
        r.raise_for_status()
        img = Image.open(io.BytesIO(r.content)).convert("RGB")
        img.save(output_path, "WEBP", quality=85)
        return True
    except Exception as e:
        print(f"  Error descargando: {e}")
        return False

ok, skip, fail = 0, 0, 0

for libro in LIBROS:
    slug = libro["slug"]
    dest = os.path.join(OUTPUT_DIR, f"{slug}.webp")

    if os.path.exists(dest):
        print(f"[SKIP] {slug}.webp ya existe")
        skip += 1
        continue

    print(f"[...] {slug}", end=" ", flush=True)
    cover_url = buscar_portada(libro["buscar"])

    if not cover_url:
        print("→ sin portada en Open Library")
        fail += 1
        continue

    if descargar_y_guardar(cover_url, dest):
        print(f"→ OK")
        ok += 1
    else:
        fail += 1

    time.sleep(0.5)  # respetar rate limit de Open Library

print(f"\nResultado: {ok} descargadas, {skip} ya existían, {fail} fallidas")
print(f"Carpeta: {os.path.abspath(OUTPUT_DIR)}")
