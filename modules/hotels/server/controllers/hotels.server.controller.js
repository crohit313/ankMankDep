'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Hotel = mongoose.model('Hotel'),
  Consumed = mongoose.model('Consumed'),
  ProductManagement = mongoose.model('ProductManagement'),
  User = mongoose.model('User'),  
  _   = require('lodash'),
    geolib = require('geolib'),
    Async = require('async'), 
    itemsPerPage = 8,
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an hotel
 */
exports.create = function (req, res) {
  var hotel = new Hotel(req.body);
  hotel.user = req.user;

  hotel.save(function (err, hotel) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(hotel);
    }
  });
};


/**
 * Show the current hotel
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var hotel = req.hotel ? req.hotel.toJSON() : {};
  res.json(hotel);
};

/**
 * Update an hotel
 */
exports.update = function (req, res) {
  req.body.__v = req.hotel.__v;
  var hotel = _.extend(req.hotel, req.body);
  hotel.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(hotel);
    }
  });
};

/**
 * Delete an hotel
 */
exports.delete = function(req, res) {
  var hotel = req.hotel;
  hotel.isDeleted = true;
  var adminId = req.hotel.admin;
  
  hotel.save( function(err, hotelDeleted) {
    if(err) {
      return res.status(422).send({
        message:errorHandler.getErrorMessage(err)
      });
    } else {
      if(adminId) {
        User.findById(adminId).exec(function (err, user) {
          if (err) {
            return res.status(422).send({
              message:errorHandler.getErrorMessage(err)
            });          
          } else{
            user.remove(function(err, userDeleted) {
              if (err) {
                return res.status(422).send({
                  message:errorHandler.getErrorMessage(err)
                });          
              } else{
                res.json(hotel);                            
              }  
            });
          }
        });
      } else {
        res.json(hotel);        
      }
    }
  });
};
/**
 * List of hotels
 */
exports.list = function (req, res) {
  var skipNumber = 0;
  if(req.query.pageNumber) {
    skipNumber = itemsPerPage*(req.query.pageNumber - 1);
  }
  Hotel.find({isDeleted: false}).skip(skipNumber).limit(itemsPerPage).sort('-created').exec(function (err, hotels) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var hotelList = [];
      if(req.query.lat && req.query.lng) {
        Async.each(hotels,function(hotel, done) {
          var distance = null;
          distance = geolib.getDistance(
                {latitude: req.query.lat, longitude: req.query.lng},
                {latitude: hotel.lat, longitude: hotel.lng}
              );
          hotel.distance = distance/1000;
          hotelList.push(hotel);    
          done();
        }, function(err){
          if(hotelList.length) {
            hotelList.sort(function(a, b){return a.distance - b.distance});
            res.send(hotelList);
          } else {
            res.send(hotelList);
          }
        });
      } else {
        res.json(hotels);       
      }  
    }
  });
};

/**
 * List of hotels for mobile
 */
exports.getHotelsForMobile = function (req, res) {
  Hotel.find({isDeleted: false}).exec(function (err, hotels) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var hotelList = [];
      if(req.query.lat && req.query.lng) {
        Async.each(hotels,function(hotel, done) {
          var distance = null;
          distance = geolib.getDistance(
                {latitude: req.query.lat, longitude: req.query.lng},
                {latitude: hotel.lat, longitude: hotel.lng}
              );
          hotel.distance = distance/1000;
          hotelList.push(hotel);    
          done();
        }, function(err){
          if(hotelList.length) {
            hotelList.sort(function(a, b){return a.distance - b.distance});
            res.send(hotelList);
          } else {
            res.send(hotelList);
          }
        });
      } else {
        res.json(hotels);       
      }  
    }
  });
};

exports.getHistoryByHotelId = function(req, res) {
  var skipNumber = 0;
  if(req.query.pageNumber) {
    skipNumber = parseInt(req.query.itemsPerPageForSuperAdmin)*(req.query.pageNumber - 1);
    // .skip(skipNumber).limit(parseInt(req.query.itemsPerPageForSuperAdmin))
    Consumed.find({hotel: req.query.hotelId}).populate('hotel bottle', '_id name city unit').populate('user', 'name email displayName').populate({path:'bottle', populate:{path: 'type', select:'type'}}).sort('-created').exec(function(err, historyList) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        calculateCost(historyList).then(function(historyListWithCost) {
          res.json(historyListWithCost);
        }, function(err) {
          res.json(historyList);          
        });
      }  
    });
  } else {
    return res.send({message: 'Invalid page number'});
  }
};

function calculateCost(historyList){
  var updatedHistoryList = [];
  return new Promise(function (resolve, reject){
    Async.each(historyList, function(history, done){
      var history = history.toObject();
      ProductManagement.find({ hotel: history.hotel._id},{products:{$elemMatch:{bottleId: ""+history.bottle._id}}}, function(err, data) {
        var productCostByHotelTemp = data[0].toObject();
        history.manageHotelProduct = productCostByHotelTemp;        
        updatedHistoryList.push(history);
          done();
      });
    }, function(done) {
      resolve(updatedHistoryList);
    });
  });
};

exports.updatePaymentStatus = function(req, res) {
  var consumed = _.extend(req.consumed, req.body);
  consumed.save(function(err, updated) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(updated);
    }
  });
};
/**
 * Hotel By Admin Id
 */
exports.hotelByAdminId = function (req, res) {
  Hotel.find({admin: req.query.adminId}).populate('admin').exec(function(err, hotel) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(hotel);
    }      
  });
};

exports.productByHotelId = function(req, res) {
  ProductManagement.find({hotel: req.query.hotelId}).sort('created').exec(function(err, products) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(products);
    }
  });
};

exports.addManageProductRecord = function(req, res) {
  var manageProductObject = {
    hotel: req.body.hotelId,
    products: req.body.products
  };
  var hotelProduct = new ProductManagement(manageProductObject);
  product.save(function(err, hotelProduct) {
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
  var updatedHotelProduct = _.extend(req.hotelProduct, req.body);
  updatedHotelProduct.save(function(err, updatedHotelProduct) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(hotelProduct);
    }  
  });
};
/**
 * hotel middleware
 */
exports.hotelByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Hotel is invalid'
    });
  }

  Hotel.findById(id).populate('admin').exec(function (err, hotel) {
    if (err) {
      return next(err);
    } else if (!hotel) {
      return res.status(422).send({
        message: 'No hotel with that identifier has been found'
      });
    }
    req.hotel = hotel;
    next();
  });
};
/**
 * Consumed Middleware
 */
exports.consumedByID = function (req, res, next, id) {
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'report is invalid'
    });
  }

  Consumed.findById(id).exec(function (err, consuemdItem) {
    if (err) {
      return next(err);
    } else if (!consuemdItem) {
      return res.status(422).send({
        message: 'No report with that identifier has been found'
      });
    }
    req.consumed = consuemdItem;
    next();
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
