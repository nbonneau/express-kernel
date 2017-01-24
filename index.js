var express = require('express');
var connect = require('connect');
var bodyParser = require('body-parser');
var configLoader = require('./core/config/loader');
var database = require('./core/database/database');

module.exports = {
    app: null,
    config: null,
    database: null,
    init: function (appDir) {
        // Load app config
        var config = configLoader.load(appDir);
        this.config = config;

        // Create new App
        var app = express();

        app.set('superSecret', config.getConfig('secret')); // secret variable

        app.use(bodyParser.json()); // support json encoded bodies
        app.use(bodyParser.urlencoded({
            extended: true
        })); // support encoded bodies
        // Configuration
        app.use(express.static(__dirname + '/public'));
        //app.use(connect.logger('dev'));
        app.use(connect.json());
        app.use(connect.urlencoded());


        // Check database connection URL
        database.connect();
        database.close();
        this.database = database;

        // Set Access-Controls
        config.setAccessControl(app);

        // Load app routes
        config.loadRoutes(appDir, app);

        // Get the port to listen
        var port = this.config.getConfig('port');
        app.set('port', port);

        this.app = app;
        return app;
    },
    start: function (app) {
        // Start the server
        var server = app.listen(app.get('port'), function () {
            console.log('\nServer running, listening on port ' + server.address().port);
        });
        return server;
    }
};