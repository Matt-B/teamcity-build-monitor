# TeamCity Build Monitor

A simple build monitor for TeamCity, which shows failing builds and those under investigation.

Designed to be as light as possible so it can be run and displayed in a browser on a Raspberry Pi (specifically a Model B).

## Getting started

Clone the repository and install the dependencies:

    git clone https://github.com/Matt-B/teamcity-build-monitor.git
    cd teamcity-build-monitor
    npm install

Tell the build monitor where your teamcity server can be found, and optionally add a project name filter if you only want to see builds from a particular project:

    export TEAMCITY_HOST=http://teamcity.server.address
    export TEAMCITY_PROJECT_FILTER="Some Project Name"

Now we can start the monitor up:

    node app.js

Open a browser and navigate to http://localhost:3000 - you should see a list of failing builds (in red) and builds being investigated (in orange), if there are any.
