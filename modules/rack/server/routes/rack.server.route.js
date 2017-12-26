'use strict';


var rack = require('../controllers/rack.server.controller');


module.exports = function (app) {

    // Routes for create, listing  the rack
    app.route('/api/rack')
        .get(rack.rackListByUserId)
        .post(rack.create);
        
    app.route('/api/rack/UniqueCode')
        .get(rack.verifyUniqueCode);
    // Routes for delete and get the rack by id
    app.route('/api/rack/:rackId')
        .get(rack.read);
    
    //Find rack with id using the middleware
    app.param('rackId', rack.rackById);    
};