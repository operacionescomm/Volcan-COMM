const { execFileSync } = require('child_process');

function installBrowser() {
  try {
    console.log('[browser] Verificando Chrome compatible con Puppeteer...');
    const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    execFileSync(npx, ['puppeteer', 'browsers', 'install', 'chrome'], {
      stdio: 'inherit',
      env: process.env
    });
    console.log('[browser] Chrome disponible.');
  } catch (error) {
    console.error('[browser] No se pudo instalar Chrome:', error.message);
    process.exitCode = 1;
  }
}

installBrowser();
