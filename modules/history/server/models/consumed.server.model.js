'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * History Schema
 */
    var consumedSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    hotel: {
        type: Schema.ObjectId,
        ref: 'Hotel'
    },
    bottle: {
        type: Schema.ObjectId,
        ref: 'Bottle'
    },
    consumedVolume: {
        type: Number,
        default: 0,
        trim: true
    },
    uniqueCode: {
        type: String,
        default: '',
        trim: true,
    },
    purchasedType: {
        type: String,
        default: ''
    },
    date: {
        type: String,
        default: ''
    },
    status: {
        type: Boolean,
        default: false
    }
});

mongoose.model('Consumed', consumedSchema);
