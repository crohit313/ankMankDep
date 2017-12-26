'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Bottle = mongoose.model('Bottle'),
  Hotel = mongoose.model('Hotel'),
  ProductManagement = mongoose.model('ProductManagement'),
  _  = require('lodash'),
  Async = require('async'),
  geolib = require('geolib'),  
  itemsPerPage = 8,    
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a bottle
 */
exports.create = function (req, res) {
  var bottle = new Bottle(req.body);
  bottle.user = req.user;

  bottle.save(function (err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(bottle);
    }
  });
};

/**
 * Show the current bottle
 */
exports.read = function (req, res) {
  return res.json(req.bottle);
};

/**
 * Update a bottle
 */
exports.update = function (req, res) {

  req.body.__v = req.bottle.__v;
  var bottle = _.extend(req.bottle, req.body);
  bottle.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(bottle);
    }
  });
};

/**
 * Delete an bottle
 */
exports.delete = function (req, res) {
  var bottle = req.bottle;

  bottle.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(bottle);
    }
  });
};

/**
 * List of Bottles
 */
exports.list = function (req, res) {
  var skipNumber  = 0;
  if(req.query.pageNumber) {
    skipNumber = itemsPerPage*(req.query.pageNumber - 1);
  }
  Bottle.find({}).skip(skipNumber).limit(itemsPerPage).sort('name').populate('type').exec(function (err, bottles) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(bottles);
    }
  });
};
/**
 * List of Bottles
 */
exports.bottleListByDrinkType = function (req, res) {
  Bottle.find({type: req.query.typeId}).sort('name').populate('type').exec(function (err, bottles) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(bottles);
    }
  });
};
exports.bottleListByDrinkTypeFilter = function (req, res) {
  var skipNumber  = 0;
  if(req.query.pageNumber) {
    skipNumber = itemsPerPage*(req.query.pageNumber - 1);
  }
  Bottle.find({type: req.query.drinkTypeId}).skip(skipNumber).limit(itemsPerPage).sort('name').populate('type').exec(function (err, bottles) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(bottles);
    }
  });
};

exports.hotelsByBottleId = function(req, res) {

  ProductManagement.find({"products.bottleId": req.query.bottleId}).exec(function(err, hotelListByBottleId) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      hotelListByBottleId = _.filter(hotelListByBottleId, function(hotel) {
        var isContain = _.some(hotel.products, function (product) {
          return product.checked === true && product.bottleId === req.query.bottleId;
        });
        if (isContain) return hotel;
      });
      if(req.query.lat && req.query.lng && hotelListByBottleId.length) {
        var hotelList = [];
        Async.each(hotelListByBottleId,function(manageHotelProduct, done) {
            Hotel.findOne({_id: manageHotelProduct.hotel, isDeleted: false}, function(err, hotelDetail) {
              var distance = null;
              if (hotelDetail) {
                distance = geolib.getDistance(
                  {latitude: req.query.lat, longitude: req.query.lng},
                  {latitude: hotelDetail.lat, longitude: hotelDetail.lng}
                );
                hotelDetail.distance = distance/1000;
                hotelList.push(hotelDetail);
              }
              done();
            });
        }, function(err){
          if(hotelList.length) {
            hotelList.sort(function(a, b){return a.distance - b.distance}); 
            res.send(hotelList);
          } else {
            res.send(hotelList);
          }
        });
      } else {
        if(hotelListByBottleId.length) {
          var hotelList = [];
          Async.each(hotelListByBottleId,function(manageHotelProduct, done) {
              Hotel.findOne({_id: manageHotelProduct.hotel, isDeleted: false}, function(err, hotelDetail) {
                if (hotelDetail) {
                  hotelList.push(hotelDetail);
                }
                done();                        
              });
          }, function(err){
            res.send(hotelList);         
          });
        } else {
          res.send(hotelListByBottleId);
        }
      }
    }
  });
};

/**
 * Bottle middleware
 */
exports.bottleByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Bottle is invalid'
    });
  }

  Bottle.findById(id).exec(function (err, bottle) {
    if (err) {
      return next(err);
    } else if (!bottle) {
      return res.status(404).send({
        message: 'No bottle with that identifier has been found'
      });
    }
    req.bottle = bottle;
    next();
  });
};
