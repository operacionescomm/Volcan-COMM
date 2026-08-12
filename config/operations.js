const SCOPES = {
  VOLCAN: {
    key: 'VOLCAN',
    nombre: 'VOLCAN',
    titulo: 'VOLCAN - CONSOLIDADO',
    tipo: 'consolidado',
    minas: [
      'Andaychagua',
      'San Cristóbal - Carahuacra',
      'Cerro Pasco',
      'Chungar'
    ]
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

function getScope(scope) {
  const key = normalizeScopeKey(scope);
  const config = SCOPES[key];

  if (!config) {
    const valid = Object.keys(SCOPES).join(', ');
    throw new Error(`Scope no reconocido: ${scope}. Valores válidos: ${valid}`);
  }

  return config;
}

module.exports = {
  SCOPES,
  getScope,
  normalizeScopeKey
};
