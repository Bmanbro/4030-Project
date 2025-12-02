d3.csv('data.csv').then(dataset => {

  const cityCoords = {
    "Peshawar": { lat: 34.0, lon: 71.52 },
    "Multan": { lat: 30.186, lon: 71.49 },
    "Lahore": { lat: 31.52, lon: 74.36 },
    "Karachi": { lat: 24.86, lon: 67.0 },
    "Islamabad": { lat: 33.7, lon: 73.036 }
  };

  const labelCoords = {
    "Peshawar": { lat: 34.75, lon: 70.5 },
    "Multan": { lat: 29.5, lon: 71.5 },
    "Lahore": { lat: 31.0, lon: 75.0 },
    "Karachi": { lat: 24.5, lon: 66.5 },
    "Islamabad": { lat: 34.25, lon: 74.5 }
  };

  const width = 600;
  const height = 550;
  const margins = 140;

  // plain list of cities, restaurants
  // (cities are already hardcoded obv)
  const cities = Object.keys(cityCoords);
  const restaurants = Array.from(new Set(dataset.map(d => d.restaurant_name)));

  const svg = d3.select('#geo')
    .attr('width', width)
    .attr('height', height);

  // bg layer for map
  const bgLayer = svg.append('g').attr('class', 'background');

  // fg layer
  const fgLayer = svg.append('g').attr('class', 'foreground');

  const cityFeatures = {
    type: "FeatureCollection",
    features: Object.entries(cityCoords).map(([city, pos]) => ({
      type: "Feature",
      properties: { city },
      geometry: {
        type: "Point",
        coordinates: [pos.lon, pos.lat]
      }
    }))
  };

  const projection = d3.geoMercator()
    .fitExtent(
    [ [margins + 64, margins-10], [width - margins, height - margins+20] ], // comfortable margins
    cityFeatures
  );

  // background underlay of pakistan
  const geoPath = d3.geoPath().projection(projection);

  // Use GeoJSON for Pakistan
  d3.json('PAK_adm0.json').then(geoData => {
    bgLayer.append('g')
      .selectAll('path')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('d', geoPath)
      .attr('fill', '#ffffff')
      .attr('stroke', '#999')
      .attr('stroke-width', 4);
  });

  // convert city lat-long to x,y
  Object.entries(cityCoords).forEach(([city, pos]) => {
    const [x, y] = projection([pos.lon, pos.lat]);
    cityCoords[city].x = x;
    cityCoords[city].y = y;
  });
  Object.entries(labelCoords).forEach(([city, pos]) => {
    const [x, y] = projection([pos.lon, pos.lat]);
    labelCoords[city].x = x;
    labelCoords[city].y = y;
  });

  //// color scale based on city
  //const cityColor = d3.scaleOrdinal()
  //  .domain(cities)
  //  .range(d3.schemeCategory10);

  // colors based on restaurant
  const restaurantColor = d3.scaleOrdinal()
    .domain(restaurants)
    .range(d3.schemeCategory10);

  // nodes per order
  // important, this assumes that all the dataset cities are in the
  // hardcoded list up there
  const orderNodes = dataset.map((d, i) => ({
    id: i,
    ...d,
    targetX: cityCoords[d.city].x,
    targetY: cityCoords[d.city].y
  }));

  // Precompute repulsive forces for other cities
  const otherCityForces = orderNodes.map(node => {
    const others = Object.entries(cityCoords)
      .filter(([city]) => city !== node.city)
      .map(([city, pos]) => ({ x: pos.x, y: pos.y }));
    return others;
  });

  // Map restaurants to a fixed directional angle (in degrees)
  const restaurantAngles = {};
  restaurants.forEach((r, i) => {
    restaurantAngles[r] = (i / restaurants.length) * 2 * Math.PI; // spread 0-360 degrees
  });

  const restaurantForce = 3.2;
  // forces
  const simulation = d3.forceSimulation(orderNodes)
    .force('x', d3.forceX(d => d.targetX).strength(0.2))
    .force('y', d3.forceY(d => d.targetY).strength(0.2))
    .force('collide', d3.forceCollide(1.9))
    .force('repulseCities', d3.forceManyBody()
      .strength(d => {
        // repel from other cities by adding negative force from each non-target city
        const idx = orderNodes.indexOf(d);
        const others = otherCityForces[idx];
        return -42 / others.length / others.length / others.length; // scale factor, adjust as needed
      }))
    .force('restaurantX', d3.forceX(d => d.x + Math.cos(restaurantAngles[d.restaurant_name])).strength(restaurantForce))
    .force('restaurantY', d3.forceY(d => d.y + Math.sin(restaurantAngles[d.restaurant_name])).strength(restaurantForce))
    .alphaDecay(0.01)
    .on('tick', ticked);

  // rendered points
  const dots = fgLayer.selectAll('circle.order')
    .data(orderNodes)
    .enter()
    .append('circle')
    .attr('class', 'order')
    .attr('r', 1.8)
    .attr('fill', d => restaurantColor(d.restaurant_name))
    .attr('opacity', 0.8);

  function ticked() {
    dots
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
    simulation
      .force('restaurantX', d3.forceX(d => d.x + Math.cos(restaurantAngles[d.restaurant_name])).strength(restaurantForce))
      .force('restaurantY', d3.forceY(d => d.y + Math.sin(restaurantAngles[d.restaurant_name])).strength(restaurantForce))
    
  }

  // city points
  const cityDots = fgLayer.selectAll('circle.cities')
    .data(cities)
    .enter()
    .append('circle')
    .attr('class', 'cities')
    .attr('cx', c => cityCoords[c].x)
    .attr('cy', c => cityCoords[c].y)
    .attr('r', 16)
    .attr('fill', d => "#222222")
    .attr('opacity', 0.4);

  // city labels
  fgLayer.selectAll('text.city-label')
    .data(cities)
    .enter()
    .append('text')
    .attr('class', 'city-label')
    .attr('x', c => labelCoords[c].x)
    .attr('y', c => labelCoords[c].y)
    .text(c => c)
    .style('font-size', '14px')
    .style('font-weight', '600')
    .style('text-anchor', 'middle')
    .style('cursor', 'pointer')
    .style('fill', '#222222')
    .style('stroke', '#eeeeee')
    .style('stroke-width', '3px')
    .style('paint-order', 'stroke');

});
