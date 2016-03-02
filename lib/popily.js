'use strict';


var request = require('request');
var fs = require('fs');

/*var http = require('http');
var https = require('https');
var url = require('url') ;*/

Popily.DEFAULT_URL = 'https://popily.com';
Popily.DEFAULT_BASE_PATH = '/api';

function Popily(token, apiUrl) {
  if(!apiUrl)
    apiUrl = Popily.DEFAULT_URL;
  apiUrl = apiUrl + Popily.DEFAULT_BASE_PATH;

  var _error = function(msg, error) {
    return {msg: msg, error: error};
  };
    
  var _request = function(method, path, data, callback) {
    var params = {
      method: method,
      headers: { 
        'Authorization': 'Token ' + token,
        'Accept': 'application/json',
      },
      url: apiUrl + path// + '?format=api'
    };
        
    if('qs' in data) {
      params['qs'] = data['qs'];
    }
    if('json' in data) {
      params['body'] = data['json'];
      params['json'] = true;
    }
    if('form' in data) {
      params['formData'] = data['form'];
    }
    
    request(params, function(err, httpResponse, body) {
      if(err)
        return cb(_error('Request error', err));
        
      if(httpResponse.statusCode === 401)
        return callback(_error('Invalid API token'));

      if(httpResponse.statusCode === 400)
        return callback(_error('Bad request', body));
        
        
      try {
        var response = body;
        if(typeof body === 'string')
          response = JSON.parse(body);
        callback(null, response);
      } catch(e) {
        callback(_error('Invalid JSON received from the Stripe API: '+e, e) )
      }

    });
  };
    
  /*
  var urlParts = url.parse(apiUrl, true);
  var isHTTPS = urlParts.protocol == 'https:';

  var request = function(method, path, data, callback) {
  
    var requestData = '';
    var contentType = "application/x-www-form-urlencoded";
    var contentLength = 0;
    if('data' in data) {
      requestData = querystring.stringify(data['data']);
      contentType = "application/x-www-form-urlencoded";
      contentLength = Buffer.byteLength(requestData);
    }
    if('json' in data) {
      requestData = JSON.stringify(data['json']);
      contentType = "application/json";
      contentLength = Buffer.byteLength(requestData);
    }
    if('file' in data) {
      
      contentType = "multipart/form-data; ";
      
      
    }
    
    
    var req = (
      isHTTPS ? https : http
    ).request({
      host: urlParts.hostname,
      port: urlParts.port,
      path: Popily.DEFAULT_BASE_PATH + path,
      method: method,
      headers: {
        'Authorization': 'Token ' + token,
        'Content-Type': contentType,
        'Content-Length': contentLength}
    });

    req.setTimeout(Popily.DEFAULT_TIMEOUT, function() {
      callback(error('Connection timeout'));
    });
    req.on('response', function(res) {
      var response = '';
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        response += chunk;
      });
      res.on('end', function() {
        if(res.statusCode === 401) {
          callback(error('Invalid API token'))
        }
        else {
          try {
            response = JSON.parse(response);
            callback(null, response)
          } catch(e) {
            callback(error('Invalid JSON received from the Stripe API', e) )
          }
        }
      });
    });
    req.on('error', function(error) {
      callback(error('Request error', error) )
    }
    req.on('socket', function(socket) {
      socket.on((isHTTPS ? 'secureConnect' : 'connect'), function() {
          req.write(requestData);
          req.end();
      });
    });
  }
  */
  
  var packFilters = function(filters) {
    var packedStr = '';
    filters.forEach(function(f, i) {
      var op = 'eq'
      if('op' in f)
        op = f['op']
      
      var filterStr = '';
      if(i > 0)
        filterStr += '__';

      filterStr += f['column'] + '!' + op + '!' + ( f['values'].join(',') );
      packedStr += filterStr
    });
    return packedStr;
  }
  
  
  
  return {
        
        
    addSource : function(sourceData, cb) {
      
      var data = {};
      ['columns', 'title', 'description'].forEach(function(key) {
        if(key in sourceData)
          data[key] = sourceData[key];
      })

      if('url' in sourceData) {
        data['url'] = sourceData['url']
        _request('POST', '/sources/', {json: data}, cb);
      }
        
      else if('data' in sourceData) {
        data['columns'].forEach(function(column, i) {
          data['columns'][i] = JSON.stringify(column);
        });
        data['data'] = fs.createReadStream(sourceData['data']);
        _request('POST', '/sources/', {form: data}, cb);
      }

      else if('connection_string' in sourceData ) {
        data['connection_string'] = sourceData['connection_string']
        data['query'] = sourceData['query']
        _request('POST', '/sources/', {json: data}, cb);
      }
      
      else
        cb('url or data is required');
    },
    
    
    getSources: function(cb) {
      _request('GET', '/sources/', {}, cb);
    },
    
    
    getSource: function(sourceId, cb) {
      _request('GET', '/sources/'+sourceId+'/', {}, cb);
    },
    
    
    getInsights: function(sourceId, params, cb) {
      params = params || {};
      var payload = {'source': source_id}

      ['columns', 'insight_types', 'insight_type_categories'].forEach(function(key) {
        if(key in params)
          payload[key] = params[key].join(',')
      });

      if('filters' in params)
        payload['filters'] = packFilters(params['filters'])

      if('full' in params)
        payload['full'] = params['full']

      _request('GET', '/insights/', {qa: payload}, cb);
    },


    getInsight: function(insightId, params, cb) {
      var payload = {};
      if('filters' in params)
        payload['filters'] = packFilters(params['filters'])

      ['full', 'height', 'width'].forEach(function(key) {
        if(key in params)
          payload[key] = params[key].join(',')
      });
      
      _request('GET', '/insights/' + insightId + '/', {qa: payload}, cb);
    },
    
    
    customizeInsight: function(insightId, params, insightData, cb) {
      var data = {};
      [
        'title',
        'x_label',
        'y_label',
        'z_label',
        'category_order',
        'time_interval'
      ].forEach(function(key) {
        if(key in insightData)
          data[key] = insightData[key];
      });
      if('filters' in params)
        data['filters'] = self.packFilters(params['filters'])

      _request('PUT', '/insights/' + insightId + '/', {json: data}, cb);
    }
    
    
  }
}


module.exports = Popily;
