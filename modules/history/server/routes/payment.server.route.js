var payment = require('../controllers/payment.server.controller');

module.exports = function(app) {
    app.route('/api/paymentStatus')
        .post(payment.savePaymentReceipt);
    app.route('/api/payments')
        .get(payment.paymentsByUserId);
    app.route('/api/paymentStatusById/:paymentReceiptId')
        .get(payment.checkPaymentStatusById);
    //     .put(payment.updatePaymentStatusByHotelAdmin);    
    // app.route('/api/updatePaymentStatus/:paymentReceiptId')
        // .put(payment.updatePaymentStatusByUser); 
    app.route('/api/payment/count')
        .get(payment.paymentCountByUserId);

    app.param('paymentReceiptId', payment.paymentReceiptById); 
};