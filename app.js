

const svg = d3.select('svg');
const path = svg.append('path');
const projection = d3.geoOrthographic();
const initialScale = projection.scale();
const geoPath = d3.geoPath().projection(projection);
const sensitivity = 58;
// adjust links to original data sources
const urls = {
  migration: 'https://gist.githubusercontent.com/robcrock/a30f589308f73f234f46986a21676e30/raw/d1a632ced68f1cf115a5ca9af8baafa6920da05d/data_slim.csv',
  world: 'https://raw.githubusercontent.com/d3/d3.github.com/master/world-110m.v1.json'
};

d3.csv(urls.migration, (error, data) => {

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

  const sortedData = data.sort(function (a, b) {
    return d3.descending(parseInt(a.event_id), parseInt(b.event_id));
  })

  // const singleEvent = sortedData.filter(function (d) {
  //   return d.animal_id === 'Steamhouse 2';
  // })

  var nestedData = d3.nest()
    .key(function (d) { return d.animal_id; })
    .entries(sortedData);


  nestedData.forEach(function (turkey) {

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

      movementObj.coordinates.push([movement.longitude, movement.latitude])

    })

    turkeyObj.geometry = movementObj;

    turkeyProperties.study_timezone = turkey.values[0].study_timezone;

    turkeyObj.properties = turkeyProperties;

    featureCollection.features.push(turkeyObj)

    // console.log(geoPath(featureCollection));

    // const land = topojson.feature(data, world.objects.land);
    const render = () => path
      .attr('d', geoPath(featureCollection))
      .attr('fill', 'none')
      .style('stroke', '#FF00FF');
    render();

    svg
      .call(d3.drag().on('drag', () => {
        const rotate = projection.rotate();
        const k = sensitivity / projection.scale();
        projection.rotate([
          rotate[0] + d3.event.dx * k,
          rotate[1] - d3.event.dy * k
        ])
        render();
      }))
      .call(d3.zoom().on('zoom', () => {
        projection.scale(initialScale * d3.event.transform.k);
        render();
      }));
  });
});