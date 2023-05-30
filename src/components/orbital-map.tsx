import * as d3 from "d3";
import "./styles/orbital-map.css";
import {
  Sun,
  PlanetsWithOrbits,
  AsteroidBelt,
  OortCloud,
} from "./solar-objects";
import { useEffect } from "react";
import { MinorSolarObjectData, PlanetData } from "../models";
import planetsDataJson from "../data/planet-data.json";
import minorSolarObjectsJson from "../data/minor-solar-objects.json";
const planetsData: PlanetData[] = planetsDataJson;
const asteroidBeltData: MinorSolarObjectData =
  minorSolarObjectsJson.AsteroidBelt;
const oortCloudData: MinorSolarObjectData = minorSolarObjectsJson.OortCloud;

export default function OrbitalMap() {
  useEffect(() => {
    d3.select("#map-root").selectAll("*").remove();
    console.log("OrbitalMap mounted");
    const svg = createSvg();
    const g = svg.append("g").attr("id", "g-root");
    g.attr(
      "transform",
      `translate(${window.innerWidth / 2}, ${window.innerHeight / 2})`
    );
    g.append(() => Sun().node());

    // Create earth and its orbit
    const planetsWithOrbits = PlanetsWithOrbits(planetsData);
    planetsWithOrbits.forEach((pwo) => {
      g.append(() => pwo.orbit.node());
      g.append(() => pwo.planet.node());
    });

    // Create asteroid belt and Oort Cloud
    g.append(() => AsteroidBelt(asteroidBeltData).node());
    g.append(() => OortCloud(oortCloudData).node());

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
    .attr("class", "responsive-svg")
    .attr("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet");
