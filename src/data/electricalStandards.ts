import { ConductorMaterial, InstallationMethod, InsulationType, PhaseType } from '../types';

// Standard commercial breaker currents in Amperes
export const STANDARD_BREAKERS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 70, 80, 100, 125, 150, 175, 200, 225, 250, 300, 400];

// Standard wire sections in mm²
export const STANDARD_SECTIONS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];

// Ampacity tables based on NBR 5410 (Tabela 36, 37, 38, 39)
// For copper, PVC 70°C, 2 loaded conductors (B1 - embutido em alvenaria em eletroduto)
export const COPPER_PVC_B1_2COND: Record<number, number> = {
  1.5: 17.5,
  2.5: 24,
  4: 32,
  6: 41,
  10: 57,
  16: 76,
  25: 101,
  35: 125,
  50: 151,
  70: 192,
  95: 232,
  120: 269,
  150: 300,
  185: 341,
  240: 400,
};

// For copper, PVC 70°C, 3 loaded conductors (B1)
export const COPPER_PVC_B1_3COND: Record<number, number> = {
  1.5: 15.5,
  2.5: 21,
  4: 28,
  6: 36,
  10: 50,
  16: 68,
  25: 89,
  35: 110,
  50: 134,
  70: 171,
  95: 207,
  120: 239,
  150: 272,
  185: 310,
  240: 364,
};

// For copper, XLPE/EPR 90°C, 2 loaded conductors (B1)
export const COPPER_XLPE_B1_2COND: Record<number, number> = {
  1.5: 22,
  2.5: 30,
  4: 40,
  6: 51,
  10: 70,
  16: 94,
  25: 119,
  35: 147,
  50: 179,
  70: 229,
  95: 278,
  120: 322,
  150: 371,
  185: 424,
  240: 500,
};

// For copper, XLPE/EPR 90°C, 3 loaded conductors (B1)
export const COPPER_XLPE_B1_3COND: Record<number, number> = {
  1.5: 19,
  2.5: 26,
  4: 35,
  6: 45,
  10: 62,
  16: 83,
  25: 105,
  35: 129,
  50: 157,
  70: 201,
  95: 244,
  120: 282,
  150: 325,
  185: 372,
  240: 439,
};

// Method multiplier relative to B1
export const METHOD_MULTIPLIERS: Record<InstallationMethod, number> = {
  A1: 0.90, // condutores isolados em eletroduto embutido em parede termicamente isolante
  A2: 0.85,
  B1: 1.00, // condutores em eletroduto de seção circular embutido em alvenaria
  B2: 0.95, // cabo multipolar em eletroduto em alvenaria
  C: 1.10,  // cabos unipolares ou cabo multipolar sobre parede de alvenaria / leito
  D: 1.05,  // cabo em eletroduto enterrado no solo
};

// Grouping factor table (NBR 5410 Tabela 42)
export const GROUPING_FACTORS: Record<number, number> = {
  1: 1.00,
  2: 0.80,
  3: 0.70,
  4: 0.65,
  5: 0.60,
  6: 0.57,
  7: 0.54,
  8: 0.52,
  9: 0.50,
  10: 0.48,
  12: 0.45,
  14: 0.43,
  16: 0.41,
  18: 0.39,
  20: 0.38,
};

export function getGroupingFactor(count: number): number {
  if (count <= 1) return 1.0;
  if (count >= 20) return 0.38;
  const keys = Object.keys(GROUPING_FACTORS).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < keys.length; i++) {
    if (count <= keys[i]) {
      return GROUPING_FACTORS[keys[i]];
    }
  }
  return 0.38;
}

// Temperature factor table for PVC 70°C and XLPE 90°C (NBR 5410 Tabela 40)
export function getTemperatureFactor(temp: number, insulation: InsulationType): number {
  if (insulation === 'PVC') {
    if (temp <= 10) return 1.22;
    if (temp <= 15) return 1.17;
    if (temp <= 20) return 1.12;
    if (temp <= 25) return 1.06;
    if (temp <= 30) return 1.00;
    if (temp <= 35) return 0.94;
    if (temp <= 40) return 0.87;
    if (temp <= 45) return 0.79;
    if (temp <= 50) return 0.71;
    if (temp <= 55) return 0.61;
    return 0.50;
  } else {
    // XLPE / EPR (90°C base)
    if (temp <= 10) return 1.15;
    if (temp <= 15) return 1.12;
    if (temp <= 20) return 1.08;
    if (temp <= 25) return 1.04;
    if (temp <= 30) return 1.00;
    if (temp <= 35) return 0.96;
    if (temp <= 40) return 0.91;
    if (temp <= 45) return 0.87;
    if (temp <= 50) return 0.82;
    if (temp <= 55) return 0.76;
    if (temp <= 60) return 0.71;
    return 0.58;
  }
}

// Get ampacity for a specific section and parameters
export function getBaseAmpacity(
  section: number,
  phase: PhaseType,
  insulation: InsulationType,
  material: ConductorMaterial,
  method: InstallationMethod
): number {
  const isThreePhase = phase === 'tri';
  let table: Record<number, number>;

  if (insulation === 'PVC') {
    table = isThreePhase ? COPPER_PVC_B1_3COND : COPPER_PVC_B1_2COND;
  } else {
    table = isThreePhase ? COPPER_XLPE_B1_3COND : COPPER_XLPE_B1_2COND;
  }

  let ampacity = table[section] || (table[240] * (section / 240));

  // Material factor (Aluminum ~ 0.78 of Copper ampacity)
  if (material === 'aluminum') {
    ampacity *= 0.78;
  }

  // Method factor
  const methodMult = METHOD_MULTIPLIERS[method] || 1.0;
  ampacity *= methodMult;

  return Math.round(ampacity * 10) / 10;
}

// Color codes NBR 5410
export const NBR5410_COLORS = [
  {
    role: 'Condutor Neutro (N)',
    colorName: 'Azul Claro',
    hex: '#0284c7',
    textColor: '#ffffff',
    rule: 'Obrigatório conforme item 6.1.5.3.1 da NBR 5410. Não pode ser usado para outra função.',
    mandatory: true,
  },
  {
    role: 'Condutor de Proteção / Terra (PE)',
    colorName: 'Verde ou Verde-Amarelo (Brasileirinho)',
    hex: '#16a34a',
    textColor: '#ffffff',
    rule: 'Obrigatório conforme item 6.1.5.3.2 da NBR 5410. Exclusivo para aterramento.',
    mandatory: true,
  },
  {
    role: 'Condutor Fase (R, S, T / A, B, C)',
    colorName: 'Vermelho, Preto, Marrom ou Cinza',
    hex: '#dc2626',
    textColor: '#ffffff',
    rule: 'Pode ser qualquer cor, EXCETO Azul Claro, Verde ou Verde-Amarelo.',
    mandatory: false,
  },
  {
    role: 'Condutor de Retorno (Iluminação)',
    colorName: 'Amarelo, Branco ou Laranja',
    hex: '#eab308',
    textColor: '#000000',
    rule: 'Utilizado entre o interruptor e a lâmpada para fácil diferenciação da fase direta.',
    mandatory: false,
  },
  {
    role: 'Condutor PEN (Proteção e Neutro combinados)',
    colorName: 'Azul Claro com anilhas Verdes nas pontas',
    hex: '#0ea5e9',
    textColor: '#ffffff',
    rule: 'Em esquema TN-C, condutor azul com marcação verde/amarela nas extremidades.',
    mandatory: true,
  },
];

// NR-10 Golden Rules
export const NR10_GOLDEN_RULES = [
  {
    step: 1,
    title: 'Seccionamento',
    description: 'Desligar o disjuntor geral, chave seccionadora ou retirar fusíveis do circuito a ser trabalhado.',
    icon: 'PowerOff',
  },
  {
    step: 2,
    title: 'Impedimento de Reenergização (LOTO)',
    description: 'Bloquear fisicamente com cadeado e cartão de travamento para impedir que terceiros religuem o circuito acidentalmente.',
    icon: 'Lock',
  },
  {
    step: 3,
    title: 'Constatação da Ausência de Tensão',
    description: 'Testar com multímetro ou detector de tensão calibrado entre Fase-Neutro, Fase-Fase e Fase-Terra.',
    icon: 'ZapOff',
  },
  {
    step: 4,
    title: 'Instalação de Aterramento Temporário',
    description: 'Equipotencializar os condutores do circuito com a terra para descarregar tensões induzidas e garantir proteção.',
    icon: 'ShieldCheck',
  },
  {
    step: 5,
    title: 'Proteção dos Elementos Energizados & Sinalização',
    description: 'Colocar mantas isolantes em partes vivas adjacentes e placas visíveis: "PERIGO: HOMENS TRABALHANDO NA REDE".',
    icon: 'AlertTriangle',
  },
];

// Interactive wiring diagrams data
export const INTERACTIVE_DIAGRAMS = [
  {
    id: 'three-way',
    title: 'Interruptor Paralelo (Three-Way)',
    category: 'Residencial',
    description: 'Comando de uma ou mais lâmpadas a partir de 2 pontos diferentes (ex: início e fim de escada ou corredor, cabeceira da cama).',
    difficulty: 'Iniciante',
    normReference: 'NBR 5410 - Circuitos de iluminação',
    components: ['2x Interruptores Three-Way (3 bornes cada)', '1x Lâmpada', 'Fase, Neutro, Retorno e 2x Fios Paralelos'],
    tips: [
      'A Fase entra exclusivamente no borne central (comum) do Interruptor 1.',
      'O Retorno da lâmpada sai exclusivamente do borne central (comum) do Interruptor 2.',
      'Os dois bornes das extremidades são interligados entre si (Fios Paralelos ou Balanços).',
      'O Neutro vai DIRETO no bocal da lâmpada, NUNCA no interruptor!'
    ],
    steps: [
      '1. Leve o condutor Neutro (Azul Claro) até o contato lateral do bocal da lâmpada.',
      '2. Leve o condutor Fase (Vermelho/Preto) até o borne central do primeiro interruptor.',
      '3. Conecte dois condutores de balanço (Amarelos) entre os bornes superior/inferior dos dois interruptores.',
      '4. Conecte o condutor de Retorno do borne central do segundo interruptor até o contato central do bocal da lâmpada.'
    ]
  },
  {
    id: 'four-way',
    title: 'Interruptor Intermediário (Four-Way)',
    category: 'Residencial',
    description: 'Comando de lâmpadas a partir de 3 ou mais pontos diferentes em conjunto com dois interruptores Three-Way.',
    difficulty: 'Intermediário',
    normReference: 'NBR 5410 - Comandos de múltiplos pontos',
    components: ['2x Interruptores Three-Way', '1x (ou mais) Interruptores Four-Way (4 bornes)', '1x Lâmpada'],
    tips: [
      'O interruptor intermediário fica SEMPRE entre dois Three-Ways nos fios de balanço.',
      'Você pode adicionar quantos Four-Ways quiser em série para ter 4, 5, 6 ou mais pontos de comando.',
      'Atenção para não cruzar as entradas e saídas no mesmo par de bornes.'
    ],
    steps: [
      '1. Instale o Three-Way 1 com a Fase no borne central.',
      '2. Saia com 2 fios paralelos do Three-Way 1 e entre nos 2 bornes de entrada do Four-Way.',
      '3. Saia com 2 fios paralelos dos 2 bornes de saída do Four-Way e entre nas extremidades do Three-Way 2.',
      '4. Saia do centro do Three-Way 2 com o retorno para a lâmpada.'
    ]
  },
  {
    id: 'qdc-dps-dr',
    title: 'Quadro de Distribuição (QDC) com Geral, DPS e IDR',
    category: 'Proteção',
    description: 'Padrão moderno e seguro conforme NBR 5410 com proteção contra sobrecorrente (Disjuntor), choque (DR) e surtos de raios (DPS).',
    difficulty: 'Avançado',
    normReference: 'NBR 5410 item 5.1 (Proteção contra choques e sobretensões)',
    components: ['Disjuntor Bipolar/Tripolar Geral', 'Dispositivo DR (IDR 30mA)', 'DPS Classe II (1 por Fase + 1 Neutro/Terra)', 'Barramento Neutro', 'Barramento Terra PE'],
    tips: [
      'O DPS é instalado antes do DR para desviar surtos atmosféricos diretamente para a terra sem danificar o DR.',
      'O Neutro que entra no DR deve ser EXCLUSIVO para os circuitos protegidos por ele, não podendo tocar o barramento PE após o DR.',
      'O IDR de 30mA (alta sensibilidade) é obrigatório para áreas molhadas (banheiro, cozinha, área de serviço, tomadas externas).'
    ],
    steps: [
      '1. Fases e Neutro da concessionária entram no Disjuntor Geral.',
      '2. Da saída do Geral, deriva-se em paralelo para os DPS (ligados ao barramento de Terra).',
      '3. As Fases e o Neutro entram na parte superior do IDR.',
      '4. Na saída do IDR, as Fases vão para o barramento tipo pente dos disjuntores parciais e o Neutro vai para o Barramento de Neutro isolado.'
    ]
  },
  {
    id: 'tomada-10a-20a',
    title: 'Tomada 2P+T Padrão NBR 14136 (10A e 20A)',
    category: 'Residencial',
    description: 'Ligação correta dos pinos de Fase, Neutro e Terra conforme a norma brasileira de plugues e tomadas.',
    difficulty: 'Iniciante',
    normReference: 'NBR 14136 e NBR 5410',
    components: ['Módulo de tomada 10A (furo 4mm) ou 20A (furo 4.8mm)', 'Fase', 'Neutro', 'Terra (PE)'],
    tips: [
      'Olhando a tomada de frente com o pino terra para CIMA: o Neutro fica na ESQUERDA (letra N gravada) e a Fase na DIREITA.',
      'O pino Terra central é sempre o Terra (PE - Verde/Verde-Amarelo).',
      'Tomadas de 20A exigem condutor mínimo de 2.5mm² (ou 4mm² conforme corrente) e disjuntor adequado (máx 20A).'
    ],
    steps: [
      '1. Conecte o condutor de Terra (Verde) no borne central da tomada.',
      '2. Conecte o condutor Neutro (Azul Claro) no borne marcado com "N" (lado esquerdo).',
      '3. Conecte o condutor Fase (Vermelho/Preto) no borne restante (lado direito).',
      '4. Encaixe no espelho 4x2 garantindo que não fiquem fios desencapados expostos.'
    ]
  },
  {
    id: 'motor-partida-direta',
    title: 'Comando de Partida Direta de Motor (Contator + Relé Térmico)',
    category: 'Industrial',
    description: 'Circuito de força e comando para ligar e desligar motor trifásico com proteção contra sobrecarga térmica e botoeiras Liga/Desliga (com retenção/selo).',
    difficulty: 'Avançado',
    normReference: 'NR-10 e NR-12 - Máquinas e Equipamentos',
    components: ['Disjuntor-Motor ou Fusíveis', 'Contator Tri/Tetrapolar (C1)', 'Relé de Sobrecarga Térmico (RT)', 'Botoeira NF (Desliga - Vermelha)', 'Botoeira NA (Liga - Verde)', 'Contato de Selo 13-14'],
    tips: [
      'O contato auxiliar normalmente aberto (NA 13-14) do contator é ligado em paralelo com o botão Liga (S1) para fazer o selo elétrico.',
      'O contato normalmente fechado (NF 95-96) do Relé Térmico fica em série no início do comando para desarmar a bobina em sobrecarga.',
      'Nunca ligue um motor trifásico sem aterramento na carcaça e proteção contra falta de fase.'
    ],
    steps: [
      '1. Circuito de Força: L1, L2, L3 entram no disjuntor -> Contator (1, 3, 5) -> Relé Térmico (2, 4, 6) -> Motor (U, V, W).',
      '2. Circuito de Comando: Fase -> Contato NF 95-96 do Relé Térmico -> Botão Desliga (S0 - NF) -> Botão Liga (S1 - NA).',
      '3. Em paralelo com S1, conecte o contato auxiliar NA 13-14 do contator.',
      '4. Da saída de S1, alimente a bobina A1 do Contator. Conecte A2 ao Neutro (ou 2ª Fase se bobina for 220V/380V).'
    ]
  },
  {
    id: 'fotocelula-rele-fotoeletrico',
    title: 'Relé Fotoelétrico / Fotocélula para Iluminação Externa',
    category: 'Predial',
    description: 'Acionamento automático de lâmpadas ao anoitecer e desligamento ao amanhecer.',
    difficulty: 'Iniciante',
    normReference: 'NBR 5410 - Automação predial básica',
    components: ['Relé Fotoelétrico (com base 3 ou 4 fios)', 'Lâmpada/Refletor LED', 'Fase, Neutro e Carga'],
    tips: [
      'Aponte a janela sensora do sensor para o SUL ou longe de luz artificial direta para não causar efeito estroboscópico/pisca-pisca.',
      'Em modelos de 3 fios: Vermelho costuma ser Carga (Retorno para a lâmpada), Preto é Fase e Branco é Neutro comum (consulte o manual do fabricante).'
    ],
    steps: [
      '1. Ligue a Fase no condutor de entrada do relé fotoelétrico.',
      '2. Ligue o Neutro no condutor de neutro do relé e derive também para o bocal da lâmpada.',
      '3. Ligue o condutor de Carga/Retorno do relé direto no bocal da lâmpada.'
    ]
  }
];

// Common Appliance Power & Consumption Reference
export const APPLIANCE_PRESETS = [
  { name: 'Chuveiro Elétrico (Inverno)', powerW: 6800, defaultHoursDay: 0.5, category: 'Banheiro' },
  { name: 'Chuveiro Elétrico (Verão)', powerW: 4500, defaultHoursDay: 0.5, category: 'Banheiro' },
  { name: 'Ar-Condicionado 9.000 BTU Inverter', powerW: 810, defaultHoursDay: 8, category: 'Climatização' },
  { name: 'Ar-Condicionado 12.000 BTU Inverter', powerW: 1080, defaultHoursDay: 8, category: 'Climatização' },
  { name: 'Geladeira Frost Free Duplex', powerW: 180, defaultHoursDay: 10, category: 'Cozinha' },
  { name: 'Cooktop por Indução (4 bocas)', powerW: 7000, defaultHoursDay: 1, category: 'Cozinha' },
  { name: 'Forno Elétrico Embutido', powerW: 2400, defaultHoursDay: 0.7, category: 'Cozinha' },
  { name: 'Micro-ondas 30 Litros', powerW: 1400, defaultHoursDay: 0.3, category: 'Cozinha' },
  { name: 'Máquina de Lavar Roupas 12kg', powerW: 500, defaultHoursDay: 1.2, category: 'Lavanderia' },
  { name: 'Secadora de Roupas', powerW: 2500, defaultHoursDay: 1, category: 'Lavanderia' },
  { name: 'Ferro de Passar Roupas', powerW: 1500, defaultHoursDay: 0.5, category: 'Lavanderia' },
  { name: 'Computador Gamer com Monitor', powerW: 450, defaultHoursDay: 6, category: 'Escritório' },
  { name: 'Televisor Smart 55" 4K', powerW: 120, defaultHoursDay: 5, category: 'Sala' },
  { name: 'Lâmpadas LED (Casa inteira - 15 un)', powerW: 150, defaultHoursDay: 6, category: 'Iluminação' },
  { name: 'Bomba de Água 1/2 CV', powerW: 370, defaultHoursDay: 1.5, category: 'Utilidades' },
];
