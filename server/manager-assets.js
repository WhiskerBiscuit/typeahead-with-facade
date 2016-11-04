var path = require('path');
var express = require('express');
var assign = require('object-assign');

var baseManager = require('./manager-base');

var assetsManager = assign({}, baseManager, {

    configureCommon: function(app) {

        // Bind static assets directory
        app.use(express.static(path.join(__dirname, '../client')));
    }
});

module.exports = assetsManager;
