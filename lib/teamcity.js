var cheerio = require('cheerio');
var request = require('request');
var teamcityUrl = process.env.TEAMCITY_HOST;

exports.getBuilds = function getBuilds(callback) {
  request(teamcityUrl + '/externalStatus.html', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      $ = cheerio.load(body);
      var buildConfigurations = $('.tcTable .buildConfigurationName');
      var builds = []; 
      for (i = 0; i < buildConfigurations.length; i++) { 
        buildConfig = $(buildConfigurations[i]);
        var project = buildConfig.parent().parent().find('tr .projectName').text();
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

exports.filterBuildsByProjectTitle = function filterBuildsByProjectTitle(builds, projectName, callback) {
  var filteredBuilds = [];
  for (i = 0; i < builds.length; i++) {
    if(builds[i].project.indexOf(projectName) != -1) {
      filteredBuilds.push(builds[i]);
    }
  };
  callback(filteredBuilds);
};

exports.trimBuildNames = function trimBuildNames(builds, stringToTrim, callback) {
  builds.map(function(build) {
    build.project = build.project.replace(stringToTrim, '');
  });
  callback(builds);
};  

exports.filterAndSortBuildsByState = function filterAndSortBuildsByState(builds, projectFilter, callback) {
  var self = this;
  if(projectFilter) {
    self.filterBuildsByProjectTitle(builds, projectFilter, function(filteredBuilds) {
      self.trimBuildNames(filteredBuilds, projectFilter, function(filteredBuilds) {
        self.sortBuildsByState(filteredBuilds, function(sortedBuilds) {
          callback(sortedBuilds);
        });
      });
    });
  } else {
    self.sortBuildsByState(builds, function(sortedBuilds) {
      callback(sortedBuilds);
    });
  }      
};

exports.sortBuildsByState = function sortBuildsByState(builds, callback) {
  var successfulBuilds = [];
  var failingBuilds = [];
  var investigatingBuilds = [];

  for (i = 0; i < builds.length; i++) {
    if (builds[i].buildStatus.indexOf("successful") != -1) {
      successfulBuilds.push(builds[i]);
    } else if (builds[i].buildStatus.indexOf("failing") != -1) {
      failingBuilds.push(builds[i]);
    } else if (builds[i].buildStatus.indexOf("investigate") != -1) {
      investigatingBuilds.push(builds[i]);
    }
  };

  callback({
    successfulBuilds: successfulBuilds,
    failingBuilds: failingBuilds,
    investigatingBuilds: investigatingBuilds
  });
};

module.exports = exports;
