'use strict';

require('./test-source');

var expect  = require("chai").expect;
var popily = require("../lib/popily")(
  '60827788782637ff62abb202db211788047abc43', 
  'https://staging.popily.com'
);

describe("Insight API", function() {

  var testSource = null;
  var testInsight = null;

  before(function(done) {
    popily.getSources(function(err, sources) {
      if(err)
        return done();
      sources.results.forEach(function(source) {
        if( !testSource && 
            source.status == 'finished' && 
            source.title.substring(0, 5) == 'test ' && 
            source.columns.length == 5)
          testSource = source;
      });
      done();
    });
  });
  
  it("Should have test source on list", function() {
    expect(testSource).to.not.equal(null);
  })
  
  
  describe("getInsights()", function() {
    var _insights;
    var _err;
    before(function(done) {
      popily.getInsights(testSource.id, {}, function(err, insights) {
        _insights = insights;
        _err = err;
        done();
      });
    });
    
    it("Should return list", function() {
      expect(_err).to.equal(null);
    })
    it("Should return list fields", function() {
      expect(_insights).to.have.all.keys('count', 'next', 'previous', 'results');
    });
    it("Returned list should have results on list", function() {
      expect(_insights.results).to.have.length.above(0);
    });
  });
  

  describe("getInsights() with columns", function() {
    var _insights;
    var _err;
    before(function(done) {
      popily.getInsights(testSource.id, {
        columns: ['Category A','Category B', 'Number']
      }, function(err, insights) {
        _insights = insights;
        _err = err;
        done();
      });
    });
    
    it("Should return list", function() {
      expect(_err).to.equal(null);
    });
    it("Returned list should have 2 results on list", function() {
      expect(_insights.results).to.have.lengthOf(2);
    });
  });


  describe("getInsights() with filters", function() {
    var _insights;
    var _err;
    before(function(done) {
      popily.getInsights(testSource.id, {
        columns: ['Category A'],
        filters: [{
          'column': 'Category A',
          'values': ['OK']
        }],
        insight_types: ['ratio_by_category']
      }, function(err, insights) {
        _insights = insights;
        _err = err;
        done();
      });
    });
    
    it("Should return list", function() {
      expect(_err).to.equal(null);
    });
    it("Returned list should have 1 results on list", function() {
      expect(_insights.results).to.have.lengthOf(1);
    });
    it("Returned list should have 1 results on list", function() {
      testInsight = _insights.results[0];
      expect(testInsight.title).to.equal('OK is 30.00% of Category A');
    });
  });


  describe("getInsight() with filters", function() {
    var _insight;
    var _err;
    before(function(done) {
      popily.getInsight(testInsight.id, {
        filters: [{
          'column': 'Category A',
          'values': ['OK']
        }]
      }, function(err, insight) {
        _insight = insight;
        _err = err;
        done();
      });
    });
    
    it("Should return insight", function() {
      expect(_err).to.equal(null);
    });
    it("Returned insight should have expected title", function() {
      expect(_insight.title).to.equal(testInsight.title);
    });
    it("Returned insight should have expected filters_key", function() {
      expect(_insight.filters_key).to.equal(testInsight.filters_key);
    });
  
  });


  describe("customizeInsight() with filters", function() {
    var _insight;
    var _err;
    before(function(done) {
      popily.customizeInsight(testInsight.id, {
        filters: [{
          'column': 'Category A',
          'values': ['OK']
        }]
      }, {
        title: 'Test insight'
      }, function(err, insight) {
        _insight = insight;
        _err = err;
        done();
      });
    });
    
    it("Should customize insight", function() {
      expect(_err).to.equal(null);
    });
    it("Returned insight should have customized title", function() {
      expect(_insight.title).to.equal('Test insight');
    });
    it("Returned insight should have expected filters_key", function() {
      expect(_insight.filters_key).to.equal(testInsight.filters_key);
    });
  
  });
  

  describe("getInsight() get customized insight", function() {
    var _insight;
    var _err;
    before(function(done) {
      popily.getInsight(testInsight.id, {
        filters: [{
          'column': 'Category A',
          'values': ['OK']
        }]
      }, function(err, insight) {
        _insight = insight;
        _err = err;
        done();
      });
    });
    
    it("Should return insight", function() {
      expect(_err).to.equal(null);
    });
    it("Returned insight should have customized title", function() {
      expect(_insight.title).to.equal('Test insight');
    });
  
  });
  
  
  describe("customizeInsight() back default", function() {
    var _insight;
    var _err;
    before(function(done) {
      popily.customizeInsight(testInsight.id, {
        filters: [{
          'column': 'Category A',
          'values': ['OK']
        }]
      }, {
        title: testInsight.title
      }, function(err, insight) {
        _insight = insight;
        _err = err;
        done();
      });
    });
    
    it("Should customize insight", function() {
      expect(_err).to.equal(null);
    });
    it("Returned insight should have customized title", function() {
      expect(_insight.title).to.equal(testInsight.title);
    });
    it("Returned insight should have expected filters_key", function() {
      expect(_insight.filters_key).to.equal(testInsight.filters_key);
    });
  
  });


  
})
