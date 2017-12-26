'use strict';

/**
 * Module dependencies.
 */
// var bottlesPolicy = require('../policies/bottles.server.policy'),
  var bottles = require('../controllers/bottle.server.controller'),
      jwt = require('express-jwt'),
      auth = jwt({
        secret: 'iXarbaSecret',
        userProperty: 'payload'
      });

module.exports = function (app) {
 
  // Bottles collection routes
  app.route('/api/bottles')
    .get(bottles.list)
    .post(bottles.create);
    //Android 
  app.route('/api/bottlesByType')
    .get(bottles.bottleListByDrinkType);
  app.route('/api/bottlesByTypeFilter')
    .get(bottles.bottleListByDrinkTypeFilter);  
  // Single Bottle routes
  app.route('/api/bottles/:bottleId')
    .get(bottles.read)
    .put(bottles.update)
    .delete(bottles.delete);  
  app.route('/api/hotelsByBottleId')
    .get(bottles.hotelsByBottleId);
  // Finish by binding the bottle middleware
  app.param('bottleId', bottles.bottleByID);
};
