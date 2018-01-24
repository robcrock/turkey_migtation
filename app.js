const gistURL = 'https://gist.githubusercontent.com/robcrock/a30f589308f73f234f46986a21676e30/raw/d1a632ced68f1cf115a5ca9af8baafa6920da05d/data_slim.csv';

d3.csv(gistURL, (error, data) => {

  const featureCollection = {
    "type": "FeatureCollection",
    "features": [ /* append featuresObj */ ]
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
    "study_timezone": "",
    // "timestamp": "",
    // "event_id": "",
    // "tag_id": "",
    // "animal_id": "",
    // "animal_comments": "",
    // "animal_life_stage": ""
  };

  const sortedData = data.sort(function(a, b) {
    return d3.descending(parseInt(a.event_id), parseInt(b.event_id));
  })

  const singleEvent = sortedData.filter(function(d) {
    return d.animal_id === 'Steamhouse 2';
  })

  var nestedData = d3.nest()
    .key(function (d) { return d.animal_id; })
    .entries(singleEvent);


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

      // capture lon/lat
      movementObj.coordinates.push([movement.longitude, movement.latitude])

    })

    turkeyObj.geometry = movementObj;

    turkeyProperties.study_timezone = turkey.values[0].study_timezone;

    turkeyObj.properties = turkeyProperties;

    featureCollection.features.push(turkeyObj)

  })

  console.log(JSON.stringify(featureCollection));

})

/****************************/
/* CODE FROM ONLINE EXAMPLE */
/****************************/