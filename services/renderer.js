const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const { getBrowser } = require('./browser');

const ROOT = path.join(__dirname, '..');
const VIEW_DIR = path.join(ROOT, 'views');
const PUBLIC_DIR = path.join(ROOT, 'public');

function applyTemplateOverrides(templateName, html) {
  if (templateName !== 'incidentes-requerimientos-unidad') return html;

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

  return html.includes('</head>')
    ? html.replace('</head>', `${overrideCss}\n</head>`)
    : `${overrideCss}\n${html}`;
}

async function renderTemplateToHtml(templateName, data) {
  const templatePath = path.join(VIEW_DIR, `${templateName}.ejs`);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Plantilla no encontrada: ${templateName}`);
  }

  const html = await ejs.renderFile(templatePath, data, { async: false });
  return applyTemplateOverrides(templateName, html);
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
