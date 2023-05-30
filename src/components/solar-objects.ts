import * as d3 from "d3";
import { Cords, MinorSolarObjectData, PlanetData } from "../models";
import ts from "typescript";

export function PlanetsWithOrbits(planetsData: PlanetData[]): {
  planet: d3.Selection<SVGCircleElement, undefined, null, undefined>;
  orbit: d3.Selection<SVGEllipseElement, undefined, null, undefined>;
}[] {
  const cords = calculateBarycenter(planetsData);
  return planetsData.map((pd) => {
    const orbit = Orbit(pd, cords);
    const planet = d3
      .create<SVGCircleElement>("svg:circle")
      .attr("label", pd.name)
      .attr("cx", cords.x)
      .attr("cy", cords.y)
      .attr("r", getScaledDiameter(pd.diameter))
      .attr("fill", pd.color);

    addOrbitalAnimation(planet, orbit);

    return { planet, orbit };
  });
}

export function Sun(): d3.Selection<d3.BaseType, undefined, null, undefined> {
  const sunRadius = 50;
  return d3
    .create("svg:pattern")
    .attr("width", sunRadius)
    .attr("height", sunRadius)
    .attr("patternUnits", "userSpaceOnUse")
    .attr("x", -(sunRadius / 2))
    .attr("y", -(sunRadius / 2))
    .append("svg:image")
    .attr("xlink:href", "/assets/sun.png")
    .attr("width", sunRadius)
    .attr("height", sunRadius)
    .attr("x", -(sunRadius / 2))
    .attr("y", -(sunRadius / 2));
}

export function AsteroidBelt(ad: MinorSolarObjectData) {
  const asteroidGroup = d3.create("svg:g").attr("id", "asteroid-g");
  const innerRadius = getScaledSemiMajorAxis(ad.semiMajorAxisStart, ad.name);
  const outerRadius = getScaledSemiMajorAxis(ad.semiMajorAxisEnd, ad.name);
  const arcGenerator = d3
    .arc()
    .innerRadius(innerRadius * 2)
    .outerRadius(outerRadius)
    .startAngle(0)
    .endAngle(Math.PI * 2);

  const textArcGenerator = d3
    .arc()
    .innerRadius(innerRadius * 1.5)
    .outerRadius((innerRadius * 2 + outerRadius) / 2);

  asteroidGroup
    .append("svg:path")
    .attr("d", arcGenerator as any)
    .attr("fill", "grey")
    .attr("opacity", 0.3)
    .text(ad.name);

  const text = asteroidGroup.append("text");

  text
    .append("textPath")
    .text(ad.name)
    .attr("startOffset", "50%")
    .style("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("id", "ad-text-path")
    .attr("href", "#ad-text-arc1");

  asteroidGroup
    .append("path")
    .attr(
      "d",
      //@ts-ignore
      textArcGenerator({
        startAngle: 0,
        endAngle: Math.PI * 2,
      }) as any
    )
    .attr("id", "ad-text-arc1")
    .style("fill", "none")
    .style("stroke", "none");

  text
    .append("textPath")
    .text(ad.name)
    .attr("startOffset", "50%")
    .style("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("id", "ad-text-path")
    .attr("href", "#ad-text-arc2");

  asteroidGroup
    .append("path")
    .attr(
      "d",
      () =>
        //@ts-ignore
        textArcGenerator({
          startAngle: Math.PI * 1,
          endAngle: Math.PI * 3,
        }) as any
    )
    .attr("id", "ad-text-arc2")
    .style("fill", "none")
    .style("stroke", "none");

  return asteroidGroup;
}

export function OortCloud(oc: MinorSolarObjectData) {
  const oortGroup = d3.create("svg:g").attr("id", "oort-g");
  const innerRadius = getScaledSemiMajorAxis(oc.semiMajorAxisStart, oc.name);
  const outerRadius = getScaledSemiMajorAxis(oc.semiMajorAxisEnd / 15, oc.name);
  const arcGenerator = d3
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius * 1.5)
    .startAngle(0)
    .endAngle(Math.PI * 2);

  const textArcGenerator = d3
    .arc()
    .innerRadius(innerRadius * 1.1) // Adjust the factor (0.1) to control the distance from the inner edge
    .outerRadius(outerRadius * 0.8);
  oortGroup
    .append("svg:path")
    .attr("id", "text-path")
    .attr("d", arcGenerator as any)
    .attr("fill", "grey")
    .attr("opacity", 0.2)
    .text(oc.name);

  oortGroup.append(() => textAtAngle(textArcGenerator, oc.name, 45).node());

  oortGroup.append(() => textAtAngle(textArcGenerator, oc.name, 313).node());
  oortGroup.append(() =>
    textAtAngle(textArcGenerator, oc.name, 223, true).node()
  );
  oortGroup.append(() =>
    textAtAngle(textArcGenerator, oc.name, 133, true).node()
  );

  return oortGroup;
}

function textAtAngle(
  arcGenerator: any,
  text: string,
  angle: number,
  flip = false
): d3.Selection<Element, undefined, null, undefined> {
  const id = "text-at-angle-" + angle + (flip ? "-flipped" : "");
  const g = d3.create("svg:g");
  g.append("text")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "middle")
    .attr("dominant-baseline", "middle")
    .append("textPath")
    .text(text)
    .attr("href", `#${id}`);

  g.append("path")
    .attr(
      "d",
      arcGenerator({
        startAngle: (Math.PI / 180) * (flip ? -angle : angle),
        endAngle: (Math.PI / 180) * (flip ? -360 : 360),
      })
    )
    .attr("id", id)
    .style("fill", "none")
    .style("stroke", "none");
  return g;
}

function Orbit(
  solarObject: PlanetData,
  cords: Cords
): d3.Selection<SVGEllipseElement, undefined, null, undefined> {
  const { width, height } = calculateWidthAndHeight(
    solarObject.eccentricity,
    getScaledSemiMajorAxis(solarObject.semiMajorAxis, solarObject.name)
  );
  return d3
    .create<SVGEllipseElement>("svg:ellipse")
    .attr("cx", cords.x)
    .attr("cy", cords.y)
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

const addOrbitalAnimation = (
  planet: d3.Selection<any, undefined, null, undefined>,
  orbit: d3.Selection<SVGEllipseElement, undefined, null, undefined>,
  rotationSpeed = 1
) => {
  planet
    .transition()
    .duration(1000 * rotationSpeed)
    .ease(d3.easeLinear)
    .attrTween("transform", () => {
      return (t: number) => {
        const angle = t * 2 * Math.PI;
        const x = 0 + (parseInt(orbit.attr("rx")) || 1) * Math.cos(angle);
        const y = 0 + (parseInt(orbit.attr("ry")) || 1) * Math.sin(angle);
        return `translate(${x},${y})`;
      };
    });
  //.on("end", () => planetOrbitalAnimation(planet, orbit));
};

function calculateBarycenter(planets: PlanetData[]): Cords {
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

function calculatePlanetPosition(planet: PlanetData): Cords {
  const { semiMajorAxis, eccentricity, orbitInclination, argumentOfPeriapsis } =
    planet;

  // Calculate the eccentricity vector
  const eccentricityVector = {
    x: semiMajorAxis * eccentricity * Math.cos(argumentOfPeriapsis),
    y: semiMajorAxis * eccentricity * Math.sin(argumentOfPeriapsis),
  };

  // Apply the inclination to the eccentricity vector
  const inclinedEccentricityVector = {
    x: eccentricityVector.x * Math.cos(orbitInclination),
    y: eccentricityVector.y,
  };

  return inclinedEccentricityVector;
}

const getScaledSemiMajorAxis = (
  semiMajorAxis: number,
  name: string
): number => {
  switch (name) {
    case "Mercury":
      return semiMajorAxis * 38;
    case "Venus":
      return semiMajorAxis * 34;
    case "Earth":
      return semiMajorAxis * 40;
    case "Mars":
      return semiMajorAxis * 35;
    case "Ceres":
      return semiMajorAxis * 27;
    case "Asteroid Belt":
      return semiMajorAxis * 37;
    case "Jupiter":
      return semiMajorAxis * 17;
    case "Saturn":
      return semiMajorAxis * 12;
    case "Uranus":
      return semiMajorAxis * 8;
    case "Neptune":
      return semiMajorAxis * 7;
    case "Pluto":
      return semiMajorAxis * 6.5;
    case "Oort Cloud":
      return semiMajorAxis / 9;
    default:
      return 0;
  }
};

const getScaledDiameter = (diameter: number, scaleFactor = 1500): number => {
  if (diameter > 150000) return diameter / (scaleFactor * 10);
  if (diameter > 100000) return diameter / (scaleFactor * 5);
  if (diameter > 50000) return diameter / (scaleFactor * 2.5);
  if (diameter > 10000) return (diameter / scaleFactor) * 1.5;
  return (diameter / scaleFactor) * 2;
};
