var Recalls = function(options){
  var self = this;

  this.base_url = options.url || 'https://api.fda.gov/';
  this.api_key = options.api_key || 'J9fMuXQVgb0ftI7BPSEDGMT49c9yXdHxKPWRxaVN';
  this.api = 'food/enforcement.json';
  
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
  //console.log('find: ', options);

  var api = options.api || this.api;
  var url;

  if ( options.date ) {
    url = this.base_url + api + '?limit=100&api_key=' + this.api_key + '&search=distribution_pattern=' + options.location + '+AND+report_date:['+options.date[0]+'+TO+'+options.date[1]+']+AND+classification:"'+options.classification+'"';
  } else {
    url = this.base_url + api + '?limit=100&api_key=' + this.api_key + '&search=distribution_pattern=' + options.location + '+AND+classification:"'+options.classification+'"';
  }

  if ( options.status ) {
    url = url + '+AND+status:' + options.status;
  }

  if ( options.skip ) {
    url = url + '&skip=' + options.skip;
  }

  this.getData(url, {}, function(data) {
    cb(data);
  });
}



Recalls.prototype.getData = function(url, params, callback) {
  //console.log('url: ', url);

  params.type = 'GET';
  params.dataType = 'json';

  $.ajax(url, params)
    .done(function(data) {
      callback(data);
    })
    .error(function(err) {
      console.log('err', err);
      if ( err.status === 404 && err.responseJSON) {
        callback(err.responseJSON.error);
      }
    });

}