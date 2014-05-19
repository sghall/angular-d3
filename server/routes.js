var async = require('async'), 
    request = require('request'),
    us = require('underscore');

var dataURL = 'http://localhost:7474/db/data/';

exports.getIngredientJSON = function(req, res) {
    queryNode(req.param("nodeid"), function (err, response){
      if (err) throw err;
      res.send(response);
    });
};

function queryNode(nodeID, cb) {
  var options;
  async.waterfall([
    function (callback){
      options = getOptions(nodeID, 'GET_RECIPES');
      request.post(options, function (err, response, body) {
        if (err) return callback(err);
        if (body.data != undefined && response.statusCode === 200) {
          return callback(null, body.data);
        } else {
          return callback(new Error('GET_RECIPES: '+ response.body.message));
        }
      });
    },
    function (rcps, callback){
      if (rcps.length > 10) rcps = us.shuffle(rcps).slice(0,10);
      options = getOptions(rcps.join(","), 'GET_INGREDS');
      request.post(options, function (err, response, body) {
        if (err) return callback(err);
        if (body.data && response.statusCode === 200) {
          return callback(null, rcps, body.data);
        } else {
          return callback(new Error('GET_INGREDS: '+ response.body.message));
        }
      });
    },
    function (rcps, ings, callback){
      options = getOptions(us.union(rcps, ings, [nodeID]), 'GET_RELATIONS');
      request.post(options, function (err, response, body) {
        if (err) return callback(err);
        if (body.results && response.statusCode === 201) {
          return callback(null, body.results);
        } else {
          return callback(new Error('GET_RELATIONS: '+ response));
        }
      });
    }
   ], cb);
}

function getOptions(d, type) {
  var query, options = {headers: { accept: 'application/json; charset=UTF-8'}, json: true};

  switch(type) {
    case 'GET_RECIPES':
      query = "MATCH (a)-[r]->(b) WHERE id(a)=" + d + " RETURN id(b)";
      options.url = dataURL + "cypher"
      options.body = {query: query, params: {} };
      break;
    case 'GET_INGREDS':
      query = "START a = node(" + d + ") MATCH (b)-[r]->(a) RETURN id(b)";
      options.url = dataURL + "cypher"
      options.body = {query: query,  params: {}};
      break;
    case 'GET_RELATIONS':
      query = "START a = node("+ d + "), b = node(" + d + ") MATCH a -[r]-> b RETURN r";
      options.url = dataURL + "transaction"
      options.body = {statements:[{ statement: query , resultDataContents:['row','graph']}]}
      break;
  }
  return options;
}



