var pjson = require('./package.json')

exports.name = 'FDA'
exports.hosts = false
exports.controller = require('./controller')
exports.routes = require('./routes')
exports.model = require('./models/FDA.js')
exports.status = { version: pjson.version }
