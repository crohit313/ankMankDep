'use strict'

//Require history controllers

var history = require('../controllers/history.server.controller.js');

module.exports = function(app) {


    app.route('/api/history')
        .get(history.read)
        .post(history.deductVolumeByCode);
};