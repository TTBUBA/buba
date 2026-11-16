#!/usr/bin/env python3
"""Scansiona ricorsivamente library/pdf e genera library/books.json."""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "library" / "pdf"
OUTPUT = ROOT / "library" / "books.json"

def title_from_filename(path: Path) -> str:
    name = path.stem.replace("_", " ").replace("-", " ")
    return re.sub(r"\s+", " ", name).strip().title()

def main():
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    books = []
    for pdf in sorted((item for item in PDF_DIR.rglob("*") if item.is_file() and item.suffix.lower() == ".pdf"), key=lambda p: str(p).lower()):
        relative = pdf.relative_to(ROOT).as_posix()
        # L'ID deriva dal percorso relativo: stabile e univoco nella libreria.
        book_id = re.sub(r"[^a-z0-9]+", "-", relative.lower()).strip("-")
        books.append({
            "id": book_id,
            "title": title_from_filename(pdf),
            "author": "",
            "category": "",
            "path": relative
        })
    OUTPUT.write_text(json.dumps(books, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Catalogo aggiornato: {len(books)} PDF -> {OUTPUT.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
