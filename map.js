(function() {
  const margin = { top: 50, left: 50, right: 50, bottom: 50 },
    height = 400 - margin.top - margin.bottom,
    width = 800 - margin.left - margin.right;

  const svg = d3.select('#map')
    .append('svg')
      .attr('height', height - margin.top + margin.bottom)
      .attr('width', width + margin.left + margin.right)
    .append('g')
      .attr('transform', `translate( ${margin.left} , ${margin.top} )`);

  /*
    Read in world.topojson
    Read in capiltals.csv
  */
  d3.queue()
    .defer(d3.json, 'data/world.json')
    .await(ready);

  /*
    Create a new projection using Orthographic (geoOrthographic)
    and center it (translate)
    and zoom in a certain amount (scale)
  */
  const projection = d3.geoOrthographic()
    .translate( [width/2, height/2] )
    .scale(200)
    .clipAngle(90 + 1e-6)
    .precision(.3)
    .rotate([-280, 0]);

  /*
    Create a path (geoPath)
    using the projection
  */
  const geoPath = d3.geoPath()
    .projection(projection);


  const graticule = d3.geoGraticule();

  svg.append("path")
    .datum({ type: "Sphere" })
    .attr("class", "sphere")
    .attr("d", geoPath);

  svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", geoPath)
    .style('fill', '#3399CC');

  function ready(error, data) {

    /*
      topojson.feature converts
      our RAW geo data into USEABLE geo data
      always pass it data, then data.objects.___something___
      then get .features out of it
    */
    const land = topojson.feature(data, data.objects.ne_50m_land).features;

    console.log(land);

    /*
      Add a path for each country
      Shapes -> paths
    */
    svg.selectAll('.land')
      .data(land)
      .enter().append('path')
      .attr('class', 'land')
      .attr('d', geoPath);

    /*
      Add the cities
      Get the x/y from the lat/long + projection
    */
  };

})()