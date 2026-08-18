const express = require('express');
const path = require('path');
const { getSlideConfig } = require('./config/slides');
const { normalizeIncReqTrend } = require('./services/incidentes-requerimientos-trend');
const { normalizeIncReqUnidad } = require('./services/incidentes-requerimientos-unidad');
const { renderTemplateToHtml, renderTemplateToPng } = require('./services/renderer');
const { closeBrowser, resolveChromeExecutable } = require('./services/browser');
const { getRootCauseComparisonSample, getCerroRootCauseSample } = require('./services/root-cause-samples');

const app = express();
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || 'Volcan-COMM Visual Engine';
const API_KEY = String(process.env.RENDER_API_KEY || '').trim();
const VERSION = '0.9.1';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

const ACTIVE_SLIDES = [19,20,21,22,23,24,25,26,27,28,29,30,31,32];
app.get('/', (req, res) => res.json({
  ok:true, service:APP_NAME, version:VERSION,
  activeSlides: ACTIVE_SLIDES.map(number => ({ number, key:getSlideConfig(number).key })),
  tests: Object.fromEntries(ACTIVE_SLIDES.map(n => [`slide${n}`, `/test-slide${n}-png`]))
}));
app.get('/health', (req, res) => res.json({ ok:true, service:APP_NAME, version:VERSION, timestamp:new Date().toISOString() }));
app.get('/browser-status', (req, res) => { const executablePath = resolveChromeExecutable(); res.status(executablePath ? 200 : 503).json({ ok:Boolean(executablePath), executablePath:executablePath || null }); });
function requireApiKey(req,res,next){ if(!API_KEY) return next(); return String(req.get('x-api-key')||'').trim()===API_KEY ? next() : res.status(401).json({ok:false,error:'No autorizado'}); }

const INC_REQ_UNIT_SAMPLES = {
  20:{unidadNombre:'U.M. Yauli',titulo:'INCIDENTES VS REQUERIMIENTOS – U.M. YAULI',tituloVisual:'Incidentes vs Requerimientos Yauli',periodo:'jul-26',series:[['ago-25',147,415,562],['sept-25',163,448,611],['oct-25',149,454,603],['nov-25',144,469,613],['dic-25',158,551,709],['ene-26',145,454,599],['feb-26',137,393,530],['mar-26',163,456,619],['abr-26',158,419,577],['may-26',152,465,617],['jun-26',155,495,650],['jul-26',152,478,630]],resumen1:'En julio 2026, U.M. Yauli registró 630 atenciones clasificadas.',resumen2:'152 fueron incidentes (24%) y 478 fueron requerimientos (76%).'},
  21:{unidadNombre:'San Cristóbal-Carahuacra',titulo:'INCIDENTES VS REQUERIMIENTOS YAULI (SCR-CAR)',tituloVisual:'Incidentes vs Requerimientos Yauli (SCR-CAR)',periodo:'jul-26',series:[['ago-25',67,128,195],['sept-25',71,158,229],['oct-25',64,158,222],['nov-25',62,145,207],['dic-25',68,166,234],['ene-26',66,163,229],['feb-26',53,109,162],['mar-26',65,116,181],['abr-26',67,143,210],['may-26',59,119,178],['jun-26',56,117,173],['jul-26',57,120,177]],resumen1:'En julio 2026, San Cristóbal-Carahuacra registró 177 atenciones clasificadas.',resumen2:'57 fueron incidentes (32%) y 120 fueron requerimientos (68%).'},
  22:{unidadNombre:'Andaychagua',titulo:'INCIDENTES VS REQUERIMIENTOS YAULI (ANDAYCHAGUA)',tituloVisual:'Incidentes vs Requerimientos Yauli (Andaychagua)',periodo:'jul-26',series:[['ago-25',72,144,216],['sept-25',75,173,248],['oct-25',75,149,224],['nov-25',69,170,239],['dic-25',75,187,262],['ene-26',67,158,225],['feb-26',69,165,234],['mar-26',75,182,257],['abr-26',73,161,234],['may-26',71,169,240],['jun-26',68,194,262],['jul-26',66,193,259]],resumen1:'En julio 2026, Andaychagua registró 259 atenciones clasificadas.',resumen2:'66 fueron incidentes (25%) y 193 fueron requerimientos (75%).'},
  23:{unidadNombre:'Ticlio',titulo:'INCIDENTES VS REQUERIMIENTOS YAULI (TICLIO)',tituloVisual:'Incidentes vs Requerimientos Yauli (Ticlio)',periodo:'jul-26',series:[['ago-25',8,143,151],['sept-25',19,117,136],['oct-25',10,147,157],['nov-25',13,154,167],['dic-25',15,198,213],['ene-26',12,133,145],['feb-26',15,119,134],['mar-26',23,158,181],['abr-26',18,115,133],['may-26',22,177,199],['jun-26',31,184,215],['jul-26',29,165,194]],resumen1:'En julio 2026, Ticlio registró 194 atenciones clasificadas.',resumen2:'29 fueron incidentes (15%) y 165 fueron requerimientos (85%).'},
  24:{unidadNombre:'Chungar',titulo:'INCIDENTES VS REQUERIMIENTOS CHUNGAR',tituloVisual:'Incidentes vs Requerimientos Chungar',periodo:'jul-26',series:[['ago-25',61,195,256],['sept-25',63,176,239],['oct-25',57,185,242],['nov-25',60,178,238],['dic-25',60,203,263],['ene-26',56,150,206],['abr-26',54,183,237],['may-26',54,211,265],['jun-26',83,246,329],['jul-26',89,250,339]],resumen1:'En julio 2026, Chungar registró 339 atenciones clasificadas.',resumen2:'89 fueron incidentes (26%) y 250 fueron requerimientos (74%).'},
  25:{unidadNombre:'Cerro Pasco',titulo:'INCIDENTES VS REQUERIMIENTOS CERRO',tituloVisual:'Incidentes vs Requerimientos Cerro',periodo:'jul-26',series:[['ago-25',8,72,80],['sept-25',7,74,81],['oct-25',10,73,83],['nov-25',7,76,83],['dic-25',6,80,86],['ene-26',9,74,83],['feb-26',12,67,79],['mar-26',3,63,66],['abr-26',2,75,77],['may-26',1,67,68],['jun-26',1,30,31],['jul-26',2,37,39]],resumen1:'En julio 2026, Cerro registró 39 atenciones clasificadas.',resumen2:'2 fueron incidentes (5%) y 37 fueron requerimientos (95%).'},
  26:{unidadNombre:'Romina',titulo:'INCIDENTES VS REQUERIMIENTOS ROMINA',tituloVisual:'Incidentes vs Requerimientos Romina',periodo:'jul-26',series:[['sept-25',0,8,8],['oct-25',0,32,32],['nov-25',0,68,68],['dic-25',1,63,64],['ene-26',3,51,54],['feb-26',3,92,95],['mar-26',5,97,102],['abr-26',6,91,97],['may-26',3,94,97],['jun-26',1,101,102],['jul-26',8,92,100]],resumen1:'En julio 2026, Romina registró 100 atenciones clasificadas.',resumen2:'8 fueron incidentes (8%) y 92 fueron requerimientos (92%).'}
};
function normalizeIncReqClassic(body={},unidadNombre,tituloVisual){ const n=normalizeIncReqUnidad(body,unidadNombre); return {...body,...n,tituloVisual:body.tituloVisual||tituloVisual}; }
function getSampleIncReqUnit(n){ const p=INC_REQ_UNIT_SAMPLES[Number(n)]; if(!p) throw new Error(`No hay muestra para slide ${n}`); return normalizeIncReqClassic(p,p.unidadNombre,p.tituloVisual); }

const TOP_TEN_SAMPLES = {
  27:{titulo:'Top Ten: Requerimientos – VOLCAN (Acumulado)',tipoSingular:'Requerimiento',tipoPlural:'Requerimientos',mesCorto:'Jul',totalMes:857,totalAcumulado:9051,alcance:'las tres localidades mineras',notaMesPrefix:'En julio se realizó un total de',notaAcumuladoPrefix:'De agosto 2025 a julio 2026 se realizó',showMesColumn:false,items:[
    ['Mantenimiento Programado',0,1095,0.12098110705999338],['Instalación Nueva (RAD)',0,736,0.0813169815490001],['Instalación Nueva',0,636,0.07026847862114684],['Retiro Programado',0,569,0.06286598165948513],['Cambio de Lugar de Trabajo',0,468,0.05170699370235333],['Instalación Nueva (TEL)',0,465,0.051375538614517734],['Estandarización de Cable',0,444,0.049055352999668546],['Instalación Nueva (FO)',0,392,0.04331013147718484],['Instalación Nueva (ELE)',0,356,0.03933267042315766],['Instalación Nueva (DAT)',0,334,0.03690199977902994]
  ]},
  28:{titulo:'Top Ten: Incidentes – VOLCAN (Acumulado)',tipoSingular:'Incidente',tipoPlural:'Incidentes',mesCorto:'Jul',totalMes:251,totalAcumulado:2558,alcance:'las 7 localidades mineras',notaMesPrefix:'En julio se realizó un total de',notaAcumuladoPrefix:'De julio 2025 a junio 2026 se realizó',showMesColumn:true,items:[
    ['Cable Roto por Trabajos (TEL)',45,420,0.1641907740422205],['Empalme Sulfatado',35,278,0.10867865519937452],['Equipo Inhibido',31,219,0.0856137607505864],['Cable Roto por Vehículo (TEL)',28,187,0.07310398749022674],['Cable Roto por Trabajos (RAD)',26,171,0.06684910086004692],['Cable Roto por Vehículo (FO)',27,167,0.06528537920250195],['Cable Roto por Trabajos (FO)',26,164,0.06411258795934324],['Falla de energia',23,162,0.06333072713057075],['Equipo Malogrado (TEL)',24,162,0.06333072713057075],['Cable Roto por Trabajos (ELE)',24,152,0.05942142298670837]
  ]}
};
function normalizeTopTen(body={},fallback={}){ const src=Array.isArray(body.items)&&body.items.length?body.items:fallback.items; return {...fallback,...body,items:(src||[]).map(item=>Array.isArray(item)?{nombre:item[0],mesValor:Number(item[1]||0),cant:Number(item[2]||0),pct:Number(item[3]||0)}:{nombre:String(item.nombre||item.categoria||''),mesValor:Number(item.mesValor||item.jul||0),cant:Number(item.cant||item.cantidad||item.total||0),pct:Number(item.pct||item.porcentaje||0)}).filter(i=>i.nombre)}; }

function slide19Sample(){ return normalizeIncReqTrend({titulo:'INCIDENTES VS REQUERIMIENTOS – VOLCAN',periodo:'jul-26',acumuladoIncidentes:2558,acumuladoRequerimientos:9051,acumuladoTotal:11609,series:[['ago-25',216,682,898],['sept-25',233,706,939],['oct-25',216,744,960],['nov-25',211,791,1002],['dic-25',225,897,1122],['ene-26',213,729,942],['feb-26',152,552,704],['mar-26',171,616,787],['abr-26',220,768,988],['may-26',210,837,1047],['jun-26',240,872,1112],['jul-26',251,857,1108]]}); }
function dataFor(n, body={}){
  if(n===19) return Object.keys(body).length?normalizeIncReqTrend(body):slide19Sample();
  if(n>=20&&n<=26){const p=INC_REQ_UNIT_SAMPLES[n]; return Object.keys(body).length?normalizeIncReqClassic(body,p.unidadNombre,p.tituloVisual):getSampleIncReqUnit(n);}
  if(n>=27&&n<=28) return normalizeTopTen(body,TOP_TEN_SAMPLES[n]);
  if(n>=29&&n<=31) return Object.keys(body).length ? body : getRootCauseComparisonSample(n);
  if(n===32) return Object.keys(body).length ? body : getCerroRootCauseSample();
  throw new Error(`Slide no soportado: ${n}`);
}
function register(n){ app.get(`/test-slide${n}`,async(req,res)=>{try{const s=getSlideConfig(n); res.type('html').send(await renderTemplateToHtml(s.template,dataFor(n)));}catch(e){console.error(`[test-slide${n}]`,e);res.status(500).send(String(e));}}); app.get(`/test-slide${n}-png`,async(req,res)=>{try{const s=getSlideConfig(n); res.type('png').end(await renderTemplateToPng(s.template,dataFor(n)));}catch(e){console.error(`[test-slide${n}-png]`,e);res.status(500).send(String(e));}}); app.post(`/render/slide${n}`,requireApiKey,async(req,res)=>{try{const s=getSlideConfig(n); res.type('png').end(await renderTemplateToPng(s.template,dataFor(n,req.body||{})));}catch(e){console.error(`[render/slide${n}]`,e);res.status(500).json({ok:false,error:String(e)});}}); }
ACTIVE_SLIDES.forEach(register);

app.listen(PORT,()=>console.log(`${APP_NAME} v${VERSION} activo en http://localhost:${PORT}`));
async function shutdown(signal){console.log(`[shutdown] ${signal}`); await closeBrowser(); process.exit(0);} process.on('SIGTERM',()=>shutdown('SIGTERM')); process.on('SIGINT',()=>shutdown('SIGINT'));
