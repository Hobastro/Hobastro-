export interface PlanetInterpretation {
  name: string;
  title: string;
  mainFunction: string;
  connectionMethod: string;
  receiverEffect: string;
  psychologicalLevel: string;
  manifestationConditions: string;
}

export const PLANET_INTERPRETATIONS: Record<string, PlanetInterpretation> = {};
