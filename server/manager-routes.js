var assign = require('object-assign');
var baseManager = require('./manager-base');

var routesManager = assign({}, baseManager, {

    configureCommon: function(app) {

        this.createAppRoutes(app);
    },

    createAppRoutes: function(app) {

        app.get('/', function(req, res) {

            res.render('application', {
                title: 'Sharecare Find a Doctor Widget'
            });
        });
    }
});

module.exports = routesManager;
