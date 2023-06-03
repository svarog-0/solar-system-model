import * as d3 from "d3";

function ZoomableSvg(svgContent: SVGSVGElement | null) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let translateX = 0;
  let translateY = 0;

  const div = d3
    .create("div")
    .style("width", "100%")
    .style("user-select", "none") // Make the SVG unselectable
    .style("cursor", isDragging ? "grabbing" : "grab"); // Change cursor style when dragging

  // Create the SVG element
  const svg = div
    .append("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("viewBox", "0 0 1920 1080")
    .style("transform", `translate(${translateX}px, ${translateY}px)`); // Apply translation

  // Clear existing SVG content
  svg.selectAll("*").remove();

  if (svgContent) {
    // Insert the provided SVG content
    svg.append(() => svgContent);
  }

  const handleMouseDown = (event: MouseEvent) => {
    console.log("handleMouseDown");
    isDragging = true;
    div.style("cursor", isDragging ? "grabbing" : "grab");
    startX = event.clientX;
    startY = event.clientY;
  };

  function handleMouseMove(event: MouseEvent) {
    if (!isDragging) return;

    const offsetX = event.clientX - startX;
    const offsetY = event.clientY - startY;

    translateX = translateX + offsetX;
    translateY = translateY + offsetY;
    svg.style("transform", `translate(${translateX}px, ${translateY}px)`);
    startX = event.clientX;
    startY = event.clientY;
    // debug this method console log one log
    //console.log("handleMouseMove", offsetX, offsetY);
  }

  const handleMouseUp = () => {
    isDragging = false;
    div.style("cursor", isDragging ? "grabbing" : "grab");
  };

  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    if (!svg) return;

    const currentViewBox = svg.node()?.viewBox.baseVal as DOMRect;
    const { width, height } = currentViewBox;

    const scaleFactor = event.deltaY > 0 ? 1.1 : 0.9; // Adjust zoom factor as needed

    const newWidth = width * scaleFactor;
    const newHeight = height * scaleFactor;

    const newX = currentViewBox.x + (width - newWidth) / 2; // Center the zoomed area
    const newY = currentViewBox.y + (height - newHeight) / 2; // Center the zoomed area
    svg.attr("viewBox", `${newX} ${newY} ${newWidth} ${newHeight}`);
  };

  svg.on("mousedown", handleMouseDown);
  svg.on("mousemove", handleMouseMove);
  svg.on("mouseup", handleMouseUp);
  svg.on("mouseleave", handleMouseUp);

  return div.node();
}

export default ZoomableSvg;
