d3.csv('data.csv').then(dataset => {
    console.log(dataset);

    // Establishing dimensions for the scatterplot.
    const dimensions = {
        width: 1400,
        height: 800,
        margin: {
            vertical: 60,
            horizontal: 60
        }
    }

    // Converting the needed fields to numbers.
    dataset.forEach(d => {
        d.order_frequency = +d.order_frequency;
        d.loyalty_points = +d.loyalty_points;
    })

    // Targeting the right element, applying the dimensions.
    const svg = d3.select('#scatter')
                    .attr('width', dimensions.width)
                    .attr('height', dimensions.height)
                    .append('svg');

    // Setting up the scales needed for the scatterplot.
    const xScale = d3.scaleLinear()
                    .domain(d3.extent(dataset, d => d.order_frequency))
                    .nice()
                    .range([dimensions.margin.horizontal, dimensions.width - dimensions.margin.horizontal]);

    const yScale = d3.scaleLinear()
                    .domain(d3.extent(dataset, d => d.loyalty_points))
                    .range([dimensions.height - dimensions.margin.vertical, dimensions.margin.vertical]);

    const markColor = d3.scaleOrdinal()
                        .domain(['Active', 'Inactive'])
                        .range(['green', 'red']);

    // Setting up the axes and their labels!
    svg.append('g')
        .attr('transform', `translate(0, ${dimensions.height - dimensions.margin.vertical})`)
        .call(d3.axisBottom(xScale))
        .call(g => g.select('.domain')
                    .attr('stroke', 'black'))
        .call(g => g.selectAll('.tick line')
                    .attr('stroke', 'black'));
        
    svg.append('g')
        .attr('transform', `translate(${dimensions.margin.horizontal}, 0)`)
        .call(d3.axisLeft(yScale))
        .call(g => g.select('.domain')
                    .attr('stroke', 'black'))
        .call(g => g.selectAll('.tick line')
                    .attr('stroke', 'black'));

    svg.append('text')
        .attr('x', dimensions.width / 2)
        .attr('y', dimensions.height - 10)
        .attr('text-anchor', 'middle')
        .text('Order Frequency');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -dimensions.height / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .text('Loyalty Points');

    // Creating the marks on the scatterplot.
    svg.selectAll('circle')
        .data(dataset)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.order_frequency))
        .attr('cy', d => yScale(d.loyalty_points))
        .attr('r', 6)
        .attr('fill', d => markColor(d.churned))
        .attr('opacity', 0.8);
});