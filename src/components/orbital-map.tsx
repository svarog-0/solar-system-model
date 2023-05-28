import * as d3 from "d3";
import "./styles/orbital-map.css";
import { Sun, PlanetWithOrbit } from "./solar-objects";
import { useEffect } from "react";

const earthData = {
  name: "Earth",
  mass: 1,
  semiMajorAxis: 1,
  eccentricity: 0.0167,
  inclination: 0,
  argumentOfPeriapsis: 114.20783,
  diameter: 12742,
  type: "Rocky",
  averageTemperature: 15,
  dayDuration: 24,
  yearDuration: 1,
};

export default function OrbitalMap() {
  useEffect(() => {
    d3.select("#map-root").selectAll("*").remove();
    console.log("OrbitalMap mounted");
    const svg = createSvg();
    const g = svg.append("g");
    g.attr("transform", `translate(${300},${200})`);
    g.append(() => Sun().node());

    // Create earth and its orbit
    const { planet: earth, orbit: earthOrbit } = PlanetWithOrbit({
      name: "Earth",
      radius: 10,
      color: "blue",
      rotationDuration: 1000,
      position: {
        x: 0,
        y: 0,
      },
      semiMajorAxis: 57,
      eccentricity: 0.1,
      orbitInclination: 0.0,
      equatorInclination: 23.4,
      scaleFactor: 10,
    });

    g.append(() => earthOrbit.node());
    g.append(() => earth.node());
    d3.select("#map-root").append(() => svg.node());
  }, []);

  return <div id="map-root" />;
}

const createSvg = () =>
  d3
    .select("#map-root")
    // Container class to make it responsive.
    .classed("svg-container", true)
    .append("svg")
    // Responsive SVG needs these 2 attributes and no width and height attr.
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 600 400")
    // Class to make it responsive.
    .classed("svg-content-responsive", true);
