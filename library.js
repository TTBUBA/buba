(() => {
  const list = document.getElementById('book-list');
  const search = document.getElementById('book-search');
  const count = document.getElementById('book-count');
  const readingCount = document.getElementById('reading-count');
  const PROGRESS_KEY = 'buba-reading-progress';

  let books = [];

  function readProgress() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); }
    catch { return {}; }
  }

  // Ricostruisce l'albero usando il percorso effettivo dei PDF nel repository.
  function createTree(items) {
    const root = { folders: new Map(), files: [] };

    items.forEach(book => {
      const normalizedPath = String(book.path || '').replaceAll('\\', '/');
      const parts = normalizedPath.split('/').filter(Boolean);
      const pdfIndex = parts.lastIndexOf('pdf');
      const relativeParts = pdfIndex >= 0 ? parts.slice(pdfIndex + 1) : parts;
      if (!relativeParts.length) return;

      let current = root;
      relativeParts.slice(0, -1).forEach(folderName => {
        if (!current.folders.has(folderName)) {
          current.folders.set(folderName, { folders: new Map(), files: [] });
        }
        current = current.folders.get(folderName);
      });
      current.files.push({ ...book, filename: book.filename || relativeParts.at(-1) });
    });

    return root;
  }

  function countFiles(node) {
    let total = node.files.length;
    node.folders.forEach(folder => { total += countFiles(folder); });
    return total;
  }

  function makeFileEntry(book, progress) {
    const entry = document.createElement('div');
    entry.className = 'book-entry';

    const info = document.createElement('div');
    info.className = 'book-info';
    const title = document.createElement('h3');
    title.textContent = book.filename || `${book.title}.pdf`;
    const meta = document.createElement('p');
    meta.textContent = [book.author, book.category].filter(Boolean).join(' · ') || 'Documento PDF';
    info.append(title, meta);

    const link = document.createElement('a');
    link.className = 'book-open';
    link.href = `reader.html?book=${encodeURIComponent(book.path)}`;
    link.textContent = progress[book.id]?.page > 1
      ? `Continua · pag. ${progress[book.id].page}`
      : 'Apri PDF';

    entry.append(info, link);
    return entry;
  }

  function renderFolder(name, node, progress, query, isRoot = false) {
    const matchingFiles = node.files.filter(book => {
      const searchable = `${book.filename || book.title} ${book.title || ''} ${book.author || ''} ${book.category || ''} ${name}`;
      return searchable.toLocaleLowerCase('it').includes(query);
    });
    const childFolders = [...node.folders.entries()]
      .map(([folderName, folderNode]) => [folderName, folderNode, renderFolder(folderName, folderNode, progress, query)])
      .filter(([, , element]) => element !== null);

    if (query && matchingFiles.length === 0 && childFolders.length === 0) return null;

    const section = document.createElement('details');
    section.className = isRoot ? 'folder-section root-folder' : 'folder-section';
    // Le cartelle principali restano aperte al primo caricamento; con una ricerca
    // vengono aperti anche i rami che contengono risultati.
    section.open = isRoot || Boolean(query);

    const summary = document.createElement('summary');
    summary.className = 'folder-summary';
    const folderLabel = document.createElement('span');
    folderLabel.className = 'folder-name';
    folderLabel.textContent = name;
    const folderCount = document.createElement('span');
    folderCount.className = 'folder-count';
    const total = query ? matchingFiles.length + childFolders.reduce((sum, [, child]) => sum + countFiles(child), 0) : countFiles(node);
    folderCount.textContent = `${total} ${total === 1 ? 'PDF' : 'PDF'}`;
    summary.append(folderLabel, folderCount);
    section.append(summary);

    const contents = document.createElement('div');
    contents.className = 'folder-contents';
    childFolders.forEach(([, , element]) => contents.append(element));
    matchingFiles
      .sort((a, b) => (a.filename || a.title).localeCompare(b.filename || b.title, 'it', { sensitivity: 'base' }))
      .forEach(book => contents.append(makeFileEntry(book, progress)));

    if (!contents.childElementCount) {
      const empty = document.createElement('p');
      empty.className = 'folder-empty';
      empty.textContent = 'Nessun PDF in questa cartella.';
      contents.append(empty);
    }
    section.append(contents);
    return section;
  }

  function render() {
    const query = search.value.trim().toLocaleLowerCase('it');
    const progress = readProgress();
    const started = books.filter(book => progress[book.id]?.page > 1).length;
    const tree = createTree(books);

    count.textContent = `${books.length} ${books.length === 1 ? 'documento' : 'documenti'}`;
    readingCount.textContent = started ? `${started} in lettura` : '';
    list.replaceChildren();

    if (!books.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Il catalogo è vuoto. Inserisci i PDF in library/pdf e genera il catalogo.';
      list.append(empty);
      return;
    }

    const treeView = renderFolder('pdf', tree, progress, query, true);
    if (treeView) list.append(treeView);
    else {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Nessun PDF corrisponde alla ricerca.';
      list.append(empty);
    }
  }

  search.addEventListener('input', render);

  fetch('library/books.json')
    .then(response => {
      if (!response.ok) throw new Error('Catalogo non trovato');
      return response.json();
    })
    .then(data => {
      books = Array.isArray(data) ? data : [];
      render();
    })
    .catch(() => {
      count.textContent = 'Catalogo non disponibile';
      list.textContent = 'Non riesco a caricare library/books.json. Genera il catalogo e avvia il sito tramite un server web locale.';
      list.className = 'book-list empty-state';
    });
})();
