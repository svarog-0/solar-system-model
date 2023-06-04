import * as d3 from "d3";
import "./space-background.css";

export function SpaceBackground(
  svg: d3.Selection<SVGSVGElement, undefined, null, undefined>
) {
  svg.attr("class", "star-background");

  const defs = svg.append("defs");

  const solarGradientLeftBottom = defs
    .append("radialGradient")
    .attr("cx", "0%")
    .attr("cy", "100%")
    .attr("r", "100%")
    .attr("spreadMethod", "pad")
    .attr("id", "solarGradient");

  solarGradientLeftBottom
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "hsla(0, 0%, 100%, 0.35)");

  solarGradientLeftBottom
    .append("stop")
    .attr("offset", "70%")
    .attr("stop-color", "hsla(0, 0%, 0%, 0)");

  const solarGradientRightTop = defs
    .append("radialGradient")
    .attr("cx", "100%")
    .attr("cy", "0%")
    .attr("r", "100%")
    .attr("spreadMethod", "pad")
    .attr("id", "solarGradientTop");

  solarGradientRightTop
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "hsla(0, 0%, 100%, 0.35)");

  solarGradientRightTop
    .append("stop")
    .attr("offset", "70%")
    .attr("stop-color", "hsla(0, 0%, 0%, 0)");

  const flickerGradient = defs
    .append("radialGradient")
    .attr("id", "flickerGradient");

  flickerGradient
    .append("stop")
    .attr("offset", "80%")
    .attr("stop-color", "hsla(0, 0%, 0%, 1)");

  flickerGradient
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "hsla(0, 0%, 0%, 0.25)");

  const stars = defs.append("g").attr("id", "stars");

  stars
    .append("path")
    .attr("id", "*")
    .attr(
      "d",
      `
    M 0.000 0.500
    L 1.736 3.604
    L 0.391 0.312
    L 3.900 0.890
    L 0.487 -0.111
    L 3.127 -2.494
    L 0.217 -0.450
    L 0.000 -4.000
    L -0.217 -0.450
    L -3.127 -2.494
    L -0.487 -0.111
    L -3.900 0.890
    L -0.391 0.312
    L -1.736 3.604
    L 0.000 0.500
  `
    );

  stars
    .selectAll("use")
    .data([
      { x: 13, y: 26 },
      { x: 229, y: 45 },
      { x: 361, y: 12 },
      { x: 491, y: 40 },
      { x: 522, y: 48 },
      { x: 717, y: 19 },
      { x: 814, y: 92 },
      { x: 975, y: 30 },
      { x: 64, y: 137 },
      { x: 185, y: 149 },
      { x: 317, y: 205 },
      { x: 401, y: 227 },
      { x: 546, y: 171 },
      { x: 732, y: 228 },
      { x: 882, y: 241 },
      { x: 974, y: 144 },
      { x: 112, y: 318 },
      { x: 243, y: 350 },
      { x: 372, y: 373 },
      { x: 394, y: 273 },
      { x: 519, y: 375 },
      { x: 722, y: 353 },
      { x: 780, y: 293 },
      { x: 999, y: 267 },
      { x: 23, y: 432 },
      { x: 169, y: 481 },
      { x: 321, y: 455 },
      { x: 399, y: 493 },
      { x: 536, y: 440 },
      { x: 661, y: 473 },
      { x: 797, y: 444 },
      { x: 982, y: 502 },
      { x: 13, y: 561 },
      { x: 200, y: 558 },
      { x: 376, y: 602 },
      { x: 432, y: 611 },
      { x: 603, y: 607 },
      { x: 692, y: 560 },
      { x: 796, y: 557 },
      { x: 973, y: 604 },
      { x: 64, y: 724 },
      { x: 232, y: 742 },
      { x: 267, y: 647 },
      { x: 430, y: 736 },
      { x: 585, y: 695 },
      { x: 713, y: 701 },
      { x: 852, y: 695 },
      { x: 998, y: 697 },
      { x: 63, y: 866 },
      { x: 241, y: 876 },
      { x: 358, y: 810 },
      { x: 422, y: 787 },
      { x: 617, y: 832 },
      { x: 660, y: 814 },
      { x: 825, y: 886 },
      { x: 1008, y: 863 },
      { x: 82, y: 910 },
      { x: 238, y: 993 },
      { x: 301, y: 946 },
      { x: 476, y: 1013 },
      { x: 568, y: 945 },
      { x: 662, y: 981 },
      { x: 879, y: 997 },
    ])
    .enter()
    .append("use")
    .attr("href", "#*")
    .attr("xlink:href", "#*")
    .attr("x", (d) => d.x)
    .attr("y", (d) => d.y);

  svg
    .append("use")
    .attr("class", "stars stars-sm-no-rotate")
    .attr("href", "#stars");

  svg.append("use").attr("class", "stars stars-sm").attr("href", "#stars");

  svg.append("use").attr("class", "stars stars-md").attr("href", "#stars");

  svg
    .append("g")
    .attr("class", "flicker-circles")
    .selectAll("circle")
    .data([
      { cx: 47, cy: 149 },
      { cx: 290, cy: 11 },
      { cx: 506, cy: 69 },
      { cx: 808, cy: 99 },
      { cx: 962, cy: 49 },
      { cx: 15, cy: 276 },
      { cx: 257, cy: 395 },
      { cx: 465, cy: 342 },
      { cx: 707, cy: 242 },
      { cx: 901, cy: 222 },
      { cx: 68, cy: 551 },
      { cx: 270, cy: 549 },
      { cx: 573, cy: 470 },
      { cx: 708, cy: 466 },
      { cx: 914, cy: 542 },
      { cx: 40, cy: 751 },
      { cx: 366, cy: 806 },
      { cx: 461, cy: 790 },
      { cx: 644, cy: 720 },
      { cx: 905, cy: 684 },
      { cx: 192, cy: 853 },
      { cx: 218, cy: 946 },
      { cx: 431, cy: 854 },
      { cx: 740, cy: 1006 },
    ])
    .enter()
    .append("circle")
    .attr("cx", (d) => d.cx)
    .attr("cy", (d) => d.cy);

  svg.append("use").attr("class", "stars stars-lg").attr("href", "#stars");

  svg.append("rect").attr("class", "sun-ray-1").attr("x", 0).attr("y", 0);
  console.log("svg", svg);
  svg.append("rect").attr("class", "sun-ray-2");
}
