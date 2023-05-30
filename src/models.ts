export type Cords = {
  x: number;
  y: number;
};
export type PlanetData = {
  name: string;
  mass: number; // Relative to Earth's mass (Earth's mass = 1)
  semiMajorAxis: number; // In astronomical units (AU)
  eccentricity: number; // Between 0 and 1
  orbitInclination: number; // In degrees
  argumentOfPeriapsis: number; // In degrees
  diameter: number; // In kilometers
  type: string; // "Rocky" | "Gas Giant" | "Dwarf Planet";
  averageTemperature: number; // In degrees Celsius
  dayDuration: number; // In Earth days
  yearDuration: number; // In Earth years
  equatorialInclination: number; // In degrees
  color: string; // TODO: temporary
};

export type MinorSolarObjectData = {
  name: string;
  semiMajorAxisStart: number;
  semiMajorAxisEnd: number;
  orbitInclination: number;
  diameter: number;
  type: string;
  averageTemperature: number;
  eccentricity: number;
  img: string;
  numberOfObjectsToRender: number;
};
