// Defines the routes and params name that will be passed in req.params
// routes tell Koop what controller method should handle what request route
var routes = {
	'get /FDA.:format': 'exportFile',
  'get /FDA': 'getRecalls',
  'get /FDA/drop': 'drop',
  'get /FDA/FeatureServer': 'featureserver',
  'get /FDA/FeatureServer/:layer': 'featureserver',
  'get /FDA/FeatureServer/:layer/:method': 'featureserver'
}

module.exports = routes
