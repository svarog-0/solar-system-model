import * as d3 from "d3";
import "./zoomable-svg.css";

/**
 * Creates a zoomable SVG container with the provided SVG content.
 */
export default function ZoomableSvg(
  svgContent: SVGSVGElement | null
): HTMLElement {
  const svgWidth = 1920 * 1.2;
  const svgHeight = 1080 * 1.3;
  const maxMoveDistance = 50;
  const defaultScale = window.innerWidth <= 1000 ? 3 : 1.5;
  const minScale = 1;
  const maxScale = 4;
  const zoomIntensity = 0.1;
  const moveThreshold = 10;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let translateX = 0;
  let translateY = 0;
  let scale = defaultScale;
  let isPanning = false;
  let isZooming = false;
  let touchStartDistance = 0;
  let touchStartScale = 1;
  let touchStartX = 0;
  let touchStartY = 0;

  const div = d3.create("div").attr("class", "zoomable-svg-div");
  setCursor(div, isDragging);

  const svg = div
    .append("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
  const g = svg
    .append("g")
    .attr("transform", `translate(${svgWidth / 2}, ${svgHeight / 2})`);

  function handleMouseDown(event: any): void {
    console.log("handleMouseDown");
    isDragging = true;
    setCursor(div, isDragging);
    startX = getClientX(event);
    startY = getClientY(event);
  }

  function handleMouseMove(event: MouseEvent): void {
    console.log("handleMouseMove");
    if (!isDragging) return;

    const offsetX = getClientX(event) - startX;
    const offsetY = getClientY(event) - startY;
    const distance = Math.sqrt(offsetX ** 2 + offsetY ** 2);
    if (distance <= maxMoveDistance) {
      translateX = translateX + offsetX;
      translateY = translateY + offsetY;
      applyTransform();
    }
    startX = getClientX(event);
    startY = getClientY(event);
  }

  function handleMouseUp(): void {
    isDragging = false;
    setCursor(div, isDragging);
  }

  function handleWheel(event: WheelEvent): void {
    const minScale = 1;
    const maxScale = 4;
    const delta = event.deltaY > 0 ? -zoomIntensity : zoomIntensity;
    let newScale = scale + delta;

    newScale = Math.max(minScale, Math.min(maxScale, newScale));

    scale = newScale;
    applyTransform();
  }

  function handleTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      // Single touch for panning
      isPanning = true;
      isZooming = false;
      touchStartX = getClientX(event.touches[0]);
      touchStartY = getClientY(event.touches[0]);
    } else if (event.touches.length === 2) {
      // Two touches for zooming and panning
      isPanning = true;
      isZooming = true;
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      touchStartDistance = getDistance(touch1, touch2);
      touchStartScale = scale;
      touchStartX = (touch1.clientX + touch2.clientX) / 2;
      touchStartY = (touch1.clientY + touch2.clientY) / 2;
    }
  }

  function handleTouchMove(event: TouchEvent): void {
    if (isPanning) {
      event.preventDefault(); // Prevent scrolling

      if (isZooming) {
        // Two touches for zooming and panning
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const touchDistance = getDistance(touch1, touch2);
        const deltaDistance = touchDistance - touchStartDistance;
        const newScale = Math.max(
          minScale,
          Math.min(maxScale, touchStartScale + deltaDistance * 0.01)
        );
        const touchX = (touch1.clientX + touch2.clientX) / 2;
        const touchY = (touch1.clientY + touch2.clientY) / 2;
        const offsetX = touchX - touchStartX;
        const offsetY = touchY - touchStartY;

        scale = newScale;
        translateX = offsetX;
        translateY = offsetY;

        applyTransform();
      } else {
        // Single touch for panning
        const touchX = getClientX(event.touches[0]);
        const touchY = getClientY(event.touches[0]);
        const offsetX = touchX - touchStartX;
        const offsetY = touchY - touchStartY;

        if (
          Math.abs(offsetX) > moveThreshold ||
          Math.abs(offsetY) > moveThreshold
        ) {
          translateX += offsetX;
          translateY += offsetY;

          applyTransform();

          touchStartX = touchX;
          touchStartY = touchY;
        }
      }
    }
  }

  function handleTouchEnd(): void {
    isPanning = false;
    isZooming = false;
  }

  function applyTransform(): void {
    svg.style(
      "transform",
      `translate(${translateX}px, ${translateY}px) scale(${scale})`
    );
  }

  function setCursor(
    div: d3.Selection<HTMLDivElement, undefined, null, undefined>,
    isDragging: boolean
  ) {
    div.style("cursor", isDragging ? "grabbing" : "grab");
  }

  if (svgContent) {
    g.append(() => svgContent);
  }

  applyTransform();

  svg.on("mousedown", handleMouseDown);
  svg.on("touchstart", handleTouchStart);
  svg.on("mousemove", handleMouseMove);
  svg.on("mouseup", handleMouseUp);
  svg.on("mouseleave", handleMouseUp);
  svg.on("touchmove", handleTouchMove);
  svg.on("touchend", handleTouchEnd);
  div.on("wheel", handleWheel);

  return (
    div.node() ||
    (() => {
      throw new Error("Zoomable svg not created");
    })()
  );
}

function getClientX(event: any): number {
  return "touches" in event ? event.touches[0].clientX : event.clientX;
}

function getClientY(event: any): number {
  return "touches" in event ? event.touches[0].clientY : event.clientY;
}

function getDistance(point1: Touch, point2: Touch): number {
  const dx = point2.clientX - point1.clientX;
  const dy = point2.clientY - point1.clientY;
  return Math.sqrt(dx ** 2 + dy ** 2);
}
