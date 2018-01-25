(function () {
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
    .translate([width / 2, height / 2.65])
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

    transition(turkey, route);

  }

})()