var Recalls = function(options){
  var self = this;
  console.log('FDA API Wrapper');

  this.base_url = options.url || 'https://api.fda.gov/';
  this.api_key = options.api_key || 'J9fMuXQVgb0ftI7BPSEDGMT49c9yXdHxKPWRxaVN';
  this.api = 'food/enforcement.json';

  //"https://api.fda.gov/food/enforcement.json?api_key=J9fMuXQVgb0ftI7BPSEDGMT49c9yXdHxKPWRxaVN&count=state"
};


/*
* Count
* @param {object}  count options
* example: { type: 'state', api: 'food/enforcement.json' }
*
*/ 
Recalls.prototype.count = function(options, cb) {
  
  var api = options.api || this.api;
  var url = this.base_url + api + '?api_key=' + this.api_key + '&count=' + options.type;

  this.getData(url, {}, cb);

}


/*
* Find
*
*
*/
Recalls.prototype.find = function(options, cb) {
  console.log('find: ', options);

  var api = options.api || this.api;
  var url = this.base_url + api + '?limit=100&api_key=' + this.api_key;

  this.getData(url, {}, function(data) {

    var results = [];
    _.each(data, function(result) {
      var loc = _.trim(options.location.split(',')[1]);
      
      if ( result.state === loc ) {
        results.push(result);
      }

    });

    cb(results);
  });
}



Recalls.prototype.getData = function(url, params, callback) {
  console.log('url: ', url);

  params.type = 'GET';
  params.dataType = 'json';

  $.ajax(url, params)
    .done(function(data) {
      callback(data.results);
    })
    .error(function(err) {
      console.log('err', err);
    });

}