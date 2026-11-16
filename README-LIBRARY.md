# BUBA Library

La Library riproduce la gerarchia reale delle directory presenti in `library/pdf/`: cartelle e sottocartelle vengono mostrate come sezioni espandibili e ogni PDF compare nella propria posizione. I nomi dei file vengono mantenuti esattamente come nella directory.

## Aggiungere PDF

1. Copia i file PDF dentro `library/pdf/`, organizzandoli nelle cartelle e sottocartelle che preferisci.
2. Dalla cartella principale del progetto esegui:

   ```bash
   python scripts/build_catalog.py
   ```

3. Pubblica su GitHub Pages anche i PDF e il file `library/books.json`.

Lo script esplora ricorsivamente la directory e salva nel catalogo il percorso relativo e il nome originale di ogni PDF. La pagina `library.html` ricostruisce da questi percorsi l'albero delle cartelle; non serve creare manualmente le cartelle nel sito.

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
