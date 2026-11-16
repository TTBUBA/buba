# BUBA Library

La Library aggiunge una raccolta PDF al sito BUBA mantenendo il layout originale.

## Aggiungere PDF

1. Copia i file PDF dentro `library/pdf/` (sono supportate anche le sottocartelle).
2. Dalla cartella principale del progetto esegui:

   ```bash
   python scripts/build_catalog.py
   ```

3. Pubblica su GitHub Pages anche i PDF e il file `library/books.json`.

La pagina `library.html` legge il catalogo JSON. Il lettore `reader.html` apre il PDF tramite il suo percorso relativo nel repository. Non viene richiesto di caricare i documenti su servizi esterni.

## Avvio locale

Non aprire `library.html` con doppio clic (`file://`): i browser bloccano normalmente le richieste `fetch` locali. Avvia un server statico dalla cartella principale:

```bash
python -m http.server 8000
```

Poi visita `http://localhost:8000/library.html`.

## Lettore PDF

Il rendering usa PDF.js 4.10.38 caricato da cdnjs. I PDF, il catalogo e il sito restano nella repository; per il lettore è necessaria una connessione per scaricare la libreria PDF.js dal CDN.

## Nota sui PDF

GitHub Pages pubblica i file che inserisci e committi nella repository: non è uno spazio privato. Assicurati di avere i diritti per distribuire online i PDF.
