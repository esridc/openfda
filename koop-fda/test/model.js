/* global describe, it */

var should = require('should')

// fixtures
var states_geometries = require('../lib/states_geometry_simplified.json')
var single_recall = require('./fixtures/single_recall.json')
var count_response = require('./fixtures/count_response.json')
var one_page = require('./fixtures/one_page.json')
// request mocking
var nock = require('nock')
var requests = nock('https://api.fda.gov')

// method stubbing
var sinon = require('sinon')

// init koop with the local cache as a db for tests
var koop = require('koop/lib')
koop.config = {fda: {key: 'foobar'}}
var fda = require('../models/FDA.js')(koop)
koop.Cache = new koop.DataCache(koop)
koop.Cache.db = koop.LocalDB
koop.log = new koop.Logger({logfile: '/log/test_log'})

describe('FDA Model', function () {
  describe('fetching recalls', function () {
    it('should count results correctly', function (done) {
      requests.get('/count&limit=0').reply(200, count_response)
      fda.countResults('https://api.fda.gov/count', function (err, count) {
        should.not.exist(err)
        count.should.equal(6062)
      })
      done()
    })

    it('should build the right set of pages', function (done) {
      var pages = fda.buildPages('http://foobar.com?where=1=1', 101)
      pages[0].should.equal('http://foobar.com?where=1=1&skip=0&limit=100')
      pages[1].should.equal('http://foobar.com?where=1=1&skip=100&limit=100')
      done()
    })

    it('should be able to fetch a single page', function (done) {
      requests.get('/page.json').reply(200, one_page)
      fda.getPage('https://api.fda.gov/page.json', function (err, results) {
        should.not.exist(err)
        should.exist(results.meta)
        should.exist(results.results)
        done()
      })
    })
  })

  describe('integration tests', function () {
    it('should scrape the endpoint correctly', function (done) {
      sinon.stub(fda, 'countResults', function (url, callback) {
        callback(null, 100)
      })
      sinon.stub(fda, 'buildPages', function (base, count) {
        return ['https://api.fda.gov/page.json']
      })
      sinon.stub(fda, 'translate', function (response, callback) {
        callback(null, {})
      })
      sinon.stub(fda, 'insert', function (key, geojson, callback) {
        callback(null, true)
      })
      sinon.stub(fda, 'insertPartial', function (key, geojson, callback) {
        callback(null, true)
      })
      requests.get('/page.json').times(2).reply(200, one_page)
      fda.scrape(function (err, info) {
        should.not.exist(err)
        should.exist(info)
        fda.buildPages.restore()
        fda.countResults.restore()
        fda.insert.restore()
        fda.insertPartial.restore()
        fda.translate.restore()
        done()
      })
    })
  })

  describe('translating data to geojson', function () {
    it('should correctly parse states out of the distribution pattern', function (done) {
      fda.matchStates('CA, California, Texas, GA, FL, foobar; washetaaksdh').length.should.equal(5)
      done()
    })

    it('should correctly normalize an abbreviated state', function (done) {
      fda.normalizeState('CA').should.equal('California')
      done()
    })

    it('should correctly normalize a non abbreviated state', function (done) {
      fda.normalizeState('California').should.equal('California')
      done()
    })

    it('should add the expected geometry to a recall', function (done) {
      sinon.stub(fda, 'matchStates', function (distribution) {
        return ['Georgia']
      })
      var recall = {distribution_pattern: 'GA'}
      fda.buildGeometry(recall).coordinates.length.should.equal(states_geometries.Georgia.coordinates.length)
      fda.matchStates.restore()
      done()
    })

    it('should translate a single result as expected', function (done) {
      sinon.stub(fda, 'buildGeometry', function (result) {
        return states_geometries.Georgia
      })
      fda.translate(single_recall, function (err, geojson) {
        should.not.exist(err)
        geojson.type.should.equal('FeatureCollection')
        geojson.features.should.exist
        geojson.features.length.should.equal(1)
        Object.keys(geojson.features[0].properties).length.should.equal(21)
        geojson.features[0].type.should.equal('Feature')
        geojson.features[0].geometry.coordinates.length.should.equal(states_geometries.Georgia.coordinates.length)
        fda.buildGeometry.restore()
        done()
      })
    })
  })
})
