const VOLCAN_CONTROL_SYNC = {
  CONTROL_SHEET: 'CONTROL_AUTOMATIZACION',
  CONTROL_PERIOD_CELL: 'B2',
  ALLOWED_PERIODS_RANGE: 'Z2:Z23',
  TARGETS: [
    { sheet: 'Incidentes vs Requerimientos', cell: 'Q2', role: 'Incidentes vs Requerimientos' },
    { sheet: 'Top 10 Req e Inc', cell: 'R1', role: 'Top Ten + Causa Raíz' },
    { sheet: 'Costo_Servicio', cell: 'R2', role: 'Valorización' },
    { sheet: 'ToTen_Sum', cell: 'X2', role: 'Suministros' }
  ],
  RECALC_WAIT_MS: 1200
};

/**
 * Paso obligatorio antes de cualquier validación/render del reporte VOLCAN.
 * Lee CONTROL_AUTOMATIZACION!B2 y sincroniza el periodo hacia todas las
 * hojas limpias que alimentan el motor.
 *
 * Importante: setValue conserva la validación/desplegable de cada selector.
 */
function volcanPrepareRun() {
  return volcanSyncPeriodFromControl();
}

function volcanSyncPeriodFromControl() {
  const ss = volcanGetSpreadsheet_();
  const control = volcanRequireSheet_(ss, VOLCAN_CONTROL_SYNC.CONTROL_SHEET);
  const period = control.getRange(VOLCAN_CONTROL_SYNC.CONTROL_PERIOD_CELL).getValue();

  volcanValidatePeriod_(control, period);

  VOLCAN_CONTROL_SYNC.TARGETS.forEach(target => {
    const sheet = volcanRequireSheet_(ss, target.sheet);
    sheet.getRange(target.cell).setValue(period).setNumberFormat('mmm-yy');
  });

  SpreadsheetApp.flush();
  if (VOLCAN_CONTROL_SYNC.RECALC_WAIT_MS > 0) {
    Utilities.sleep(VOLCAN_CONTROL_SYNC.RECALC_WAIT_MS);
  }
  SpreadsheetApp.flush();

  const verification = volcanVerifySync_(ss, period);
  const failed = verification.filter(row => !row.ok);

  if (failed.length) {
    throw new Error(
      'No se pudo sincronizar el periodo maestro en todas las hojas limpias. ' +
      failed.map(row => `${row.sheet}!${row.cell}=${row.actual || '(vacío)'}`).join(' | ')
    );
  }

  return {
    ok: true,
    period,
    periodLabel: volcanFormatPeriod_(period, ss.getSpreadsheetTimeZone()),
    targets: verification
  };
}

function volcanVerifySync() {
  const ss = volcanGetSpreadsheet_();
  const control = volcanRequireSheet_(ss, VOLCAN_CONTROL_SYNC.CONTROL_SHEET);
  const period = control.getRange(VOLCAN_CONTROL_SYNC.CONTROL_PERIOD_CELL).getValue();
  return volcanVerifySync_(ss, period);
}

function volcanVerifySync_(ss, expectedPeriod) {
  const expectedKey = volcanMonthKey_(expectedPeriod);

  return VOLCAN_CONTROL_SYNC.TARGETS.map(target => {
    const sheet = volcanRequireSheet_(ss, target.sheet);
    const range = sheet.getRange(target.cell);
    const actual = range.getValue();
    return {
      sheet: target.sheet,
      cell: target.cell,
      role: target.role,
      actual: range.getDisplayValue(),
      ok: volcanMonthKey_(actual) === expectedKey
    };
  });
}

function volcanValidatePeriod_(control, period) {
  if (!(period instanceof Date) || isNaN(period.getTime())) {
    throw new Error(
      `${VOLCAN_CONTROL_SYNC.CONTROL_SHEET}!${VOLCAN_CONTROL_SYNC.CONTROL_PERIOD_CELL} ` +
      'no contiene un periodo válido.'
    );
  }

  const allowed = control
    .getRange(VOLCAN_CONTROL_SYNC.ALLOWED_PERIODS_RANGE)
    .getValues()
    .flat()
    .filter(value => value instanceof Date && !isNaN(value.getTime()))
    .map(volcanMonthKey_);

  if (!allowed.includes(volcanMonthKey_(period))) {
    throw new Error(
      `El periodo ${volcanFormatPeriod_(period, control.getParent().getSpreadsheetTimeZone())} ` +
      `no está incluido en ${VOLCAN_CONTROL_SYNC.ALLOWED_PERIODS_RANGE}.`
    );
  }
}

function volcanMonthKey_(value) {
  if (!(value instanceof Date) || isNaN(value.getTime())) return '';
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
}

function volcanFormatPeriod_(value, timeZone) {
  if (!(value instanceof Date) || isNaN(value.getTime())) return '';
  return Utilities.formatDate(value, timeZone || Session.getScriptTimeZone(), 'MMM-yy').toLowerCase();
}

function volcanRequireSheet_(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error(`No existe la hoja requerida: ${name}`);
  return sheet;
}

function volcanGetSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = String(props.getProperty('VOLCAN_SPREADSHEET_ID') || '').trim();
  if (spreadsheetId) return SpreadsheetApp.openById(spreadsheetId);

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) {
    throw new Error('No hay spreadsheet activo y falta VOLCAN_SPREADSHEET_ID.');
  }
  return active;
}
