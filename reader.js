import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';

const params = new URLSearchParams(location.search);
const file = params.get('book');
const canvas = document.getElementById('pdf-canvas');
const context = canvas.getContext('2d');
const message = document.getElementById('reader-message');
const pageNumber = document.getElementById('page-number');
const pageCount = document.getElementById('page-count');
const title = document.getElementById('reader-title');
const zoomLevel = document.getElementById('zoom-level');
const previous = document.getElementById('previous-page');
const next = document.getElementById('next-page');

const PROGRESS_KEY = 'buba-reading-progress';
let pdf = null;
let page = 1;
let scale = 1;
let renderTask = null;
let bookId = file || '';

function progressData() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); }
  catch { return {}; }
}

function saveProgress() {
  const data = progressData();
  data[bookId] = { page, updatedAt: new Date().toISOString() };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

async function renderPage() {
  if (!pdf) return;
  if (renderTask) {
    try { renderTask.cancel(); } catch {}
  }
  const current = await pdf.getPage(page);
  const viewport = current.getViewport({ scale });
  const outputScale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.height = `${Math.floor(viewport.height)}px`;

  renderTask = current.render({
    canvasContext: context,
    viewport,
    transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null
  });
  try {
    await renderTask.promise;
    pageNumber.textContent = page;
    pageCount.textContent = pdf.numPages;
    zoomLevel.textContent = `${Math.round(scale * 100)}%`;
    previous.disabled = page <= 1;
    next.disabled = page >= pdf.numPages;
    message.textContent = '';
    saveProgress();
  } catch (error) {
    if (error?.name !== 'RenderingCancelledException') throw error;
  }
}

previous.addEventListener('click', () => { if (page > 1) { page--; renderPage(); } });
next.addEventListener('click', () => { if (pdf && page < pdf.numPages) { page++; renderPage(); } });
document.getElementById('zoom-in').addEventListener('click', () => {
  scale = Math.min(2.5, scale + .15); renderPage();
});
document.getElementById('zoom-out').addEventListener('click', () => {
  scale = Math.max(.5, scale - .15); renderPage();
});

if (!file || !file.startsWith('library/pdf/')) {
  message.textContent = 'Documento non valido. Torna alla Library e apri un PDF dal catalogo.';
} else {
  title.textContent = decodeURIComponent(file.split('/').pop()).replace(/\.pdf$/i, '');
  bookId = file;
  try {
    pdf = await pdfjsLib.getDocument(file).promise;
    const saved = progressData()[bookId];
    if (saved?.page && saved.page <= pdf.numPages) page = saved.page;
    await renderPage();
  } catch (error) {
    console.error(error);
    message.textContent = 'Impossibile aprire il PDF. Verifica che il file esista e che il sito sia avviato tramite un server web locale.';
  }
}
