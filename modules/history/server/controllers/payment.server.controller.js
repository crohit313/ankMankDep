var path = require('path'),
_ = require('lodash'),
mongoose = require('mongoose'),
Payment = mongoose.model('Payment'),
itemsPerPage = 15,
errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


//To save payment receipt
exports.savePaymentReceipt = function(req, res) {
    var payment = new Payment(req.body);
    payment.save(function(err, savedPayment) {
        if (err) {
            return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(savedPayment);
        }
    });
};

// check payment status by id
exports.checkPaymentStatusById = function(req, res) {
    var payment = req.paymentReceipt;
    if(payment) {
        res.json(payment);
    }
};

//To get pending payment request count
exports.paymentCountByUserId = function(req, res) {
    Payment.count({user: req.query.userId, status:"Pending"}).exec(function(err, paymentListCount) {
        if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json({count: paymentListCount});
        }
    });
};

// exports.updatePaymentStatusByUser = function(req, res) {
//     var invoice = req.paymentReceipt;
//     if(invoice.cancelledByAdmin === false) {
//         var payment = _.extend(req.paymentReceipt, req.body);
//         payment.save(function(err, updatedPayment) {
//             if (err) {
//                 return res.status(422).send({
//                     message: errorHandler.getErrorMessage(err)
//                 });
//             } else {
//                 res.json(updatedPayment);
//             }  
//         });
//     } else {
//         return res.status(422).send({
//             message: 'This transaction has been cancelled by the hotel admin. Ask for new request'
//         }); 
//     }
// };

// exports.updatePaymentStatusByHotelAdmin = function(req, res) {
//     var payment = _.extend(req.paymentReceipt, req.body);
//     payment.save(function(err, savedPayment) {
//         if (err) {
//             return res.status(422).send({
//               message: errorHandler.getErrorMessage(err)
//             });
//         } else {
//             res.json(savedPayment);
//         }
//     });
// };

exports.paymentsByUserId = function(req, res) {
    Payment.find({user: req.query.userId, $or:[{status:'Pending'}, {status:'Accepted'}]}).populate('user hotel bottle').sort('-created').exec(function(err, paymentList) {
        if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(paymentList);
        }
    });
};

/**
 * Payment Middleware
 */
exports.paymentReceiptById = function (req, res, next, id) {
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
        message: 'payment receipt is invalid'
    });
    }

    Payment.findById(id).populate('user hotel bottle').exec(function (err, paymentReceipt) {
        if (err) {
            return next(err);
        } else if (!paymentReceipt) {
            return res.status(422).send({
            message: 'No payment receipt with that identifier has been found'
            });
        }
        req.paymentReceipt = paymentReceipt;
        next();
    });
};