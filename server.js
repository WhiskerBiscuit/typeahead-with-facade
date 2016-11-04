// Import modules
var express = require('express');

// Import application managers
var configManager = require('./server/manager-config');
var middlewareManager = require('./server/manager-middleware');
var assetsManager = require('./server/manager-assets');
var routesManager = require('./server/manager-routes.js');

// Create Express Application
var app = express();

// Configure application
configManager.handle(app);
middlewareManager.handle(app);
assetsManager.handle(app);
routesManager.handle(app);

// Display startup message
app.listen(app.get('port'), function() {
    console.log('Express ' + app.get('env') + ' started on http:/localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

module.exports = app;
