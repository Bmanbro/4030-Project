d3.csv('data.csv').then(dataset => {

  const width = 1700;
  const height = 320;
  const margin = { top: 40, right: 30, bottom: 70, left: 85 };

  const svg = d3.select("#bar")
    .attr("width", width)
    .attr("height", height);

  const restaurants = Array.from(new Set(dataset.map(d => d.restaurant_name)));
  const cities = Array.from(new Set(dataset.map(d => d.city)));

  // the nested data is: [{city: "CityName", Restaurant1: count, Restaurant2: count, ...}, ...]
  const cityData = cities.map(city => {
    const cityOrders = dataset.filter(d => d.city === city);
    const obj = { city };
    restaurants.forEach(r => {
      obj[r] = cityOrders.filter(d => d.restaurant_name === r).length;
    });
    return obj;
  });

  const yScale = d3.scaleBand()
    .domain(cities)
    .range([height - margin.bottom, margin.top])
    .padding(0.2);

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(cityData, d => d3.sum(restaurants, r => d[r]))])
    .range([margin.left, width - margin.right]);

  const colorScale = d3.scaleOrdinal()
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
    .attr("font-size", "16px")
    .attr("text-anchor", "middle")
    .text("Total Orders");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("font-size", "16px")
    .attr("text-anchor", "middle")
    .text("City");

  const stackGen = d3.stack()
    .keys(restaurants);

  const stackedData = stackGen(cityData);

  svg.selectAll("g.stacks")
    .data(stackedData)
    .enter()
    .append("g")
    .attr("fill", d => colorScale(d.key))
    .on("click", (event, layer) => {
      const restaurant = layer.key;
      console.log("CLICKED RESTAURANT TYPE:", restaurant);

      if (window.filterScatterRestaurant) {
        filterScatterRestaurant(restaurant);
      }

      if (window.highlightRestaurantOnMap) {
        highlightRestaurantOnMap(restaurant);
      }

      bars.classed("bar-selected", d => d.key === activeRestaurant)
        .classed("bar-unselected", d => activeRestaurant && d.key !== activeRestaurant);
    })
    .selectAll("rect")
    .data(d => d)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d[0]))
    .attr("width", d => xScale(d[1]) - xScale(d[0]))
    .attr("y", d => yScale(d.data.city))
    .attr("height", yScale.bandwidth())
    .style("cursor", "pointer");

  const cityIndex = 4;
  // this is the last index, of Islamabad, which will end up
  // at the top of the chart.

  // Find the top stack for that city
  stackedData.forEach(layer => {
    const d = layer[cityIndex];
    if (d) {
      svg.append("text")
        .text(layer.key)
        .attr("x", xScale(d[0]) + 6)
        .attr("y", yScale(d.data.city) - 6)
        .attr("text-anchor", "left")
        .attr("font-size", "16px")
        .attr("font-weight", "600")
        .attr("fill", colorScale(layer.key));
    }
  });

});
