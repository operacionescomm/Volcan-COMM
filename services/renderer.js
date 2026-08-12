const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const { getBrowser } = require('./browser');

const ROOT = path.join(__dirname, '..');
const VIEW_DIR = path.join(ROOT, 'views');
const PUBLIC_DIR = path.join(ROOT, 'public');

async function renderTemplateToHtml(templateName, data) {
  const templatePath = path.join(VIEW_DIR, `${templateName}.ejs`);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Plantilla no encontrada: ${templateName}`);
  }
  return ejs.renderFile(templatePath, data, { async: false });
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
