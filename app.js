$(document).ready(function () {
  $('select').material_select();

  (function() {
    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////// Margin convention
    ////////////////////////////////////////////////////////////////////////////////

    const margin = { top: 50, left: 50, right: 50, bottom: 50 },
      height = 700 - margin.top - margin.bottom,
      width = 600 - margin.left - margin.right;

    const svg = d3.select('#map')
      .append('svg')
      .attr('height', height - margin.top + margin.bottom)
      .attr('width', width + margin.left + margin.right)
      .append('g')
      .attr('transform', `translate( ${margin.left} , ${margin.top} )`);

    ////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////// Bring in raw data
    ////////////////////////////////////////////////////////////////////////////////

    const csvURL = 'https://gist.githubusercontent.com/robcrock/a30f589308f73f234f46986a21676e30/raw/d1a632ced68f1cf115a5ca9af8baafa6920da05d/data_slim.csv'

    d3.queue()
      .defer(d3.json, 'data/world.json')
      .defer(d3.csv, csvURL)
      .await(ready);

    function ready(error, world, data) {

      const land = topojson.feature(world, world.objects.ne_50m_land).features;
      const lakes = topojson.feature(world, world.objects.ne_50m_lakes).features;
      const rivers = topojson.feature(world, world.objects.ne_50m_rivers_lake_centerlines).features;

      const parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S");

      data.forEach(function (record) {
        record.time_integer = parseTime(record.timestamp).getTime();
      })

      ////////////////////////////////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////////// Nest and sort data
      ////////////////////////////////////////////////////////////////////////////////

      const migrationStartTimeOverall = d3.nest()
        .rollup(function (leaves) { return d3.min(leaves, d => d.time_integer) })
        .entries(data);
      const migrationEndTimeOverall = d3.nest()
        .rollup(function (leaves) { return d3.max(leaves, d => d.time_integer) })
        .entries(data);

      const timeScale = d3.scaleLinear()
        .domain([0, 1])
        .range([migrationStartTimeOverall, migrationStartTimeOverall]);

      let nested = d3.nest()
        .key(d => d.animal_id)
        .entries(data);

      nested = d3.nest()
        .key(d => d.animal_id)
        .rollup(function (leaves) {
          return {
            'events': leaves.length,
            'min_time': d3.min(leaves, d => d.time_integer),
            'max_time': d3.max(leaves, d => d.time_integer)
          }
        })
        .entries(data);

      nested = d3.nest()
        .key(d => d.animal_id)
        .sortValues((a, b) => a.time_integer - b.time_integer)
        .entries(data);

      ////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////// Create GeoJSON Feature Collection
      ////////////////////////////////////////////////////////////////////////////////

      const featureCollection = {
        "type": "FeatureCollection",
        "features": [ /* append featuresObj */]
      };

      nested.forEach(function (turkey) {

        let turkeyObj = {
          "type": "Feature",
          "geometry": { /* append migrationObj */ },
          "properties": { /* append turkeyProps */ }
        };
        let migrationObj = {
          "type": "LineString",
          "coordinates": []
        };
        let turkeyProps = {};

        turkey.values.forEach(function (migration) {
          migrationObj.coordinates.push([+migration.longitude, +migration.latitude])
        })

        turkeyObj.geometry = migrationObj;
        turkeyProps.animal_id = turkey.key;

        turkeyObj.properties = turkeyProps;

        featureCollection.features.push(turkeyObj)

      });

      console.log(featureCollection.features);

      ////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////// Set up geo projection
      ////////////////////////////////////////////////////////////////////////////////

      const projection = d3.geoOrthographic()
        .scale(250)
        .translate([width / 2, height / 3])
        .clipAngle(90 + 1e-6)
        .rotate([85, 0]);

      const geoPath = d3.geoPath()
        .projection(projection);

      const graticule = d3.geoGraticule();

      ////////////////////////////////////////////////////////////////////////////////
      //////////////////////////////////////////////////////// Bring element on screen
      ////////////////////////////////////////////////////////////////////////////////

      svg.append("path")
        .datum({ type: "Sphere" })
        .attr("class", "sphere")
        .attr("d", geoPath);

      svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", geoPath);

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

      const flightPaths = svg.selectAll('.route')
        .data(featureCollection.features)
        .enter().append('path')
        .attr('class', d => `route ${d.properties.animal_id.split(' ').join('').toLowerCase()}`)
        .attr('d', geoPath)
        .attr('fill', 'none');

      const turkeys = svg.selectAll('.turkey')
        .data(featureCollection.features)
        .enter().append('circle')
        .attr("class", function (d) {
          return `turkey ${d.properties.animal_id.split(' ').join('').toLowerCase()}`;
        })
        .attr('cx', function (d, i) {
          return projection(d.geometry.coordinates[i])[0];
        })
        .attr('cy', function (d, i) {
          return projection(d.geometry.coordinates[i])[1];
        })
        .attr('r', '3');

      const dropDownList = nested.map(function (d) {
        return d.key;
      });

      // populate drop-down
      d3.select("#dropdown")
        .selectAll("option")
        .data(dropDownList)
        .enter().append("option")
        .attr("value", d => d)
        .text(d => d);

      ////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////// Animate migration
      ////////////////////////////////////////////////////////////////////////////////

      $("#dropdown").change(function () {
        let selectedTurkey = $('#dropdown :selected').text();
        transition(`.${selectedTurkey.split(' ').join('').toLowerCase()}`)
      });

      function transition(turkeyName) {
        
        let turkey = turkeys.filter(turkeyName);
        let flightPath = flightPaths.filter(turkeyName);

        $('circle').removeClass('selected');

        turkey
          .transition()
          .attr('r', '5')
          .attr('class', 'turkey selected')
          .transition()
          .duration(10000)
          .attrTween("transform", delta(flightPath.node()))
          .transition()
          .attr('r', '3');
      }

      function delta(path) {

        let l = path.getTotalLength();
        let p0 = path.getPointAtLength(0)

        return function (i) {
          return function (t) {
            let p1 = path.getPointAtLength(t * l);
            let x = p1.x - p0.x;
            let y = p1.y - p0.y;
            return `translate( ${x} , ${y} )`;
          }
        }
      }
    };
  })();

});