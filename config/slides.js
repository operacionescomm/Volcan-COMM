const SLIDES = {
  12: {
    key: 'incidentes-requerimientos',
    template: 'incidentes-requerimientos',
    active: true,
    description: 'Incidentes vs Requerimientos por scope'
  },
  14: {
    key: 'atenciones',
    template: 'atenciones',
    active: true,
    description: 'Atenciones en la Operación - VOLCAN'
  },
  15: {
    key: 'yauli-atenciones',
    template: 'yauli-atenciones',
    active: true,
    description: 'Cantidad de Atenciones - U.M. Yauli'
  },
  16: {
    key: 'chungar-atenciones',
    template: 'unidad-atenciones',
    active: true,
    description: 'Cantidad de Atenciones - U.M. Chungar'
  },
  17: {
    key: 'cerro-pasco-atenciones',
    template: 'cerro-pasco-atenciones',
    active: true,
    description: 'Cantidad de Atenciones - U.M. Cerro Pasco'
  },
  18: {
    key: 'romina-atenciones',
    template: 'unidad-atenciones',
    active: true,
    description: 'Cantidad de Atenciones - U.M. Romina'
  },
  19: {
    key: 'incidentes-requerimientos-volcan',
    template: 'incidentes-requerimientos-volcan-classic',
    active: true,
    description: 'Incidentes vs Requerimientos - VOLCAN acumulado y tendencia'
  },
  20: {
    key: 'incidentes-requerimientos-yauli',
    template: 'incidentes-requerimientos-unidad-classic',
    active: true,
    description: 'Incidentes vs Requerimientos - U.M. Yauli mensual y tendencia'
  },
  21: {
    key: 'incidentes-requerimientos-scr-car',
    template: 'incidentes-requerimientos-unidad-classic',
    active: true,
    description: 'Incidentes vs Requerimientos - Yauli San Cristóbal-Carahuacra'
  },
  22: {
    key: 'incidentes-requerimientos-andaychagua',
    template: 'incidentes-requerimientos-unidad-classic',
    active: true,
    description: 'Incidentes vs Requerimientos - Yauli Andaychagua'
  },
  23: {
    key: 'incidentes-requerimientos-ticlio',
    template: 'incidentes-requerimientos-unidad-classic',
    active: true,
    description: 'Incidentes vs Requerimientos - Yauli Ticlio'
  }
};

function getSlideConfig(slideNumber) {
  const config = SLIDES[Number(slideNumber)];
  if (!config) throw new Error(`Slide no configurado: ${slideNumber}`);
  return config;
}

module.exports = {
  SLIDES,
  getSlideConfig
};
