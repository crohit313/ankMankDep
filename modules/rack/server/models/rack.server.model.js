'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Bottle Schema
 */
    var RackSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    bottle: {
        type: Schema.ObjectId,
        ref: 'Bottle'
    },
    totalVolume: {
        type: Number,
        default: 0,
        trim: true
    },
    remainingVolume: {
        type: Number,
        default: 0,
        trim: true
    },
    uniqueCode: {
        type: String,
        default: '',
        trim: true,
    },
    uniqueCodeExpiry: {
        type: Date,
    },
    purchasedType: {
        type: String,
        default: ''
    },
    costPerUnit: {
        type: Number,
        default: 0
    },
    date: {
        type: String,
        default: ''
    },
});

mongoose.model('Rack', RackSchema);
