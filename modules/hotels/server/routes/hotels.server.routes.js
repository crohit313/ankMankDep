'use strict';

/**
 * Module dependencies
 */
var hotel = require('../controllers/hotels.server.controller');

module.exports = function (app) {
  // hotel collection routes
  app.route('/api/hotels')
    .get(hotel.list)
    .post(hotel.create);

  app.route('/api/hotels/mobile')
    .get(hotel.getHotelsForMobile);

  // Single hotel routes
  app.route('/api/hotels/:hotelId')    
    .get(hotel.read)
    .put(hotel.update)
    .delete(hotel.delete);
  
  app.route('/api/hotelByAdminId')
    .get(hotel.hotelByAdminId);  

  app.route('/api/historyByHotelId')
    .get(hotel.getHistoryByHotelId);

  app.route('/api/changeStatus/:consumedId')    
    .put(hotel.updatePaymentStatus);

  // Finish by binding the hotel middleware
  app.param('hotelId', hotel.hotelByID);
  app.param('consumedId', hotel.consumedByID);
  app.param('manageProductId', hotel.manageProductByID);
};
