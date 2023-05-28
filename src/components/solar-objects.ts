import * as d3 from "d3";
import { Coordinates, PlanetData, PlanetProps } from "../models";

export function PlanetWithOrbit({
  name,
  radius,
  position,
  color,
  semiMajorAxis,
  eccentricity,
  orbitInclination,
  equatorInclination,
  scaleFactor = 10,
}: PlanetProps): {
  planet: d3.Selection<SVGCircleElement, undefined, null, undefined>;
  orbit: d3.Selection<SVGEllipseElement, undefined, null, undefined>;
} {
  const orbit = Orbit(
    semiMajorAxis,
    eccentricity,
    orbitInclination,
    equatorInclination,
    scaleFactor
  );
  const planet = d3
    .create<SVGCircleElement>("svg:circle")
    .attr("label", name)
    .attr("cx", position.x)
    .attr("cy", position.y)
    .attr("r", radius)
    .attr("fill", color);

  planetOrbitalAnimation(planet, orbit);

  return { planet, orbit };
}

export function Sun(): d3.Selection<
  SVGCircleElement,
  undefined,
  null,
  undefined
> {
  return d3
    .create<SVGCircleElement>("svg:circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 20)
    .attr("fill", "yellow");
}

function Orbit(
  semiMajorAxis: number,
  eccentricity: number,
  orbitInclination: number,
  equatorInclination: number,
  scaleFactor = 10
): d3.Selection<SVGEllipseElement, undefined, null, undefined> {
  const { width, height } = calculateWidthAndHeight(
    eccentricity,
    semiMajorAxis
  );
  return d3
    .create<SVGEllipseElement>("svg:ellipse")
    .attr("cx", 0)
    .attr("cy", 0)
    .style("fill", "none")
    .style("stroke", "grey")
    .style("stroke-dasharray", "4")
    .attr("rx", width)
    .attr("ry", height);
}

const calculateWidthAndHeight = (
  eccentricity: number,
  semiMajorAxis: number
): { width: number; height: number } => {
  const semiMinorAxis =
    semiMajorAxis * Math.sqrt(1 - Math.pow(eccentricity, 2));

  const width = semiMajorAxis * 2;
  const height = semiMinorAxis * 2;
  return { width, height };
};

const planetOrbitalAnimation = (
  planet: d3.Selection<SVGCircleElement, undefined, null, undefined>,
  orbit: d3.Selection<SVGEllipseElement, undefined, null, undefined>,
  rotationSpeed = 1
) => {
  planet
    .transition()
    .duration(10000 * rotationSpeed)
    .ease(d3.easeLinear)
    .attrTween("transform", () => {
      return (t: number) => {
        const angle = t * 2 * Math.PI;
        const x = 0 + (parseInt(orbit.attr("rx")) || 1) * Math.cos(angle);
        const y = 0 + (parseInt(orbit.attr("ry")) || 1) * Math.sin(angle);
        return `translate(${x},${y})`;
      };
    })
    .on("end", () => planetOrbitalAnimation(planet, orbit));
};

function calculateBarycenter(planets: PlanetData[]): Coordinates {
  let totalMass = 0;
  let weightedSumX = 0;
  let weightedSumY = 0;

  // Calculate the total mass and the weighted sum of positions
  for (const planet of planets) {
    totalMass += planet.mass;
    const planetPosition = calculatePlanetPosition(planet);
    weightedSumX += planet.mass * planetPosition.x;
    weightedSumY += planet.mass * planetPosition.y;
  }

  // Calculate the coordinates of the barycenter
  const barycenter = {
    x: weightedSumX / totalMass,
    y: weightedSumY / totalMass,
  };

  return barycenter;
}

function calculatePlanetPosition(planet: PlanetData): Coordinates {
  const { semiMajorAxis, eccentricity, inclination, argumentOfPeriapsis } =
    planet;

  // Calculate the eccentricity vector
  const eccentricityVector = {
    x: semiMajorAxis * eccentricity * Math.cos(argumentOfPeriapsis),
    y: semiMajorAxis * eccentricity * Math.sin(argumentOfPeriapsis),
  };

  // Apply the inclination to the eccentricity vector
  const inclinedEccentricityVector = {
    x: eccentricityVector.x * Math.cos(inclination),
    y: eccentricityVector.y,
  };

  return inclinedEccentricityVector;
}
