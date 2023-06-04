import * as d3 from "d3";
import "./styles/orbital-map.css";
import {
  Sun,
  PlanetsWithOrbits,
  AsteroidBelt,
  OortCloud,
} from "../d3/solar-objects";
import { useEffect, useRef } from "react";
import { MinorSolarObjectData, PlanetData } from "../../models";
import planetsDataJson from "../../data/planet-data.json";
import minorSolarObjectsJson from "../../data/minor-solar-objects.json";
import ZoomableSvg from "../d3/zoomable-svg";
const planetsData: PlanetData[] = planetsDataJson;
const asteroidBeltData: MinorSolarObjectData =
  minorSolarObjectsJson.AsteroidBelt;
const oortCloudData: MinorSolarObjectData = minorSolarObjectsJson.OortCloud;

/**
 * Creates a full screen zoomable 2D orbital map of the our solar system.
 */
export default function OrbitalMap() {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = d3.select(rootRef.current);
    root.selectAll("*").remove();
    const g = d3.create<SVGSVGElement>("svg:g");
    g.append(() => Sun());

    const planetsWithOrbits = PlanetsWithOrbits(planetsData);
    planetsWithOrbits.forEach((pwo) => {
      g.append(() => pwo.orbit);
      g.append(() => pwo.planet);
    });

    g.append(() => AsteroidBelt(asteroidBeltData));
    g.append(() => OortCloud(oortCloudData).node());
    root.append(() => ZoomableSvg(g.node()));
  }, []);

  return <div ref={rootRef}></div>;
}
