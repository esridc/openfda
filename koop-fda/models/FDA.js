// used to send http requests
var request = require('request')
// used to manage control flow
var async = require('async')
// used to create hashes that fingerprints a given request
var turfMerge = require('turf-merge')
var states_dict = require('../lib/states.json')
var states_dict_inverted = require('../lib/states_inverted.json')
var states_geometries = require('../lib/states_geometry_simplified.json')

var FDA = function (koop) {
  var fda = koop.BaseModel(koop)
  var type = 'FDA'
  var key = 'food-recalls'

  fda.getRecalls = function (options, callback) {
    // check the cache for data with this type & id
    console.log(options)
    koop.Cache.get(type, key, options || {layer: 0}, function (err, entry) {
      if (err) {
        fda.search(key, function (err, geojson) {
          if (err) return callback(err)
          callback(null, [geojson])
        })
      } else {
        callback(null, entry)
      }
    })
  }

  fda.search = function (key, callback) {
    var url = 'https://api.fda.gov/food/enforcement.json?'
    url += 'api_key=' + koop.config.fda.key
    url += '&limit=1&search=report_date:[2014-04-01+TO+2015-12-31]'
    // get the first page and figure out the count
    fda.getPage(url, function (err, results) {
      if (err) return callback(err)
      fda.translate(results, function (err, geojson) {
        if (err) return callback(err)
        geojson.name = 'Food recalls'
        fda.insert(key, geojson, function (err, success) {
          if (err) return callback(err)
          callback(null, [{status: 'processing'}])
          fda.scrape(function (err, info) {
            if (err) koop.log.error(err)
            if (info) koop.log.info(info)
          })
        })
      })
    })
  }

  fda.insert = function (key, geojson, callback) {
    // take translated geojson and huck it into Koop
    koop.Cache.insert(type, key, geojson, 0, function (err, success) {
      if (err) {
        callback(err)
      } else {
        callback(null, success)
      }
    })
  }

  fda.insertPartial = function (key, geojson, callback) {
    koop.Cache.insertPartial(type, key, geojson, 0, function (err, success) {
      if (err) {
        callback(err)
      } else {
        callback(null, success)
      }
    })
  }

  fda.getPage = function (url, callback) {
    var options = {
      url: url,
      gzip: true
    }
    request.get(options, function (err, res, body) {
      if (err) return callback(err)
      var results
      try {
        results = JSON.parse(body)
      } catch (err) {
        callback(err)
      }
      callback(null, results)
    })
  }

  fda.scrape = function (callback) {
    // have to split the data into two groups because the API won't allow a skip parameter over 5000
    var groups = ['[2000-06-01+TO+2014-03-31]', '[2014-04-01+TO+2015-12-31]']
    var base = 'https://api.fda.gov/food/enforcement.json?'
    base += 'api_key=' + koop.config.fda.key
    var pages = []
    async.each(groups, function (group, callback) {
      var url = base + '&search=report_date:' + group
      fda.countResults(url, function (err, count) {
        if (err) return console.log(err)
        var reqPages = fda.buildPages(url, count)
        pages = pages.concat(reqPages)
        callback()
      })
    }, function (err) {
      if (err) console.log(err)
      fda.createQueue('food-recalls', pages, function (err, info) {
        callback(err, info)
      })
    })
  }

  fda.countResults = function (url, callback) {
    url += '&limit=0'
    var options = {
      gzip: true,
      url: url
    }
    request.get(options, function (err, res, body) {
      if (err) return callback(err)
      var count = JSON.parse(body).meta.results.total
      callback(null, count)
    })
  }

  fda.buildPages = function (base, count) {
    var pageCount = Math.ceil(count / 100)
    var i = 0
    var pages = []
    while (i < pageCount) {
      var url = base + '&skip=' + (i * 100) + '&limit=100'
      pages.push(url)
      i++
    }

    return pages
  }

  fda.createQueue = function (key, pages, callback) {
    var pageQueue = async.queue(function (page, cb) {
      fda.getPage(page, function (err, results) {
        if (err) return cb(err)
        fda.translate(results, function (err, geojson) {
          if (err) return cb(err)
          fda.insertPartial(key, geojson, function (err, success) {
            if (err) return cb(err)
            cb(null, 'Successfully scraped the FDA endpoint')
          })
        })
      })
    }, 4)

    pageQueue.drain = function () {
      callback(null, 'Finished paging: ' + key)
    }
    pageQueue.push(pages, function (err) {
      if (err) return callback(err)
      koop.log.info('Sucessfully processed a page of ' + key)
    })

    callback(null, 'Paging kicked off for ' + key)
  }

  fda.translate = function (response, callback) {
    // translate the fda API response into geojson
    // create the shell that will hold all the properties
    var geojson = {
      type: 'FeatureCollection',
      features: []
    }
    response.results.forEach(function (result) {
    // loop through each dataset returned from the API call and push it into the geojson shell
      // console.log(dataset)
      var feature = {
        type: 'Feature'
      }
      feature.properties = result
      feature.geometry = fda.buildGeometry(result)
      geojson.features.push(feature)
    })
    callback(null, geojson)
  }

  fda.buildGeometry = function (result) {
    var matchedStates = fda.matchStates(result.distribution_pattern)
    var geojson = {
      type: 'FeatureCollection',
      features: []
    }
    matchedStates.forEach(function (state) {
      var feature = {
        type: 'Feature'
      }
      feature.geometry = states_geometries[state]
      geojson.features.push(feature)
    })
    if (geojson.features.length > 0) {
      try {
        var merged = turfMerge(geojson)
        return merged.geometry
      } catch (e) {
        console.log(e)
        return null
      }
    } else {
      return null
    }
  }

  fda.matchStates = function (distribution) {
    var candidates = distribution.replace(/[,:&.;!]/g, '').split(' ')
    var states = []
    candidates.forEach(function (candidate) {
      var state = fda.normalizeState(candidate)
      if (state) states.push(state)
    })
    return states
  }

  fda.normalizeState = function (candidate) {
    // checks to see if the token from the distribution string is a US state
    // todo: normalize on caps
    if (states_dict[candidate]) {
      return states_dict[candidate]
    } else if (states_dict_inverted[candidate]) {
      return candidate
    } else {
      return null
    }
  }

  fda.exportToFormat = function (format, dir, key, geojson, options, callback) {
    koop.Exporter.exportToFormat(format, dir, key, geojson, options, callback)
  }

  fda.drop = function (callback) {
  // drops the item from the cache
    var dir = [type, key, 0].join(':')
    koop.Cache.remove(type, key, {}, function (err, res) {
      if (err) return callback(err)
      koop.files.removeDir('files/' + dir, function (err, res) {
        if (err) return callback(err)
        koop.files.removeDir('tiles/' + dir, function (err, res) {
          if (err) return callback(err)
          koop.files.removeDir('thumbs/' + dir, function (err, res) {
            if (err) return callback(err)
            callback(err, true)
          })
        })
      })
    })
  }

  fda.getCount = function (options, callback) {
    koop.Cache.getCount(type + ':' + key + ':' + 0, options, callback)
  }

  return fda

}

module.exports = FDA
