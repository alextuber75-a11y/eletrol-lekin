export type InstallationMethod = 'B1' | 'B2' | 'C' | 'D' | 'A1' | 'A2';
export type ConductorMaterial = 'copper' | 'aluminum';
export type InsulationType = 'PVC' | 'EPR_XLPE';
export type PhaseType = 'mono' | 'bi' | 'tri';

export interface CableCalculationInput {
  voltage: number; // Volts (e.g. 127, 220, 380)
  power: number; // Watts or VA
  powerUnit: 'W' | 'kW' | 'VA' | 'kVA' | 'HP' | 'CV';
  powerFactor: number; // e.g. 0.95 or 1.0 (resistive)
  phase: PhaseType;
  length: number; // meters
  maxVoltageDrop: number; // % (e.g. 4%, 2%, 1%)
  installationMethod: InstallationMethod;
  material: ConductorMaterial;
  insulation: InsulationType;
  groupingCount: number; // number of loaded circuits
  ambientTemp: number; // Celsius (default 30)
}

export interface CableCalculationResult {
  currentIB: number; // Corrente de projeto (Amperes)
  correctedCurrentIzMin: number; // Corrente corrigida pelos fatores (FCA * FCT)
  fca: number; // Fator de agrupamento
  fct: number; // Fator de temperatura
  minSectionByAmpacity: number; // mm²
  ampacityTableValue: number; // Capacidade da tabela Iz
  minSectionByVoltageDrop: number; // mm²
  actualVoltageDropPercent: number; // %
  actualVoltageDropVolts: number; // V
  recommendedSection: number; // mm²
  recommendedBreaker: number; // A
  recommendedBreakerCurve: 'B' | 'C' | 'D';
  safetyVerification: {
    ruleRespected: boolean;
    ib: number;
    inBreaker: number;
    izConductor: number;
    explanation: string;
  };
}

export interface RoomLoadItem {
  id: string;
  name: string;
  type: 'sala' | 'quarto' | 'cozinha' | 'banheiro' | 'area_servico' | 'varanda' | 'corredor' | 'garagem' | 'outro';
  width: number; // meters
  length: number; // meters
  area: number; // m²
  perimeter: number; // m
  minLightingVA: number;
  actualLightingVA: number;
  minTugCount: number;
  minTugPowerVA: number;
  actualTugs: { powerVA: number; count: number }[];
  tues: { name: string; powerW: number; voltage: number }[];
}

export interface ElectricalCircuit {
  id: string;
  number: number;
  name: string;
  type: 'iluminacao' | 'tug' | 'tue' | 'motor' | 'reserva';
  voltage: number;
  powerVA: number;
  currentA: number;
  cableSection: number;
  breakerA: number;
  hasDR: boolean;
  phase: 'R' | 'S' | 'T' | 'Monofásico';
}

export interface DiagramItem {
  id: string;
  title: string;
  category: 'Residencial' | 'Predial' | 'Industrial' | 'Proteção';
  description: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  normReference: string;
  components: string[];
  tips: string[];
  steps: string[];
}
