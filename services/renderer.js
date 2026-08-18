const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const { getBrowser } = require('./browser');

const ROOT = path.join(__dirname, '..');
const VIEW_DIR = path.join(ROOT, 'views');
const PUBLIC_DIR = path.join(ROOT, 'public');

// Branding estándar solicitado para slides 19–52, excluyendo portadas 33 y 43.
const STANDARD_BRANDING_TEMPLATES = new Set([
  'incidentes-requerimientos-volcan-classic',
  'incidentes-requerimientos-unidad-classic',
  'incidentes-requerimientos-chungar-classic',
  'top-ten-volcan-classic',
  'top-ten-root-cause-compare',
  'top-ten-root-cause-cerro',
  'valorizacion-servicio',
  'top-ten-suministros'
]);

const DONUT_LABEL_TEMPLATES = new Set([
  'incidentes-requerimientos-volcan-classic',
  'incidentes-requerimientos-unidad-classic',
  'incidentes-requerimientos-chungar-classic',
  'incidentes-requerimientos-unidad'
]);

const BAR_INSIDE_LABEL_TEMPLATES = new Set([
  'incidentes-requerimientos-volcan-classic',
  'incidentes-requerimientos-unidad-classic',
  'incidentes-requerimientos-chungar-classic',
  'incidentes-requerimientos-unidad',
  'top-ten-volcan-classic',
  'top-ten-root-cause-compare'
]);

const STANDARD_GLOBE_SVG = `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18"/><path d="M6 24h36M24 6c5.8 5 8.8 11.1 8.8 18S29.8 37 24 42M24 6c-5.8 5-8.8 11.1-8.8 18S18.2 37 24 42M10 15c8.8 4 19.2 4 28 0M10 33c8.8-4 19.2-4 28 0"/></svg>`;

function standardBrandingInjection() {
  return `
<style id="comm-standard-branding-overrides">
.comm-brand-standard{position:absolute!important;right:0!important;top:0!important;width:410px!important;height:94px!important;border-bottom-left-radius:235px 98px!important;padding-right:38px!important;overflow:hidden!important;color:#fff!important;display:flex!important;align-items:center!important;justify-content:flex-end!important;background:linear-gradient(145deg,#0d478e,#073772 60%,#062d61)!important;box-shadow:none!important;z-index:25!important}
.comm-brand-standard::before{content:'';position:absolute;left:0;top:0;width:92px;height:100%;background:rgba(255,255,255,.06);border-bottom-left-radius:210px 92px;pointer-events:none}
.comm-brand-standard .comm-header-lockup{position:relative;z-index:2;display:flex;align-items:center;gap:13px;white-space:nowrap}
.comm-brand-standard .comm-header-globe{width:45px;height:45px;flex:0 0 auto}
.comm-brand-standard .comm-header-globe svg{width:45px;height:45px;stroke:#fff;fill:none;stroke-width:2.2}
.comm-brand-standard .comm-header-text{line-height:.9;text-align:left;white-space:nowrap}
.comm-brand-standard .comm-header-text .w1{display:block;font-size:39px;font-weight:900;letter-spacing:.6px;color:#7da7ec}
.comm-brand-standard .comm-header-text .w2{display:block;margin-top:4px;font-size:16.5px;font-weight:900;letter-spacing:.3px;color:#7da7ec}
.comm-brand-standard .comm-header-text .w3{display:block;margin-top:5px;font-size:8px;font-weight:800;letter-spacing:.6px;color:#d5d5d5}
.comm-footer-standard{position:absolute!important;left:0!important;right:0!important;bottom:0!important;height:66px!important;background:linear-gradient(90deg,#0d4a98,#063774)!important;color:#fff!important;display:flex!important;align-items:center!important;padding-left:50px!important;overflow:hidden!important;z-index:30!important;border-radius:0!important;transform:none!important}
.comm-footer-standard .comm-footer-inner{position:relative;z-index:2;display:flex;align-items:center;gap:16px;font-size:22px;letter-spacing:.2px;font-weight:700;color:#fff;white-space:nowrap}
.comm-footer-standard strong{font-size:25px;letter-spacing:.5px;color:#ff7414}
.comm-footer-standard .comm-footer-globe{width:34px;height:34px;flex:0 0 auto}
.comm-footer-standard .comm-footer-globe svg{width:34px;height:34px;stroke:#fff;fill:none;stroke-width:2}
.comm-footer-standard .comm-footer-sep{width:2px;height:40px;background:rgba(255,255,255,.72);margin:0 12px 0 2px;flex:0 0 auto}
.comm-footer-standard .comm-footer-orange{position:absolute;right:-22px;bottom:-28px;width:180px;height:104px;background:#ff6f12;border-radius:70% 0 0 0;transform:rotate(-7deg)}
</style>
<script id="comm-standard-branding-script">
(function(){
  const globe = ${JSON.stringify(STANDARD_GLOBE_SVG)};
  const headerHtml = '<div class="comm-header-lockup"><span class="comm-header-globe">' + globe + '</span><span class="comm-header-text"><span class="w1">COMM</span><span class="w2">COMMUNICATIONS</span><span class="w3">AND SYSTEMS DEVELOPMENT</span></span></div>';
  const footerHtml = '<div class="comm-footer-inner"><span class="comm-footer-globe">' + globe + '</span><span class="comm-footer-sep"></span><span>www.<strong>COMMUNICATIONS</strong>.com.pe</span></div><span class="comm-footer-orange"></span>';
  const brand = document.querySelector('.brand, .brand-curve');
  if (brand) { brand.innerHTML = headerHtml; brand.classList.add('comm-brand-standard'); }
  let footer = document.querySelector('.footer');
  if (!footer) {
    const slide = document.querySelector('.slide');
    if (slide) { slide.insertAdjacentHTML('beforeend', '<footer class="footer comm-footer-standard">' + footerHtml + '</footer>'); return; }
  }
  if (footer) { footer.innerHTML = footerHtml; footer.classList.add('comm-footer-standard'); }
})();
</script>`;
}

function incidentRequirementColorInjection(data = {}) {
  const pctInc = Number(data.pctIncidentesMes ?? data.pctIncidentes ?? data.pctInc ?? 0);
  const unit = String(data.unidadNombre || data.tituloVisual || data.titulo || '').toLowerCase();
  let incTop = 58, incRight = 26, reqLeft = 28, reqBottom = 54;
  if (unit.includes('ticlio') || (pctInc > 9 && pctInc <= 16)) { incTop = 42; incRight = 42; reqLeft = 34; reqBottom = 58; }
  if (unit.includes('cerro') || unit.includes('romina') || (pctInc > 0 && pctInc <= 9)) { incTop = 31; incRight = 58; reqLeft = 34; reqBottom = 58; }
  if (String(data.titulo || '').toLowerCase().includes('volcan') && pctInc > 20) { incTop = 54; incRight = 12; reqLeft = 26; reqBottom = 54; }
  const isVolcanAccumulated = String(data.titulo || '').toLowerCase().includes('volcan') && data.pctIncidentesAcum !== undefined;
  const donutIncidentPct = Math.max(0, Math.min(100, Number(isVolcanAccumulated ? data.pctIncidentesAcum : pctInc)));
  return `
<style id="comm-inc-req-color-overrides">
/* Lógica definitiva: Incidentes = azul, Requerimientos = naranja */
.side .donut,.donut{background:conic-gradient(#1765c1 0 ${donutIncidentPct}%,#ff7617 ${donutIncidentPct}% 100%)!important}
.side .donut .pct,.donut .pct{transform:none!important;box-shadow:0 3px 9px rgba(10,45,95,.16)!important}
.side .donut .pct-inc,.donut .pct-inc{right:${incRight}px!important;top:${incTop}px!important;min-width:58px!important;padding:5px 10px!important;color:#1555ad!important;border-color:#1765c1!important;background:rgba(255,255,255,.98)!important}
.side .donut .pct-req,.donut .pct-req{left:${reqLeft}px!important;bottom:${reqBottom}px!important;min-width:62px!important;padding:5px 10px!important;color:#e9610c!important;border-color:#ff7617!important;background:rgba(255,255,255,.98)!important}
.legbox{background:#1765c1!important}.legline,.legline:after{background:#ef6b12!important}
.sval.blue,.stext .blue{color:#1765c1!important}.sval.orange,.stext .orange{color:#ef6b12!important}
.mini.blue{background:#1765c1!important}.mini.orange{background:#ff7617!important}
.pitem.inc{color:#1765c1!important}.pitem.req{color:#ef6b12!important}
.pitem.inc .pdot,.pitem.inc .pdot.orange{background:#1765c1!important}.pitem.req .pdot,.pitem.req .pdot.blue{background:#ff7617!important}
</style>
<script id="comm-inc-req-donut-script">
(function(){
  const donutIncidentPct = ${JSON.stringify(donutIncidentPct)};
  document.querySelectorAll('.side .donut, .donut').forEach(donut => {
    donut.style.setProperty('background', 'conic-gradient(#1765c1 0 ' + donutIncidentPct + '%, #ff7617 ' + donutIncidentPct + '% 100%)', 'important');
  });
})();
</script>`;
}

function barInsideLabelsInjection() {
  return `
<style id="comm-bar-inside-label-overrides">
.value-inc,.bar-label,.bar-value{fill:#fff!important;stroke:transparent!important;stroke-width:0!important;font-size:12px!important;font-weight:900!important;text-anchor:middle!important;dominant-baseline:middle!important;paint-order:normal!important}
</style>
<script id="comm-bar-inside-label-script">
(function(){
  function num(el, attr){ return Number(el.getAttribute(attr) || 0); }
  function fillOf(el){ return String(el.getAttribute('fill') || '').trim().toLowerCase(); }
  function strokeOf(el){ return String(el.getAttribute('stroke') || '').trim().toLowerCase(); }
  function isBar(r){
    const f = fillOf(r);
    const w = num(r,'width'), h = num(r,'height');
    if (w <= 8 || h <= 4) return false;
    return ['#1765c1','#1557a5','#1554a9','#9fb8d7','#4d8dd3','#2f5fae','#3569bf','#143f86'].includes(f);
  }
  function nearestBar(label, bars){
    const lx = num(label,'x');
    let best = null, dist = Infinity;
    bars.forEach(bar => {
      const cx = num(bar,'x') + num(bar,'width') / 2;
      const d = Math.abs(cx - lx);
      if (d < dist) { dist = d; best = bar; }
    });
    return best;
  }
  document.querySelectorAll('svg.chart-svg').forEach(svg => {
    const bars = Array.from(svg.querySelectorAll('rect')).filter(isBar);
    if (!bars.length) return;
    // Oculta las cápsulas blancas que antes iban sobre las barras.
    Array.from(svg.querySelectorAll('rect')).forEach(r => {
      if (fillOf(r) === '#fff' && ['#9abce0','#9fb8d7','#4d8dd3'].includes(strokeOf(r))) {
        r.style.display = 'none';
      }
    });
    const labels = Array.from(svg.querySelectorAll('text.value-inc, text.bar-label, text.bar-value'));
    labels.forEach(label => {
      const bar = nearestBar(label, bars);
      if (!bar) return;
      const x = num(bar,'x'), y = num(bar,'y'), w = num(bar,'width'), h = num(bar,'height');
      label.setAttribute('x', String(x + w / 2));
      label.setAttribute('y', String(y + Math.max(7, h / 2)));
      label.setAttribute('fill', '#fff');
      label.setAttribute('stroke', 'transparent');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('text-anchor', 'middle');
      label.style.fill = '#fff';
      label.style.stroke = 'transparent';
      label.style.fontWeight = '900';
      label.style.dominantBaseline = 'middle';
    });
  });
})();
</script>`;
}

function valuationTiclioLabelInjection(data = {}) {
  const title = String(data.titulo || '').toLowerCase();
  if (!title.includes('ticlio')) return '';
  const seriesColors = (data.series || []).map(s => String(s.color || '').toLowerCase());
  const blue = seriesColors[0] || '';
  const orange = seriesColors[1] || '';
  return `
<style id="valorizacion-ticlio-label-overrides">
.val-line-label{paint-order:stroke!important;stroke:#fff!important;stroke-width:5px!important;stroke-linejoin:round!important}
</style>
<script id="valorizacion-ticlio-label-script">
(function(){
  const svg = document.querySelector('.val-chart-svg');
  if (!svg) return;
  const blue = ${JSON.stringify(blue)};
  const orange = ${JSON.stringify(orange)};
  const circles = Array.from(svg.querySelectorAll('circle')).filter(c => Number(c.getAttribute('r')) >= 6);
  const labels = Array.from(svg.querySelectorAll('text.val-line-label'));
  const byX = new Map();
  function key(el, attr){ return String(Math.round(Number(el.getAttribute(attr) || 0))); }
  function bucket(x){ if (!byX.has(x)) byX.set(x, { circles: [], labels: [] }); return byX.get(x); }
  circles.forEach(c => bucket(key(c, 'cx')).circles.push(c));
  labels.forEach(t => bucket(key(t, 'x')).labels.push(t));
  function fillOf(el){ return String(el.getAttribute('fill') || '').toLowerCase(); }
  byX.forEach(group => {
    const blueCircle = group.circles.find(c => fillOf(c) === blue) || group.circles[0];
    const orangeCircle = group.circles.find(c => fillOf(c) === orange) || group.circles[1];
    if (!blueCircle || !orangeCircle) return;
    const blueY = Number(blueCircle.getAttribute('cy'));
    const orangeY = Number(orangeCircle.getAttribute('cy'));
    if (Math.abs(blueY - orangeY) > 34) return;
    const blueLabel = group.labels.find(t => fillOf(t) === blue);
    const orangeLabel = group.labels.find(t => fillOf(t) === orange);
    if (blueLabel) blueLabel.setAttribute('y', String(Math.max(18, blueY - 42)));
    if (orangeLabel) orangeLabel.setAttribute('y', String(Math.min(424, orangeY + 44)));
  });
})();
</script>`;
}

function applyTemplateOverrides(templateName, html, data = {}) {
  let output = html;
  if (DONUT_LABEL_TEMPLATES.has(templateName)) {
    const overrideCss = incidentRequirementColorInjection(data);
    output = output.includes('</head>') ? output.replace('</head>', `${overrideCss}\n</head>`) : `${overrideCss}\n${output}`;
  }
  if (BAR_INSIDE_LABEL_TEMPLATES.has(templateName)) {
    const barFix = barInsideLabelsInjection();
    output = output.includes('</body>') ? output.replace('</body>', `${barFix}\n</body>`) : `${output}\n${barFix}`;
  }
  if (templateName === 'valorizacion-servicio') {
    const labelFix = valuationTiclioLabelInjection(data);
    if (labelFix) output = output.includes('</body>') ? output.replace('</body>', `${labelFix}\n</body>`) : `${output}\n${labelFix}`;
  }
  if (templateName === 'incidentes-requerimientos-unidad-classic' && data.tituloVisual) {
    output = output.replace('Incidentes vs Requerimientos Yauli', String(data.tituloVisual));
  }
  if (STANDARD_BRANDING_TEMPLATES.has(templateName)) {
    const branding = standardBrandingInjection();
    output = output.includes('</body>') ? output.replace('</body>', `${branding}\n</body>`) : `${output}\n${branding}`;
  }
  return output;
}

async function renderTemplateToHtml(templateName, data) {
  const templatePath = path.join(VIEW_DIR, `${templateName}.ejs`);
  if (!fs.existsSync(templatePath)) throw new Error(`Plantilla no encontrada: ${templateName}`);
  const html = await ejs.renderFile(templatePath, data, { async: false });
  return applyTemplateOverrides(templateName, html, data);
}

async function htmlToPng(html) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
    for (const fileName of ['styles.css', 'comm-standard.css']) {
      const cssPath = path.join(PUBLIC_DIR, fileName);
      if (fs.existsSync(cssPath)) await page.addStyleTag({ path: cssPath });
    }
    await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; });
    const screenshot = await page.screenshot({ type: 'png', fullPage: false });
    return Buffer.from(screenshot);
  } finally { await page.close(); }
}

async function renderTemplateToPng(templateName, data) {
  const html = await renderTemplateToHtml(templateName, data);
  return htmlToPng(html);
}

module.exports = { renderTemplateToHtml, htmlToPng, renderTemplateToPng };
