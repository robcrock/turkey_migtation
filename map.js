(function() {
  const margin = { top: 50, left: 50, right: 50, bottom: 50 },
    height = 540 - margin.top - margin.bottom,
    width = 700 - margin.left - margin.right;

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
    .defer(d3.csv, 'https://gist.githubusercontent.com/robcrock/a30f589308f73f234f46986a21676e30/raw/d1a632ced68f1cf115a5ca9af8baafa6920da05d/data_slim.csv')
    .await(ready);

  /*
    Create a new projection using Orthographic (geoOrthographic)
    and center it (translate)
    and zoom in a certain amount (scale)
  */
  const projection = d3.geoTwoPointEquidistant([-100, 25], [-70, 25])
    .translate( [width/2, height/2.65] )
    .scale(300);

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
    .attr("d", geoPath);

  function ready(error, world, migration) {

    /*
      topojson.feature converts
      our RAW geo data into USEABLE geo data
      always pass it data, then data.objects.___something___
      then get .features out of it
    */
    const land = topojson.feature(world, world.objects.ne_50m_land).features;
    const lakes = topojson.feature(world, world.objects.ne_50m_lakes).features;
    const rivers = topojson.feature(world, world.objects.ne_50m_rivers_lake_centerlines).features;
    
    /*
      Add a path for each country
      Shapes -> paths
    */
    svg.selectAll('.land')
      .data(land)
      .enter().append('path')
      .attr('class', 'land')
      .attr('d', geoPath);

    svg.selectAll('.lakes')
      .data(lakes)
      .enter().append('path')
      .attr('class', 'lakes')
      .attr('d', geoPath)
      .attr('fill', 'none');

    svg.selectAll('.rivers')
      .data(rivers)
      .enter().append('path')
      .attr('class', 'rivers')
      .attr('d', geoPath)
      .attr('fill', 'none');

    const featureCollection = {
      "type": "FeatureCollection",
      "features": [ /* append featuresObj */]
    };
    const featuresObj = {
      "type": "Feature",
      "geometry": { /* append geometryObj */ },
      "properties": { /* append propertiesObj */ }
    };
    const geometryObj = {
      "type": "LineString",
      "coordinates": [ /* longitutde */, /* latitude */]
    };
    const propertiesObj = {
      "study_timezone": ""
    };
    const singleTurkey = migration.filter(function (d) {
      return d.animal_id === 'Steamhouse 2';
    });
    const singleTurkeySorted = singleTurkey.sort(function (a, b) {
      return d3.descending(parseInt(a.event_id), parseInt(b.event_id));
    });
    const nestedTurkey = d3.nest()
      .key(function (d) { return d.animal_id; })
      .entries(singleTurkeySorted);

    nestedTurkey.forEach(function (turkey) {
      let turkeyObj = {
        "type": "Feature",
        "geometry": { /* append geometryObj */ },
        "properties": { /* append propertiesObj */ }
      };
      let movementObj = {
        "type": "LineString",
        "coordinates": []
      };
      let turkeyProperties = {
        "study_timezone": ""
      };

      turkey.values.forEach(function (movement) {
        movementObj.coordinates.push([+movement.longitude, +movement.latitude])
      })

      turkeyObj.geometry = movementObj;
      turkeyProperties.study_timezone = turkey.values[0].study_timezone;
      turkeyObj.properties = turkeyProperties;

      featureCollection.features.push(turkeyObj)

    });

    const route = svg.append('path')
      .attr('class', 'route')
      .attr('d', geoPath(featureCollection))
      .attr('fill', 'none');

    function transition(turkey, route) {
      var l = route.node().getTotalLength();
      turkey.transition()
        .duration(10000)
        .attrTween("transform", delta(route.node()));

    }

    function delta(path) {
      var l = path.getTotalLength();
      return function (i) {
        return function (t) {

          var p = path.getPointAtLength(t * l);
          // var x = p.x;
          // var y = p.y;
          // var r = 90 - Math.atan2(-y, x) * 180 / Math.PI;
          // var s = Math.min(Math.sin(Math.PI * t) * 0.7, 0.3);
          return `translate( ${p.x} , ${p.y} )`;
        }
      }
    }

    const turkey = svg.append("circle")
      .attr("class", "turkey")
      .attr('cx', '0')
      .attr('cy', '0')
      .attr('r', '10');
      // .attr("d", "M45.254,5.646c0.655,1.1,1.717,1.812,2.648,2.622  c-1.059-0.356-2.059-0.846-3.083-1.274c-0.087,0.059-0.238,0.176-0.325,0.235c1.074,1.079,1.745,2.503,2.964,3.433  c-0.126,0.213-0.24,0.416-0.377,0.618c1.505,1.069,2.633,2.538,3.742,3.984c1.286,1.645,3.108,2.823,4.221,4.626  c1.015,1.85,2.539,3.338,3.556,5.167c0.52,0.881,1.012,1.551,1.785,1.93c0.59,1.159,1.484,2.14,1.604,3.505  c-2.45,1.12-5.098,1.505-7.703,2.169c-1.803,0.494-3.775,0.427-5.489,1.239c0.798,0.552,1.773,0.486,2.677,0.207  c0.724,0.78,1.829,0.835,2.804,0.592c-0.01,0.188-0.02,0.376-0.039,0.573c0.634,0.063,1.27,0.105,1.905,0.147  c0.054,0.171,0.108,0.341,0.173,0.521c0.929,0.235,1.783,0.696,2.714,0.932c0.732,0.173,0.976,0.969,1.464,1.443  c1.012,0.877,1.639,2.122,2.003,3.405c0.067,0.317,0.407,0.429,0.66,0.577c0.179,0.615,0.346,1.241,0.63,1.819  c0.163-0.326,0.327-0.674,0.419-1.034c0.67-3.135,1.061-6.314,1.762-9.438c0.012-0.448,0.674-0.51,0.932-0.225  c1.145,1.136,2.875,1.243,4.181,2.114c0.484,0.339,0.959,0.686,1.477,0.974c4.794,1.998,8.914,5.28,13.777,7.136  c0.781,0.269,1.317,1.038,2.159,1.154c0.862,0.116,1.487,0.765,2.197,1.198c0.022-0.24,0.056-0.467,0.077-0.707  c0.609,0.563,1.174,1.21,1.94,1.551c-0.158-0.594-0.422-1.172-0.719-1.72c0.485,0.338,0.971,0.677,1.477,0.995  c-0.374-1.493-1.423-2.676-2.216-3.949c0.517,0.329,1.044,0.648,1.583,0.938c-0.464-1.373-1.595-2.361-2.504-3.431  c-2.036-2.32-4.382-4.341-6.615-6.482c-1.687-1.381-3.745-2.248-5.788-2.989c-1.72-0.735-3.429-1.479-5.078-2.378  c0.279-0.944,0.527-1.541,0.955-2.138c0.18,0.177,0.349,0.363,0.539,0.529c-0.058-0.526-0.248-1.11-0.816-1.254  c-1.421-0.845-3.138,0.448-4.501-0.51c-0.57-0.3-0.907-0.893-1.278-1.392c-1.055-1.476-2.076-3.002-2.904-4.622  c-1.088-1.864-2.462-3.647-4.36-4.758c-2.108-1.319-4.104-2.821-6.313-3.988c-1.905-0.985-3.584-2.335-5.419-3.462  c0.182,0.751,0.771,1.293,1.2,1.901C48.357,7.339,46.915,6.273,45.254,5.646z");

    transition(turkey, route);

  }
  
})()