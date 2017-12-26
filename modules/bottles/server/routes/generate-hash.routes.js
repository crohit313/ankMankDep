'use strict'


var generateHash = require('../controllers/generate-hash.server.controller');

module.exports = function (app) {
    //Routes without id for list and crate the Drink Type.

    app.route('/api/get_hash')
        .post(generateHash.getServerGeneratedHash);
    
};