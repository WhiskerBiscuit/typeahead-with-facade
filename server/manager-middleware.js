var logger = require('morgan');
var assign = require('object-assign');

var baseManager = require('./manager-base');

var middlewareManager = assign({}, baseManager, {

    configureCommon: function(app) {

        // Set up logging
        app.use(logger('dev'));
    }
});

module.exports =  middlewareManager;
