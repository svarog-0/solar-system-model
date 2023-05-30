import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";

interface ZoomableSvgProps {
  svgContent: SVGSVGElement | null;
}

const ZoomableSvg: React.FC<ZoomableSvgProps> = ({ svgContent }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Clear existing SVG content
    svg.selectAll("*").remove();

    if (svgContent) {
      // Insert the provided SVG content
      svg.node()?.appendChild(svgContent.cloneNode(true));
    }

    // Add event listeners for dragging
    svg.on("mousedown", handleMouseDown);
    svg.on("mousemove", handleMouseMove);
    svg.on("mouseup", handleMouseUp);
    svg.on("mouseleave", handleMouseUp);
  }, [svgContent, isDragging, startX, startY, translateX, translateY]);

  const handleMouseDown = (event: MouseEvent) => {
    setIsDragging(true);
    setStartX(event.clientX);
    setStartY(event.clientY);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging) return;

    const offsetX = event.clientX - startX;
    const offsetY = event.clientY - startY;

    setTranslateX(translateX + offsetX);
    setTranslateY(translateY + offsetY);

    setStartX(event.clientX);
    setStartY(event.clientY);
    // debug this method console log one log
    console.log("handleMouseMove", offsetX, offsetY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;

    const currentViewBox = svg.viewBox.baseVal;
    const { width, height } = currentViewBox;

    const scaleFactor = event.deltaY > 0 ? 1.1 : 0.9; // Adjust zoom factor as needed

    const newWidth = width * scaleFactor;
    const newHeight = height * scaleFactor;

    const newX = currentViewBox.x + (width - newWidth) / 2; // Center the zoomed area
    const newY = currentViewBox.y + (height - newHeight) / 2; // Center the zoomed area
    svg.setAttribute("viewBox", `${newX} ${newY} ${newWidth} ${newHeight}`);
  };

  return (
    <div
      style={{
        width: "100%",
        userSelect: "none", // Make the SVG unselectable
        cursor: isDragging ? "grabbing" : "grab", // Change cursor style when dragging
      }}
    >
      <svg
        onWheel={handleWheel}
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1920 1080"
        style={{ transform: `translate(${translateX}px, ${translateY}px)` }} // Apply translation
      />
    </div>
  );
};

export default ZoomableSvg;
