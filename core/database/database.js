var mongoose = require('mongoose');
var config = require('./../config/config');

module.exports = {
    "mongoose": mongoose,
    "connect": function () {
        if (!config.isLoaded) {
            throw 'Config must be loaded before connect to database';
        }
        mongoose.Promise = global.Promise;
        mongoose.connect(config.getDatabaseUrl(), function (err) {
            if (err) {
                console.log('Check database connection: KO');
                // Notify database problem
                // Log error
                // ---------
                // To remove
                throw err;
            }
        });
    },
    "close": function () {
        mongoose.connection.close();
    }
};

var _private = {
    "loadConfig": function () {
        config.load();
    }
}