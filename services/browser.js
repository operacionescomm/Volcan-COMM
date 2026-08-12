const fs = require('fs');
const puppeteer = require('puppeteer');

let browserPromise = null;

function resolveChromeExecutable() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_BIN,
    process.env.GOOGLE_CHROME_BIN,
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
  ].filter(Boolean);

  try {
    const bundled = puppeteer.executablePath();
    if (bundled) candidates.unshift(bundled);
  } catch (_) {
    // La caché puede no existir todavía durante el build.
  }

  return candidates.find(candidate => {
    try {
      return candidate && fs.existsSync(candidate);
    } catch (_) {
      return false;
    }
  }) || null;
}

async function getBrowser() {
  if (!browserPromise) {
    const executablePath = resolveChromeExecutable();

    if (!executablePath) {
      throw new Error('No se encontró Chrome/Chromium. Ejecuta npm run install:browser o revisa PUPPETEER_CACHE_DIR.');
    }

    browserPromise = puppeteer.launch({
      headless: true,
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote'
      ]
    }).catch(error => {
      browserPromise = null;
      throw error;
    });
  }

  return browserPromise;
}

async function closeBrowser() {
  if (!browserPromise) return;
  try {
    const browser = await browserPromise;
    await browser.close();
  } finally {
    browserPromise = null;
  }
}

module.exports = {
  getBrowser,
  closeBrowser,
  resolveChromeExecutable
};
