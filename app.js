// // adjust links to original data sources
// const urls = {
//   migration: 'https://goo.gl/pTRi1U',
//   world: 'https://raw.githubusercontent.com/d3/d3.github.com/master/world-110m.v1.json'
// };

// const svg = d3.select("svg");
// const plot = svg.append("g").attr("id", "plot");

// var width = +svg.attr("width");
// var height = +svg.attr("height");

// var radius = { min: 6, max: 12 };

// // placeholder for countries data once loaded
// var countries = null;

// // renders a globe
// // https://github.com/d3/d3-geo#geoOrthographic
// var projection = d3.geoOrthographic();

// // trigger map drawing
// d3.json(urls.world, drawMap);

// /*
//  * draw the continental united states
//  */
// function drawMap(error, map) {

//   const svg = d3.select('svg');
//   const path = svg.append('path');
//   const projection = d3.geoOrthographic();
//   const initialScale = projection.scale();
//   const geoPath = d3.geoPath().projection(projection);

//   // const land = topojson.feature(data, world.objects.land);
//   const render = () => path
//     .attr('d', geoPath(featureCollection))
//     .attr('fill', 'none')
//     .style('stroke', '#FF00FF');
//   render();

//   svg
//     .call(d3.drag().on('drag', () => {
//       const rotate = projection.rotate();
//       const k = sensitivity / projection.scale();
//       projection.rotate([
//         rotate[0] + d3.event.dx * k,
//         rotate[1] - d3.event.dy * k
//       ])
//       render();
//     }))
//     .call(d3.zoom().on('zoom', () => {
//       projection.scale(initialScale * d3.event.transform.k);
//       render();
//     }));

//   // size projection to fit continental united states
//   // https://github.com/topojson/topojson-client/blob/master/README.md#feature
//   countries = topojson.feature(map, map.objects.countries);
//   projection.fitSize([width, height], countries);

//   // draw base map with state borders
//   var base = plot.append("g").attr("id", "basemap");
//   var path = d3.geoPath(projection);

//   base.append("path")
//     .datum(countries)
//     .attr("class", "land")
//     .attr("d", path);

//   // trigger data drawing
//   d3.queue()
//     .defer(d3.csv, urls.migraion, typeMigration)
//     .await(filterData);
// }

// /*
//  * see airports.csv
//  * convert gps coordinates to number and init degree
//  */
// function typeAirport(d) {
//   d.longitude = +d.longitude;
//   d.latitude = +d.latitude;
//   d.degree = 0;
//   return d;
// }

// /**********/

// const gistURL = 'https://gist.githubusercontent.com/robcrock/a30f589308f73f234f46986a21676e30/raw/d1a632ced68f1cf115a5ca9af8baafa6920da05d/data_slim.csv';

// d3.csv(gistURL, (error, data) => {

//   const featureCollection = {
//     "type": "FeatureCollection",
//     "features": [ /* append featuresObj */ ]
//   };
//   const featuresObj = {
//     "type": "Feature",
//     "geometry": { /* append geometryObj */ },
//     "properties": { /* append propertiesObj */ }
//   };
//   const geometryObj = {
//     "type": "LineString",
//     "coordinates": [ /* longitutde */, /* latitude */]
//   };
//   const propertiesObj = {
//     "study_timezone": "",
//     // "timestamp": "",
//     // "event_id": "",
//     // "tag_id": "",
//     // "animal_id": "",
//     // "animal_comments": "",
//     // "animal_life_stage": ""
//   };

//   const sortedData = data.sort(function(a, b) {
//     return d3.descending(parseInt(a.event_id), parseInt(b.event_id));
//   })

//   const singleEvent = sortedData.filter(function(d) {
//     return d.animal_id === 'Steamhouse 2';
//   })

//   var nestedData = d3.nest()
//     .key(function (d) { return d.animal_id; })
//     .entries(singleEvent);


//   nestedData.forEach(function (turkey) {

//     let turkeyObj = {
//       "type": "Feature",
//       "geometry": { /* append geometryObj */ },
//       "properties": { /* append propertiesObj */ }
//     };
//     let movementObj = {
//       "type": "LineString",
//       "coordinates": []
//     };
//     let turkeyProperties = {
//       "study_timezone": ""
//     };

//     turkey.values.forEach(function (movement) {

//       // capture lon/lat
//       movementObj.coordinates.push([movement.longitude, movement.latitude])

//     })

//     turkeyObj.geometry = movementObj;

//     turkeyProperties.study_timezone = turkey.values[0].study_timezone;

//     turkeyObj.properties = turkeyProperties;

//     featureCollection.features.push(turkeyObj)

//   })

//   console.log(JSON.stringify(featureCollection));

// })

// /****************************/
// /* CODE FROM ONLINE EXAMPLE */
// /****************************/