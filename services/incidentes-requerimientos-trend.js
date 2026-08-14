function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function humanPeriod(value) {
  const text = String(value || '').trim();
  const months = { ene:'Enero', feb:'Febrero', mar:'Marzo', abr:'Abril', may:'Mayo', jun:'Junio', jul:'Julio', ago:'Agosto', sept:'Septiembre', sep:'Septiembre', oct:'Octubre', nov:'Noviembre', dic:'Diciembre' };
  const match = text.toLowerCase().match(/^([a-záéíóú]+)[-\s](\d{2,4})$/i);
  if (!match) return text || 'Periodo';
  const key = match[1].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const year = match[2].length === 2 ? `20${match[2]}` : match[2];
  return `${months[key] || match[1]} ${year}`;
}

function normalizeSeries(raw = []) {
  if (!Array.isArray(raw)) return [];
  return raw.map(item => {
    if (Array.isArray(item)) {
      const incidentes = toNumber(item[1]);
      const requerimientos = toNumber(item[2]);
      return {
        mes: String(item[0] || '').trim(),
        incidentes,
        requerimientos,
        total: toNumber(item[3]) || incidentes + requerimientos
      };
    }
    const incidentes = toNumber(item?.incidentes ?? item?.incidente ?? 0);
    const requerimientos = toNumber(item?.requerimientos ?? item?.requerimiento ?? 0);
    return {
      mes: String(item?.mes || item?.periodo || '').trim(),
      incidentes,
      requerimientos,
      total: toNumber(item?.total) || incidentes + requerimientos
    };
  }).filter(item => item.mes);
}

function normalizeIncReqTrend(body = {}) {
  const series = normalizeSeries(body.series || body.seriesMensual || body.meses || []);
  const latest = series[series.length - 1] || {};
  const periodoRaw = body.periodo || latest.mes || 'Periodo';
  const periodo = humanPeriod(periodoRaw);
  const mesCorto = periodo.split(' ')[0] || periodo;

  const incidentesMes = toNumber(body.incidentesMes ?? body.incidentes ?? latest.incidentes ?? 0);
  const requerimientosMes = toNumber(body.requerimientosMes ?? body.requerimientos ?? latest.requerimientos ?? 0);
  const totalMes = toNumber(body.totalMes ?? body.total ?? latest.total ?? 0) || incidentesMes + requerimientosMes;

  const acumuladoIncidentes = toNumber(body.acumuladoIncidentes) || series.slice(-12).reduce((acc, d) => acc + d.incidentes, 0);
  const acumuladoRequerimientos = toNumber(body.acumuladoRequerimientos) || series.slice(-12).reduce((acc, d) => acc + d.requerimientos, 0);
  const acumuladoTotal = toNumber(body.acumuladoTotal) || acumuladoIncidentes + acumuladoRequerimientos;

  const pctIncidentesAcum = acumuladoTotal ? (acumuladoIncidentes / acumuladoTotal) * 100 : 0;
  const pctRequerimientosAcum = acumuladoTotal ? (acumuladoRequerimientos / acumuladoTotal) * 100 : 0;
  const maxSerie = Math.max(100, ...series.flatMap(d => [d.incidentes, d.requerimientos]));
  const rangoPeriodo = series.length ? `${series[0].mes} a ${series[series.length - 1].mes}` : periodoRaw;

  return {
    titulo: body.titulo || 'INCIDENTES VS REQUERIMIENTOS – VOLCAN',
    periodo,
    periodoRaw,
    mesCorto,
    totalMes,
    incidentesMes,
    requerimientosMes,
    acumuladoIncidentes,
    acumuladoRequerimientos,
    acumuladoTotal,
    pctIncidentesAcum,
    pctRequerimientosAcum,
    series,
    maxSerie,
    rangoPeriodo,
    resumen1: body.resumen1 || `En ${periodo}, VOLCAN registró ${totalMes.toLocaleString('es-PE')} atenciones: ${incidentesMes.toLocaleString('es-PE')} incidentes y ${requerimientosMes.toLocaleString('es-PE')} requerimientos.`,
    resumen2: body.resumen2 || `En el acumulado de 12 meses se registran ${acumuladoTotal.toLocaleString('es-PE')} atenciones; los requerimientos representan ${pctRequerimientosAcum.toFixed(0)}% y los incidentes ${pctIncidentesAcum.toFixed(0)}%.`
  };
}

module.exports = { normalizeIncReqTrend };
