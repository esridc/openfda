var App = function(){
  var self = this;
    
  $( document ).ajaxStart(function() {
    NProgress.start();
  });

  $( document ).ajaxStop(function() {
    NProgress.done();
  });

  this.states = this._getStates();
  this.stateGeoms = this._getStateGeoms();
  //sourceCountry=USA
  this.geocodeService = new L.esri.Geocoding.Services.Geocoding();

  //setup map and states 
  this.createMap();
  this.addStatesLayer();
  this.constructUI();
  this._wire();

  //initial page load aggregation call 
  recalls.count({type: 'state'}, function(data) {
    self.enforcementCountByState(data.results);
    //self.showList(data, 'Recall Enforcement Count by State', 'count');
    self.createHomeChart(data.results, 'Recall Enforcement Count by State');
  });

};

/*
* 
* create map, add features
*
*/
App.prototype.createMap = function() {
  var self = this;

  this.map = L.map('map').setView([38.891, -80.94], 4);

  L.esri.basemapLayer("Gray").addTo(this.map);
  
  var searchControl = new L.esri.Geocoding.Controls.Geosearch({'useMapBounds': true, 'zoomToResult': false}).addTo(this.map);

  searchControl.on('results', function(data){
    var state = data.results[0].properties.Region;

    _.each(self.states, function(st, abbr) {
      if ( st === state ) {
        state = abbr;
      }
    });

    $('.detail-list').empty();

    self._clearLayers();
    self.selectedStateAbbr = state;
    self._stateSelected = true;
    //self.selectedState = e;
    //self.selectState();

    self.statesLayer.eachFeature(function(f) {
      if ( f.feature.properties.STATE_ABBR === state ) {
        self.selectedState = f;
        self.selectState();
      }
    });

    self._find({ text: state });

  });
}


/*
*
* Add generic states layer for joins 
*
*/
App.prototype.addStatesLayer = function() {
  this.statesLayer = L.esri.featureLayer('http://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_States_Generalized/FeatureServer/0', {
    style: function (feature) {
      //console.log('feature', feature);
      return {color: '#7fbbdf', stroke: '#FFF', weight: 1 };
    }
  }).addTo(this.map);
}



App.prototype.addKoopLayer = function() {
  var i = 0;
  this.koopLayer = L.esri.featureLayer('http://services.arcgis.com/bkrWlSKcjUDFDtgw/arcgis/rest/services/FDA_Food_Recall_Enforcement/FeatureServer/0', {
    style: function (feature) {
      i++;
      if ( i < 5 ) {
        console.log('feature', feature);
      }
      return {fillColor: '#000', color: '#FFF', weight: 1 };
    }
  }).addTo(this.map);
}



App.prototype.constructUI = function() {

  var el = '<div id="search-helper" class="leaflet-bar">Or select location on map</div>'

  $('.geocoder-control input').attr('placeholder', 'Search for places or addresses');
  $('.geocoder-control').addClass('geocoder-control-expanded').append(el);

  //sizing
  var height = $(window).height();
  //$('#list-container').css({'height': height - });

}



App.prototype.selectState = function() {

  $('#legend').hide();

  this.statesLayer.setStyle(function(feature) {
    //return {color: '#337ab7', stroke: '#FFF', weight: 1, fillOpacity: 0.3}; 
    return {fillColor: '#FFF', color: '#CCC', weight: 1, fillOpacity: 0.3}; 
  });

  if ( this.selectedState ) {
    var layer = (this.selectedState.layer) ? this.selectedState.layer : this.selectedState;
    
    layer.setStyle({
        weight: 1,
        fillColor: '#1a3d88',
        dashArray: '',
        fillOpacity: 0.3
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

  }

}



/*
*
* Create initial map view "Envorcement Counts by State"
*
*/
App.prototype.enforcementCountByState = function(data) {
  //console.log('data', data);
  var keys = _.keys(this.states);
  var counts = {};
  
  _.each(data, function(result) {
    if ( _.contains(keys, result.term.toUpperCase() ) ) {
      counts[result.term.toUpperCase()] = result.count;
    }
  });

  function getColor(d) {
    return d > 1000 ? '#084594' :
           d > 500  ? '#2171b5' :
           d > 200  ? '#4292c6' :
           d > 100  ? '#6baed6' :
           d > 50   ? '#9ecae1' :
           d > 20   ? '#c6dbef' :
           d > 10   ? '#deebf7' :
                      '#f7fbff';
  }

  this.statesLayer.setStyle(function(feature) {
    var cnt = counts[feature.properties.STATE_ABBR];
    return {fillColor: getColor(cnt), color: '#EEE', weight: 0.9, fillOpacity: 0.5 }; 
  });

  $('#legend-title').html('Recall Enforcement Count by State');
  $('#legend-item-1').css({'background': '#084594'});
  $('#legend-item-2').css({'background': '#4292c6'});
  $('#legend-item-3').css({'background': '#6baed6'});
  $('#legend-item-4').css({'background': '#c6dbef'});
  $('#legend-item-5').css({'background': '#deebf7'});
  $('#legend-item-6').css({'background': '#f7fbff'});
  $('#legend-min').html('<10');
  $('#legend-max').html('>1,000');
  
  this.enforceData = data;
}

/****************** UI functions *************/

/*
*
*
*/ 
App.prototype.showList = function(data, title, type) {
  var self = this;
  console.log('data', data);
  this.data = data;

  //$('#list-container').show();
  $('#list').empty();
  $('.detail-list').empty();
  $('#list-header').html(title);
  $('#detail-item').empty().hide();

  if ( type === 'count' ) {
    $('#list').show();
    $('#detail-tabs').hide();
    _.each(data, function(result) {
      var el = '<li class="list-element">'+self.states[result.term.toUpperCase()]+': '+result.count.toLocaleString()+'</li>';
      $('#list').append(el);
    });
  } else if ( type === 'recalls' ) {
    
    $('#list').hide();
    $('#detail-tabs').show();
    $('#list-container').show();

    _.each(data, function(result) {
      //console.log('result', result);
      var states = result.distribution_pattern; //.replace(/[\n\r]+/g, '');
      states = states.split(/[ ,\n]+/);
      var statesLength = [result.state];
      _.each( states, function(st) {
        if ( self.states[st] ) {
          statesLength.push(st);
        }
      });
      statesLength = statesLength.length; 

      if ( _.contains(states, 'nationwide') || _.contains(states, 'Nationwide') ) {
        statesLength = 50;
      }

      var el = '<li class="list-element animated slideInRight">\
          <div class="recalling-firm">'+result.recalling_firm +'</div>\
          <div class="detail-text caps">'+moment(result.recall_initiation_date, "YYYYMMDD").format('MMMM DD, YYYY')+' – <span class="caps '+result.status.toLowerCase()+'">'+result.status+'</span></div>\
          <div><span class="list-title">Recalled Product Source</span>: '+self.states[result.state] +'</div>\
          <div><span class="list-title">Number of States Impacted</span>: '+statesLength+'</div>\
          <div class="recall-item-description"><span class="recall-item-description-title">Description</span>: '+result.product_description +'</div>\
          <div class="show-details" id="'+result.recall_number+'"><i class="glyphicon glyphicon-search"></i> Show Details</div>\
        </li>';

      if ( result.classification === "Class I" ) {
        $('#danger-list').append(el);
      } else if ( result.classification === "Class II" ) {
        $('#slight-list').append(el);
      } else if ( result.classification === "Class III" ) {
        $('#unlikely-list').append(el);
      }
    });

    $('.list-element').on('mouseenter', function(e) {
      $('.list-element').removeClass('selected');
      $(this).addClass('selected');

      var id = $(this).children('.show-details').attr('id');
      self._drawArcs(id);
    });

    $('.show-details').on('click', function(e) {
      var id = e.target.id;
      self.showDetails(id, title);
    });

  }
}



App.prototype.showDetails = function(id, title) {
  var self = this;

  _.each(this.data, function(result) {
    if ( result.recall_number === id ) {
      $('#detail-tabs').hide();
      $('#detail-item').empty().show();

      $('#list-header').html('<span class="glyphicon glyphicon-chevron-left" id="back"></span> '+ result.recalling_firm);

      var html = '<div>\
          <div class="detail-section">\
            <div class="detail-title">Reason for Recall</div>\
            <div class="detail-text">'+result.reason_for_recall+'</div>\
          </div>\
          <div class="detail-section">\
            <div class="detail-title">Product Description</div>\
            <div class="detail-text">'+result.product_description+'</div>\
          </div>\
          <div class="detail-section">\
            <div class="col-md-6">\
              <div class="detail-title">Initiation Date</div>\
              <div class="detail-text">'+moment(result.recall_initiation_date, "YYYYMMDD").format('MMMM DD, YYYY')+'</div>\
            </div>\
            <div class="col-md-6">\
              <div class="detail-title">Report Date</div>\
              <div class="detail-text">'+moment(result.report_date, "YYYYMMDD").format('MMMM DD, YYYY')+'</div>\
            </div>\
          </div>\
          <div class="detail-section">\
            <div class="col-md-6">\
              <div class="detail-title">Recall Number</div>\
              <div class="detail-text">'+result.recall_number+'</div>\
            </div>\
            <div class="col-md-6">\
              <div class="detail-title">Status</div>\
              <div class="detail-text">'+result.status+'</div>\
            </div>\
          </div>\
          <div class="detail-section">\
            <div class="col-md-6">\
              <div class="detail-title">Classification</div>\
              <div class="detail-text">'+result.classification+'</div>\
            </div>\
            <div class="col-md-6">\
              <div class="detail-title">Initiated by</div>\
              <div class="detail-text">'+result.recalling_firm+'</div>\
            </div>\
          </div>\
          <div class="detail-section">\
            <div class="detail-title">Quantity</div>\
            <div class="detail-text">'+result.product_quantity+'</div>\
          </div>\
          <div class="detail-section">\
            <div class="detail-title">Distribution Pattern</div>\
            <div class="detail-text">'+result.distribution_pattern+'</div>\
          </div>\
        </div>'

      $('#detail-item').append(html);
    }
  });

  $('#list-header').on('click', function() {
    self.showList(self.data, title, 'recalls');
  });

}



App.prototype.createHomeChart = function(data, title) {
  var self = this;
  this.data = data;

  $('#list').show();
  $('#detail-tabs').hide();
  $('#list').empty();
  $('.detail-list').empty();
  $('#list-header').html(title);
  $('#detail-item').empty().hide();

  var el = '<div id="home-chart"></div>';
  $('#list').append(el);

  var obj = {};
  obj.features = [];
  obj.fields = [
    {
      'name': 'state',
      'type': 'esriFieldTypeString',
      'alias': 'state'
    },
    {
      'name': 'count',
      'type': 'esriFieldTypeString',
      'alias': 'count'
    }
  ]

  _.each(data, function(st) {
    var feature = { 
      attributes: {
        'state': st.term,
        'count': st.count
      }
    }

    if ( st.term.toUpperCase() !== 'BC' && st.term.toUpperCase() !== 'PQ' && st.term.toUpperCase() !== 'ON' && st.term.toUpperCase() !== 'PR' ) {
      obj.features.push(feature);
    }
  });


  var chart = new Cedar({"type": "bar-horizontal"});

  var dataset = {
    "data": obj,
    "mappings":{
      "x": {"field":"count","label":"count"},
      "y": {"field":"state","label":"state"}
    }
  };
  //assign to the chart
  chart.dataset = dataset;
  
  // fix placement of axes labels
  chart.override = {
    "height": 440,
    "axes": [
      { 
        "titleOffset": 0,
        "title": "",
        "properties": {
          "labels": { "fontSize": {"value": 9} }
        }
      },
      { 
        "titleOffset": 40,
        "title": "",
        "properties": {
          "labels": { "fontSize": {"value": 9} }
        }
      }
    ],
    "marks": [
      {"properties": 
        {
          "hover": {"fill": {"value": "#4292c6"}},
          "update": {"fill": {"value": "#2171b5"}, "opacity": {"value": 0.5}}
        }
      }
    ]
  };

  //show the chart
  chart.show({
    elementId: "#home-chart"
  });

  chart.on('click', function(e, d) {
    var selected = d.state.toUpperCase();

    $('.detail-list').empty();

    self._clearLayers();
    self.selectedStateAbbr = selected;
    self._stateSelected = true;
    
    self.statesLayer.eachFeature(function(f) {
      if ( f.feature.properties.STATE_ABBR === selected ) {
        self.selectedState = f;
        self.selectState();
      }
    });

    self._find({ text: selected });
  });

}



/****************************************/

/****************************************/


App.prototype._wire = function() {
  var self = this;

  $('.geocoder-control input').on('blur', function() {
    $(this).attr('placeholder', 'Search for places or addresses');
    $('.geocoder-control').addClass('geocoder-control-expanded');
  });

  //reverse geocoding
  this.map.on('click', function(e) {
    self.geocodeService.reverse().latlng(e.latlng).run(function(error, result) {
      if ( result ) {
        L.marker(result.latlng).addTo(self.map).bindPopup(result.address.Match_addr).openPopup();
      }
    });
  });

  this.statesLayer.on('click', function(e) {
    $('.detail-list').empty();

    var state = e.layer.feature.properties.STATE_ABBR;
    self._find({ text: state });

    self._clearLayers();
    self.selectedStateAbbr = state;
    self._stateSelected = true;
    self.selectedState = e;
    self.selectState();

  });

  this.statesLayer.on('mouseover', function(e) {
    //console.log('hover', e);
    var layer = e.layer;
    
    layer.setStyle({
        weight: 1,
        dashArray: '',
        fillColor: "#999",
        fillOpacity: 0.3
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
  });

  this.statesLayer.on('mouseout', function(e) {
    if ( !self._stateSelected ) {
      self.enforcementCountByState(self.enforceData);
    } else {
      self.selectState();
    }
  });

  $('#close-list').on('click', function() {
    $('#list-container').hide();
  });

}


App.prototype._clearLayers = function() {
  
  if ( this.arcsLayer ) {
    this.arcsLayer.clearLayers();
  }

  if ( this.endLayer ) {
    this.map.removeLayer(this.endLayer);
  }

  if ( this.sourceLayer ) {
    this.map.removeLayer(this.sourceLayer);
  }

}


App.prototype._drawArcs = function (id) {
  var self = this;

  if ( ! this.arcsLayer ) {
    this.arcsLayer = L.geoJson().addTo( this.map );
  }

  self.arcsLayer.clearLayers();
  self._clearLayers();

  var latlngs = [];
  _.each(this.data, function(result) {
    if ( result.recall_number === id ) {
      //console.log('recall distribution_pattern', result.distribution_pattern);
      var states = result.distribution_pattern; //.replace(/[\n\r]+/g, '');
      states = states.split(/[ ,\n]+/);
      
      //console.log('states', states);
      if ( _.contains(states, 'nationwide') || _.contains(states, 'Nationwide') ) {
        states = ['AK','AL','AR','AS','AZ','CA','CO','CT','DC','DE','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY']
      }
      
      _.each(states, function(st) {
        st = _.trim(st.toUpperCase());
        
        //console.log('selectedStateAbbr', self.selectedStateAbbr);
        if ( self.stateGeoms[st] !== undefined  && st !== result.state ) {
          
          var start = { x: self.stateGeoms[result.state].longitude, y: self.stateGeoms[result.state].latitude };
          var end = { x: self.stateGeoms[st].longitude, y: self.stateGeoms[st].latitude };
          //console.log('start', start, 'end', end);
          latlngs.push(end);

          var generator = new arc.GreatCircle(start, end, {'name': 'Seattle to DC'});

          var line = generator.Arc(100,{offset:10});
          line = line.json();

          self.arcsLayer.addData(line);
          self.arcsLayer.setStyle({color: '#000', opacity: 1, weight: 0.5});
        }
      });

      if ( latlngs.length > 0 ) {
        var features = [];
        _.each(latlngs, function(loc) {
          
          var end = {
            "type": "Feature",
            "properties": {},
            "geometry": {
              "type": "Point",
              "coordinates": [loc.x, loc.y]
            }
          };

          features.push(end);
        });

        var geojsonMarkerOptions = {
          radius: 2,
          fillColor: "#0079c1",
          color: "#FFF",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        };

        self.endLayer = L.geoJson(features, {
          pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
          }
        }).addTo(self.map);
      }

      var source = {
        "type": "Feature",
        "properties": {
          "name": result.recalling_firm,
          "state": result.state
        },
        "geometry": {
          "type": "Point",
          "coordinates": [self.stateGeoms[result.state].longitude, self.stateGeoms[result.state].latitude]
        }
      };

      function onEachFeature(feature, layer) {
        // does this feature have a property named popupContent?
        if (feature.properties) {
          layer.bindPopup('<b>Recalling firm: ' + feature.properties.name + '</b><br />' + result.product_quantity + '<br /><br />' + result.product_description );
        }
      }

      //self.arcsLayer.addData(source);
      self.sourceLayer = L.geoJson(source, {
          onEachFeature: onEachFeature
      }).addTo(self.map);

    }
  });

}



App.prototype._find = function(data) {
  var self = this;

  console.log('_find data: ', data);
  
  var options = {};
  options.location = data.text;
  options.api = 'food/enforcement.json';
  
  recalls.find(options, function(d) {
    var results = d.results;
    var meta = d.meta;
    console.log('find callback: ', results, 'meta', meta);
    self.showList(results, meta.results.total.toLocaleString() + " recalls found in " + self.states[data.text], 'recalls' );
  });
}



/*
*
* list of state names and abbrevations for joins 
*
*/
App.prototype._getStates = function() {
  return  {
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FM": "Federated States Of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
  }
};


App.prototype._getStateGeoms = function() {
  return {
    "AK": {
      "latitude":61.385,
      "longitude":-152.2683
    },
    "AL": {
      "latitude":32.799,
      "longitude":-86.8073
    },
    "AR": {
      "latitude":34.9513,
      "longitude":-92.3809
    },
    "AS": {
      "latitude":14.2417,
      "longitude":-170.7197
    },
    "AZ": {
      "latitude":33.7712,
      "longitude":-111.3877
    },
    "CA": {
      "latitude":36.17,
      "longitude":-119.7462
    },
    "CO": {
      "latitude":39.0646,
      "longitude":-105.3272
    },
    "CT": {
      "latitude":41.5834,
      "longitude":-72.7622
    },
    "DC": {
      "latitude":38.8964,
      "longitude":-77.0262
    },
    "DE": {
      "latitude":39.3498,
      "longitude":-75.5148
    },
    "FL": {
      "latitude":27.8333,
      "longitude":-81.717
    },
    "GA": {
      "latitude":32.9866,
      "longitude":-83.6487
    },
    "HI": {
      "latitude":21.1098,
      "longitude":-157.5311
    },
    "IA": {
      "latitude":42.0046,
      "longitude":-93.214
    },
    "ID": {
      "latitude":44.2394,
      "longitude":-114.5103
    },
    "IL": {
      "latitude":40.3363,
      "longitude":-89.0022
    },
    "IN": {
      "latitude":39.8647,
      "longitude":-86.2604
    },
    "KS": {
      "latitude":38.5111,
      "longitude":-96.8005
    },
    "KY": {
      "latitude":37.669,
      "longitude":-84.6514
    },
    "LA": {
      "latitude":31.1801,
      "longitude":-91.8749
    },
    "MA": {
      "latitude":42.2373,
      "longitude":-71.5314
    },
    "MD": {
      "latitude":39.0724,
      "longitude":-76.7902
    },
    "ME": {
      "latitude":44.6074,
      "longitude":-69.3977
    },
    "MI": {
      "latitude":43.3504,
      "longitude":-84.5603
    },
    "MN": {
      "latitude":45.7326,
      "longitude":-93.9196
    },
    "MO": {
      "latitude":38.4623,
      "longitude":-92.302
    },
    "MP": {
      "latitude":14.8058,
      "longitude":145.5505
    },
    "MS": {
      "latitude":32.7673,
      "longitude":-89.6812
    },
    "MT": {
      "latitude":46.9048,
      "longitude":-110.3261
    },
    "NC": {
      "latitude":35.6411,
      "longitude":-79.8431
    },
    "ND": {
      "latitude":47.5362,
      "longitude":-99.793
    },
    "NE": {
      "latitude":41.1289,
      "longitude":-98.2883
    },
    "NH": {
      "latitude":43.4108,
      "longitude":-71.5653
    },
    "NJ": {
      "latitude":40.314,
      "longitude":-74.5089
    },
    "NM": {
      "latitude":34.8375,
      "longitude":-106.2371
    },
    "NV": {
      "latitude":38.4199,
      "longitude":-117.1219
    },
    "NY": {
      "latitude":42.1497,
      "longitude":-74.9384
    },
    "OH": {
      "latitude":40.3736,
      "longitude":-82.7755
    },
    "OK": {
      "latitude":35.5376,
      "longitude":-96.9247
    },
    "OR": {
      "latitude":44.5672,
      "longitude":-122.1269
    },
    "PA": {
      "latitude":40.5773,
      "longitude":-77.264
    },
    "PR": {
      "latitude":18.2766,
      "longitude":-66.335
    },
    "RI": {
      "latitude":41.6772,
      "longitude":-71.5101
    },
    "SC": {
      "latitude":33.8191,
      "longitude":-80.9066
    },
    "SD": {
      "latitude":44.2853,
      "longitude":-99.4632
    },
    "TN": {
      "latitude":35.7449,
      "longitude":-86.7489
    },
    "TX": {
      "latitude":31.106,
      "longitude":-97.6475
    },
    "UT": {
      "latitude":40.1135,
      "longitude":-111.8535
    },
    "VA": {
      "latitude":37.768,
      "longitude":-78.2057
    },
    "VI": {
      "latitude":18.0001,
      "longitude":-64.8199
    },
    "VT": {
      "latitude":44.0407,
      "longitude":-72.7093
    },
    "WA": {
      "latitude":47.3917,
      "longitude":-121.5708
    },
    "WI": {
      "latitude":44.2563,
      "longitude":-89.6385
    },
    "WV": {
      "latitude":38.468,
      "longitude":-80.9696
    },
    "WY": {
      "latitude":42.7475,
      "longitude":-107.2085
    }
  }
}