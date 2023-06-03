import * as d3 from "d3";
import "./styles/orbital-map.css";
import {
  Sun,
  PlanetsWithOrbits,
  AsteroidBelt,
  OortCloud,
} from "./solar-objects";
import { useEffect, useRef } from "react";
import { MinorSolarObjectData, PlanetData } from "../models";
import planetsDataJson from "../data/planet-data.json";
import minorSolarObjectsJson from "../data/minor-solar-objects.json";
import ZoomableSvg from "./zoomable-svg";
const planetsData: PlanetData[] = planetsDataJson;
const asteroidBeltData: MinorSolarObjectData =
  minorSolarObjectsJson.AsteroidBelt;
const oortCloudData: MinorSolarObjectData = minorSolarObjectsJson.OortCloud;
const { svgWidth, svgHeight } = { svgWidth: 1920, svgHeight: 1080 };

export default function OrbitalMap() {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = d3.select(rootRef.current);
    root.selectAll("*").remove();
    const g = d3.create<SVGSVGElement>("svg:g").attr("id", "g-root");
    g.attr("transform", `translate(${svgWidth / 2}, ${svgHeight / 2})`);
    g.append(() => Sun());

    // Create earth and its orbit
    const planetsWithOrbits = PlanetsWithOrbits(planetsData);
    planetsWithOrbits.forEach((pwo) => {
      g.append(() => pwo.orbit);
      g.append(() => pwo.planet);
    });

    // Create asteroid belt and Oort Cloud
    g.append(() => AsteroidBelt(asteroidBeltData));
    g.append(() => OortCloud(oortCloudData).node());
    root.append(() => ZoomableSvg(g.node()));
  }, []);

  return <div ref={rootRef}></div>;
}
