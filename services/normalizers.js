function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  let text = String(value ?? '').trim();
  if (!text) return 0;
  text = text.replace(/\s/g, '').replace(/[^\d,.-]/g, '');
  const lastComma = text.lastIndexOf(',');
  const lastDot = text.lastIndexOf('.');
  if (lastComma > -1 && lastDot > -1) {
    if (lastComma > lastDot) text = text.replace(/\./g, '').replace(',', '.');
    else text = text.replace(/,/g, '');
  } else if (lastComma > -1) {
    const decimals = text.length - lastComma - 1;
    text = decimals <= 2 ? text.replace(',', '.') : text.replace(/,/g, '');
  }
  const result = Number(text);
  return Number.isFinite(result) ? result : 0;
}

function pct(value, total, decimals = 0) {
  if (!total) return `0${decimals ? '.' + '0'.repeat(decimals) : ''}%`;
  return `${((toNumber(value) / toNumber(total)) * 100).toFixed(decimals)}%`;
}

function normalizeRows(rawRows) {
  if (!Array.isArray(rawRows)) return [];
  return rawRows.map(item => {
    if (Array.isArray(item)) {
      const incidentes = toNumber(item[1]);
      const requerimientos = toNumber(item[2]);
      return { unidad: String(item[0] || '').trim(), incidentes, requerimientos, total: toNumber(item[3]) || incidentes + requerimientos };
    }
    const incidentes = toNumber(item?.incidentes ?? item?.incidente ?? item?.inc ?? 0);
    const requerimientos = toNumber(item?.requerimientos ?? item?.requerimiento ?? item?.req ?? 0);
    return { unidad: String(item?.unidad || item?.mina || item?.up || item?.nombre || '').trim(), incidentes, requerimientos, total: toNumber(item?.total) || incidentes + requerimientos };
  }).filter(item => item.unidad);
}

function normalizeIncReq(body = {}, scopeConfig) {
  const rows = normalizeRows(body.resumenRows || body.tablaRows || body.rows || []);
  const sumInc = rows.reduce((acc, item) => acc + item.incidentes, 0);
  const sumReq = rows.reduce((acc, item) => acc + item.requerimientos, 0);
  const sumTotal = rows.reduce((acc, item) => acc + item.total, 0);
  const incidentes = toNumber(body.incidentes) || sumInc;
  const requerimientos = toNumber(body.requerimientos) || sumReq;
  const totalAtenciones = toNumber(body.totalAtenciones || body.total) || sumTotal || incidentes + requerimientos;
  const pctIncidentesNum = totalAtenciones ? (incidentes / totalAtenciones) * 100 : 0;
  const pctRequerimientosNum = totalAtenciones ? (requerimientos / totalAtenciones) * 100 : 0;
  const brecha = requerimientos - incidentes;
  const maxTotal = Math.max(1, ...rows.map(item => Math.max(item.incidentes, item.requerimientos, item.total)));
  const liderIncidentes = rows.slice().sort((a, b) => b.incidentes - a.incidentes)[0] || null;
  const liderAtenciones = rows.slice().sort((a, b) => b.total - a.total)[0] || null;
  const titulo = body.titulo || `${scopeConfig.titulo} - ${body.periodo || 'Periodo'} - Incidentes vs Requerimientos`;
  const scopeLabel = scopeConfig.tipo === 'consolidado' ? 'Consolidado' : 'Unidad minera';
  return {
    titulo, periodo: body.periodo || 'Periodo', scope: scopeConfig.key, scopeNombre: scopeConfig.nombre,
    scopeTitulo: scopeConfig.titulo, scopeTipo: scopeConfig.tipo, scopeLabel, minas: scopeConfig.minas,
    totalAtenciones, incidentes, requerimientos, brecha,
    pctIncidentes: body.pctIncidentes || pct(incidentes, totalAtenciones),
    pctRequerimientos: body.pctRequerimientos || pct(requerimientos, totalAtenciones),
    pctIncidentesNum, pctRequerimientosNum, rows, maxTotal, liderIncidentes, liderAtenciones,
    insight: body.insight || buildInsight({ scopeConfig, incidentes, requerimientos, totalAtenciones, pctRequerimientosNum, liderIncidentes })
  };
}

function buildInsight({ scopeConfig, incidentes, requerimientos, totalAtenciones, pctRequerimientosNum, liderIncidentes }) {
  const predominio = requerimientos >= incidentes ? 'requerimientos' : 'incidentes';
  const base = `${scopeConfig.nombre} registra ${totalAtenciones} atenciones: ${requerimientos} requerimientos y ${incidentes} incidentes. `;
  if (scopeConfig.tipo === 'consolidado' && liderIncidentes) {
    return base + `Predominan los ${predominio}; los requerimientos representan ${pctRequerimientosNum.toFixed(0)}% del total. ${liderIncidentes.unidad} concentra la mayor cantidad de incidentes (${liderIncidentes.incidentes}).`;
  }
  return base + `Predominan los ${predominio}; los requerimientos representan ${pctRequerimientosNum.toFixed(0)}% del total del periodo.`;
}

function normalizeAtencionesSeries(raw = []) {
  if (!Array.isArray(raw)) return [];
  return raw.map(item => {
    if (Array.isArray(item)) return { mes: String(item[0] || '').trim(), yauli: toNumber(item[1]), chungar: toNumber(item[2]), cerroPasco: toNumber(item[3]), romina: toNumber(item[4]), total: toNumber(item[5]) };
    return { mes: String(item?.mes || item?.periodo || '').trim(), yauli: toNumber(item?.yauli ?? item?.umYauli ?? 0), chungar: toNumber(item?.chungar ?? item?.umChungar ?? 0), cerroPasco: toNumber(item?.cerroPasco ?? item?.cerro ?? item?.umCerroPasco ?? 0), romina: toNumber(item?.romina ?? item?.umRomina ?? 0), total: toNumber(item?.total ?? 0) };
  }).filter(item => item.mes);
}

function normalizeImSupSeries(raw = []) {
  if (!Array.isArray(raw)) return [];
  return raw.map(item => {
    if (Array.isArray(item)) return { mes: String(item[0] || '').trim(), im: toNumber(item[1]), sup: toNumber(item[2]), total: toNumber(item[3]) || toNumber(item[1]) + toNumber(item[2]) };
    const im = toNumber(item?.im ?? item?.interiorMina ?? 0);
    const sup = toNumber(item?.sup ?? item?.superficie ?? 0);
    return { mes: String(item?.mes || item?.periodo || '').trim(), im, sup, total: toNumber(item?.total ?? 0) || im + sup };
  }).filter(item => item.mes);
}

function humanPeriod(value) {
  const text = String(value || '').trim();
  if (!text) return 'Periodo';
  const months = { ene: 'Enero', feb: 'Febrero', mar: 'Marzo', abr: 'Abril', may: 'Mayo', jun: 'Junio', jul: 'Julio', ago: 'Agosto', sept: 'Septiembre', sep: 'Septiembre', oct: 'Octubre', nov: 'Noviembre', dic: 'Diciembre' };
  const match = text.toLowerCase().match(/^([a-záéíóú]+)[-\s](\d{2,4})$/i);
  if (!match) return text;
  const key = match[1].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const year = match[2].length === 2 ? `20${match[2]}` : match[2];
  return `${months[key] || match[1]} ${year}`;
}

function normalizeAtenciones(body = {}) {
  const seriesUM = normalizeAtencionesSeries(body.seriesUM || body.mesesUM || body.unidades || []);
  const seriesImSup = normalizeImSupSeries(body.seriesImSup || body.mesesImSup || body.imSup || []);
  const latestUM = seriesUM[seriesUM.length - 1] || {};
  const latestImSup = seriesImSup[seriesImSup.length - 1] || {};
  const kpis = body.kpis || {};
  const periodoRaw = body.periodo || latestUM.mes || latestImSup.mes || 'Periodo';
  const periodo = humanPeriod(periodoRaw);
  const yauli = toNumber(kpis.yauli ?? body.yauli ?? latestUM.yauli ?? 0);
  const chungar = toNumber(kpis.chungar ?? body.chungar ?? latestUM.chungar ?? 0);
  const cerroPasco = toNumber(kpis.cerroPasco ?? body.cerroPasco ?? latestUM.cerroPasco ?? 0);
  const romina = toNumber(kpis.romina ?? body.romina ?? latestUM.romina ?? 0);
  const im = toNumber(kpis.im ?? body.im ?? latestImSup.im ?? 0);
  const sup = toNumber(kpis.sup ?? body.sup ?? latestImSup.sup ?? 0);
  const maxUM = Math.max(100, ...seriesUM.flatMap(item => [item.yauli, item.chungar, item.cerroPasco, item.romina]));
  const maxImSup = Math.max(100, ...seriesImSup.flatMap(item => [item.im, item.sup]));
  const unidades = [ { key: 'yauli', nombre: 'YAULI', valor: yauli }, { key: 'chungar', nombre: 'CHUNGAR', valor: chungar }, { key: 'cerroPasco', nombre: 'CERRO PASCO', valor: cerroPasco }, { key: 'romina', nombre: 'ROMINA', valor: romina } ];
  const lider = unidades.slice().sort((a, b) => b.valor - a.valor)[0] || { nombre: '-', valor: 0 };
  const segundo = unidades.slice().sort((a, b) => b.valor - a.valor)[1] || { nombre: '-', valor: 0 };
  const resumen1 = body.resumen1 || `En ${periodo}, ${lider.nombre} lidera las atenciones por U.M. con ${lider.valor}, seguido de ${segundo.nombre} con ${segundo.valor}.`;
  const resumen2 = body.resumen2 || `Interior Mina (IM) registró ${im} atenciones y Superficie (SUP) ${sup}, ${im >= sup ? 'manteniendo la mayor demanda en interior mina' : 'con mayor demanda registrada en superficie'}.`;
  return { titulo: body.titulo || 'ATENCIONES EN LA OPERACIÓN', periodo, periodoRaw, kpis: { yauli, chungar, cerroPasco, romina, im, sup }, seriesUM, seriesImSup, maxUM, maxImSup, resumen1, resumen2 };
}

function normalizeYauliAtenciones(body = {}) {
  const seriesTotal = (body.seriesTotal || body.totales || []).map(item => Array.isArray(item)
    ? { mes: String(item[0] || '').trim(), total: toNumber(item[1]) }
    : { mes: String(item?.mes || item?.periodo || '').trim(), total: toNumber(item?.total ?? item?.atenciones ?? 0) }
  ).filter(item => item.mes);
  const seriesImSup = normalizeImSupSeries(body.seriesImSup || body.imSup || []);
  const latestTotal = seriesTotal[seriesTotal.length - 1] || {};
  const latestImSup = seriesImSup[seriesImSup.length - 1] || {};
  const periodoRaw = body.periodo || latestTotal.mes || latestImSup.mes || 'Periodo';
  const periodo = humanPeriod(periodoRaw);
  const totalMes = toNumber(body.totalMes ?? body.total ?? latestTotal.total ?? latestImSup.total ?? 0);
  const im = toNumber(body.im ?? latestImSup.im ?? 0);
  const sup = toNumber(body.sup ?? latestImSup.sup ?? 0);
  const acumulado12 = toNumber(body.acumulado12) || seriesTotal.slice(-12).reduce((acc, item) => acc + item.total, 0);
  const diasMes = toNumber(body.diasMes) || 31;
  const promedioDia = body.promedioDia != null ? toNumber(body.promedioDia) : (diasMes ? totalMes / diasMes : 0);
  const maxTotal = Math.max(100, ...seriesTotal.map(item => item.total));
  const maxImSup = Math.max(100, ...seriesImSup.flatMap(item => [item.im, item.sup]));
  return {
    titulo: body.titulo || 'CANTIDAD DE ATENCIONES – U.M. YAULI',
    periodo, periodoRaw, totalMes, acumulado12, im, sup,
    promedioDia: Number(promedioDia.toFixed(1)), diasMes,
    seriesTotal, seriesImSup, maxTotal, maxImSup,
    resumen1: body.resumen1 || `En ${periodo}, U.M. Yauli registró ${totalMes} atenciones.`,
    resumen2: body.resumen2 || `Interior Mina (IM) alcanzó ${im} atenciones y Superficie (SUP) ${sup}.`,
    resumen3: body.resumen3 || `La operación mantiene una demanda más alta en Interior Mina durante el periodo analizado.`
  };
}

module.exports = {
  toNumber, pct, normalizeRows, normalizeIncReq, normalizeAtencionesSeries,
  normalizeImSupSeries, normalizeAtenciones, normalizeYauliAtenciones, humanPeriod
};