import * as d3 from "d3";
import "./zoomable-svg.css";

// Constants
const SVG_WIDTH = 1920 * 1.2;
const SVG_HEIGHT = 1080 * 1.3;
const MAX_MOVE_DISTANCE = 50;
const DEFAULT_SCALE = window.innerWidth <= 1000 ? 3 : 1.5;
const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_INTENSITY = 0.1;
const MOVE_THRESHOLD = 10;

/**
 * Creates a zoomable SVG container with the provided SVG content.
 */
export default function ZoomableSvg(
  svgContent: SVGSVGElement | null
): HTMLElement {
  // State
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let translateX = 0;
  let translateY = 0;
  let scale = DEFAULT_SCALE;
  let isPanning = false;
  let isZooming = false;
  let touchStartDistance = 0;
  let touchStartScale = 1;
  let touchStartX = 0;
  let touchStartY = 0;

  // Create container
  const div = d3.create("div").attr("class", "zoomable-svg-div");
  setCursor(div, isDragging);

  // Create SVG
  const svg = div
    .append("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("viewBox", `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`);

  // Create main group
  const g = svg
    .append("g")
    .attr("transform", `translate(${SVG_WIDTH / 2}, ${SVG_HEIGHT / 2})`);

  // Define event handlers
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
    if (distance <= MAX_MOVE_DISTANCE) {
      translateX = translateX + offsetX;
      translateY = translateY + offsetY;

      applyTransform(svg, translateX, translateY, scale);
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
    const delta = event.deltaY > 0 ? -ZOOM_INTENSITY : ZOOM_INTENSITY;
    let newScale = scale + delta;

    newScale = Math.max(minScale, Math.min(maxScale, newScale));

    scale = newScale;

    applyTransform(svg, translateX, translateY, scale);
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
          MIN_SCALE,
          Math.min(MAX_SCALE, touchStartScale + deltaDistance * 0.01)
        );
        const touchX = (touch1.clientX + touch2.clientX) / 2;
        const touchY = (touch1.clientY + touch2.clientY) / 2;
        const offsetX = touchX - touchStartX;
        const offsetY = touchY - touchStartY;

        scale = newScale;
        translateX = offsetX;
        translateY = offsetY;

        applyTransform(svg, translateX, translateY, scale);
      } else {
        // Single touch for panning
        const touchX = getClientX(event.touches[0]);
        const touchY = getClientY(event.touches[0]);
        const offsetX = touchX - touchStartX;
        const offsetY = touchY - touchStartY;

        if (
          Math.abs(offsetX) > MOVE_THRESHOLD ||
          Math.abs(offsetY) > MOVE_THRESHOLD
        ) {
          translateX += offsetX;
          translateY += offsetY;

          applyTransform(svg, translateX, translateY, scale);

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

  // Add event listeners
  svg.on("mousedown", handleMouseDown);
  svg.on("touchstart", handleTouchStart);
  svg.on("mousemove", handleMouseMove);
  svg.on("mouseup", handleMouseUp);
  svg.on("mouseleave", handleMouseUp);
  svg.on("touchmove", handleTouchMove);
  svg.on("touchend", handleTouchEnd);
  div.on("wheel", handleWheel);

  // Render and return
  if (svgContent) {
    g.append(() => svgContent);
  }

  applyTransform(svg, translateX, translateY, scale);

  return (
    div.node() ??
    (() => {
      throw new Error("Zoomable svg not created");
    })()
  );
}

function applyTransform(
  svg: d3.Selection<SVGSVGElement, undefined, null, undefined>,
  translateX: number,
  translateY: number,
  scale: number
): void {
  svg.style(
    "transform",
    `translate(${translateX}px, ${translateY}px) scale(${scale})`
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

function setCursor(
  div: d3.Selection<HTMLDivElement, undefined, null, undefined>,
  isDragging: boolean
) {
  div.style("cursor", isDragging ? "grabbing" : "grab");
}
