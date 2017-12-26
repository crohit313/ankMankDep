'use strict'

//Dependencies

var mongoose = require('mongoose'),
Schema = mongoose.Schema;

//Drink Type Schema

var drinkTypeSchema = new Schema({
    created:{
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        required: 'Drink type name is required',
        trim: true
    },
    unit: {
        type: String,
        required: 'Drink type unit is required',
        trim: true
    },
});

mongoose.model('DrinkType', drinkTypeSchema);