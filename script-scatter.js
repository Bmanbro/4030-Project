let allData;
let reducedData;

let activeRestaurant = null;
let activeCity = null;

window.allScatterData = reducedData;
window.drawScatter = drawScatter;

// Simple seeded random generator
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

d3.csv('data.csv').then(dataset => {
  allData = dataset.map((d, i) => ({
    ...d,
    order_frequency: +d.order_frequency,
    loyalty_points: +d.loyalty_points,
    _seed: i // unique seed per row
  }));

  reducedData = allData.filter(() => Math.random() < 1.0);

  drawScatter(reducedData);

  window.filterScatterCity = (selectedCity) => {
    if (activeCity === selectedCity) {
      activeCity = null;
    } else {
      activeCity = selectedCity;
    }
    applyCombinedFilters();
  };

  window.filterScatterRestaurant = (restaurant) => {
    if (activeRestaurant === restaurant) {
      activeRestaurant = null;
    } else {
      activeRestaurant = restaurant;
    }
    applyCombinedFilters();
  };
});


function applyCombinedFilters() {
  let filtered = allData;

  if (activeRestaurant) {
    filtered = filtered.filter(d => d.restaurant_name === activeRestaurant);
  }
  if (activeCity) {
    filtered = filtered.filter(d => d.city === activeCity);
  }

  drawScatter(filtered);
}

function drawScatter(data, overrideColor = null) {
  const width = 1000;
  const height = 550;
  const margin = { top: 30, right: 30, bottom: 60, left: 60 };

  d3.select("#scatter").selectAll("*").remove();

  const svg = d3.select("#scatter")
    .attr("width", width)
    .attr("height", height);

  const xScale = d3.scaleLinear()
    .domain(d3.extent(allData, d => d.loyalty_points))
    .nice()
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(allData, d => d.order_frequency))
    .nice()
    .range([height - margin.bottom, margin.top]);

  const restaurants = Array.from(new Set(allData.map(d => d.restaurant_name)));
  const restaurantColor = d3.scaleOrdinal()
    .domain(restaurants)
    .range(d3.schemeCategory10);

  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 20)
    .attr("text-anchor", "middle")
    .text("Loyalty Points");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .text("Order Frequency");

  // Add seeded random offset within bounding box
  const offsetScale = 8; 
  const nodes = data.map(d => {
    const offsetX = (seededRandom(d._seed + 1) - 0.5) * offsetScale;
    const offsetY = (seededRandom(d._seed + 2) - 0.5) * offsetScale;
    const x = Math.max(margin.left, Math.min(width - margin.right, xScale(d.loyalty_points) + offsetX));
    const y = Math.max(margin.top, Math.min(height - margin.bottom, yScale(d.order_frequency) + offsetY));
    return { ...d, x, y };
  });

  svg.selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("r", 4)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("fill", d => overrideColor ? overrideColor : restaurantColor(d.restaurant_name))
    .attr("opacity", 0.8);
}
