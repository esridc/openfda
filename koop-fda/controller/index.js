var crypto = require('crypto')
var Path = require('path')

// a function that is given an instance of Koop at init
var Controller = function (FDA, BaseController) {
  var controller = BaseController()

  // drops the cache for an item
  controller.drop = function (req, res) {
    FDA.drop(function (error, itemJson) {
      if (error) {
        res.send(error, 500)
      } else {
        res.json(itemJson)
      }
    })
  }

  controller.findRecalls = function (req, res, callback) {
    FDA.getRecalls(req.query, function (error, itemJson) {
      if (error) return res.status(500).send(error)
      callback(itemJson)
    })
  }

  controller.getRecalls = function (req, res) {
    controller.findRecalls(req, res, function (recalls) {
      res.status(200).json(recalls[0])
    })
  }

  controller.exportFile = function (req, res) {
    console.log('yello')
    // change geojson to json
    var format = req.params.format.replace('geojson', 'json')
    delete req.params.format
    var dir = 'FDA'
    // build the file key as an MD5 hash that's a join on the params and look for the file
    var toHash = JSON.stringify(req.params) + JSON.stringify(req.query)
    var key = crypto.createHash('md5').update(toHash).digest('hex')
    var filePath
    if (format === 'zip') {
      filePath = ['files', dir, key].join('/')
    } else {
      filePath = ['files', dir].join('/')
    }
    var fileName = key + '.' + format
    console.log(filePath, fileName)
    FDA.files.exists(filePath, fileName, function (exists, path) {
      if (exists) {
        if (path.substr(0, 4) === 'http') {
          res.redirect(path)
        } else {
          res.sendFile(path)
        }
      } else {
        controller.findRecalls(req, res, function (recalls) {
          FDA.exportToFormat(format, dir, key, recalls[0], {rootDir: FDA.files.localDir}, function (err, file) {
            if (err) return res.status(500).send(err)
            res.status(200).sendFile(Path.resolve(process.cwd(), file.file))
          })
        })
      }
    })
  }

  // shared dispath for feature service responses
  controller.featureserver = function (req, res) {
    var callback = req.query.callback
    delete req.query.callback
    for (var k in req.body) {
      req.query[k] = req.body[k]
    }
    // if this is a count request then go straight to the db
    if (req.query.returnCountOnly) {
      controller.featureserviceCount(req, res)
    } else {
      // else send this down for further processing
      controller.featureservice(req, res, callback)
    }
  }

  controller.featureserviceCount = function (req, res) {
    // first check if the dataset is new, in the cache, or processing
    // ask for a single feature becasue we just want to know if the data is there
    req.query.limit = 1
    FDA.getRecalls(req.query, function (err, geojson) {
      if (err) {
        res.status(500).send(err)
      } else if (geojson[0] && geojson[0].status === 'processing') {
        res.status(202).json(geojson)
      } else {
        // it's not processing so send for the count
        FDA.getCount(req.query, function (err, count) {
          if (err) {
            console.log('Could not get feature count', req.params.item)
            res.status(500).send(err)
          } else {
            var response = {count: count}
            res.status(200).json(response)
          }
        })
      }
    })
  }

  controller.featureservice = function (req, res, callback) {
    var err
    req.query.limit = req.query.limit || req.query.resultRecordCount || 1000
    req.query.offset = req.query.resultOffset || null
    // Get the item
    FDA.getRecalls(req.query, function (error, geojson) {
      if (error) {
        res.status(500).send(error)
      } else if (geojson[0] && geojson[0].status === 'processing') {
        res.status(202).json(geojson)
      } else {
        // pass to the shared logic for FeatureService routing
        delete req.query.geometry
        delete req.query.where
        controller.processFeatureServer(req, res, err, geojson, callback)
      }
    })
  }

  return controller
}

module.exports = Controller
