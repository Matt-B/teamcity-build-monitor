'use strict';

var express = require('express');
var moment = require('moment');
var teamcity = require('./lib/teamcity');
var app = express();
var filterString = process.env.TEAMCITY_PROJECT_FILTER; 

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  teamcity.getBuilds(function(builds, error) {
    if(!error) {
      teamcity.filterAndSortBuildsByState(builds, filterString, function(sortedAndFilteredBuilds) {
        sortedAndFilteredBuilds.time = moment().format('h:mm a');
        res.render('index', sortedAndFilteredBuilds);
      });
    } else {
      console.log('Error: ' + error);
      res.render('error', {
        error: error,
        time: moment().format('h:mm a')
      });
    }
  });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('App listening at http://%s:%s', host, port);
});
