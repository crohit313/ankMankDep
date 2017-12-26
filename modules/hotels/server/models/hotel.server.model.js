'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * hotel Schema
 */
var hotelSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
   name: {
    type: String,
    default: '',
    required: 'Name is required',
    trim: true
  },
  admin: {
    ref: 'User',
    type: Schema.ObjectId,
  },
  address: {
    type: String,
    default: '',
    required: 'Address is required',    
    trim: true
  },
  city: {
    type: String,
    default: '',
    // required: 'City is required',
    trim: true
  },
  zipcode: {
    type: Number,
    trim: true
  },
  phone: {
    type: String,
    required: 'Phone number is required',    
    trim: true
  },
  type: {
    type: String,
    default:'',
    trim: true
  },
  imageUrl: {
    type: Array,
    default:[]
  },
  lat: {
    type: Number,
    trim: true
  },
  lng: {
    type: Number,
    trim: true
  },
  distance: {
    type: String,
    default: '0'
  },
  music: {
    type: String,
    default: '',
    trim: true
  },
  cuisine: {
    type: String,
    default: '',
    trim: true
  },
  cost: {
    type: Number,
    default: 0,
    trim: true
  },
  taxPercentage: {
    type: Number,
    default: 0,
    trim: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }

});

mongoose.model('Hotel', hotelSchema);
