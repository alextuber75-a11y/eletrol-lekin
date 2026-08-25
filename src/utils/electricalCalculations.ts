import {
  CableCalculationInput,
  CableCalculationResult,
  ConductorMaterial,
  PhaseType,
} from '../types';
import {
  getBaseAmpacity,
  getGroupingFactor,
  getTemperatureFactor,
  STANDARD_BREAKERS,
  STANDARD_SECTIONS,
} from '../data/electricalStandards';

export function calculateCableAndBreaker(input: CableCalculationInput): CableCalculationResult {
  // Convert power to Watts
  let powerWatts = input.power;
  if (input.powerUnit === 'kW') powerWatts *= 1000;
  if (input.powerUnit === 'kVA') powerWatts = input.power * 1000 * input.powerFactor;
  if (input.powerUnit === 'VA') powerWatts = input.power * input.powerFactor;
  if (input.powerUnit === 'HP') powerWatts = input.power * 745.7;
  if (input.powerUnit === 'CV') powerWatts = input.power * 735.5;

  const pf = Math.max(0.1, Math.min(1.0, input.powerFactor || 1.0));
  const voltage = Math.max(1, input.voltage);

  // Calculate design current (IB)
  let currentIB = 0;
  if (input.phase === 'mono') {
    currentIB = powerWatts / (voltage * pf);
  } else if (input.phase === 'bi') {
    currentIB = powerWatts / (voltage * pf);
  } else {
    // Three-phase
    currentIB = powerWatts / (Math.sqrt(3) * voltage * pf);
  }
  currentIB = Math.round(currentIB * 100) / 100;

  // Correction factors
  const fca = getGroupingFactor(input.groupingCount || 1);
  const fct = getTemperatureFactor(input.ambientTemp || 30, input.insulation);
  const totalCorrectionFactor = Math.max(0.01, fca * fct);

  // Corrected current required by table
  const correctedCurrentIzMin = Math.round((currentIB / totalCorrectionFactor) * 100) / 100;

  // Find minimum section by ampacity
  let minSectionByAmpacity = STANDARD_SECTIONS[0];
  let ampacityTableValue = 0;

  for (const s of STANDARD_SECTIONS) {
    const baseIz = getBaseAmpacity(s, input.phase, input.insulation, input.material, input.installationMethod);
    const correctedIz = baseIz * totalCorrectionFactor;
    if (correctedIz >= currentIB) {
      minSectionByAmpacity = s;
      ampacityTableValue = baseIz;
      break;
    }
  }

  // Sizing by Voltage Drop
  // Resistivity at 70°C: Copper ~ 0.021, Aluminum ~ 0.033
  const rho = input.material === 'copper' ? 0.021 : 0.033;
  const maxDropVolts = (voltage * input.maxVoltageDrop) / 100;

  let minSectionByVoltageDrop = STANDARD_SECTIONS[0];
  let multiplier = input.phase === 'tri' ? Math.sqrt(3) : 2;

  // Theoretical required section = (multiplier * L * IB * rho * cosPhi) / maxDropVolts
  const theoreticalSection = (multiplier * input.length * currentIB * rho * pf) / maxDropVolts;

  for (const s of STANDARD_SECTIONS) {
    if (s >= theoreticalSection) {
      minSectionByVoltageDrop = s;
      break;
    }
    minSectionByVoltageDrop = s;
  }

  // Recommended section is the max of both criteria
  const recommendedSection = Math.max(minSectionByAmpacity, minSectionByVoltageDrop);

  // Actual voltage drop with chosen section
  const actualDropVolts = (multiplier * input.length * currentIB * rho * pf) / recommendedSection;
  const actualVoltageDropPercent = Math.round(((actualDropVolts / voltage) * 100) * 100) / 100;
  const actualVoltageDropVolts = Math.round(actualDropVolts * 100) / 100;

  // Selection of standard breaker
  // Rule NBR 5410: IB <= In <= Iz_corrected
  const finalConductorBaseIz = getBaseAmpacity(recommendedSection, input.phase, input.insulation, input.material, input.installationMethod);
  const finalConductorIzCorrected = finalConductorBaseIz * totalCorrectionFactor;

  let recommendedBreaker = STANDARD_BREAKERS[0];
  for (const b of STANDARD_BREAKERS) {
    if (b >= currentIB) {
      recommendedBreaker = b;
      break;
    }
  }

  // If breaker exceeds conductor capacity, suggest upgrading wire or note safety
  const ruleRespected = currentIB <= recommendedBreaker && recommendedBreaker <= finalConductorIzCorrected;

  // Determine breaker curve
  let recommendedBreakerCurve: 'B' | 'C' | 'D' = 'C';
  if (input.powerUnit === 'HP' || input.powerUnit === 'CV') {
    recommendedBreakerCurve = 'D'; // High inrush motors
  } else if (pf >= 0.98 && input.length > 25) {
    recommendedBreakerCurve = 'B'; // Resistive loads with long circuits
  } else {
    recommendedBreakerCurve = 'C'; // Standard general loads
  }

  let explanation = '';
  if (ruleRespected) {
    explanation = `Conforme NBR 5410 (item 5.3.4): IB (${currentIB}A) ≤ In (${recommendedBreaker}A) ≤ Iz corrigido (${Math.round(finalConductorIzCorrected * 10) / 10}A). Proteção perfeitamente balanceada!`;
  } else {
    explanation = `Atenção: A corrente nominal do disjuntor (${recommendedBreaker}A) é superior à capacidade corrigida do condutor (${Math.round(finalConductorIzCorrected * 10) / 10}A). Recomendamos aumentar a seção do cabo para segurança térmica.`;
  }

  return {
    currentIB,
    correctedCurrentIzMin,
    fca,
    fct,
    minSectionByAmpacity,
    ampacityTableValue: finalConductorBaseIz,
    minSectionByVoltageDrop,
    actualVoltageDropPercent,
    actualVoltageDropVolts,
    recommendedSection,
    recommendedBreaker,
    recommendedBreakerCurve,
    safetyVerification: {
      ruleRespected,
      ib: currentIB,
      inBreaker: recommendedBreaker,
      izConductor: Math.round(finalConductorIzCorrected * 10) / 10,
      explanation,
    },
  };
}

// Ohm's Law and Power Calculations
export function calculateOhmsLaw(params: {
  voltage?: number;
  current?: number;
  resistance?: number;
  power?: number;
}) {
  let { voltage: v, current: i, resistance: r, power: p } = params;

  if (v !== undefined && i !== undefined) {
    r = v / i;
    p = v * i;
  } else if (v !== undefined && r !== undefined) {
    i = v / r;
    p = (v * v) / r;
  } else if (v !== undefined && p !== undefined) {
    i = p / v;
    r = (v * v) / p;
  } else if (i !== undefined && r !== undefined) {
    v = i * r;
    p = i * i * r;
  } else if (i !== undefined && p !== undefined) {
    v = p / i;
    r = p / (i * i);
  } else if (r !== undefined && p !== undefined) {
    v = Math.sqrt(p * r);
    i = Math.sqrt(p / r);
  }

  return {
    voltage: v !== undefined ? Math.round(v * 100) / 100 : 0,
    current: i !== undefined ? Math.round(i * 100) / 100 : 0,
    resistance: r !== undefined ? Math.round(r * 100) / 100 : 0,
    power: p !== undefined ? Math.round(p * 100) / 100 : 0,
  };
}

// Power Triangle & Power Factor Correction
export function calculatePowerTriangle(
  apparentPowerS: number, // VA
  activePowerP: number, // W
  targetPowerFactor: number = 0.95, // Desired cos(phi)
  frequencyHz: number = 60,
  voltage: number = 220
) {
  const currentCosPhi = activePowerP > 0 && apparentPowerS > 0 ? Math.min(1, activePowerP / apparentPowerS) : 0.8;
  const phiCurrent = Math.acos(currentCosPhi);
  const reactivePowerQ = activePowerP * Math.tan(phiCurrent); // VAr

  const phiTarget = Math.acos(Math.min(1, targetPowerFactor));
  const targetReactiveQ = activePowerP * Math.tan(phiTarget);

  const qcCorrection = Math.max(0, reactivePowerQ - targetReactiveQ); // VAr of capacitor bank needed

  // Capacitance C in microFarads (uF): C = Qc / (2 * pi * f * V^2) * 10^6
  const capacitanceUF = (qcCorrection / (2 * Math.PI * frequencyHz * Math.pow(voltage, 2))) * 1_000_000;

  return {
    currentPowerFactor: Math.round(currentCosPhi * 1000) / 1000,
    reactivePowerQ: Math.round(reactivePowerQ * 10) / 10,
    capacitorPowerQcVAr: Math.round(qcCorrection * 10) / 10,
    capacitanceMicroFarads: Math.round(capacitanceUF * 10) / 10,
  };
}

// Conduit / Eletroduto dimensioning (NBR 5410 6.2.11)
// Outside diameter approximations for 750V PVC wires in mm
export const WIRE_EXTERNAL_DIAMETERS: Record<number, number> = {
  1.5: 2.8,
  2.5: 3.6,
  4: 4.2,
  6: 4.8,
  10: 6.2,
  16: 7.4,
  25: 9.2,
  35: 10.6,
  50: 12.6,
  70: 14.6,
  95: 17.0,
};

export const STANDARD_CONDUITS = [
  { sizeInch: '1/2"', dnMm: 16, internalAreaMm2: 120 },
  { sizeInch: '3/4"', dnMm: 20, internalAreaMm2: 190 },
  { sizeInch: '1"', dnMm: 25, internalAreaMm2: 300 },
  { sizeInch: '1 1/4"', dnMm: 32, internalAreaMm2: 500 },
  { sizeInch: '1 1/2"', dnMm: 40, internalAreaMm2: 800 },
  { sizeInch: '2"', dnMm: 50, internalAreaMm2: 1300 },
];

export function calculateConduitSize(wires: { section: number; count: number }[]) {
  let totalWireArea = 0;
  let totalConductors = 0;

  wires.forEach((w) => {
    const extDiam = WIRE_EXTERNAL_DIAMETERS[w.section] || Math.sqrt(w.section) * 2.2;
    const wireArea = (Math.PI * Math.pow(extDiam, 2)) / 4;
    totalWireArea += wireArea * w.count;
    totalConductors += w.count;
  });

  // Max fill factor
  let maxOccupancyRate = 0.40; // 40% for 3 or more conductors
  if (totalConductors === 1) maxOccupancyRate = 0.53;
  if (totalConductors === 2) maxOccupancyRate = 0.31;

  const minInternalAreaRequired = totalWireArea / maxOccupancyRate;

  let recommendedConduit = STANDARD_CONDUITS[STANDARD_CONDUITS.length - 1];
  for (const c of STANDARD_CONDUITS) {
    if (c.internalAreaMm2 >= minInternalAreaRequired) {
      recommendedConduit = c;
      break;
    }
  }

  const occupancyPercent = Math.round((totalWireArea / recommendedConduit.internalAreaMm2) * 100 * 10) / 10;

  return {
    totalWireAreaMm2: Math.round(totalWireArea * 10) / 10,
    totalConductors,
    maxAllowedOccupancyPercent: maxOccupancyRate * 100,
    recommendedConduit,
    occupancyPercent,
  };
}

// NBR 5410 Lighting and TUG rules for a room
export function calculateRoomStandards(
  type: string,
  width: number,
  length: number
) {
  const area = Math.round(width * length * 100) / 100;
  const perimeter = Math.round(2 * (width + length) * 100) / 100;

  // Minimum Lighting VA according to NBR 5410:
  // Area <= 6m² -> 100 VA
  // Area > 6m² -> 100 VA for first 6m² + 60 VA for each completed 4m²
  let minLightingVA = 100;
  if (area > 6) {
    const additionalBlocks = Math.floor((area - 6) / 4);
    minLightingVA = 100 + additionalBlocks * 60;
  }

  // Minimum TUGs according to NBR 5410:
  let minTugCount = 1;
  let minTugPowerVA = 100;

  const isWetArea = ['cozinha', 'banheiro', 'area_servico', 'varanda'].includes(type);

  if (type === 'banheiro') {
    // 1 outlet at least near sink (600VA)
    minTugCount = 1;
    minTugPowerVA = 600;
  } else if (isWetArea) {
    // Kitchen / Laundry / Pantry: 1 outlet for each 3.5m (or fraction) of perimeter
    minTugCount = Math.max(1, Math.ceil(perimeter / 3.5));
    // Up to 3 outlets at 600VA each, remaining at 100VA
    if (minTugCount <= 3) {
      minTugPowerVA = minTugCount * 600;
    } else {
      minTugPowerVA = 3 * 600 + (minTugCount - 3) * 100;
    }
  } else {
    // Living room, bedrooms, halls:
    // If area <= 6m² -> 1 outlet (100VA)
    // If area > 6m² -> 1 outlet for each 5m (or fraction) of perimeter
    if (area <= 6) {
      minTugCount = 1;
      minTugPowerVA = 100;
    } else {
      minTugCount = Math.max(1, Math.ceil(perimeter / 5));
      minTugPowerVA = minTugCount * 100;
    }
  }

  return {
    area,
    perimeter,
    minLightingVA,
    minTugCount,
    minTugPowerVA,
  };
}
