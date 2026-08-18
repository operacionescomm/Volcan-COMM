const MONTHS_12 = ['AGO. 25','SET. 25','OCT. 25','NOV. 25','DIC. 25','ENE. 26','FEB. 26','MAR. 26','ABR. 26','MAY. 26','JUN.26','JUL.26'];

const VALORIZACION_SAMPLES = {
  34: {
    titulo: 'Valorización Volcan',
    tablaTitulo: 'SERVICIO',
    periodo: 'JUL.26',
    categories: MONTHS_12,
    series: [
      { label: 'Soporte y Mantenimiento', color: '#0d4a98', values: [73785.72,77577.45,85319.90,85180.10,83499.24,84978.00,84978.00,84978.00,84065.55,82984.50,83758.98,84356.14] },
      { label: 'Suministros', color: '#f26b12', values: [34022.08,37783.95,36501.19,34264.30,40036.89,33767.82,32624.99,31997.90,36235.78,32256.94,39700.44,43337.82] }
    ]
  },
  35: {
    titulo: 'Valorización U.M. Yauli',
    tablaTitulo: 'U.M. YAULI',
    periodo: 'JUL.26',
    categories: MONTHS_12,
    series: [
      { label: 'Soporte y Mantenimiento', color: '#0d4a98', values: [53517.34,53517.34,57177.63,57263.72,55582.86,56642.11,56642.11,56642.11,55729.66,55729.66,55729.66,56642.11] },
      { label: 'Suministros', color: '#f26b12', values: [24010.28,25306.48,24376.89,22017.79,29831.10,24728.97,23568.33,22181.25,23926.93,22053.56,25227.13,25847.74] }
    ]
  },
  36: {
    titulo: 'Valorización U.M. Yauli – San Cristóbal',
    tablaTitulo: 'MINA SAN CRISTOBAL',
    periodo: 'JUL.26',
    categories: MONTHS_12,
    series: [
      { label: 'Soporte y Mantenimiento', color: '#0d4a98', values: [17870.67,17870.67,17708.28,17546.21,16186.21,17546.21,17546.21,17546.21,17546.21,17546.21,17546.21,17546.21] },
      { label: 'Suministros', color: '#f26b12', values: [10428.98,5421.74,7108.27,6620.44,12208.65,7108.67,5703.58,5172.33,6032.97,5672.84,6119.00,6683.99] }
    ]
  },
  37: {
    titulo: 'Valorización U.M. Yauli – Carahuacra',
    tablaTitulo: 'MINA CARAHUACRA',
    periodo: 'JUL.26',
    categories: MONTHS_12,
    series: [
      { label: 'Soporte y Mantenimiento', color: '#0d4a98', values: [14429.53,14429.53,14429.53,14429.53,14429.53,14429.53,14429.53,14429.53,14429.53,14429.53,14429.53,14429.53] },
      { label: 'Suministros', color: '#f26b12', values: [3176.25,3693.20,2684.27,3423.00,4187.54,7241.98,4266.18,6314.14,5010.13,3474.78,3923.92,4729.42] }
    ]
  },
  38: {
    titulo: 'Valorización U.M. Yauli – Andaychagua',
    tablaTitulo: 'MINA ANDAYCHAGUA',
    periodo: 'JUL.26',
    categories: MONTHS_12,
    series: [
      { label: 'Soporte y Mantenimiento', color: '#0d4a98', values: [16915.25,17090.27,20949.76,20986.09,20665.23,20364.48,20364.48,20364.48,19452.03,19452.03,19452.03,20364.48] },
      { label: 'Suministros', color: '#f26b12', values: [8347.99,11938.60,8746.00,8076.15,6062.80,6181.69,7856.50,6242.03,7904.92,8523.41,10743.22,10402.16] }
    ]
  },
  39: {
    titulo: 'Valorización U.M. Yauli – Ticlio',
    tablaTitulo: 'MINA TICLIO',
    periodo: 'JUL.26',
    categories: MONTHS_12,
    series: [
      { label: 'Soporte y Mantenimiento', color: '#0d4a98', values: [4301.89,4301.89,4090.06,4301.89,4301.89,4301.89,4301.89,4301.89,4301.89,4301.89,4301.89,4301.89] },
      { label: 'Suministros', color: '#f26b12', values: [2057.06,4252.94,5838.35,3898.20,7372.11,4196.63,5742.07,4452.75,4978.91,4382.53,4440.99,4032.17] }
    ]
  },
  40: {
    titulo: 'Valorización U.M. Chungar',
    tablaTitulo: 'U.M. CHUNGAR',
    periodo: 'JUL.26',
    categories: MONTHS_12,
    series: [
      { label: 'Soporte y Mantenimiento', color: '#0d4a98', values: [16036.97,16036.97,16036.97,16036.97,16036.97,16036.97,16036.97,16036.97,16036.97,16036.97,16036.97,16036.97] },
      { label: 'Suministros Soporte', color: '#f26b12', values: [7010.29,6515.92,7406.25,6441.57,6400.35,6506.93,6250.48,6424.80,6684.27,5503.54,6541.56,8338.33] },
      { label: 'Suministros Automatización', color: '#7b8798', values: [3001.51,3557.05,3025.99,3020.05,1020.55,1519.93,1562.35,1583.93,1523.99,1536.89,1527.48,1521.04] }
    ]
  },
  41: {
    titulo: 'Valorización U.M. Cerro',
    tablaTitulo: 'U.M. CERRO',
    periodo: 'JUL.26',
    categories: MONTHS_12,
    series: [
      { label: 'Soporte y Mantenimiento', color: '#0d4a98', values: [4231.41,4231.41,4231.41,4231.41,4231.41,4231.41,4231.41,4231.41,4231.41,4231.41,4231.41,4231.41] },
      { label: 'Suministros', color: '#f26b12', values: [0,0,0,0,0,0,0,0,0,0,0,0] }
    ]
  },
  42: {
    titulo: 'Valorización U.M. Romina',
    tablaTitulo: 'U.M. ROMINA',
    periodo: 'JUL.26',
    categories: ['DIC.25','ENE. 26','FEB. 26','MAR. 26','ABR. 26','MAY. 26','JUN. 26','JUL. 26'],
    series: [
      { label: 'Soporte y Mantenimiento', color: '#0d4a98', values: [7648.00,8067.51,8067.51,8067.51,8067.51,6986.46,7760.94,7445.65] },
      { label: 'Suministros', color: '#f26b12', values: [2784.89,1011.99,1243.83,1807.92,4100.59,3162.95,6404.27,7630.71] }
    ]
  }
};

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function normalizeValorizacion(data = {}) {
  const categories = data.categories || [];
  const series = (data.series || []).map((s, index) => ({
    label: s.label || `Serie ${index + 1}`,
    color: s.color || ['#0d4a98', '#f26b12', '#7b8798'][index % 3],
    values: (s.values || []).map(round2)
  }));
  const rows = series.map(s => ({ label: s.label, value: round2(s.values[s.values.length - 1] || 0), color: s.color }));
  const total = round2(rows.reduce((sum, row) => sum + row.value, 0));
  return {
    titulo: data.titulo || 'Valorización',
    tablaTitulo: data.tablaTitulo || 'SERVICIO',
    periodo: data.periodo || 'JUL.26',
    categories,
    series,
    rows,
    total
  };
}

function getValorizacionSample(slideNumber, override = {}) {
  const base = VALORIZACION_SAMPLES[Number(slideNumber)];
  if (!base) throw new Error(`No hay muestra de valorización para slide ${slideNumber}`);
  return normalizeValorizacion({ ...base, ...override });
}

function getCostosCoverData(override = {}) {
  return {
    titulo: 'COSTOS DEL SERVICIO',
    subtitulo: 'Resumen económico del servicio',
    periodo: 'Julio 2026',
    chips: ['COSTOS', 'SERVICIO', 'JULIO 2026'],
    ...override
  };
}

module.exports = { getValorizacionSample, getCostosCoverData, VALORIZACION_SAMPLES };
