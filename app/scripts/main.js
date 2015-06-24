var App = function(){
  var self = this;
  
  this.states = this._getStates();
  this.geocodeService = new L.esri.Geocoding.Services.Geocoding();

  //setup map and states 
  this.createMap();
  this.addStatesLayer();
  this.constructUI();
  this._wire();

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



App.prototype.constructUI = function() {

  var el = '<div id="search-helper" class="leaflet-bar">Or select location on map</div>'

  $('.geocoder-control input').attr('placeholder', 'Search for places or addresses');
  $('.geocoder-control').addClass('geocoder-control-expanded').append(el);

  //sizing
  var height = $(window).height();
  //$('#list-container').css({'height': height - });

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

  $('#legend-title').html('Recall Enforcement Count by State');
  $('#legend-item-1').css({'background': '#800026'});
  $('#legend-item-2').css({'background': '#E31A1C'});
  $('#legend-item-3').css({'background': '#FC4E2A'});
  $('#legend-item-4').css({'background': '#FD8D3C'});
  $('#legend-item-5').css({'background': '#FEB24C'});
  $('#legend-item-6').css({'background': '#FFEDA0'});
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
      console.log('result', result);

      var el = '<li class="list-element">\
          <div class="recalling-firm">'+result.recalling_firm +'</div>\
          <div>Source State: '+self.states[result.state] +'</div>\
          <div class="recall-reason">'+result.reason_for_recall +'</div>\
          <div class="recall-number"><span class="recall-number-title">Item Number</span>: '+result.recall_number +'</div>\
          <div class="recall-item-description"><span class="recall-item-description-title">Item Description</span>: '+result.product_description +'</div>\
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

      $('#list-header').html('<span class="glyphicon glyphicon-arrow-left" id="back"></span> '+ result.recalling_firm);

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
              <div class="detail-text">'+result.recall_initiation_date+'</div>\
            </div>\
            <div class="col-md-6">\
              <div class="detail-title">Report Date</div>\
              <div class="detail-text">'+result.report_date+'</div>\
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
      L.marker(result.latlng).addTo(self.map).bindPopup(result.address.Match_addr).openPopup();
    });
  });

  this.statesLayer.on('click', function(e) {
    var state = e.layer.feature.properties.STATE_ABBR;
    self._find({ text: state });
  });

  this.statesLayer.on('mouseover', function(e) {
    console.log('hover', e);
    var layer = e.layer;
    
    layer.setStyle({
        weight: 1,
        color: '#FFF',
        dashArray: '',
        fillOpacity: 0.3
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
  });

  this.statesLayer.on('mouseout', function(e) {
    self.enforcementCountByState(self.enforceData);
  });

  $('#close-list').on('click', function() {
    $('#list-container').hide();
  });

}


App.prototype._find = function(data) {
  var self = this;

  console.log('_find data: ', data);
  
  var options = {};
  options.location = data.text;
  options.api = 'food/enforcement.json';
  
  recalls.find(options, function(results) {
    //console.log('find callback: ', results);
    self.showList(results, "Recalls in " + self.states[data.text], 'recalls' );
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