const express = require('express');
const path = require('path');
const { SCOPES, REPORT_SCOPE_MEMBERS, getScope } = require('./config/operations');
const { getSlideConfig } = require('./config/slides');
const { normalizeIncReq, normalizeAtenciones, normalizeYauliAtenciones } = require('./services/normalizers');
const { normalizeIncReqTrend } = require('./services/incidentes-requerimientos-trend');
const { normalizeIncReqUnidad } = require('./services/incidentes-requerimientos-unidad');
const { renderTemplateToHtml, renderTemplateToPng } = require('./services/renderer');
const { closeBrowser, resolveChromeExecutable } = require('./services/browser');

const app = express();
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || 'Volcan-COMM Visual Engine';
const API_KEY = String(process.env.RENDER_API_KEY || '').trim();
const VERSION = '0.7.1';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: APP_NAME,
    version: VERSION,
    activeSlides: [
      { number: 12, key: 'incidentes-requerimientos' },
      { number: 14, key: 'atenciones' },
      { number: 15, key: 'yauli-atenciones' },
      { number: 16, key: 'chungar-atenciones' },
      { number: 17, key: 'cerro-pasco-atenciones' },
      { number: 18, key: 'romina-atenciones' },
      { number: 19, key: 'incidentes-requerimientos-volcan' },
      { number: 20, key: 'incidentes-requerimientos-yauli' },
      { number: 21, key: 'incidentes-requerimientos-scr-car' },
      { number: 22, key: 'incidentes-requerimientos-andaychagua' },
      { number: 23, key: 'incidentes-requerimientos-ticlio' },
      { number: 24, key: 'incidentes-requerimientos-chungar' },
      { number: 25, key: 'incidentes-requerimientos-cerro-pasco' },
      { number: 26, key: 'incidentes-requerimientos-romina' }
    ],
    tests: {
      slide12: '/test-slide12-png?scope=VOLCAN',
      slide14: '/test-slide14-png',
      slide15: '/test-slide15-png',
      slide16: '/test-slide16-png',
      slide17: '/test-slide17-png',
      slide18: '/test-slide18-png',
      slide19: '/test-slide19-png',
      slide20: '/test-slide20-png',
      slide21: '/test-slide21-png',
      slide22: '/test-slide22-png',
      slide23: '/test-slide23-png',
      slide24: '/test-slide24-png',
      slide25: '/test-slide25-png',
      slide26: '/test-slide26-png'
    }
  });
});

app.get('/health', (req, res) => res.json({ ok: true, service: APP_NAME, version: VERSION, timestamp: new Date().toISOString() }));

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
  const normalized = normalizeYauliAtenciones({ ...body, titulo: body.titulo || titulo });
  return { ...normalized, unidadNombre: body.unidadNombre || unidadNombre };
}

function normalizeIncReqClassic(body = {}, unidadNombre, tituloVisual) {
  return {
    ...normalizeIncReqUnidad(body, unidadNombre),
    tituloVisual: body.tituloVisual || tituloVisual
  };
}

function hasUnitPayload(body = {}) {
  return Boolean(
    (Array.isArray(body.seriesTotal) && body.seriesTotal.length) ||
    (Array.isArray(body.seriesImSup) && body.seriesImSup.length) ||
    Number(body.totalMes) > 0 || Number(body.im) > 0 || Number(body.sup) > 0
  );
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
      ['feb-26',530,185,79,95,889], ['mar-26',619,260,66,102,1047], ['abr-26',577,237,77,97,988], ['may-26',696,351,1047]
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
    periodo: 'jul-26', totalMes: 630, acumulado12: 7320, im: 483, sup: 147, promedioDia: 20.3,
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
  const key = String(unidadNombre || '').toLowerCase();
  const titulo = `CANTIDAD DE ATENCIONES – U.M. ${unidadNombre.toUpperCase()}`;
  const presets = {
    chungar: {
      periodo: 'jul-26', totalMes: 339, acumulado12: 3059, im: 245, sup: 94, promedioDia: 10.9,
      seriesTotal: [['ago-25',256],['sept-25',239],['oct-25',242],['nov-25',238],['dic-25',263],['ene-26',206],['feb-26',185],['mar-26',260],['abr-26',237],['may-26',265],['jun-26',329],['jul-26',339]],
      seriesImSup: [['jun-25',166,61,227],['jul-25',168,59,227],['ago-25',178,78,256],['sept-25',176,63,239],['oct-25',170,72,242],['nov-25',172,66,238],['dic-25',191,72,263],['ene-26',133,73,206],['feb-26',126,59,185],['mar-26',174,86,260],['abr-26',179,58,237],['may-26',157,108,265]],
      resumen1: 'En julio 2026, U.M. Chungar registró 339 atenciones.', resumen2: 'Interior Mina alcanzó 245 atenciones y Superficie 94.', resumen3: 'Se cargó una muestra manual de julio mientras se conecta el Apps Script.'
    },
    'cerro pasco': {
      periodo: 'jul-26', totalMes: 39, acumulado12: 856, im: 21, sup: 18, promedioDia: 1.3,
      seriesTotal: [['ago-25',80],['sept-25',81],['oct-25',83],['nov-25',83],['dic-25',86],['ene-26',83],['feb-26',79],['mar-26',66],['abr-26',77],['may-26',68],['jun-26',31],['jul-26',39]],
      seriesImSup: [['ago-25',41,39,80],['sept-25',52,29,81],['oct-25',37,46,83],['nov-25',22,61,83],['dic-25',10,76,86],['ene-26',47,36,83],['feb-26',25,54,79],['mar-26',40,26,66],['abr-26',30,47,77],['may-26',32,36,68],['jun-26',13,18,31],['jul-26',21,18,39]],
      resumen1: 'En julio 2026, U.M. Cerro Pasco registró 39 atenciones.', resumen2: 'Interior Mina alcanzó 21 atenciones y Superficie 18.', resumen3: 'Se cargó una muestra manual de julio mientras se conecta el Apps Script.'
    },
    romina: {
      periodo: 'jul-26', totalMes: 100, acumulado12: 819, im: 76, sup: 24, promedioDia: 3.2,
      seriesTotal: [['sept-25',8],['oct-25',32],['nov-25',68],['dic-25',64],['ene-26',54],['feb-26',95],['mar-26',102],['abr-26',97],['may-26',97],['jun-26',102],['jul-26',100]],
      seriesImSup: [['sept-25',3,5,8],['oct-25',29,3,32],['nov-25',35,33,68],['dic-25',30,34,64],['ene-26',47,7,54],['feb-26',85,10,95],['mar-26',48,54,102],['abr-26',67,30,97],['may-26',43,54,97],['jun-26',83,19,102],['jul-26',76,24,100]],
      resumen1: 'En julio 2026, U.M. Romina registró 100 atenciones.', resumen2: 'Interior Mina alcanzó 76 atenciones y Superficie 24.', resumen3: 'Se cargó una muestra manual de julio mientras se conecta el Apps Script.'
    }
  };
  const fallback = { periodo:'jul-26', totalMes:0, acumulado12:0, im:0, sup:0, promedioDia:0, seriesTotal:[], seriesImSup:[], resumen1:`Vista de prueba para U.M. ${unidadNombre}.`, resumen2:'Los valores reales serán enviados automáticamente desde Google Apps Script.', resumen3:'Endpoint activo y preparado para recibir la data de la unidad minera.' };
  return normalizeUnidadAtenciones({ ...(presets[key] || fallback), titulo }, unidadNombre, titulo);
}

function registerUnidadSlide(slideNumber, unidadNombre) {
  const titulo = `CANTIDAD DE ATENCIONES – U.M. ${unidadNombre.toUpperCase()}`;
  app.get(`/test-slide${slideNumber}`, async (req, res) => {
    try { const slide = getSlideConfig(slideNumber); res.type('html').send(await renderTemplateToHtml(slide.template, getSampleUnidadAtenciones(unidadNombre))); }
    catch (error) { console.error(`[test-slide${slideNumber}]`, error); res.status(500).send(String(error)); }
  });
  app.get(`/test-slide${slideNumber}-png`, async (req, res) => {
    try { const slide = getSlideConfig(slideNumber); res.type('png').end(await renderTemplateToPng(slide.template, getSampleUnidadAtenciones(unidadNombre))); }
    catch (error) { console.error(`[test-slide${slideNumber}-png]`, error); res.status(500).send(String(error)); }
  });
  app.post(`/render/slide${slideNumber}`, requireApiKey, async (req, res) => {
    try {
      const slide = getSlideConfig(slideNumber);
      const data = hasUnitPayload(req.body || {}) ? normalizeUnidadAtenciones(req.body || {}, unidadNombre, titulo) : getSampleUnidadAtenciones(unidadNombre);
      res.type('png').end(await renderTemplateToPng(slide.template, data));
    } catch (error) { console.error(`[render/slide${slideNumber}]`, error); res.status(500).json({ ok:false, error:String(error) }); }
  });
}

registerUnidadSlide(16, 'Chungar');
registerUnidadSlide(17, 'Cerro Pasco');
registerUnidadSlide(18, 'Romina');

function getSampleSlide19() {
  return normalizeIncReqTrend({
    titulo: 'INCIDENTES VS REQUERIMIENTOS – VOLCAN',
    periodo: 'jul-26',
    acumuladoIncidentes: 2558,
    acumuladoRequerimientos: 9051,
    acumuladoTotal: 11609,
    series: [
      ['ago-25',216,682,898], ['sept-25',233,706,939], ['oct-25',216,744,960], ['nov-25',211,791,1002],
      ['dic-25',225,897,1122], ['ene-26',213,729,942], ['feb-26',152,552,704], ['mar-26',171,616,787],
      ['abr-26',220,768,988], ['may-26',210,837,1047], ['jun-26',240,872,1112], ['jul-26',251,857,1108]
    ]
  });
}

app.get('/test-slide19', async (req, res) => {
  try { const slide = getSlideConfig(19); res.type('html').send(await renderTemplateToHtml(slide.template, getSampleSlide19())); }
  catch (error) { console.error('[test-slide19]', error); res.status(500).send(String(error)); }
});
app.get('/test-slide19-png', async (req, res) => {
  try { const slide = getSlideConfig(19); res.type('png').end(await renderTemplateToPng(slide.template, getSampleSlide19())); }
  catch (error) { console.error('[test-slide19-png]', error); res.status(500).send(String(error)); }
});
app.post('/render/slide19', requireApiKey, async (req, res) => {
  try { const slide = getSlideConfig(19); res.type('png').end(await renderTemplateToPng(slide.template, normalizeIncReqTrend(req.body || {}))); }
  catch (error) { console.error('[render/slide19]', error); res.status(500).json({ ok:false, error:String(error) }); }
});

const INC_REQ_UNIT_SAMPLES = {
  20: {
    unidadNombre: 'U.M. Yauli',
    titulo: 'INCIDENTES VS REQUERIMIENTOS – U.M. YAULI',
    tituloVisual: 'Incidentes vs Requerimientos Yauli',
    periodo: 'jul-26',
    series: [
      ['ago-25',147,415,562], ['sept-25',163,448,611], ['oct-25',149,454,603], ['nov-25',144,469,613],
      ['dic-25',158,551,709], ['ene-26',145,454,599], ['feb-26',137,393,530], ['mar-26',163,456,619],
      ['abr-26',158,419,577], ['may-26',152,465,617], ['jun-26',155,495,650], ['jul-26',152,478,630]
    ],
    resumen1: 'En julio 2026, U.M. Yauli registró 630 atenciones clasificadas.',
    resumen2: '152 fueron incidentes (24%) y 478 fueron requerimientos (76%).'
  },
  21: {
    unidadNombre: 'San Cristóbal-Carahuacra',
    titulo: 'INCIDENTES VS REQUERIMIENTOS YAULI (SCR-CAR)',
    tituloVisual: 'Incidentes vs Requerimientos Yauli (SCR-CAR)',
    periodo: 'jul-26',
    series: [
      ['ago-25',67,128,195], ['sept-25',71,158,229], ['oct-25',64,158,222], ['nov-25',62,145,207],
      ['dic-25',68,166,234], ['ene-26',66,163,229], ['feb-26',53,109,162], ['mar-26',65,116,181],
      ['abr-26',67,143,210], ['may-26',59,119,178], ['jun-26',56,117,173], ['jul-26',57,120,177]
    ],
    resumen1: 'En julio 2026, San Cristóbal-Carahuacra registró 177 atenciones clasificadas.',
    resumen2: '57 fueron incidentes (32%) y 120 fueron requerimientos (68%).'
  },
  22: {
    unidadNombre: 'Andaychagua',
    titulo: 'INCIDENTES VS REQUERIMIENTOS YAULI (ANDAYCHAGUA)',
    tituloVisual: 'Incidentes vs Requerimientos Yauli (Andaychagua)',
    periodo: 'jul-26',
    series: [
      ['ago-25',72,144,216], ['sept-25',75,173,248], ['oct-25',75,149,224], ['nov-25',69,170,239],
      ['dic-25',75,187,262], ['ene-26',67,158,225], ['feb-26',69,165,234], ['mar-26',75,182,257],
      ['abr-26',73,161,234], ['may-26',71,169,240], ['jun-26',68,194,262], ['jul-26',66,193,259]
    ],
    resumen1: 'En julio 2026, Andaychagua registró 259 atenciones clasificadas.',
    resumen2: '66 fueron incidentes (25%) y 193 fueron requerimientos (75%).'
  },
  23: {
    unidadNombre: 'Ticlio',
    titulo: 'INCIDENTES VS REQUERIMIENTOS YAULI (TICLIO)',
    tituloVisual: 'Incidentes vs Requerimientos Yauli (Ticlio)',
    periodo: 'jul-26',
    series: [
      ['ago-25',8,143,151], ['sept-25',19,117,136], ['oct-25',10,147,157], ['nov-25',13,154,167],
      ['dic-25',15,198,213], ['ene-26',12,133,145], ['feb-26',15,119,134], ['mar-26',23,158,181],
      ['abr-26',18,115,133], ['may-26',22,177,199], ['jun-26',31,184,215], ['jul-26',29,165,194]
    ],
    resumen1: 'En julio 2026, Ticlio registró 194 atenciones clasificadas.',
    resumen2: '29 fueron incidentes (15%) y 165 fueron requerimientos (85%).'
  },
  24: {
    unidadNombre: 'Chungar',
    titulo: 'INCIDENTES VS REQUERIMIENTOS CHUNGAR',
    tituloVisual: 'Incidentes vs Requerimientos Chungar',
    periodo: 'jul-26',
    series: [
      ['ago-25',61,195,256], ['sept-25',63,176,239], ['oct-25',57,185,242], ['nov-25',60,178,238],
      ['dic-25',60,203,263], ['ene-26',56,150,206], ['abr-26',54,183,237], ['may-26',54,211,265],
      ['jun-26',83,246,329], ['jul-26',89,250,339]
    ],
    resumen1: 'En julio 2026, Chungar registró 339 atenciones clasificadas.',
    resumen2: '89 fueron incidentes (26%) y 250 fueron requerimientos (74%).'
  },
  25: {
    unidadNombre: 'Cerro Pasco',
    titulo: 'INCIDENTES VS REQUERIMIENTOS CERRO',
    tituloVisual: 'Incidentes vs Requerimientos Cerro',
    periodo: 'jul-26',
    series: [
      ['ago-25',8,72,80], ['sept-25',7,74,81], ['oct-25',10,73,83], ['nov-25',7,76,83],
      ['dic-25',6,80,86], ['ene-26',9,74,83], ['feb-26',12,67,79], ['mar-26',3,63,66],
      ['abr-26',2,75,77], ['may-26',1,67,68], ['jun-26',1,30,31], ['jul-26',2,37,39]
    ],
    resumen1: 'En julio 2026, Cerro registró 39 atenciones clasificadas.',
    resumen2: '2 fueron incidentes (5%) y 37 fueron requerimientos (95%).'
  },
  26: {
    unidadNombre: 'Romina',
    titulo: 'INCIDENTES VS REQUERIMIENTOS ROMINA',
    tituloVisual: 'Incidentes vs Requerimientos Romina',
    periodo: 'jul-26',
    series: [
      ['sept-25',0,8,8], ['oct-25',0,32,32], ['nov-25',0,68,68], ['dic-25',1,63,64],
      ['ene-26',3,51,54], ['feb-26',3,92,95], ['mar-26',5,97,102], ['abr-26',6,91,97],
      ['may-26',3,94,97], ['jun-26',1,101,102], ['jul-26',8,92,100]
    ],
    resumen1: 'En julio 2026, Romina registró 100 atenciones clasificadas.',
    resumen2: '8 fueron incidentes (8%) y 92 fueron requerimientos (92%).'
  }
};

function getSampleIncReqUnit(slideNumber) {
  const preset = INC_REQ_UNIT_SAMPLES[Number(slideNumber)];
  if (!preset) throw new Error(`No hay muestra configurada para slide ${slideNumber}`);
  return normalizeIncReqClassic(preset, preset.unidadNombre, preset.tituloVisual);
}

function registerIncReqUnitSlide(slideNumber) {
  app.get(`/test-slide${slideNumber}`, async (req, res) => {
    try { const slide = getSlideConfig(slideNumber); res.type('html').send(await renderTemplateToHtml(slide.template, getSampleIncReqUnit(slideNumber))); }
    catch (error) { console.error(`[test-slide${slideNumber}]`, error); res.status(500).send(String(error)); }
  });
  app.get(`/test-slide${slideNumber}-png`, async (req, res) => {
    try { const slide = getSlideConfig(slideNumber); res.type('png').end(await renderTemplateToPng(slide.template, getSampleIncReqUnit(slideNumber))); }
    catch (error) { console.error(`[test-slide${slideNumber}-png]`, error); res.status(500).send(String(error)); }
  });
  app.post(`/render/slide${slideNumber}`, requireApiKey, async (req, res) => {
    try {
      const slide = getSlideConfig(slideNumber);
      const preset = INC_REQ_UNIT_SAMPLES[Number(slideNumber)];
      const data = normalizeIncReqClassic(req.body || {}, preset.unidadNombre, preset.tituloVisual);
      res.type('png').end(await renderTemplateToPng(slide.template, data));
    } catch (error) { console.error(`[render/slide${slideNumber}]`, error); res.status(500).json({ ok:false, error:String(error) }); }
  });
}

[20, 21, 22, 23, 24, 25, 26].forEach(registerIncReqUnitSlide);

app.listen(PORT, () => console.log(`${APP_NAME} v${VERSION} activo en http://localhost:${PORT}`));

async function shutdown(signal) {
  console.log(`[shutdown] ${signal}`);
  await closeBrowser();
  process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
