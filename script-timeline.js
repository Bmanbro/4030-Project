let allTimeLineData = null;


window.allTimelineData = [];

const parseDate = d3.timeParse("%m/%d/%Y");

d3.csv('data.csv').then(dataset => {
  allTimeLineData = dataset.map((d, i) => ({
    ...d,
    order_date: parseDate(d.order_date),
    signup_date: parseDate(d.signup_date),
    _seed: i
  }));

  drawTimeline(allTimeLineData);

  window.filterTimelineCity = () => {
    applyCombinedFiltersTimeline();
  };

  window.filterTimelineRestaurant = () => {
    applyCombinedFiltersTimeline();
  };
});

function applyCombinedFiltersTimeline() {
  let filtered = allTimeLineData.map(d => ({ ...d, _dim: false }));

  if (window.activeRestaurant || window.activeCity) {
    filtered = filtered.map(d => {
      const matchRestaurant = !window.activeRestaurant || d.restaurant_name === window.activeRestaurant;
      const matchCity = !window.activeCity || d.city === window.activeCity;
      return { ...d, _dim: !(matchRestaurant && matchCity) };
    });
  }

  renderTimeline(filtered);
}

function renderTimeline(data) {
  const width = 950;
  const height = 550;
  const margin = { top: 40, right: 20, bottom: 60, left: 90 };

  d3.select("#timeline").selectAll("*").remove();

  const svg = d3.select("#timeline")
    .attr("width", width)
    .attr("height", height);

  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.signup_date))
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.order_date))
    .range([height - margin.bottom, margin.top]);

  const restaurants = Array.from(new Set(data.map(d => d.restaurant_name)));
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
    .text("Signup Date");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .text("Order Date");

  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.signup_date))
    .attr("cy", d => yScale(d.order_date))
    .attr("r", 4)
    .attr("fill", d => restaurantColor(d.restaurant_name))
    .attr("opacity", d => d._dim ? 0.15 : 0.9)
    .append("title")
    .text(d => `Customer: ${d.customer_id}\nRestaurant: ${d.restaurant_name}\nSignup: ${d.signup_date.toLocaleDateString()}\nOrder: ${d.order_date.toLocaleDateString()}`);
}

window.drawTimeline = renderTimeline;
