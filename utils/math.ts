import { PhaseValues, ClarkeValues, ParkValues } from '../types';

export const PI = Math.PI;
export const TWO_PI = 2 * PI;
export const SQRT3 = Math.sqrt(3);

// Calculate balanced 3-phase signals based on angle
export const calculateThreePhase = (angle: number, amplitude: number): PhaseValues => {
  return {
    a: amplitude * Math.cos(angle),
    b: amplitude * Math.cos(angle - (2 * PI) / 3),
    c: amplitude * Math.cos(angle + (2 * PI) / 3),
  };
};

// Amplitude Invariant Clarke Transformation
// [alpha] = 2/3 * [ 1   -1/2       -1/2      ] * [a]
// [beta ]         [ 0    sqrt(3)/2 -sqrt(3)/2]   [b]
//                                                [c]
export const calculateClarke = (phase: PhaseValues): ClarkeValues => {
  const alpha = (2 / 3) * (phase.a - 0.5 * phase.b - 0.5 * phase.c);
  const beta = (2 / 3) * ((SQRT3 / 2) * phase.b - (SQRT3 / 2) * phase.c);
  return { alpha, beta };
};

// Park Transformation (Rotating Frame)
// [d] = [ cos(theta)   sin(theta) ] * [alpha]
// [q]   [-sin(theta)   cos(theta) ]   [beta ]
export const calculatePark = (clarke: ClarkeValues, theta: number): ParkValues => {
  const d = clarke.alpha * Math.cos(theta) + clarke.beta * Math.sin(theta);
  const q = -clarke.alpha * Math.sin(theta) + clarke.beta * Math.cos(theta);
  return { d, q };
};