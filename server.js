const express = require('express');
const path = require('path');
const { SCOPES, getScope } = require('./config/operations');
const { SLIDES, getSlideConfig } = require('./config/slides');
const { normalizeIncReq } = require('./services/normalizers');
const { renderTemplateToHtml, renderTemplateToPng } = require('./services/renderer');
const { closeBrowser, resolveChromeExecutable } = require('./services/browser');

const app = express();
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || 'Volcan-COMM Visual Engine';
const API_KEY = String(process.env.RENDER_API_KEY || '').trim();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: APP_NAME,
    version: '0.1.0',
    activeSlides: Object.entries(SLIDES)
      .filter(([, config]) => config.active)
      .map(([number, config]) => ({ number: Number(number), ...config })),
    scopes: Object.keys(SCOPES),
    tests: {
      html: '/test-slide12?scope=VOLCAN',
      png: '/test-slide12-png?scope=VOLCAN'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: APP_NAME,
    version: '0.1.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/browser-status', (req, res) => {
  const executablePath = resolveChromeExecutable();
  res.status(executablePath ? 200 : 503).json({
    ok: Boolean(executablePath),
    executablePath: executablePath || null,
    cacheDirectory: process.env.PUPPETEER_CACHE_DIR || null
  });
});

app.get('/scopes', (req, res) => {
  res.json({
    ok: true,
    scopes: SCOPES
  });
});

function requireApiKey(req, res, next) {
  if (!API_KEY) return next();
  const provided = String(req.get('x-api-key') || '').trim();
  if (provided === API_KEY) return next();
  return res.status(401).json({ ok: false, error: 'No autorizado' });
}

function buildSlide12Data(body = {}) {
  const scope = getScope(body.scope || 'VOLCAN');
  return normalizeIncReq(body, scope);
}

app.get('/test-slide12', async (req, res) => {
  try {
    const slide = getSlideConfig(12);
    const sample = getSampleSlide12(req.query.scope || 'VOLCAN');
    const html = await renderTemplateToHtml(slide.template, sample);
    res.type('html').send(html);
  } catch (error) {
    console.error('[test-slide12]', error);
    res.status(500).send(String(error));
  }
});

app.get('/test-slide12-png', async (req, res) => {
  try {
    const slide = getSlideConfig(12);
    const sample = getSampleSlide12(req.query.scope || 'VOLCAN');
    const png = await renderTemplateToPng(slide.template, sample);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', png.length);
    res.end(png);
  } catch (error) {
    console.error('[test-slide12-png]', error);
    res.status(500).send(String(error));
  }
});

app.post('/render/slide12', requireApiKey, async (req, res) => {
  try {
    const slide = getSlideConfig(12);
    const data = buildSlide12Data(req.body || {});
    const png = await renderTemplateToPng(slide.template, data);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', png.length);
    res.end(png);
  } catch (error) {
    console.error('[render/slide12]', error);
    res.status(500).json({ ok: false, error: String(error) });
  }
});

function getSampleSlide12(scopeKey) {
  const scope = getScope(scopeKey);

  const rows = [
    { unidad: 'Andaychagua', incidentes: 71, requerimientos: 169 },
    { unidad: 'San Cristóbal - Carahuacra', incidentes: 59, requerimientos: 119 },
    { unidad: 'Cerro Pasco', incidentes: 1, requerimientos: 67 },
    { unidad: 'Chungar', incidentes: 54, requerimientos: 211 }
  ];

  const selectedRows = scope.tipo === 'consolidado'
    ? rows
    : rows.filter(row => scope.minas.includes(row.unidad));

  return normalizeIncReq({
    scope: scope.key,
    periodo: 'Mayo 2026',
    resumenRows: selectedRows
  }, scope);
}

app.listen(PORT, () => {
  console.log(`${APP_NAME} activo en http://localhost:${PORT}`);
});

async function shutdown(signal) {
  console.log(`[shutdown] ${signal}`);
  await closeBrowser();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
