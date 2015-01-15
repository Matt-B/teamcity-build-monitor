var request = require('request');
var cheerio = require('cheerio');
var express = require('express')
var app = express()
var teamcityUrl = process.env.TEAMCITY_HOST

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  getBuildInformation(function(builds) {
    filterBuildsByProjectTitle(builds, 'Content Disco', function(contentDiscoBuilds) {      
      filterBuildsByState(contentDiscoBuilds, 'failing', function(failingBuilds) {
        filterBuildsByState(contentDiscoBuilds, 'investigate', function(investigatingBuilds) {
          res.render('index', {
            failingBuilds: failingBuilds,
            investigatingBuilds: investigatingBuilds
          });
        });
      });
    });
  });
})

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('App listening at http://%s:%s', host, port)

})


function getBuildInformation(callback) {
  request(teamcityUrl + '/externalStatus.html', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      $ = cheerio.load(body);
      var buildConfigurations = $('.tcTable .buildConfigurationName');
      var builds = []; 
      for (i = 0; i < buildConfigurations.length; i++) { 
        buildConfig = $(buildConfigurations[i]);
        var project = buildConfig.parent().parent().find('tr .projectName a').text();
        var name = buildConfig.find('a').text();
        var buildStatus = buildConfig.find('img').attr('title');
        builds.push({
          project: project,
          name: name,
          buildStatus: buildStatus
        });
      };
      callback(builds);
    }
  })
};

function filterBuildsByProjectTitle(builds, projectName, callback) {
  var filteredBuilds = [];
  for (i = 0; i < builds.length; i++) {
    if(builds[i].project.indexOf(projectName) != -1) {
      filteredBuilds.push(builds[i]);
    }
  };
  callback(filteredBuilds);
};

function filterBuildsByState(builds, state, callback) {
  var filteredBuilds = [];
  for (i = 0; i < builds.length; i++) {
    if(builds[i].buildStatus.indexOf(state) != -1) {
      filteredBuilds.push(builds[i]);
    }
  };
  callback(filteredBuilds);
};
