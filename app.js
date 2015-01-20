var express = require('express');
var teamcity = require('./lib/teamcity');
var app = express();
var filterString = process.env.TEAMCITY_PROJECT_FILTER; 

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  teamcity.getBuilds(function(builds) {
    teamcity.filterAndSortBuildsByState(builds, filterString, function(sortedAndFilteredBuilds) {
      res.render('index', sortedAndFilteredBuilds);
    });
  });
});

var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('App listening at http://%s:%s', host, port)
})
