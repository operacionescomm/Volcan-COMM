const express = require('express');
const path = require('path');
const { SCOPES, REPORT_SCOPE_MEMBERS, getScope } = require('./config/operations');
const { getSlideConfig } = require('./config/slides');
const { normalizeIncReq, normalizeAtenciones, normalizeYauliAtenciones } = require('./services/normalizers');
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
    version: '0.3.0',
    activeSlides: [
      { number: 12, key: 'incidentes-requerimientos' },
      { number: 14, key: 'atenciones' },
      { number: 15, key: 'yauli-atenciones' },
      { number: 16, key: 'chungar-atenciones' },
      { number: 17, key: 'cerro-pasco-atenciones' },
      { number: 18, key: 'romina-atenciones' }
    ],
    tests: {
      slide12: '/test-slide12-png?scope=VOLCAN',
      slide14: '/test-slide14-png',
      slide15: '/test-slide15-png',
      slide16: '/test-slide16-png',
      slide17: '/test-slide17-png',
      slide18: '/test-slide18-png'
    }
  });
});

app.get('/health', (req, res) => res.json({ ok: true, service: APP_NAME, version: '0.3.0', timestamp: new Date().toISOString() }));

app.get('/browser-status', (req, res) => {
  const executablePath = resolveChromeExecutable();
  res.status(executablePath ? 200 : 503).json({ ok: Boolean(executablePath), executablePath: executablePath || null, cacheDirectory: process.env.PUPPETEER_CACHE_DIR || null });
});

app.get('/scopes', (req, res) => res.json({ ok: true, scopes: SCOPES, reportScopeMembers: REPORT_SCOPE_MEMBERS }));

function requireApiKey(req, res, next) {
  if (!API_KEY) return next();
  const provided = String(req.get('x-api-key') || '').trim();
  if (provided === API_KEY) return next();
  return res.status(401).json({ ok: false, error: 'No autorizado' });
}

function buildSlide12Data(body = {}) {
  const scope = getScope(body.scope || 'VOLCAN', 'INC_REQ');
  return normalizeIncReq(body, scope);
}

function normalizeUnidadAtenciones(body = {}, unidadNombre, titulo) {
  const normalized = normalizeYauliAtenciones({
    ...body,
    titulo: body.titulo || titulo
  });

  return {
    ...normalized,
    unidadNombre: body.unidadNombre || unidadNombre
  };
}

app.get('/test-slide12-png', async (req, res) => {
  try {
    const slide = getSlideConfig(12);
    const png = await renderTemplateToPng(slide.template, getSampleSlide12(req.query.scope || 'VOLCAN'));
    res.type('png').end(png);
  } catch (error) { console.error('[test-slide12-png]', error); res.status(500).send(String(error)); }
});

app.post('/render/slide12', requireApiKey, async (req, res) => {
  try {
    const slide = getSlideConfig(12);
    const png = await renderTemplateToPng(slide.template, buildSlide12Data(req.body || {}));
    res.type('png').end(png);
  } catch (error) { console.error('[render/slide12]', error); res.status(500).json({ ok: false, error: String(error) }); }
});

function getSampleSlide12(scopeKey) {
  const scope = getScope(scopeKey, 'INC_REQ');
  const rows = [
    { unidad: 'Andaychagua', incidentes: 71, requerimientos: 169 },
    { unidad: 'San Cristóbal - Carahuacra', incidentes: 59, requerimientos: 119 },
    { unidad: 'Cerro Pasco', incidentes: 1, requerimientos: 67 },
    { unidad: 'Chungar', incidentes: 54, requerimientos: 211 },
    { unidad: 'Romina', incidentes: 3, requerimientos: 94 },
    { unidad: 'Ticlio', incidentes: 22, requerimientos: 177 },
    { unidad: 'San Cristóbal', incidentes: 47, requerimientos: 85 }
  ];
  return normalizeIncReq({ scope: scope.key, periodo: 'Mayo 2026', resumenRows: rows.filter(row => scope.minas.includes(row.unidad)) }, scope);
}

app.get('/test-slide14', async (req, res) => {
  try { res.type('html').send(await renderTemplateToHtml('atenciones', getSampleSlide14())); }
  catch (error) { console.error('[test-slide14]', error); res.status(500).send(String(error)); }
});

app.get('/test-slide14-png', async (req, res) => {
  try { res.type('png').end(await renderTemplateToPng('atenciones', getSampleSlide14())); }
  catch (error) { console.error('[test-slide14-png]', error); res.status(500).send(String(error)); }
});

app.post('/render/slide14', requireApiKey, async (req, res) => {
  try { res.type('png').end(await renderTemplateToPng('atenciones', normalizeAtenciones(req.body || {}))); }
  catch (error) { console.error('[render/slide14]', error); res.status(500).json({ ok: false, error: String(error) }); }
});

function getSampleSlide14() {
  return normalizeAtenciones({
    periodo: 'may-26',
    seriesUM: [
      ['jun-25',620,227,129,0,976], ['jul-25',609,227,114,0,950], ['ago-25',562,256,80,0,898], ['sept-25',611,239,81,8,939],
      ['oct-25',603,242,83,32,960], ['nov-25',613,238,83,68,1002], ['dic-25',709,263,86,64,1122], ['ene-26',599,206,83,54,942],
      ['feb-26',530,185,79,95,889], ['mar-26',619,260,66,102,1047], ['abr-26',577,237,77,97,988], ['may-26',617,265,68,97,1047]
    ],
    seriesImSup: [
      ['jun-25',613,363,976], ['jul-25',623,327,950], ['ago-25',633,265,898], ['sept-25',705,234,939], ['oct-25',686,274,960], ['nov-25',670,332,1002],
      ['dic-25',752,370,1122], ['ene-26',679,263,942], ['feb-26',659,230,889], ['mar-26',712,335,1047], ['abr-26',742,246,988], ['may-26',696,351,1047]
    ]
  });
}

app.get('/test-slide15', async (req, res) => {
  try { res.type('html').send(await renderTemplateToHtml('yauli-atenciones', getSampleSlide15())); }
  catch (error) { console.error('[test-slide15]', error); res.status(500).send(String(error)); }
});

app.get('/test-slide15-png', async (req, res) => {
  try { res.type('png').end(await renderTemplateToPng('yauli-atenciones', getSampleSlide15())); }
  catch (error) { console.error('[test-slide15-png]', error); res.status(500).send(String(error)); }
});

app.post('/render/slide15', requireApiKey, async (req, res) => {
  try { res.type('png').end(await renderTemplateToPng('yauli-atenciones', normalizeYauliAtenciones(req.body || {}))); }
  catch (error) { console.error('[render/slide15]', error); res.status(500).json({ ok: false, error: String(error) }); }
});

function getSampleSlide15() {
  return normalizeYauliAtenciones({
    periodo: 'jul-26',
    totalMes: 630,
    acumulado12: 7320,
    im: 483,
    sup: 147,
    promedioDia: 20.3,
    seriesTotal: [
      ['ago-25',562],['sept-25',611],['oct-25',603],['nov-25',613],['dic-25',709],['ene-26',599],
      ['feb-26',530],['mar-26',619],['abr-26',577],['may-26',617],['jun-26',650],['jul-26',630]
    ],
    seriesImSup: [
      ['ago-25',414,148,562],['sept-25',474,137,611],['oct-25',450,153,603],['nov-25',441,172,613],
      ['dic-25',521,188,709],['ene-26',452,147,599],['feb-26',423,107,530],['mar-26',450,169,619],
      ['abr-26',466,111,577],['may-26',464,153,617],['jun-26',463,187,650],['jul-26',483,147,630]
    ]
  });
}

function getSampleUnidadAtenciones(unidadNombre) {
  return normalizeUnidadAtenciones({
    periodo: 'jul-26',
    totalMes: 0,
    acumulado12: 0,
    im: 0,
    sup: 0,
    promedioDia: 0,
    seriesTotal: [],
    seriesImSup: [],
    resumen1: `Vista de prueba para U.M. ${unidadNombre}.`,
    resumen2: 'Los valores reales serán enviados automáticamente desde Google Apps Script.',
    resumen3: 'Endpoint activo y preparado para recibir la data de la unidad minera.'
  }, unidadNombre, `CANTIDAD DE ATENCIONES – U.M. ${unidadNombre.toUpperCase()}`);
}

function registerUnidadSlide(slideNumber, unidadNombre) {
  const titulo = `CANTIDAD DE ATENCIONES – U.M. ${unidadNombre.toUpperCase()}`;

  app.get(`/test-slide${slideNumber}`, async (req, res) => {
    try {
      const slide = getSlideConfig(slideNumber);
      res.type('html').send(await renderTemplateToHtml(slide.template, getSampleUnidadAtenciones(unidadNombre)));
    } catch (error) {
      console.error(`[test-slide${slideNumber}]`, error);
      res.status(500).send(String(error));
    }
  });

  app.get(`/test-slide${slideNumber}-png`, async (req, res) => {
    try {
      const slide = getSlideConfig(slideNumber);
      res.type('png').end(await renderTemplateToPng(slide.template, getSampleUnidadAtenciones(unidadNombre)));
    } catch (error) {
      console.error(`[test-slide${slideNumber}-png]`, error);
      res.status(500).send(String(error));
    }
  });

  app.post(`/render/slide${slideNumber}`, requireApiKey, async (req, res) => {
    try {
      const slide = getSlideConfig(slideNumber);
      const data = normalizeUnidadAtenciones(req.body || {}, unidadNombre, titulo);
      res.type('png').end(await renderTemplateToPng(slide.template, data));
    } catch (error) {
      console.error(`[render/slide${slideNumber}]`, error);
      res.status(500).json({ ok: false, error: String(error) });
    }
  });
}

registerUnidadSlide(16, 'Chungar');
registerUnidadSlide(17, 'Cerro Pasco');
registerUnidadSlide(18, 'Romina');

app.listen(PORT, () => console.log(`${APP_NAME} v0.3 activo en http://localhost:${PORT}`));

async function shutdown(signal) {
  console.log(`[shutdown] ${signal}`);
  await closeBrowser();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
