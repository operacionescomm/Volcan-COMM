const VOLCAN_AUTOMATION = {
  INC_REQ_SHEET: 'Incidentes vs Requerimientos',
  CONFIG_SHEET: 'CONFIG DASHBOARDS',
  PERIOD_CELL: 'Q2',

  HEADERS: {
    VOLCAN: 'INCIDENTES VS REQUERIMIENTOS – VOLCAN',
    ANDAYCHAGUA: 'INCIDENTES VS REQUERIMIENTOS – ANDAYCHAGUA',
    SAN_CRISTOBAL_CARAHUACRA: 'INCIDENTES VS REQUERIMIENTOS – SAN CRISTÓBAL - CARAHUACRA',
    CERRO_PASCO: 'INCIDENTES VS REQUERIMIENTOS – CERRO PASCO',
    CHUNGAR: 'INCIDENTES VS REQUERIMIENTOS – CHUNGAR',
    ROMINA: 'INCIDENTES VS REQUERIMIENTOS – ROMINA',
    TICLIO: 'INCIDENTES VS REQUERIMIENTOS – TICLIO',
    SAN_CRISTOBAL: 'INCIDENTES VS REQUERIMIENTOS – SAN CRISTÓBAL'
  },

  INC_REQ_VOLCAN_MEMBERS: [
    'ANDAYCHAGUA',
    'SAN_CRISTOBAL_CARAHUACRA',
    'CERRO_PASCO',
    'CHUNGAR',
    'ROMINA',
    'TICLIO'
  ]
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('VOLCAN · Automatización')
    .addItem('Probar Inc/Req VOLCAN', 'testRenderIncReqVolcan')
    .addItem('Probar Inc/Req Andaychagua', 'testRenderIncReqAndaychagua')
    .addToUi();
}

function testRenderIncReqVolcan() {
  return testRenderIncReq_('VOLCAN');
}

function testRenderIncReqAndaychagua() {
  return testRenderIncReq_('ANDAYCHAGUA');
}

function testRenderIncReq_(scopeKey) {
  const period = getSelectedPeriod_();
  const payload = buildIncReqPayload_(scopeKey, period);
  const png = renderDashboard_(12, payload);

  const fileName = `TEST_${scopeKey}_INC_REQ_${period}.png`;
  const file = DriveApp.createFile(png.setName(fileName));

  SpreadsheetApp.getUi().alert(
    'Dashboard generado',
    `${fileName}\n${file.getUrl()}`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );

  return file.getUrl();
}

function buildIncReqPayload_(scopeKey, period) {
  const key = normalizeScopeKey_(scopeKey);

  if (key === 'VOLCAN') {
    const rows = VOLCAN_AUTOMATION.INC_REQ_VOLCAN_MEMBERS.map(member =>
      readIncReqScopePeriod_(member, period)
    );

    const detailTotal = rows.reduce((acc, row) => {
      acc.incidentes += row.incidentes;
      acc.requerimientos += row.requerimientos;
      acc.total += row.total;
      return acc;
    }, { incidentes: 0, requerimientos: 0, total: 0 });

    const reported = readIncReqScopePeriod_('VOLCAN', period);

    if (
      detailTotal.incidentes !== reported.incidentes ||
      detailTotal.requerimientos !== reported.requerimientos
    ) {
      throw new Error(
        `El consolidado no cuadra para ${period}. ` +
        `Detalle=${detailTotal.incidentes} Inc / ${detailTotal.requerimientos} Req; ` +
        `VOLCAN=${reported.incidentes} Inc / ${reported.requerimientos} Req.`
      );
    }

    return {
      scope: 'VOLCAN',
      periodo: period,
      incidentes: reported.incidentes,
      requerimientos: reported.requerimientos,
      totalAtenciones: reported.total,
      resumenRows: rows
    };
  }

  const row = readIncReqScopePeriod_(key, period);

  return {
    scope: key,
    periodo: period,
    incidentes: row.incidentes,
    requerimientos: row.requerimientos,
    totalAtenciones: row.total,
    resumenRows: [row]
  };
}

function readIncReqScopePeriod_(scopeKey, period) {
  const key = normalizeScopeKey_(scopeKey);
  const header = VOLCAN_AUTOMATION.HEADERS[key];

  if (!header) throw new Error(`Scope sin encabezado configurado: ${key}`);

  const ss = getVolcanSpreadsheet_();
  const sheet = ss.getSheetByName(VOLCAN_AUTOMATION.INC_REQ_SHEET);
  if (!sheet) throw new Error(`No existe la hoja ${VOLCAN_AUTOMATION.INC_REQ_SHEET}`);

  const lastRow = sheet.getLastRow();
  const values = sheet.getRange(1, 1, lastRow, 16).getDisplayValues(); // A:P

  const sectionIndex = values.findIndex(row => cleanText_(row[0]) === cleanText_(header));
  if (sectionIndex < 0) throw new Error(`No se encontró la sección: ${header}`);

  let monthlyHeaderIndex = -1;
  const scanEnd = Math.min(values.length, sectionIndex + 12);

  for (let i = sectionIndex; i < scanEnd; i++) {
    if (cleanText_(values[i][13]) === 'mes') {
      monthlyHeaderIndex = i;
      break;
    }
  }

  if (monthlyHeaderIndex < 0) {
    throw new Error(`No se encontró la tabla mensual de ${header}`);
  }

  const targetPeriod = cleanText_(period);

  for (let i = monthlyHeaderIndex + 1; i < values.length; i++) {
    const month = cleanText_(values[i][13]);
    if (!month) break;

    if (month === targetPeriod) {
      const incidentes = toNumber_(values[i][14]);
      const requerimientos = toNumber_(values[i][15]);

      return {
        unidad: scopeDisplayName_(key),
        incidentes,
        requerimientos,
        total: incidentes + requerimientos
      };
    }
  }

  throw new Error(`No se encontró el periodo ${period} en ${header}`);
}

function getSelectedPeriod_() {
  const ss = getVolcanSpreadsheet_();
  const dashboard = ss.getSheetByName(VOLCAN_AUTOMATION.INC_REQ_SHEET);

  if (dashboard) {
    const selected = String(dashboard.getRange(VOLCAN_AUTOMATION.PERIOD_CELL).getDisplayValue() || '').trim();
    if (selected) return selected;
  }

  const config = ss.getSheetByName(VOLCAN_AUTOMATION.CONFIG_SHEET);
  if (!config) throw new Error('No se pudo obtener el periodo seleccionado.');

  const values = config.getRange(2, 1, Math.max(1, config.getLastRow() - 1), 1)
    .getDisplayValues()
    .flat()
    .filter(Boolean);

  if (!values.length) throw new Error('CONFIG DASHBOARDS no contiene periodos.');
  return values[values.length - 1];
}

function renderDashboard_(slideNumber, payload) {
  const props = PropertiesService.getScriptProperties();
  const baseUrl = String(props.getProperty('RENDER_BASE_URL') || '').replace(/\/$/, '');
  const apiKey = String(props.getProperty('RENDER_API_KEY') || '');

  if (!baseUrl) {
    throw new Error('Falta la propiedad RENDER_BASE_URL en Apps Script.');
  }

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
    headers: {}
  };

  if (apiKey) options.headers['x-api-key'] = apiKey;

  const response = UrlFetchApp.fetch(`${baseUrl}/render/slide${slideNumber}`, options);
  const code = response.getResponseCode();

  if (code !== 200) {
    throw new Error(`Render respondió HTTP ${code}: ${response.getContentText()}`);
  }

  return response.getBlob().setContentType('image/png');
}

function getVolcanSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const id = String(props.getProperty('VOLCAN_SPREADSHEET_ID') || '').trim();

  if (id) return SpreadsheetApp.openById(id);

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) {
    throw new Error('No hay spreadsheet activo y falta VOLCAN_SPREADSHEET_ID.');
  }

  return active;
}

function normalizeScopeKey_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function cleanText_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function toNumber_(value) {
  if (typeof value === 'number') return value;
  const text = String(value || '').trim().replace(/\s/g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  return Number(text) || 0;
}

function scopeDisplayName_(key) {
  const names = {
    VOLCAN: 'VOLCAN',
    ANDAYCHAGUA: 'Andaychagua',
    SAN_CRISTOBAL_CARAHUACRA: 'San Cristóbal - Carahuacra',
    CERRO_PASCO: 'Cerro Pasco',
    CHUNGAR: 'Chungar',
    ROMINA: 'Romina',
    TICLIO: 'Ticlio',
    SAN_CRISTOBAL: 'San Cristóbal'
  };

  return names[key] || key;
}
