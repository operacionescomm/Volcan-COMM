const SLIDES = {
  12: {
    key: 'incidentes-requerimientos',
    template: 'incidentes-requerimientos',
    active: true,
    description: 'Incidentes vs Requerimientos por scope'
  },
  10: {
    key: 'atenciones',
    template: 'atenciones',
    active: false,
    description: 'Módulo preparado para siguiente etapa'
  },
  14: {
    key: 'top-requerimientos',
    template: 'top-requerimientos',
    active: false,
    description: 'Módulo preparado para siguiente etapa'
  },
  15: {
    key: 'top-incidentes',
    template: 'top-incidentes',
    active: false,
    description: 'Módulo preparado para siguiente etapa'
  },
  17: {
    key: 'valorizacion',
    template: 'valorizacion',
    active: false,
    description: 'Módulo preparado para siguiente etapa'
  },
  18: {
    key: 'top-suministros-costo',
    template: 'top-suministros-costo',
    active: false,
    description: 'Módulo preparado para siguiente etapa'
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
