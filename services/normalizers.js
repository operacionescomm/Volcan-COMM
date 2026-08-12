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

  return rawRows
    .map(item => {
      if (Array.isArray(item)) {
        const incidentes = toNumber(item[1]);
        const requerimientos = toNumber(item[2]);
        return {
          unidad: String(item[0] || '').trim(),
          incidentes,
          requerimientos,
          total: toNumber(item[3]) || incidentes + requerimientos
        };
      }

      const incidentes = toNumber(item?.incidentes ?? item?.incidente ?? item?.inc ?? 0);
      const requerimientos = toNumber(item?.requerimientos ?? item?.requerimiento ?? item?.req ?? 0);

      return {
        unidad: String(item?.unidad || item?.mina || item?.up || item?.nombre || '').trim(),
        incidentes,
        requerimientos,
        total: toNumber(item?.total) || incidentes + requerimientos
      };
    })
    .filter(item => item.unidad);
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
  const scopeLabel = scopeConfig.tipo === 'consolidado' ? 'Consolidado 4 minas' : 'Unidad minera';

  return {
    titulo,
    periodo: body.periodo || 'Periodo',
    scope: scopeConfig.key,
    scopeNombre: scopeConfig.nombre,
    scopeTitulo: scopeConfig.titulo,
    scopeTipo: scopeConfig.tipo,
    scopeLabel,
    minas: scopeConfig.minas,
    totalAtenciones,
    incidentes,
    requerimientos,
    brecha,
    pctIncidentes: body.pctIncidentes || pct(incidentes, totalAtenciones),
    pctRequerimientos: body.pctRequerimientos || pct(requerimientos, totalAtenciones),
    pctIncidentesNum,
    pctRequerimientosNum,
    rows,
    maxTotal,
    liderIncidentes,
    liderAtenciones,
    insight: body.insight || buildInsight({
      scopeConfig,
      incidentes,
      requerimientos,
      totalAtenciones,
      pctRequerimientosNum,
      liderIncidentes
    })
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

module.exports = {
  toNumber,
  pct,
  normalizeRows,
  normalizeIncReq
};
