const VOLCAN_CLEAN_PAYLOADS = {
  TOP10_SHEET: 'Top 10 Req e Inc',
  COST_SHEET: 'Costo_Servicio',
  SUPPLY_SHEET: 'ToTen_Sum',

  ROOT_CAUSE: {
    29: { titleCell: 'A55', unit: 'SCR-CAR', previous: { headerRow: 58, labelCell: 'M56' }, current: { headerRow: 82, labelCell: 'M80' } },
    30: { titleCell: 'A96', unit: 'Andaychagua', previous: { headerRow: 101, labelCell: 'M99' }, current: { headerRow: 125, labelCell: 'M123' } },
    31: { titleCell: 'A143', unit: 'Chungar', previous: { headerRow: 149, labelCell: 'M146' }, current: { headerRow: 174, labelCell: 'M171' } },
    32: { titleCell: 'A192', unit: 'Cerro de Pasco', previous: { headerRow: 198, labelCell: 'M196' }, current: { headerRow: 222, labelCell: 'M220' } }
  },

  COST: {
    34: { headerRow: 4, title: 'Valorización Volcan' },
    35: { headerRow: 24, title: 'Valorización U.M. Yauli' },
    36: { headerRow: 45, title: 'Valorización U.M. Yauli – San Cristóbal' },
    37: { headerRow: 70, title: 'Valorización U.M. Yauli – Carahuacra' },
    38: { headerRow: 96, title: 'Valorización U.M. Yauli – Andaychagua' },
    39: { headerRow: 121, title: 'Valorización U.M. Yauli – Ticlio' },
    40: { headerRow: 146, title: 'Valorización U.M. Chungar', seriesCount: 3 },
    41: { headerRow: 172, title: 'Valorización U.M. Cerro' },
    42: { headerRow: 197, title: 'Valorización U.M. Romina' }
  },

  SUPPLY: {
    44: { unit: 'VOLCAN', titleCell: 'B3', dataRange: 'B6:R15', totalSupplyCell: 'Q18', general12m: true },
    45: { unit: 'U.M. YAULI', titleCell: 'B27', dataRange: 'B29:F38', totalSupplyCell: 'E40' },
    46: { unit: 'MINA SAN CRISTOBAL', titleCell: 'B50', dataRange: 'B52:F61', totalSupplyCell: 'E63' },
    47: { unit: 'MINA CARAHUACRA', titleCell: 'B74', dataRange: 'B76:F85', totalSupplyCell: 'E87' },
    48: { unit: 'MINA ANDAYCHAGUA', titleCell: 'B98', dataRange: 'B100:F109', totalSupplyCell: 'E111' },
    49: { unit: 'MINA TICLIO', titleCell: 'B121', dataRange: 'B123:F132', totalSupplyCell: 'E134' },
    50: { unit: 'U.M. CHUNGAR', titleCell: 'B146', dataRange: 'B148:F157', totalSupplyCell: 'E159' },
    51: { unit: 'U.M. CERRO', titleCell: 'B168', dataRange: 'B170:F179', totalSupplyCell: 'E181' },
    52: { unit: 'U.M. ROMINA', titleCell: 'B196', dataRange: 'B198:F207', totalSupplyCell: 'E209' }
  }
};

/**
 * Construye el payload para los bloques que ya tienen hoja limpia validada.
 * Slides soportados aquí: 27–32, 34–42 y 44–52.
 */
function volcanBuildCleanPayload(slideNumber) {
  const slide = Number(slideNumber);
  if (slide === 27 || slide === 28) return volcanBuildTopTenPayload_(slide);
  if (VOLCAN_CLEAN_PAYLOADS.ROOT_CAUSE[slide]) return volcanBuildRootCausePayload_(slide);
  if (VOLCAN_CLEAN_PAYLOADS.COST[slide]) return volcanBuildCostPayload_(slide);
  if (VOLCAN_CLEAN_PAYLOADS.SUPPLY[slide]) return volcanBuildSupplyPayload_(slide);
  throw new Error(`Slide ${slide} no está mapeado a las hojas limpias.`);
}

function volcanBuildTopTenPayload_(slide) {
  const ss = volcanGetSpreadsheet_();
  const sheet = volcanRequireSheet_(ss, VOLCAN_CLEAN_PAYLOADS.TOP10_SHEET);
  const isReq = slide === 27;

  const title = sheet.getRange(isReq ? 'A1' : 'A28').getDisplayValue();
  const itemRange = isReq ? 'M6:O15' : 'M33:O42';
  const rows = sheet.getRange(itemRange).getValues();
  const totalAccum = Number(sheet.getRange(isReq ? 'U16' : 'U43').getValue() || 0);
  const monthText = sheet.getRange(isReq ? 'A23' : 'A51').getDisplayValue();
  const totalMonth = volcanExtractFirstNumber_(monthText);
  const period = sheet.getRange('R1').getValue();
  const monthShort = volcanMonthNameShort_(period, ss.getSpreadsheetTimeZone());

  const items = rows
    .map(row => ({
      nombre: String(row[0] || '').trim(),
      mesValor: 0,
      cant: Number(row[1] || 0),
      pct: Number(row[2] || 0)
    }))
    .filter(row => row.nombre && row.cant !== 0);

  return {
    titulo: title,
    tipoSingular: isReq ? 'Requerimiento' : 'Incidente',
    tipoPlural: isReq ? 'Requerimientos' : 'Incidentes',
    mesCorto: monthShort,
    totalMes: totalMonth,
    totalAcumulado: totalAccum,
    alcance: 'las localidades mineras',
    notaMesPrefix: `En ${volcanMonthNameLong_(period, ss.getSpreadsheetTimeZone())} se realizó un total de`,
    notaAcumuladoPrefix: `En la ventana móvil de 12 meses hasta ${monthShort} se realizó`,
    // La hoja limpia expone el ranking acumulado. Evitamos inventar una columna mensual por categoría.
    showMesColumn: false,
    items
  };
}

function volcanBuildRootCausePayload_(slide) {
  const ss = volcanGetSpreadsheet_();
  const sheet = volcanRequireSheet_(ss, VOLCAN_CLEAN_PAYLOADS.TOP10_SHEET);
  const cfg = VOLCAN_CLEAN_PAYLOADS.ROOT_CAUSE[slide];

  return {
    titulo: sheet.getRange(cfg.titleCell).getDisplayValue(),
    unidad: cfg.unit,
    // El template histórico se llama junio/julio, pero los objetos son dinámicos:
    // 'junio' = periodo anterior; 'julio' = periodo seleccionado.
    junio: volcanReadRootCauseMonth_(sheet, cfg.previous),
    julio: volcanReadRootCauseMonth_(sheet, cfg.current)
  };
}

function volcanReadRootCauseMonth_(sheet, cfg) {
  const firstDataRow = cfg.headerRow + 1;
  const rows = sheet.getRange(firstDataRow, 13, 10, 4).getValues(); // M:P
  const topTenRow = sheet.getRange(cfg.headerRow + 11, 13, 1, 4).getValues()[0];
  const totalRow = sheet.getRange(cfg.headerRow + 12, 13, 1, 4).getValues()[0];
  const label = sheet.getRange(cfg.labelCell).getDisplayValue();

  const items = rows
    .map(row => ({
      nombre: String(row[0] || '').trim(),
      cantidad: Number(row[1] || 0),
      tiempo: row[2] === '' || row[2] == null ? null : Number(row[2]),
      pct: volcanPercentNumber_(row[3])
    }))
    .filter(row => row.nombre && row.cantidad > 0);

  return {
    label,
    totalIncidentes: Number(totalRow[1] || 0),
    topTen: Number(topTenRow[1] || 0),
    pctTopTen: volcanPercentNumber_(topTenRow[3]),
    items
  };
}

function volcanBuildCostPayload_(slide) {
  const ss = volcanGetSpreadsheet_();
  const sheet = volcanRequireSheet_(ss, VOLCAN_CLEAN_PAYLOADS.COST_SHEET);
  const cfg = VOLCAN_CLEAN_PAYLOADS.COST[slide];
  const seriesCount = cfg.seriesCount || 2;

  const headerDisplay = sheet.getRange(cfg.headerRow, 3, 1, 14).getDisplayValues()[0]; // C:P
  const dataValues = sheet.getRange(cfg.headerRow + 1, 3, seriesCount, 14).getValues();
  const dataDisplay = sheet.getRange(cfg.headerRow + 1, 3, seriesCount, 14).getDisplayValues();

  const categories = headerDisplay.slice(1, 13);
  const series = dataValues.map((row, index) => ({
    label: String(dataDisplay[index][0] || '').trim(),
    values: row.slice(1, 13).map(value => Number(value || 0))
  }));

  const period = sheet.getRange('R2').getValue();

  return {
    titulo: cfg.title,
    tablaTitulo: String(headerDisplay[0] || '').trim(),
    periodo: volcanPeriodUpper_(period, ss.getSpreadsheetTimeZone()),
    categories,
    series
  };
}

function volcanBuildSupplyPayload_(slide) {
  const ss = volcanGetSpreadsheet_();
  const sheet = volcanRequireSheet_(ss, VOLCAN_CLEAN_PAYLOADS.SUPPLY_SHEET);
  const cfg = VOLCAN_CLEAN_PAYLOADS.SUPPLY[slide];
  const totalSuministros = Number(sheet.getRange(cfg.totalSupplyCell).getValue() || 0);
  const title = sheet.getRange(cfg.titleCell).getDisplayValue();

  let rows;
  if (cfg.general12m) {
    // B:R = nombre + 12 meses + CANT + UNID + TOTAL + %
    rows = sheet.getRange(cfg.dataRange).getValues().map(row => ({
      nombre: String(row[0] || '').trim(),
      unidad: String(row[14] || '').trim(),
      cantidad: Number(row[13] || 0),
      total: Number(row[15] || 0),
      pct: volcanPercentNumber_(row[16]) * 100
    }));
  } else {
    // B:F = SUMINISTRO | UNIDAD | CANTIDAD | TOTAL | %
    rows = sheet.getRange(cfg.dataRange).getValues().map(row => ({
      nombre: String(row[0] || '').trim(),
      unidad: String(row[1] || '').trim(),
      cantidad: Number(row[2] || 0),
      total: Number(row[3] || 0),
      pct: volcanPercentNumber_(row[4]) * 100
    }));
  }

  rows = rows.filter(row => row.nombre && (row.total !== 0 || row.cantidad !== 0));

  return {
    title,
    unit: cfg.unit,
    totalSuministros,
    rows
  };
}

function volcanPercentNumber_(value) {
  if (typeof value === 'number') return value > 1 ? value / 100 : value;
  const text = String(value || '').trim().replace(',', '.').replace('%', '');
  const parsed = Number(text);
  if (!isFinite(parsed)) return 0;
  return parsed > 1 ? parsed / 100 : parsed;
}

function volcanExtractFirstNumber_(text) {
  const match = String(text || '').match(/([\d.]+(?:,\d+)?)/);
  if (!match) return 0;
  return Number(match[1].replace(/\./g, '').replace(',', '.')) || 0;
}

function volcanMonthNameLong_(value, timeZone) {
  if (!(value instanceof Date) || isNaN(value.getTime())) return '';
  const names = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return names[value.getMonth()];
}

function volcanMonthNameShort_(value, timeZone) {
  if (!(value instanceof Date) || isNaN(value.getTime())) return '';
  const names = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Set','Oct','Nov','Dic'];
  return names[value.getMonth()];
}

function volcanPeriodUpper_(value, timeZone) {
  if (!(value instanceof Date) || isNaN(value.getTime())) return '';
  const names = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SET','OCT','NOV','DIC'];
  return `${names[value.getMonth()]}.${String(value.getFullYear()).slice(-2)}`;
}

/**
 * QA rápido desde Apps Script: construye todos los payloads limpios sin renderizar.
 */
function volcanTestCleanPayloads() {
  volcanPrepareRun();
  const slides = [27,28,29,30,31,32,34,35,36,37,38,39,40,41,42,44,45,46,47,48,49,50,51,52];
  const result = slides.map(slide => ({ slide, payload: volcanBuildCleanPayload(slide) }));
  Logger.log(JSON.stringify(result));
  return result;
}
