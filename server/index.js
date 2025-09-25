import express from 'express';
import cors from 'cors';
import JSZip from 'jszip';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const VERSIONS_FILE = path.join(DATA_DIR, 'versions.json');

async function ensureData() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }); } catch {}
  try { await fs.access(VERSIONS_FILE); } catch { await fs.writeFile(VERSIONS_FILE, '[]', 'utf8'); }
}

async function readVersions() {
  await ensureData();
  const txt = await fs.readFile(VERSIONS_FILE, 'utf8');
  try { return JSON.parse(txt); } catch { return []; }
}

async function writeVersions(list) {
  await ensureData();
  await fs.writeFile(VERSIONS_FILE, JSON.stringify(list, null, 2), 'utf8');
}

function genId() {
  return (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)).toUpperCase();
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Upload endpoint (MVP: accepts JSON payload with {html, css, js})
app.post('/api/upload', (req, res) => {
  const { html, css, js } = req.body || {};
  if (typeof html !== 'string' || typeof css !== 'string' || typeof js !== 'string') {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  return res.json({ ok: true, sizes: { html: html.length, css: css.length, js: js.length } });
});

// Export single-file HTML
app.post('/api/export/single', (req, res) => {
  const { html = '', css = '', js = '' } = req.body || {};
  const doc = `<!doctype html>\n<html>\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Section Export</title>\n    <style>html,body{margin:0;padding:0} ${css}</style>\n  </head>\n  <body>\n    ${html}\n    <script>try{${js}}catch(e){console.error(e)}<\/script>\n  </body>\n</html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="section.html"');
  res.send(doc);
});

// Export ZIP with manifest.json
app.post('/api/export/zip', async (req, res) => {
  const { html = '', css = '', js = '', tokens = {} } = req.body || {};
  const zip = new JSZip();

  const indexHtml = `<!doctype html>\n<html>\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <title>Section Export</title>\n    <link rel=\"stylesheet\" href=\"styles.css\" />\n  </head>\n  <body>\n    ${html}\n    <script src=\"script.js\"></script>\n  </body>\n</html>`;

  const manifest = {
    name: 'Section Styler Export',
    createdAt: new Date().toISOString(),
    files: ['index.html', 'styles.css', 'script.js'],
    tokens,
  };

  zip.file('index.html', indexHtml);
  zip.file('styles.css', css);
  zip.file('script.js', js);
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  const buf = await zip.generateAsync({ type: 'nodebuffer' });
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="section.zip"');
  res.send(buf);
});

// Versions API
app.get('/api/versions', async (_req, res) => {
  const list = await readVersions();
  res.json(list);
});

app.post('/api/versions', async (req, res) => {
  const { name, tokens } = req.body || {};
  if (!tokens || typeof tokens !== 'object') return res.status(400).json({ error: 'tokens required' });
  const list = await readVersions();
  const item = { id: genId(), name, tokens, createdAt: new Date().toISOString() };
  list.unshift(item);
  await writeVersions(list);
  res.json(item);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
