var async = require('async'), request = require('request'), us = require('underscore');
var dataURL = 'http://localhost:7474/db/data/';

exports.getSeasonEpisodes = function (req, res) {
  options = getOptions(req.param("season"), 'GET_EPISODES');
  request.post(options, function (err, response, body) {
    if (err) throw err;
    if (body.data != undefined && response.statusCode === 200) {
      res.send(body.data);
    } else {
      throw new Error('GET_EPISODES: '+ response.body.message);
    }
  });
};

exports.getCharEpisodes = function (req, res) {
  options = getOptions(req.param("nodeid"), 'GET_CHAR_EPISODES');
  request.post(options, function (err, response, body) {
    if (err) throw err;
    if (body.data != undefined && response.statusCode === 200) {
      res.send(body.data);
    } else {
      throw new Error('GET_CHAR_EPISODES: '+ response.body.message);
    }
  });
};

exports.getEpisodeCast = function (req, res) {
  queryEpisodeRelations(req.param("nodeid"), function (err, response){
    if (err) throw err;
    res.send(response);
  });
};

function queryEpisodeRelations(nodeID, cb) {
  var options;
  async.waterfall([
    function (callback){
    options = getOptions(nodeID, 'GET_CHARACTERS');
    request.post(options, function (err, response, body) {
      if (err) throw err;
      if (body.data != undefined && response.statusCode === 200) {
          return callback(null, body.data);
      } else {
        throw new Error('GET_CHARACTERS: '+ response.body.message);
      }
    });
    },
    function (chars, callback){
      options = getOptions(us.union(chars, [nodeID]), 'GET_RELATIONS');
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
    case 'GET_EPISODES':
      query = "MATCH (a:Episode { season:" + d + " }) RETURN a";
      options.url = dataURL + "cypher"
      options.body = {query: query, params: {} };
      break;
    case 'GET_CHAR_EPISODES':
      query = "START a = node(" + d + ") MATCH (a)-[r]->(b) RETURN b.season";
      options.url = dataURL + "cypher"
      options.body = {query: query,  params: {}};
      break;
    case 'GET_CHARACTERS':
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



