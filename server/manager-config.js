var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var assign = require('object-assign');
var handlebars = require('express-handlebars').create({

    // Add partials support
    partialsDir: path.resolve(__dirname, '../views/partials'),

    // Add layout support
    layoutsDir: path.resolve(__dirname, '../views/layouts'),

    // Specify default layout
    defaultLayout: 'main',

    // Add helpers
    helpers: {

        // Add section support
        section: function (name, options) {
            if (!this._sections) {
                this._sections = {};
            }
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});

var baseManager = require('./manager-base');

var configManager = assign({}, baseManager, {

    configureCommon: function(app) {

        // Disable 'powered-by' header
        app.set('x-powered-by', false);

        // Bind views directory
        app.set('views', path.resolve(__dirname, '../views'));

        // Configure view handler
        app.engine('handlebars', handlebars.engine);
        app.set('view engine', 'handlebars');

        // Set up form parser
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));

        // Set up cookie parser
        app.use(cookieParser());

        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

        // Set listening port
        app.set('port', process.env.PORT || 3000);
    }
});

module.exports = configManager;
