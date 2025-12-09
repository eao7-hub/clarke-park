export interface SimulationState {
  angle: number; // Current angle in radians
  speed: number; // Rotation speed multiplier
  amplitude: number; // Signal amplitude
  isPlaying: boolean;
  showProjections: boolean;
}

export interface PhaseValues {
  a: number;
  b: number;
  c: number;
}

export interface ClarkeValues {
  alpha: number;
  beta: number;
}

export interface ParkValues {
  d: number;
  q: number;
}