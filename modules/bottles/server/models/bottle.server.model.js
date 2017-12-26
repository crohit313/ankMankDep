'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Bottle Schema
 */
var BottleSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    required: 'Name is required',
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  brand: {
    type: String,
    default: '',
    trim: true
  },
  type: {
    type: Schema.ObjectId,
    ref: 'DrinkType',
    required: 'Drink type is required'
  },
  price: {
    type: Array,
    required: 'Price is required'
  },
  imageUrl: {
    type: String,
    required: 'Bottle image is required',
    trim: true,
  },
  unit: {
    type: String,
    required: 'Unit is required',
    trim: true,
  },
});

mongoose.model('Bottle', BottleSchema);
