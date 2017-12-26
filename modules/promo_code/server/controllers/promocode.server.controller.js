'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Promocode = mongoose.model('Promocode'),
    UsedPromocode = mongoose.model('UsedPromocode'),
    _   = require('lodash'),
    randomstring = require("randomstring"),
    ObjectId = mongoose.ObjectID,
    expireAfterDay = 60, // Days you want to subtract
    currentDate = new Date(),    
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    uniqueCodeSetting = {length: 6,charset: 'alphanumeric',capitalization: 'uppercase'};

/**
 * Create new promo code
 */
exports.create = function (req, res) {
    // var expiryDate = new Date(currentDate.getTime() + (expireAfterDay * 24 * 60 * 60 * 1000));
    var data = {
        'promoCode': req.body.promoCode,
        'minAmmountForDiscount':req.body.minAmmountForDiscount,
        'discount':req.body.discount,
        'startDate': req.body.startDate,
        'endDate': req.body.endDate
    };

    var promocode = new Promocode(data);

    promocode.save(function(err,result){
        if(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }else {
            return res.json(result);
        }
    });
    
};

exports.list = function(req, res) {
    Promocode.find({}).sort('-created').exec(function(err, promoCodeList) {
        if(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage()
            });
        }else {
            res.json(promoCodeList);
        }    
    });
};
exports.update = function(req, res) {
    var promocode = _.extend(req.promoCode, req.body);
    promocode.save(function(err, udatedPromoCode) {
        if(err) {
            return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
            });
        }else {
            res.json(udatedPromoCode);
        }
    })
};
exports.delete = function(req, res) {
    var promoCode = req.promoCode;
    promoCode.remove(function(err, deletedPromoCode) {
        if(err) {
            return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
            });
        }else {
            res.json(deletedPromoCode);
        }
    })
};

exports.getPromoCodeById = function(req, res) {
    return res.send(req.promoCode);
}

/**
 * Fetch the promo code
 */
exports.getPromoCode = function(req,res) {
    var code = req.query.promoCode;
    var userId = req.query.userId;
    Promocode.findOne({promoCode:code, startDate:{$lte:new Date()},endDate:{$gte:new Date()}}).exec(function(err,promo){
        if(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }else {
            if(promo) {
                UsedPromocode.find({promoCode: promo._id,user:userId}).exec(function(err,usedPromo){
                    if (!err && usedPromo.length) {
                        return res.status(400).send({
                            message: "Promo code is already used"
                        });
                    }else {
                        return res.json(promo);
                    }
                })
            }else {
                return res.status(400).send({
                    message: "Invalid promo code"
                });
            } 
        }
    })
};

/**
 * Bottle middleware
 */
exports.promoCodeById = function (req, res, next, id) {
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
        message: 'Promocode is invalid'
    });
    }

    Promocode.findById(id).exec(function (err, promoCode) {
    if (err) {
        return next(err);
    } else if (!promoCode) {
        return res.status(404).send({
        message: 'No promocode with that identifier has been found'
        });
    }
    req.promoCode = promoCode;
    next();
    });
};