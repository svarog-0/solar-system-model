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
  const minScale = 1;
  const maxScale = 4;
  const zoomIntensity = 0.1;
  const moveThreshold = 10;

  let isPanning = false;
  let isZooming = false;
  let touchStartDistance = 0;
  let touchStartScale = 1;
  let touchStartX = 0;
  let touchStartY = 0;

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
  applyTransform();

  function handleMouseDown(event: any): void {
    console.log("handleMouseDown");
    isDragging = true;
    div.style("cursor", isDragging ? "grabbing" : "grab");
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
      svg.style(
        "transform",
        `translate(${translateX}px, ${translateY}px) scale(${scale})`
      );
    }
    startX = getClientX(event);
    startY = getClientY(event);
  }

  function handleMouseUp(): void {
    isDragging = false;
    div.style("cursor", isDragging ? "grabbing" : "grab");
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

  function setDefaultScale(): void {
    scale = window.innerWidth <= 1000 ? 3 : 1.5;
  }

  function applyTransform(): void {
    svg.style(
      "transform",
      `translate(${translateX}px, ${translateY}px) scale(${scale})`
    );
  }

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

function getCenter(point1: Touch, point2: Touch): { x: number; y: number } {
  const x = (point1.clientX + point2.clientX) / 2;
  const y = (point1.clientY + point2.clientY) / 2;
  return { x, y };
}
