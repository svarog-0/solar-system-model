import * as d3 from "d3";

/**
 * Creates a zoomable SVG container with the provided SVG content.
 */
export default function ZoomableSvg(
  svgContent: SVGSVGElement | null
): HTMLElement {
  const { svgWidth, svgHeight } = {
    svgWidth: 1920 * 1.2,
    svgHeight: 1080 * 1.3,
  };
  const maxMoveDistance = 50;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let translateX = 0;
  let translateY = 0;
  let scale: number;

  const div = d3
    .create("div")
    .style("overflow", "hidden")
    .style("width", "100vw")
    .style("height", "100vh")
    .style("user-select", "none")
    .style("cursor", isDragging ? "grabbing" : "grab");

  const svg = div
    .append("svg")
    .style("overflow", "hidden")
    .style("display", "block")
    .style("margin", "auto")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
    .style("transform", `translate(${translateX}px, ${translateY}px)`)
    .attr("width", "100vw")
    .attr("height", "100vh");
  const g = svg
    .append("g")
    .attr("transform", `translate(${svgWidth / 2}, ${svgHeight / 2})`);

  if (svgContent) {
    g.append(() => svgContent);
  }
  setDefaultScale();
  applyZoomTransformation();

  function handleMouseDown(event: MouseEvent): void {
    console.log("handleMouseDown");
    isDragging = true;
    div.style("cursor", isDragging ? "grabbing" : "grab");
    startX = event.clientX;
    startY = event.clientY;
  }

  function handleMouseMove(event: MouseEvent): void {
    console.log("handleMouseMove");
    if (!isDragging) return;

    const offsetX = event.clientX - startX;
    const offsetY = event.clientY - startY;
    const distance = Math.sqrt(offsetX ** 2 + offsetY ** 2);
    if (distance <= maxMoveDistance) {
      translateX = translateX + offsetX;
      translateY = translateY + offsetY;
      svg.style(
        "transform",
        `translate(${translateX}px, ${translateY}px) scale(${scale}`
      );
    }
    startX = event.clientX;
    startY = event.clientY;
  }

  function handleMouseUp(): void {
    isDragging = false;
    div.style("cursor", isDragging ? "grabbing" : "grab");
  }

  function handleWheel(event: any): void {
    const zoomIntensity = 0.1;
    const minScale = 1;
    const maxScale = 4;
    const delta = event.deltaY > 0 ? -zoomIntensity : zoomIntensity;
    let newScale = scale + delta;

    newScale = Math.max(minScale, Math.min(maxScale, newScale));

    scale = newScale;
    applyZoomTransformation();
  }

  function setDefaultScale(): void {
    scale = window.innerWidth <= 1000 ? 3 : 1.5;
  }
  function applyZoomTransformation(): void {
    svg.style(
      "transform",
      `translate(${translateX}px, ${translateY}px) scale(${scale})`
    );
  }

  svg.on("mousedown", handleMouseDown);
  svg.on("touchstart", handleMouseDown);
  svg.on("mousemove", handleMouseMove);
  svg.on("mouseup", handleMouseUp);
  svg.on("mouseleave", handleMouseUp);
  svg.on("touchmove", handleMouseMove);
  svg.on("touchend", handleMouseUp);
  div.on("wheel", handleWheel);

  return (
    div.node() ||
    (() => {
      throw new Error("Zoomable svg not created");
    })()
  );
}
