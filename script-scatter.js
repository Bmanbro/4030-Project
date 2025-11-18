let allData;
let reducedData; // NEW → downsampled dataset

d3.csv('data.csv').then(dataset => {
  allData = dataset.map(d => ({
    ...d,
    order_frequency: +d.order_frequency,
    loyalty_points: +d.loyalty_points
  }));

  // ↓ NEW: Downsample entire dataset once globally
  reducedData = allData.filter(() => Math.random() < 0.25);

  drawScatter(reducedData);

  // Modified filter function
  window.filterScatter = (selectedCity, color) => {
    let filtered = reducedData.filter(d => d.city === selectedCity);

    // Prevent 0-point output on small datasets
    if (filtered.length === 0) {
      filtered = allData.filter(d => d.city === selectedCity);
    }

    drawScatter(filtered, color);
  };
});

function drawScatter(data, overrideColor = null) {
  const width = 600;
  const height = 600;
  const margin = { top: 40, right: 40, bottom: 70, left: 70 };

  d3.select("#scatter").selectAll("*").remove();

  const svg = d3.select("#scatter")
    .attr("width", width)
    .attr("height", height);

  const xScale = d3.scaleLinear()
    .domain(d3.extent(allData, d => d.order_frequency))
    .nice()
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(allData, d => d.loyalty_points))
    .range([height - margin.bottom, margin.top]);

  // Color scale
  const cities = Array.from(new Set(allData.map(d => d.city)));
  const cityColor = d3.scaleOrdinal()
    .domain(cities)
    .range(d3.schemeCategory10);

  // Axes
  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));

  // Axis labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 20)
    .attr("text-anchor", "middle")
    .text("Order Frequency");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .text("Loyalty Points");

  // Plot Points
  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.order_frequency))
    .attr("cy", d => yScale(d.loyalty_points))
    .attr("r", 6)
    .attr("fill", d => overrideColor ? overrideColor : cityColor(d.city))
    .attr("opacity", 0.8);
}
