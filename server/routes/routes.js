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

exports.getEpisodeCharacters = function (req, res) {
  options = getOptions(req.param("episode"), 'GET_CHARACTERS');
  request.post(options, function (err, response, body) {
    if (err) throw err;
    if (body.data != undefined && response.statusCode === 200) {
      res.send(body.data);
    } else {
      throw new Error('GET_CHARACTERS: '+ response.body.message);
    }
  });
};

function getOptions(d, type) {
  var query, options = {headers: { accept: 'application/json; charset=UTF-8'}, json: true};

  switch(type) {
    case 'GET_EPISODES':
      query = "MATCH (a:Episode { season:" + d + " }) RETURN a";
      options.url = dataURL + "cypher"
      options.body = {query: query, params: {} };
      break;
    case 'GET_CHARACTERS':
      query = "MATCH (n:Character)-[:APPEARS_IN]->(m:Episode) WHERE m.uniq='" + d + "' RETURN (n)";
      options.url = dataURL + "cypher"
      options.body = {query: query,  params: {}};
      break;
  }
  return options;
}



