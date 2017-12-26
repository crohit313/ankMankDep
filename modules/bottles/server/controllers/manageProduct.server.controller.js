'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Hotel = mongoose.model('Hotel'),
  ProductManagement = mongoose.model('ProductManagement'),
  _   = require('lodash'),
    geolib = require('geolib'),
    Async = require('async'), 
    itemsPerPage = 8,
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


exports.productByHotelId = function(req, res) {
  ProductManagement.findOne({hotel: req.query.hotelId},function(err, hotelProduct) {
    if (err) {
        return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
        });
    } else {
      if(hotelProduct == null) {
        return res.json({status: false, message: 'Products not selected yet'});
      } else {
        return res.json(hotelProduct);
      }
    }
  });
};

exports.checkBottleInStockById = function(req, res) {
  ProductManagement.find({ hotel: req.query.hotelId}, {products:{$elemMatch:{'bottleId':""+req.query.bottleId}}}).exec(function(err, data) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      if(data.length && data[0].products.length && data[0].products[0].checked) {
        res.json({status: true, message: 'Bottle is in stock for this hotel', data: data});
      } else {
        res.json({status: false, message: 'Bottle is out stock for this hotel', data: data});
      }
    }
  });  
};

exports.addManageProductRecord = function(req, res) {
  var manageProductObject = {
    hotel: req.body.hotelId,
    products: req.body.products
  };
  var hotelProduct = new ProductManagement(manageProductObject);
  
  hotelProduct.save(function(err, hotelProduct) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(hotelProduct);
    }
  });
};

exports.updateManageProductRecord = function(req, res) {

  var updatedHotelProduct = req.hotelProduct;
  updatedHotelProduct.products = [];
  updatedHotelProduct.products = req.body.products;
  updatedHotelProduct.save(function(err, updatedHotelProduct) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(updatedHotelProduct);
    }  
  });
};

/**
 * Manage product Middleware
 */
exports.manageProductByID = function (req, res, next, id) {
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'product is invalid'
    });
  }

  ProductManagement.findById(id).exec(function (err, hotelProduct) {
    if (err) {
      return next(err);
    } else if (!hotelProduct) {
      return res.status(422).send({
        message: 'No product with that identifier has been found'
      });
    }
    req.hotelProduct = hotelProduct;
    next();
  });
};  
