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

  function render() {
    const query = search.value.trim().toLocaleLowerCase('it');
    const filtered = books.filter(book =>
      `${book.title} ${book.author || ''} ${book.category || ''}`
        .toLocaleLowerCase('it').includes(query)
    );

    count.textContent = `${filtered.length} ${filtered.length === 1 ? 'documento' : 'documenti'}`;
    const progress = readProgress();
    const started = books.filter(book => progress[book.id]?.page > 1).length;
    readingCount.textContent = started ? `${started} in lettura` : '';

    list.replaceChildren();
    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = books.length ? 'Nessun PDF corrisponde alla ricerca.' : 'Il catalogo è vuoto. Inserisci i PDF in library/pdf e genera il catalogo.';
      list.append(empty);
      return;
    }

    filtered.forEach(book => {
      const entry = document.createElement('article');
      entry.className = 'book-entry';

      const info = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = book.title;
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
      list.append(entry);
    });
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
      list.innerHTML = '<p class="empty-state">Non riesco a caricare library/books.json. Genera il catalogo e avvia il sito tramite un server web locale.</p>';
    });
})();
