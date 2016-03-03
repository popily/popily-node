'use strict';

var expect  = require("chai").expect;
var popily = require("../lib/popily")(
  '60827788782637ff62abb202db211788047abc43', 
  'https://staging.popily.com'
);

describe("Source API", function() {

  var testSourceTitle =  'test ' + (new Date().toISOString());
  var testSource = null;
  var addOption = null; // = 'external'; // = 'upload';
  
  if(addOption == 'external') {
    testSourceTitle =  'GoT test ' + (new Date().toISOString());
    describe("addSource()", function() {
      var _source;
      var _err;
      before(function(done) {
        popily.addSource({
          columns: [
            {
              column_header: "Battle",
              data_type: "category"
            },
            {
              column_header: "Year",
              data_type: "category"
            },
            {
              column_header: "Attacker",
              data_type: "category"
            }
          ], 
          title: sourceTitle, 
          description: 'test',
          //data: '/test/data/test.csv'
          url: 'https://s3-us-west-1.amazonaws.com/popily-sample-data/game_of_thrones_battles.csv'
        }, function(err, source) {
          _source = testSource = source;
          _err = err;
          done();
        });
      });
      it("Should create data source", function() {
        expect(_err).to.equal(null);
      });

      it("Created source should have all properties", function() {
        expect(_source).to.have.contain.all.keys(['id', 'title', 'description', 'slug']);
      });
      
      it("Created source should have expected title", function() {
        expect(_source).to.have.property('title', testSourceTitle);
      });

    });
  }
  
  if(addOption == 'upload') {
    describe("addSource()", function() {
      var _source;
      var _err;
      before(function(done) {
        popily.addSource({
          columns: [
            { 
              column_header: 'Category A',
              data_type: 'category'
            },
            { 
              column_header: 'Category B',
              data_type: 'category'
            },
            { 
              column_header: 'Number',
              data_type: 'numeric'
            },
            { 
              column_header: 'Number 2',
              data_type: 'numeric'
            },
            { 
              column_header: 'Date 1',
              data_type: 'datetime'
            }
          ], 
          title: testSourceTitle, 
          description: 'test',
          data: __dirname + '/data/test.csv'
        }, function(err, source) {
          _source = testSource = source;
          _err = err;
          done();
        });
      });
      
      it("Should create data source", function() {
        expect(_err).to.equal(null);
      });

      it("Created source should have all properties", function() {
        expect(_source).to.have.contain.all.keys(['id', 'title', 'description', 'slug']);
      });
      
      it("Created source should have expected title", function() {
        expect(_source).to.have.property('title', testSourceTitle);
      });

    });
  }
  
  
  describe("getSources()", function() {
    var _sources;
    var _err;
    before(function(done) {
      popily.getSources(function(err, sources) {
        _sources = sources;
        _err = err;
        done();
      });
    });
    
    it("Should return list", function() {
      expect(_err).to.equal(null);
    })
    it("Should return list fields", function() {
      expect(_sources).to.have.all.keys('count', 'next', 'previous', 'results');
    });
    it("Returned list should have results on list", function() {
      expect(_sources.results).to.have.length.above(0);
      if(!addOption) {
        testSource = _sources.results[0];
      }
    });
    
  });

  describe("getSource()", function() {
    var _source;
    var _err;
    before(function(done) {
      popily.getSource(testSource.id, function(err, source) {
        _source = source;
        _err = err;
        done();
      });
    });

    it("Should return created source", function() {
      expect(_err).to.equal(null);
    });    
    it("Retrived source should have all properties", function() {
      expect(_source).to.have.contain.all.keys(['id', 'title', 'description', 'slug']);
    });
    if(addOption) {
      it("Retrived source should have expected title", function() {
        expect(_source).to.have.property('title', testSourceTitle);
      });
    }  
  });
  

});
