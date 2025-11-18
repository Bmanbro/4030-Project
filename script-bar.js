d3.csv('data.csv').then(dataset => {

  const width = 500
  const height = 500
  const margin = { top: 40, right: 30, bottom: 70, left: 70 } // more bottom margin for label

  // Aggregate orders by city
  const cityCounts = d3.rollups(dataset, v => v.length, d => d.city)

  const svg = d3.select("#bar")
    .attr("width", width)
    .attr("height", height)

  const xScale = d3.scaleBand()
    .domain(cityCounts.map(d => d[0]))
    .range([margin.left, width - margin.right])
    .padding(0.2)

  // Custom Y-axis range for emphasis
  const yScale = d3.scaleLinear()
    .domain([1120, 1270])
    .range([height - margin.bottom, margin.top])

  // Color scale for cities
  const cities = cityCounts.map(d => d[0])
  const cityColor = d3.scaleOrdinal()
    .domain(cities)
    .range(d3.schemeCategory10)

  // Axes
  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale))

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale))

  // Axis labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 20)
    .attr("text-anchor", "middle")
    .text("City")

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .text("Total Orders")

  // Bars
  svg.selectAll("rect")
    .data(cityCounts)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d[0]))
    .attr("y", d => yScale(d[1]))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - margin.bottom - yScale(d[1]))
    .attr("fill", d => cityColor(d[0]))
    .style("cursor", "pointer")
    .on("click", (event, d) => {
      window.filterScatter(d[0], cityColor(d[0]))
    })

})
