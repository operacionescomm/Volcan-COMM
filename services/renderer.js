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

const STANDARD_GLOBE_SVG = `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18"/><path d="M6 24h36M24 6c5.8 5 8.8 11.1 8.8 18S29.8 37 24 42M24 6c-5.8 5-8.8 11.1-8.8 18S18.2 37 24 42M10 15c8.8 4 19.2 4 28 0M10 33c8.8-4 19.2-4 28 0"/></svg>`;

function standardBrandingInjection() {
  return `
<style id="comm-standard-branding-overrides">
.comm-brand-standard{
  position:absolute!important;
  right:0!important;
  top:0!important;
  width:410px!important;
  height:94px!important;
  border-bottom-left-radius:235px 98px!important;
  padding-right:38px!important;
  overflow:hidden!important;
  color:#fff!important;
  display:flex!important;
  align-items:center!important;
  justify-content:flex-end!important;
  background:linear-gradient(145deg,#0d478e,#073772 60%,#062d61)!important;
  box-shadow:none!important;
  z-index:25!important;
}
.comm-brand-standard::before{content:'';position:absolute;left:0;top:0;width:92px;height:100%;background:rgba(255,255,255,.06);border-bottom-left-radius:210px 92px;pointer-events:none}
.comm-brand-standard .comm-header-lockup{position:relative;z-index:2;display:flex;align-items:center;gap:13px;white-space:nowrap}
.comm-brand-standard .comm-header-globe{width:45px;height:45px;flex:0 0 auto}
.comm-brand-standard .comm-header-globe svg{width:45px;height:45px;stroke:#fff;fill:none;stroke-width:2.2}
.comm-brand-standard .comm-header-text{line-height:.9;text-align:left;white-space:nowrap}
.comm-brand-standard .comm-header-text .w1{display:block;font-size:39px;font-weight:900;letter-spacing:.6px;color:#7da7ec}
.comm-brand-standard .comm-header-text .w2{display:block;margin-top:4px;font-size:16.5px;font-weight:900;letter-spacing:.3px;color:#7da7ec}
.comm-brand-standard .comm-header-text .w3{display:block;margin-top:5px;font-size:8px;font-weight:800;letter-spacing:.6px;color:#d5d5d5}
.comm-footer-standard{
  position:absolute!important;
  left:0!important;
  right:0!important;
  bottom:0!important;
  height:66px!important;
  background:linear-gradient(90deg,#0d4a98,#063774)!important;
  color:#fff!important;
  display:flex!important;
  align-items:center!important;
  padding-left:50px!important;
  overflow:hidden!important;
  z-index:30!important;
  border-radius:0!important;
  transform:none!important;
}
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
  const brand = document.querySelector('.brand, .brand-curve, .val-brand');
  if (brand) {
    brand.innerHTML = headerHtml;
    brand.classList.add('comm-brand-standard');
  }
  let footer = document.querySelector('.footer, .val-footer');
  if (!footer) {
    const slide = document.querySelector('.slide, .val-slide');
    if (slide) {
      slide.insertAdjacentHTML('beforeend', '<footer class="footer comm-footer-standard">' + footerHtml + '</footer>');
      return;
    }
  }
  if (footer) {
    footer.innerHTML = footerHtml;
    footer.classList.add('comm-footer-standard');
  }
})();
</script>`;
}

function donutLabelInjection(data = {}) {
  const pctInc = Number(data.pctIncidentesMes ?? data.pctIncidentes ?? data.pctInc ?? 0);
  const unit = String(data.unidadNombre || data.tituloVisual || data.titulo || '').toLowerCase();

  // Base aprobada para los donuts mensuales: las cápsulas quedan sobre su
  // segmento, pero sin invadir el número ni el texto central.
  let incTop = 58;
  let incRight = 26;
  let reqLeft = 28;
  let reqBottom = 54;

  // Ticlio: franja naranja mediana, cápsula sobre el arco naranja.
  if (unit.includes('ticlio') || (pctInc > 9 && pctInc <= 16)) {
    incTop = 42;
    incRight = 42;
    reqLeft = 34;
    reqBottom = 58;
  }

  // Cerro y Romina: franja naranja pequeña, cápsula más arriba y más externa.
  if (unit.includes('cerro') || unit.includes('romina') || (pctInc > 0 && pctInc <= 9)) {
    incTop = 31;
    incRight = 58;
    reqLeft = 34;
    reqBottom = 58;
  }

  // Acumulado 12 meses: cápsulas externas para no tapar el total central.
  if (String(data.titulo || '').toLowerCase().includes('volcan') && pctInc > 20) {
    incTop = 54;
    incRight = 12;
    reqLeft = 26;
    reqBottom = 54;
  }

  return `
<style id="comm-donut-label-overrides">
/* Ajuste transversal slides 19–26: cápsulas sobre su franja del donut,
   sin tapar número central ni texto interno. */
.side .donut .pct,
.donut .pct{
  transform:none!important;
  box-shadow:0 3px 9px rgba(10,45,95,.16)!important;
}
.side .donut .pct-inc,
.donut .pct-inc{
  right:${incRight}px!important;
  top:${incTop}px!important;
  min-width:58px!important;
  padding:5px 10px!important;
  color:#e9610c!important;
  border-color:#ff7617!important;
  background:rgba(255,255,255,.98)!important;
}
.side .donut .pct-req,
.donut .pct-req{
  left:${reqLeft}px!important;
  bottom:${reqBottom}px!important;
  min-width:62px!important;
  padding:5px 10px!important;
  color:#1555ad!important;
  border-color:#1765c1!important;
  background:rgba(255,255,255,.98)!important;
}
</style>`;
}

function applyTemplateOverrides(templateName, html, data = {}) {
  let output = html;

  if (DONUT_LABEL_TEMPLATES.has(templateName)) {
    const overrideCss = donutLabelInjection(data);
    output = output.includes('</head>')
      ? output.replace('</head>', `${overrideCss}\n</head>`)
      : `${overrideCss}\n${output}`;
  }

  if (templateName === 'incidentes-requerimientos-unidad') {
    const overrideCss = `
<style id="inc-req-unidad-standard-overrides">
/* Estándar visual slides 20–26:
   porcentaje de incidentes = cápsula naranja,
   porcentaje de requerimientos = cápsula azul. */
.pct-inc{
  color:#e9610c !important;
  border:2px solid #ff7617 !important;
  background:rgba(255,255,255,.98) !important;
}
.pct-req{
  color:#1555ad !important;
  border:2px solid #1765c1 !important;
  background:rgba(255,255,255,.98) !important;
}
</style>`;

    output = output.includes('</head>')
      ? output.replace('</head>', `${overrideCss}\n</head>`)
      : `${overrideCss}\n${output}`;
  }

  /*
   * La plantilla clásica aprobada nació con el título de Yauli fijo.
   * Para reutilizar exactamente el mismo layout en los slides 20–26,
   * permitimos reemplazar solo ese encabezado mediante tituloVisual.
   */
  if (templateName === 'incidentes-requerimientos-unidad-classic' && data.tituloVisual) {
    output = output.replace(
      'Incidentes vs Requerimientos Yauli',
      String(data.tituloVisual)
    );
  }

  if (STANDARD_BRANDING_TEMPLATES.has(templateName)) {
    const branding = standardBrandingInjection();
    output = output.includes('</body>')
      ? output.replace('</body>', `${branding}\n</body>`)
      : `${output}\n${branding}`;
  }

  return output;
}

async function renderTemplateToHtml(templateName, data) {
  const templatePath = path.join(VIEW_DIR, `${templateName}.ejs`);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Plantilla no encontrada: ${templateName}`);
  }

  const html = await ejs.renderFile(templatePath, data, { async: false });
  return applyTemplateOverrides(templateName, html, data);
}

async function htmlToPng(html) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({
      width: 1600,
      height: 900,
      deviceScaleFactor: 2
    });

    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    for (const fileName of ['styles.css', 'comm-standard.css']) {
      const cssPath = path.join(PUBLIC_DIR, fileName);
      if (fs.existsSync(cssPath)) {
        await page.addStyleTag({ path: cssPath });
      }
    }

    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    });

    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false
    });

    return Buffer.from(screenshot);
  } finally {
    await page.close();
  }
}

async function renderTemplateToPng(templateName, data) {
  const html = await renderTemplateToHtml(templateName, data);
  return htmlToPng(html);
}

module.exports = {
  renderTemplateToHtml,
  htmlToPng,
  renderTemplateToPng
};