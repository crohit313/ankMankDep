'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    validator = require('validator'),
    Schema = mongoose.Schema;

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function (property) {
    return ((this.provider !== 'local' && !this.updated) || property.length);
  };

/**
 * Promo Code Schema
 */
var UsedPromocodeSchema = new Schema({
    promoCode: {
        type: Schema.ObjectId,
        ref: 'Promocode'
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
});

mongoose.model('UsedPromocode', UsedPromocodeSchema);