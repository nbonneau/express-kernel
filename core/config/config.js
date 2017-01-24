const ROUTES_DIR = '/app/routes/';

module.exports = {
    env: null,
    config: {},
    isLoaded: false,
    settingsDir: '',
    load: function (appDir, callback) {
        this.settingsDir = appDir + '/settings/';
        var envConfig = require(this.settingsDir + 'env.json');
        var dbConfig = null;
        switch (envConfig.env) {
            case "dev":
                {
                    dbConfig = require(this.settingsDir + 'config.' + envConfig.env + '.json');
                }
                break;
            case "prod":
                {
                    dbConfig = require(this.settingsDir + 'config.' + envConfig.env + '.json');
                }
                break;
            default:
                {
                    console.log('Config env not valid.');
                    process.exit(2);
                }
        }
        this.env = envConfig.env;
        if (checkConfig(dbConfig)) {
            this.config = dbConfig;
            this.isLoaded = true;
            if (callback != null) {
                return callback();
            }
        }
    },
    loadRoutes: function (appDir, app, callback) {
        // Load all routes
        var routes = require(this.settingsDir + 'routing.json');
        Object.keys(routes).map(function (route) {
            if (routes[route].prefix) {
                app.use(routes[route].prefix + route, require(appDir + ROUTES_DIR + routes[route].router));
            } else {
                app.use(route, require(appDir + ROUTES_DIR + routes[route].router));
            }
        });
    },
    setAccessControl: function (app) {
        if (this.config.access_control !== undefined && this.config.access_control.constructor === {}.constructor) {
            Object.keys(this.config.access_control).map(function (route_name) {
                app.all(route_name, function (req, res, next) {
                    // CORS headers
                    if(this.config.access_control['allow_origin']){
                        res.header("Access-Control-Allow-Origin", this.config.access_control['allow_origin']); // restrict it to the required domain
                    }
                    if(this.config.access_control['allow_methods']){
                        res.header('Access-Control-Allow-Methods', this.config.access_control['allow_methods']);
                    }
                    // Set custom headers for CORS
                    if(this.config.access_control['allow_headers']){
                        res.header('Access-Control-Allow-Headers', this.config.access_control['allow_headers']);
                    }
                    if (this.config.access_control['disable_options_method'] && req.method == 'OPTIONS') {
                        res.status(200).end();
                    } else {
                        next();
                    }
                });
            })
        }
    }
    getEnv: function () {
        return this.env;
    },
    getConfig: function (key) {
        if (this.config[key] !== undefined) {
            return this.config[key];
        }
        return null;
    },
    getDatabaseUrl: function () {
        var databseConfig = this.getConfig('database');
        return 'mongodb://' + databseConfig.host + ':' + databseConfig.port + '/' + databseConfig.dbname;
    }
}

function checkConfig(config, env) {
    if (!config.database || !config.database.host || !config.database.port || !config.database.dbname || !config.port) {
        console.log('Missing config parameter. Please check "' + this.settingsDir + 'config.' + env + '.json" file');
        process.exit();
    }
    return true;
}