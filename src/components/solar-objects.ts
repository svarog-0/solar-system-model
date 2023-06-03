import * as d3 from "d3";
import { Cords, MinorSolarObjectData, PlanetData } from "../models";

export function PlanetsWithOrbits(planetsData: PlanetData[]): {
  planet: SVGCircleElement;
  orbit: SVGEllipseElement;
}[] {
  const cords = calculateBarycenter(planetsData);
  return planetsData.map((pd) => {
    const orbit = Orbit(pd, cords);
    const planetSelection = d3
      .create<SVGCircleElement>("svg:circle")
      .attr("label", pd.name)
      .attr("cx", cords.x)
      .attr("cy", cords.y)
      .attr("r", getScaledDiameter(pd.diameter))
      .attr("fill", pd.color);

    const planet =
      planetSelection.node() ||
      (() => {
        throw Error("Planet not created");
      })();

    addOrbitalAnimation(planetSelection, orbit);

    return { planet: planet, orbit: orbit };
  });
}

export function Sun(): SVGImageElement {
  const sunRadius = 200;
  return (
    d3
      .create<SVGPatternElement>("svg:pattern")
      .attr("width", sunRadius)
      .attr("height", sunRadius)
      .attr("patternUnits", "userSpaceOnUse")
      .attr("x", -(sunRadius / 2))
      .attr("y", -(sunRadius / 2))
      .append<SVGImageElement>("svg:image")
      .attr("xlink:href", "/assets/sun.png")
      .attr("width", sunRadius)
      .attr("height", sunRadius)
      .attr("x", -(sunRadius / 2))
      .attr("y", -(sunRadius / 2))
      .node() ||
    (() => {
      throw Error("Sun not created");
    })()
  );
}

export function AsteroidBelt(ad: MinorSolarObjectData): Element {
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

  return (
    asteroidGroup.node() ||
    (() => {
      throw Error("Asteroid belt not created");
    })()
  );
}

export function OortCloud(oc: MinorSolarObjectData) {
  const oortGroup = d3.create("svg:g").attr("id", "oort-g");
  const innerRadius = getScaledSemiMajorAxis(oc.semiMajorAxisStart, oc.name);
  const outerRadius = getScaledSemiMajorAxis(oc.semiMajorAxisEnd / 15, oc.name);
  const { width, height } = calculateWidthAndHeight(
    oc.eccentricity,
    getScaledSemiMajorAxis(oc.semiMajorAxisStart * 0.8, oc.name)
  );
  const arcGenerator = d3
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius * 1.5)
    .startAngle(0)
    .endAngle(Math.PI * 2);

  const textArcGenerator = d3
    .arc()
    .innerRadius(innerRadius * 1.2) // Adjust the factor (0.1) to control the distance from the inner edge
    .outerRadius(outerRadius * 0.8);
  oortGroup
    .append<SVGEllipseElement>("ellipse")
    .attr("cx", 0)
    .attr("cy", 0)
    .style("fill", "none")
    .style("stroke", "grey")
    .attr("rx", width)
    .attr("ry", height);
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

function Orbit(solarObject: PlanetData, cords: Cords): SVGEllipseElement {
  const { width, height } = calculateWidthAndHeight(
    solarObject.eccentricity,
    getScaledSemiMajorAxis(solarObject.semiMajorAxis, solarObject.name)
  );
  return (
    d3
      .create<SVGEllipseElement>("svg:ellipse")
      .attr("cx", cords.x)
      .attr("cy", cords.y)
      .style("fill", "none")
      .style("stroke", "grey")
      .style("stroke-dasharray", "4")
      .attr("rx", width)
      .attr("ry", height)
      .node() ||
    (() => {
      throw new Error("Orbit not created");
    })()
  );
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
  planet: d3.Selection<SVGCircleElement, undefined, null, undefined>,
  orbit: SVGEllipseElement,
  rotationSpeed = 1
) => {
  planet
    .transition()
    .duration(1000 * rotationSpeed)
    .ease(d3.easeLinear)
    .attrTween("transform", () => {
      return (t: number) => {
        const angle = t * 2 * Math.PI;
        const x =
          0 + parseInt(orbit.getAttribute("rx") || "1") * Math.cos(angle);
        const y =
          0 + parseInt(orbit.getAttribute("ry") || "1") * Math.sin(angle);
        return `translate(${x},${y})`;
      };
    })
    .on("end", () => addOrbitalAnimation(planet, orbit));
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
      return semiMajorAxis * 48;
    case "Venus":
      return semiMajorAxis * 44;
    case "Earth":
      return semiMajorAxis * 50;
    case "Mars":
      return semiMajorAxis * 55;
    case "Ceres":
      return semiMajorAxis * 37;
    case "Asteroid Belt":
      return semiMajorAxis * 47;
    case "Jupiter":
      return semiMajorAxis * 27;
    case "Saturn":
      return semiMajorAxis * 22;
    case "Uranus":
      return semiMajorAxis * 13.4;
    case "Neptune":
      return semiMajorAxis * 10;
    case "Pluto":
      return semiMajorAxis * 8.3;
    case "Oort Cloud":
      return semiMajorAxis / 7;
    default:
      return 0;
  }
};

const getScaledDiameter = (diameter: number, scaleFactor = 1500): number => {
  if (diameter > 49000) return (diameter / scaleFactor) * 0.7;
  if (diameter > 5000) return (diameter / scaleFactor) * 1.5;
  return (diameter / scaleFactor) * 3;
};
