const SLIDES = {
  12: { key: 'incidentes-requerimientos', template: 'incidentes-requerimientos', active: true, description: 'Incidentes vs Requerimientos por scope' },
  14: { key: 'atenciones', template: 'atenciones', active: true, description: 'Atenciones en la Operación - VOLCAN' },
  15: { key: 'yauli-atenciones', template: 'yauli-atenciones', active: true, description: 'Cantidad de Atenciones - U.M. Yauli' },
  16: { key: 'chungar-atenciones', template: 'unidad-atenciones-left-date', active: true, description: 'Cantidad de Atenciones - U.M. Chungar' },
  17: { key: 'cerro-pasco-atenciones', template: 'cerro-pasco-atenciones', active: true, description: 'Cantidad de Atenciones - U.M. Cerro Pasco' },
  18: { key: 'romina-atenciones', template: 'unidad-atenciones-left-date', active: true, description: 'Cantidad de Atenciones - U.M. Romina' },
  19: { key: 'incidentes-requerimientos-volcan', template: 'incidentes-requerimientos-volcan-classic', active: true, description: 'Incidentes vs Requerimientos - VOLCAN acumulado y tendencia' },
  20: { key: 'incidentes-requerimientos-yauli', template: 'incidentes-requerimientos-unidad-classic', active: true, description: 'Incidentes vs Requerimientos - U.M. Yauli mensual y tendencia' },
  21: { key: 'incidentes-requerimientos-scr-car', template: 'incidentes-requerimientos-unidad-classic', active: true, description: 'Incidentes vs Requerimientos - Yauli San Cristóbal-Carahuacra' },
  22: { key: 'incidentes-requerimientos-andaychagua', template: 'incidentes-requerimientos-unidad-classic', active: true, description: 'Incidentes vs Requerimientos - Yauli Andaychagua' },
  23: { key: 'incidentes-requerimientos-ticlio', template: 'incidentes-requerimientos-unidad-classic', active: true, description: 'Incidentes vs Requerimientos - Yauli Ticlio' },
  24: { key: 'incidentes-requerimientos-chungar', template: 'incidentes-requerimientos-chungar-classic', active: true, description: 'Incidentes vs Requerimientos - Chungar' },
  25: { key: 'incidentes-requerimientos-cerro-pasco', template: 'incidentes-requerimientos-unidad-classic', active: true, description: 'Incidentes vs Requerimientos - Cerro Pasco' },
  26: { key: 'incidentes-requerimientos-romina', template: 'incidentes-requerimientos-unidad-classic', active: true, description: 'Incidentes vs Requerimientos - Romina' },
  27: { key: 'top-ten-requerimientos-volcan', template: 'top-ten-volcan-classic', active: true, description: 'Top Ten Requerimientos - VOLCAN acumulado' },
  28: { key: 'top-ten-incidentes-volcan', template: 'top-ten-volcan-classic', active: true, description: 'Top Ten Incidentes - VOLCAN acumulado' },
  29: { key: 'top-ten-causa-raiz-scr-car', template: 'top-ten-root-cause-compare', active: true, description: 'Top Ten Causa Raíz Incidente - SCR-CAR junio vs julio' },
  30: { key: 'top-ten-causa-raiz-andaychagua', template: 'top-ten-root-cause-compare', active: true, description: 'Top Ten Causa Raíz Incidente - Andaychagua junio vs julio' },
  31: { key: 'top-ten-causa-raiz-chungar', template: 'top-ten-root-cause-compare', active: true, description: 'Top Ten Causa Raíz Incidente - Chungar junio vs julio' },
  32: { key: 'top-ten-causa-raiz-cerro', template: 'top-ten-root-cause-cerro', active: true, description: 'Top Ten Causa Raíz Incidente - VOLCAN Cerro' },
  33: { key: 'costos-servicio-cover', template: 'costos-servicio-cover', active: true, description: 'Portada de bloque - Costos del servicio' },
  34: { key: 'valorizacion-volcan', template: 'valorizacion-servicio', active: true, description: 'Valorización Volcan' },
  35: { key: 'valorizacion-yauli', template: 'valorizacion-servicio', active: true, description: 'Valorización U.M. Yauli' },
  36: { key: 'valorizacion-yauli-san-cristobal', template: 'valorizacion-servicio', active: true, description: 'Valorización U.M. Yauli - San Cristóbal' },
  37: { key: 'valorizacion-yauli-carahuacra', template: 'valorizacion-servicio', active: true, description: 'Valorización U.M. Yauli - Carahuacra' },
  38: { key: 'valorizacion-yauli-andaychagua', template: 'valorizacion-servicio', active: true, description: 'Valorización U.M. Yauli - Andaychagua' },
  39: { key: 'valorizacion-yauli-ticlio', template: 'valorizacion-servicio', active: true, description: 'Valorización U.M. Yauli - Ticlio' },
  40: { key: 'valorizacion-chungar', template: 'valorizacion-servicio', active: true, description: 'Valorización U.M. Chungar' },
  41: { key: 'valorizacion-cerro', template: 'valorizacion-servicio', active: true, description: 'Valorización U.M. Cerro' },
  42: { key: 'valorizacion-romina', template: 'valorizacion-servicio', active: true, description: 'Valorización U.M. Romina' },
  43: { key: 'suministros-cover', template: 'suministros-cover', active: true, description: 'Portada de bloque - Suministros' },
  44: { key: 'top-ten-suministros-volcan', template: 'top-ten-suministros', active: true, description: 'Top Ten Suministros - Volcan' },
  45: { key: 'top-ten-suministros-yauli', template: 'top-ten-suministros', active: true, description: 'Top Ten Suministros - Yauli' },
  46: { key: 'top-ten-suministros-san-cristobal', template: 'top-ten-suministros', active: true, description: 'Top Ten Suministros - San Cristóbal' },
  47: { key: 'top-ten-suministros-carahuacra', template: 'top-ten-suministros', active: true, description: 'Top Ten Suministros - Carahuacra' },
  48: { key: 'top-ten-suministros-andaychagua', template: 'top-ten-suministros', active: true, description: 'Top Ten Suministros - Andaychagua' },
  49: { key: 'top-ten-suministros-ticlio', template: 'top-ten-suministros', active: true, description: 'Top Ten Suministros - Ticlio' },
  50: { key: 'top-ten-suministros-chungar', template: 'top-ten-suministros', active: true, description: 'Top Ten Suministros - Chungar' },
  51: { key: 'top-ten-suministros-cerro', template: 'top-ten-suministros', active: true, description: 'Top Ten Suministros - Cerro' },
  52: { key: 'top-ten-suministros-romina', template: 'top-ten-suministros', active: true, description: 'Top Ten Suministros - Romina' }
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
