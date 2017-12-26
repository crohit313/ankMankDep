'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Bottle Schema
 */
    var advertisementSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        required: 'Name is required'
    },
    description: {
        type: String,
        default: ''
    },
    startDate: {
        type: Date,
        required: 'Start Date is required'
    },
    endDate: {
        type: Date,
        required: 'End Date is required'
    },
    imageUrl: {
        type: String,
        default: 'modules/users/img/profile/default.png',
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,

    }
});

mongoose.model('advertisement', advertisementSchema);
