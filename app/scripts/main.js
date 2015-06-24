var App = function(){
  var self = this;
  
  this.states = this._getStates();

  //setup map and states 
  this.createMap();
  this.addStatesLayer();

  //initial page load aggregation call 
  recalls.count({type: 'state'}, function(data) {
    self.enforcementCountByState(data);
    self.showList(data, 'Recall Enforcement Count by State', 'count');
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
  L.esri.basemapLayer("GrayLabels").addTo(this.map);

  var searchControl = new L.esri.Geocoding.Controls.Geosearch().addTo(this.map);

  searchControl.on('results', function(data){
    self._find(data);
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
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
  }

  this.statesLayer.setStyle(function(feature) {
    var cnt = counts[feature.properties.STATE_ABBR];
    return {color: getColor(cnt), stroke: '#FFF', weight: 1 }; 
  });
}

/****************** UI functions *************/

/*
*
*
*/ 
App.prototype.showList = function(data, title, type) {
  var self = this;

  $('#list-container').show();
  $('#list').empty();
  $('#list-header').html(title);

  if ( type === 'count' ) {
    _.each(data, function(result) {
      var el = '<li class="list-element">'+self.states[result.term.toUpperCase()]+': '+result.count.toLocaleString()+'</li>';
      $('#list').append(el);
    });
  } else if ( type === 'recalls' ) {
    _.each(data, function(result) {
      var el = '<li class="list-element">\
          <div>State: '+result.state +'</div>\
          <div>'+result.reason_for_recall +'</div>\
        </li>';
      $('#list').append(el);
    });
  }
}



/****************************************/

/****************************************/



App.prototype._find = function(data) {
  var self = this;

  console.log('_find data: ', data);
  
  var options = {};
  options.location = data.text;
  options.api = 'food/enforcement.json';
  
  recalls.find(options, function(results) {
    //console.log('find callback: ', results);
    self.showList(results, "Recalls of distributions that include " + data.text, 'recalls' );
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