var config = require('./config');

module.exports = {
    load: function(appDir){
        config.load(appDir);
    }
}