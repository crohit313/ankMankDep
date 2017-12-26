'use strict';

/**
 * Module dependencies
 */
var product = require('../controllers/manageProduct.server.controller');

module.exports = function (app) {
    app.route('/api/product')
    .get(product.productByHotelId)
    .post(product.addManageProductRecord);
      
    app.route('/api/updateProduct/:manageProductId')
      .put(product.updateManageProductRecord);
    app.route('/api/product/stockByBottleId')
      .get(product.checkBottleInStockById);
  // Finish by binding the hotel middleware
  app.param('manageProductId', product.manageProductByID);
};
