'use strict';


var promocode = require('../controllers/promocode.server.controller');


module.exports = function (app) {

    // Routes for create, listing  the rack
    app.route('/api/promoCode')
        .get(promocode.getPromoCode)
        .post(promocode.create);

    app.route('/api/promoCodes')
        .get(promocode.list);

    app.route('/api/promoCodeById/:promoCodeId')   
        .get(promocode.getPromoCodeById)
        .put(promocode.update)
        .delete(promocode.delete);

    app.param('promoCodeId', promocode.promoCodeById);            
        
};