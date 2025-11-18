d3.csv("data.csv").then(dataset => {
  const width = 500,
    height = 500,
    radius = Math.min(width, height) / 2 - 20;

  // container
  const svg = d3.select("#pie")
    .attr("width", width)
    .attr("height", height)
    .style("overflow", "visible");

  // group centered
  const g = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // compute category counts
  const categoryCounts = d3.rollups(dataset, v => v.length, d => d.category)
    .sort((a, b) => d3.descending(a[1], b[1]));

  const total = d3.sum(categoryCounts, d => d[1]);

  // color scale
  const color = d3.scaleOrdinal()
    .domain(categoryCounts.map(d => d[0]))
    .range(d3.schemeCategory10);

  // pie + arc generators
  const pie = d3.pie()
    .sort(null)
    .value(d => d[1]);

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  // tooltip
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "pie-tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("padding", "6px 8px")
    .style("background", "rgba(0,0,0,0.7)")
    .style("color", "#fff")
    .style("font-size", "12px")
    .style("border-radius", "4px")
    .style("display", "none");

  // draw slices (STATIC — no animation)
  const arcs = g.selectAll("path.slice")
    .data(pie(categoryCounts))
    .enter()
    .append("path")
    .attr("class", "slice")
    .attr("d", arc)
    .attr("fill", d => color(d.data[0]))
    .attr("stroke", "white")
    .attr("stroke-width", 2);

  // LABELS — category names only
  g.selectAll("text.slice-label")
    .data(pie(categoryCounts))
    .enter()
    .append("text")
    .attr("class", "slice-label")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "600")
    .style("pointer-events", "none")
    .text(d => d.data[0]);

  // tooltip hover
  arcs.on("mousemove", (event, d) => {
    const count = d.data[1];
    const pct = ((d.data[1] / total) * 100).toFixed(1);
    tooltip.style("left", (event.pageX + 12) + "px")
      .style("top", (event.pageY + 12) + "px")
      .style("display", "block")
      .html(`<strong>${d.data[0]}</strong><br/>Count: ${count}<br/>${pct}%`);
  });

  arcs.on("mouseout", () => tooltip.style("display", "none"));

  // CSS
  d3.select("head").append("style").text(`
      .pie-tooltip { box-shadow: 0 2px 6px rgba(0,0,0,0.25); }
    `);
});
