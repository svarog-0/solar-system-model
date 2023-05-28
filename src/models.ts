export type PlanetProps = {
  name: string;
  radius: number;
  color: string;
  rotationDuration: number;
  position: {
    x: number;
    y: number;
  };
  semiMajorAxis: number;
  eccentricity: number;
  orbitInclination: number;
  equatorInclination: number;
  scaleFactor: number;
};

export type Coordinates = {
  x: number;
  y: number;
};

export type PlanetData = {
  name: string;
  mass: number; // Relative to Earth's mass (Earth's mass = 1)
  semiMajorAxis: number; // In astronomical units (AU)
  eccentricity: number; // Between 0 and 1
  inclination: number; // In degrees
  argumentOfPeriapsis: number; // In degrees
  diameter: number; // In kilometers
  type: "Rocky" | "Gas Giant" | "Dwarf Planet";
  averageTemperature: number; // In degrees Celsius
  dayDuration: number; // In Earth days
  yearDuration: number; // In Earth years
};
