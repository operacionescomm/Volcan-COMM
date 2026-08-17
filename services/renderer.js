const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const { getBrowser } = require('./browser');

const ROOT = path.join(__dirname, '..');
const VIEW_DIR = path.join(ROOT, 'views');
const PUBLIC_DIR = path.join(ROOT, 'public');

const STANDARD_BRANDING_TEMPLATES = new Set([
  'atenciones',
  'yauli-atenciones',
  'unidad-atenciones',
  'cerro-pasco-atenciones',
  'incidentes-requerimientos-volcan-classic',
  'incidentes-requerimientos-unidad-classic',
  'incidentes-requerimientos-chungar-classic'
]);

const STANDARD_GLOBE_SVG = `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18"/><path d="M6 24h36M24 6c5.8 5 8.8 11.1 8.8 18S29.8 37 24 42M24 6c-5.8 5-8.8 11.1-8.8 18S18.2 37 24 42M10 15c8.8 4 19.2 4 28 0M10 33c8.8-4 19.2-4 28 0"/></svg>`;

function standardBrandingInjection() {
  return `
<style id="comm-standard-branding-overrides">
.comm-brand-standard{overflow:hidden!important;color:#fff!important;display:flex!important;align-items:center!important;justify-content:flex-end!important;background:linear-gradient(145deg,#0d478e,#073772 60%,#062d61)!important;box-shadow:none!important}
.comm-brand-standard::before{content:'';position:absolute;left:0;top:0;width:92px;height:100%;background:rgba(255,255,255,.06);border-bottom-left-radius:210px 92px;pointer-events:none}
.comm-brand-standard .comm-header-lockup{position:relative;z-index:2;display:flex;align-items:center;gap:13px;white-space:nowrap}
.comm-brand-standard .comm-header-globe{width:45px;height:45px;flex:0 0 auto}
.comm-brand-standard .comm-header-globe svg{width:45px;height:45px;stroke:#fff;fill:none;stroke-width:2.2}
.comm-brand-standard .comm-header-text{line-height:.9;text-align:left;white-space:nowrap}
.comm-brand-standard .comm-header-text .w1{display:block;font-size:39px;font-weight:900;letter-spacing:.6px;color:#7da7ec}
.comm-brand-standard .comm-header-text .w2{display:block;margin-top:4px;font-size:16.5px;font-weight:900;letter-spacing:.3px;color:#7da7ec}
.comm-brand-standard .comm-header-text .w3{display:block;margin-top:5px;font-size:8px;font-weight:800;letter-spacing:.6px;color:#d5d5d5}
.comm-footer-standard{position:absolute!important;left:0!important;right:0!important;bottom:0!important;height:66px!important;background:linear-gradient(90deg,#0d4a98,#063774)!important;color:#fff!important;display:flex!important;align-items:center!important;padding-left:50px!important;overflow:hidden!important;z-index:20!important}
.comm-footer-standard .comm-footer-inner{position:relative;z-index:2;display:flex;align-items:center;gap:20px;font-size:22px;letter-spacing:.2px;font-weight:700;color:#fff;white-space:nowrap}
.comm-footer-standard strong{font-size:25px;letter-spacing:.5px;color:#ff7414}
.comm-footer-standard .comm-footer-globe{width:34px;height:34px;flex:0 0 auto}
.comm-footer-standard .comm-footer-globe svg{width:34px;height:34px;stroke:#fff;fill:none;stroke-width:2}
.comm-footer-standard .comm-footer-sep{width:2px;height:40px;background:rgba(255,255,255,.72);margin:0 10px 0 4px;flex:0 0 auto}
.comm-footer-standard .comm-footer-orange{position:absolute;right:-22px;bottom:-28px;width:180px;height:104px;background:#ff6f12;border-radius:70% 0 0 0;transform:rotate(-7deg)}
</style>
<script id="comm-standard-branding-script">
(function(){
  const globe = ${JSON.stringify(STANDARD_GLOBE_SVG)};
  const headerHtml = '<div class="comm-header-lockup"><span class="comm-header-globe">' + globe + '</span><span class="comm-header-text"><span class="w1">COMM</span><span class="w2">COMMUNICATIONS</span><span class="w3">AND SYSTEMS DEVELOPMENT</span></span></div>';
  const footerHtml = '<div class="comm-footer-inner"><span class="comm-footer-globe">' + globe + '</span><span class="comm-footer-sep"></span><span>www.<strong>COMMUNICATIONS</strong>.com.pe</span></div><span class="comm-footer-orange"></span>';
  const brand = document.querySelector('.brand, .brand-curve');
  if (brand) {
    brand.innerHTML = headerHtml;
    brand.classList.add('comm-brand-standard');
  }
  let footer = document.querySelector('.footer');
  if (!footer) {
    const slide = document.querySelector('.slide');
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

function applyTemplateOverrides(templateName, html, data = {}) {
  let output = html;

  if (templateName === 'incidentes-requerimientos-unidad') {
    const overrideCss = `
<style id="inc-req-unidad-standard-overrides">
/* Estándar visual slides 20–26:
   porcentaje de incidentes = cápsula naranja,
   porcentaje de requerimientos = cápsula azul. */
.pct-inc{
  right:7px !important;
  top:49px !important;
  color:#e9610c !important;
  border:2px solid #ff7617 !important;
  background:rgba(255,255,255,.98) !important;
}
.pct-req{
  left:11px !important;
  bottom:37px !important;
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
