const SCOPES = {
  VOLCAN: {
    key: 'VOLCAN',
    nombre: 'VOLCAN',
    titulo: 'VOLCAN - CONSOLIDADO',
    tipo: 'consolidado',
    minas: []
  },

  ANDAYCHAGUA: {
    key: 'ANDAYCHAGUA',
    nombre: 'Andaychagua',
    titulo: 'U.M. ANDAYCHAGUA',
    tipo: 'mina',
    minas: ['Andaychagua']
  },

  SAN_CRISTOBAL_CARAHUACRA: {
    key: 'SAN_CRISTOBAL_CARAHUACRA',
    nombre: 'San Cristóbal - Carahuacra',
    titulo: 'U.M. SAN CRISTÓBAL - CARAHUACRA',
    tipo: 'mina',
    minas: ['San Cristóbal - Carahuacra']
  },

  CERRO_PASCO: {
    key: 'CERRO_PASCO',
    nombre: 'Cerro Pasco',
    titulo: 'U.M. CERRO PASCO',
    tipo: 'mina',
    minas: ['Cerro Pasco']
  },

  CHUNGAR: {
    key: 'CHUNGAR',
    nombre: 'Chungar',
    titulo: 'U.M. CHUNGAR',
    tipo: 'mina',
    minas: ['Chungar']
  },

  ROMINA: {
    key: 'ROMINA',
    nombre: 'Romina',
    titulo: 'U.M. ROMINA',
    tipo: 'mina',
    minas: ['Romina']
  },

  TICLIO: {
    key: 'TICLIO',
    nombre: 'Ticlio',
    titulo: 'U.M. TICLIO',
    tipo: 'mina',
    minas: ['Ticlio']
  },

  SAN_CRISTOBAL: {
    key: 'SAN_CRISTOBAL',
    nombre: 'San Cristóbal',
    titulo: 'U.M. SAN CRISTÓBAL',
    tipo: 'mina',
    minas: ['San Cristóbal']
  }
};

const REPORT_SCOPE_MEMBERS = {
  INC_REQ: {
    VOLCAN: [
      'Andaychagua',
      'San Cristóbal - Carahuacra',
      'Cerro Pasco',
      'Chungar',
      'Romina',
      'Ticlio'
    ]
  },

  TOP10: {
    VOLCAN: [
      'Andaychagua',
      'San Cristóbal - Carahuacra',
      'Cerro Pasco',
      'Chungar'
    ]
  }
};

function normalizeScopeKey(value) {
  return String(value || 'VOLCAN')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function getScope(scope, reportKey = 'INC_REQ') {
  const key = normalizeScopeKey(scope);
  const base = SCOPES[key];

  if (!base) {
    const valid = Object.keys(SCOPES).join(', ');
    throw new Error(`Scope no reconocido: ${scope}. Valores válidos: ${valid}`);
  }

  if (base.tipo !== 'consolidado') return { ...base, minas: [...base.minas] };

  const reportMembers = REPORT_SCOPE_MEMBERS[reportKey]?.[key];
  if (!reportMembers) {
    throw new Error(`No existe composición del scope ${key} para el reporte ${reportKey}`);
  }

  return {
    ...base,
    minas: [...reportMembers],
    reportKey
  };
}

module.exports = {
  SCOPES,
  REPORT_SCOPE_MEMBERS,
  getScope,
  normalizeScopeKey
};
