'use strict'


var drinkType = require('../controllers/drinkType.server.controller');

module.exports = function (app) {
    //Routes without id for list and crate the Drink Type.

    app.route('/api/drinkType')
        .get(drinkType.list)
        .post(drinkType.create);
    
    // Routes with Id for get drink type by id , update and delete.
    app.route('/api/drinkType/:drinkTypeId')
        .get(drinkType.getDrinkTypeById)
        .put(drinkType.update)
        .delete(drinkType.delete);
    
    // params route
    app.param('drinkTypeId', drinkType.drinkTypeById);
};