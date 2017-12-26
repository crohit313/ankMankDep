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
var PromocodeSchema = new Schema({
    promoCode: {
        type: String,
        trim: true,
        default: '',
        index: {
            unique: true,
            sparse: true // For this to work on a previously indexed field, the index must be dropped & the application restarted.
          },
        validate: [validateLocalStrategyProperty, 'Please enter promo code']
    },
    // percDiscount: {
    //     type: Number,
    //     default: 0,
    // },
    minAmmountForDiscount: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: Date.now
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
});

mongoose.model('Promocode', PromocodeSchema);