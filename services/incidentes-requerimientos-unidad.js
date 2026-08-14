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
      return { mes:String(item[0] || '').trim(), incidentes, requerimientos, total:toNumber(item[3]) || incidentes + requerimientos };
    }
    const incidentes = toNumber(item?.incidentes ?? item?.incidente ?? 0);
    const requerimientos = toNumber(item?.requerimientos ?? item?.requerimiento ?? 0);
    return {
      mes:String(item?.mes || item?.periodo || '').trim(),
      incidentes,
      requerimientos,
      total:toNumber(item?.total) || incidentes + requerimientos
    };
  }).filter(item => item.mes);
}

function normalizeIncReqUnidad(body = {}, unidadNombre = 'Unidad') {
  const series = normalizeSeries(body.series || body.seriesMensual || body.meses || []);
  const latest = series[series.length - 1] || {};
  const periodoRaw = body.periodo || latest.mes || 'Periodo';
  const periodo = humanPeriod(periodoRaw);
  const mesCorto = periodo.split(' ')[0] || periodo;

  const incidentesMes = toNumber(body.incidentesMes ?? body.incidentes ?? latest.incidentes ?? 0);
  const requerimientosMes = toNumber(body.requerimientosMes ?? body.requerimientos ?? latest.requerimientos ?? 0);
  const totalMes = toNumber(body.totalMes ?? body.total ?? latest.total ?? 0) || incidentesMes + requerimientosMes;
  const pctIncidentesMes = totalMes ? (incidentesMes / totalMes) * 100 : 0;
  const pctRequerimientosMes = totalMes ? (requerimientosMes / totalMes) * 100 : 0;
  const maxSerie = Math.max(100, ...series.flatMap(d => [d.incidentes, d.requerimientos]));

  const nombre = body.unidadNombre || unidadNombre;
  return {
    ...body,
    titulo: body.titulo || `Incidentes vs Requerimientos ${nombre}`,
    unidadNombre: nombre,
    periodo,
    periodoRaw,
    mesCorto,
    totalMes,
    incidentesMes,
    requerimientosMes,
    pctIncidentesMes,
    pctRequerimientosMes,
    series,
    maxSerie,
    resumen1: body.resumen1 || `En ${periodo}, ${nombre} registró ${totalMes.toLocaleString('es-PE')} atenciones clasificadas.`,
    resumen2: body.resumen2 || `${incidentesMes.toLocaleString('es-PE')} fueron incidentes (${pctIncidentesMes.toFixed(0)}%) y ${requerimientosMes.toLocaleString('es-PE')} requerimientos (${pctRequerimientosMes.toFixed(0)}%).`
  };
}

module.exports = { normalizeIncReqUnidad, normalizeSeries };
