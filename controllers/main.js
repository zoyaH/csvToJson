/**
description: Convert file to csv functions
author: Zulekha Herlekar
created: 21-December-2016
**/

'use strict';
var formidable = require('formidable');
var form = new formidable.IncomingForm();
var fs = require('fs');
var Converter = require("csvtojson").Converter;
var https = require('https');
var async = require('async');
var request = require('request');

var download = function(uri, filename, cb) {
  request.head(uri, function(err, res, body) {
    request(uri).pipe(fs.createWriteStream(filename)).on('finish', cb);
  });
};

exports.convertCSV = function(req, res) {
  var uri = req.query.q;
  if (uri) {
    try {
      uri = JSON.parse(uri);
    } catch (e) {
      return res.status(400).json({
        'error': 'ensure that you have entered valid query JSON'
      });
    }
  } else {
    return res.json({
      'error': 'Please enter valid url of csv file'
    });
  }
  async.waterfall([
    //get file from given link and store into local directory
    function(callback) {
      if (uri && uri.split('.').pop() === 'csv') {
        var dirpath = require('path').join(__dirname + '/..', 'files');
        var filepath = dirpath + '/file-' + Date.now() + '.csv';
        download(uri, filepath, function() {
          //send callback
        });
        callback(null, filepath);
      } else {
        return res.json({'error':'Please enter valid csv file url to parse'});
      }
    }, //convert file to json and send response
    function(filepath, callback) {
      form.parse(req, function(err, data, files) {
        fs.readFile(filepath, function(err, data) {
          var jsonpath = 'outputfile';
          fs.writeFile(jsonpath, data, function(err) {
            if (!err) {
              var csvFileName = jsonpath;
              //new converter instance
              var csvConverter = new Converter({
                constructResult: true
              });
              //end_parsed will be emitted once parsing finished
              csvConverter.on('end_parsed', function(jsonObj) {
                callback(null, jsonObj);
              });
              fs.createReadStream(csvFileName).pipe(csvConverter);
            }
          });
        });
      });
    }
  ], function(err, resultJson) {
    res.json(resultJson);
  });
};