'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Rack = mongoose.model('Rack'),
    rackModelName = 'Rack',
    Activity = mongoose.model('Activity'),
    Bottle = mongoose.model('Bottle'),    
    UsedPromocode = mongoose.model('UsedPromocode'),    
    _   = require('lodash'),
    randomstring = require("randomstring"),
    Async = require('async'),
    ObjectId = mongoose.ObjectID,
    expireAfterDayPlatinum = 180, // Expiry Day for platinum
    expireAfterDayGold = 60,      //Expriy day for gold
    expireAfterDaySilver = 10,    // Expiry day for silver
    currentDate = new Date(),    
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    uniqueCodeSetting = {length: 6,charset: 'alphanumeric',capitalization: 'uppercase'};

/**
 * Create an rack
 */
exports.create = function (req, res) {
  var rackArray = [];
  var bottles = req.body.bottles;
  var userId = req.body.userId;
  var isValid = req.body.isValid;

  // isValid flag is used to verify puchases made by valid user
  // do not remove this flag
  if (isValid) {
    if(bottles && bottles.length) {
      Async.each(bottles,function(bottle, done) {
        var uniqueCode = randomstring.generate(uniqueCodeSetting);
        Bottle.findById(bottle.bottle_id, function(err, dbBottle) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            if(dbBottle && dbBottle!== null && dbBottle.price && dbBottle.price.length) {
              var bottleVolume = 0 ;
              var costPerUnit = 0;
              for(var i=0; i<dbBottle.price.length; i++) {
                if(bottle.purchasedType === 'Platinum' && dbBottle.price[i].label === 'Platinum') {
                  bottleVolume = dbBottle.price[i].volume;
                  costPerUnit = dbBottle.price[i].price /  dbBottle.price[i].volume;
                  break;
                } else if(bottle.purchasedType === 'Gold' && dbBottle.price[i].label === 'Gold') {
                  bottleVolume = dbBottle.price[i].volume;
                  costPerUnit = dbBottle.price[i].price /  dbBottle.price[i].volume;
                  break;
                }else if(bottle.purchasedType === 'Silver' && dbBottle.price[i].label === 'Silver') {
                  bottleVolume = dbBottle.price[i].volume;
                  costPerUnit = dbBottle.price[i].price /  dbBottle.price[i].volume;
                  break;
                }
              };

              var rackObj = {
                user: userId,
                bottle: bottle.bottle_id,
                totalVolume: bottleVolume * bottle.qty,
                remainingVolume: bottleVolume * bottle.qty,
                uniqueCode: uniqueCode,
                uniqueCodeExpiry: setExpiryDate(bottle.purchasedType),
                purchasedType: bottle.purchasedType,
                costPerUnit: costPerUnit,
                date: currentDate.toLocaleDateString()
              };
              rackArray.push(rackObj);  
            }                  
          }
          done();
        });
      }, function(){
          Rack.insertMany(rackArray, function (err, rackItemList){ 
            if (err) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              saveActivity(rackItemList, userId).then(function(activityList){
                if(req.body.promoCodeId) {
                  savePromoCodeUsage({promoCode: req.body.promoCodeId, user:userId}).then(function(savePromoCodeUsage) {
                    res.json(rackItemList);              
                  }, function(err) {
                    return res.status(400).send({
                      message: errorHandler.getErrorMessage(err)
                    });
                  });  
                } else {
                  res.json(rackItemList);                            
                }
              }, function(err) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
                });
              });
            }
          });
      });
    } 
  }else {
    return res.status(400).send({
      message: 'Invalid User'
    });
  }
};
function setExpiryDate (purchaseType) {

  var expiryDate ='';
  if(purchaseType == 'Platinum') {
    return expiryDate = new Date(currentDate.getTime() + (expireAfterDayPlatinum * 24 * 60 * 60 * 1000));    
  } else if(purchaseType == 'Gold') {
    return expiryDate = new Date(currentDate.getTime() + (expireAfterDayGold * 24 * 60 * 60 * 1000));    
  } else if(purchaseType == 'Silver') {
    return expiryDate = new Date(currentDate.getTime() + (expireAfterDaySilver * 24 * 60 * 60 * 1000));        
  } else {
    expiryDate = '';
    return expiryDate;
  }
};
function saveActivity(rackItemList, userId) {
  return new Promise(function (resolve, reject){
    var activityArray = [];
    Async.each(rackItemList, function(purchasedItem, done){
      var activityObj = {
        user: userId,
        action: 'Purchased',
        object: purchasedItem._id,
        refTable: rackModelName,
        date: currentDate.toLocaleDateString()
      };
      activityArray.push(activityObj);
      done();
    }, function(done) {
      Activity.insertMany(activityArray, function(err, saved) {
        if (err) {
          reject(err);
        } else {
          resolve(saved);
        }
      });
    });
  });
};

function savePromoCodeUsage(usedPromoCodeObject) {
  return new Promise(function (resolve, reject){
    var promoObject = new UsedPromocode(usedPromoCodeObject);
    promoObject.save(function(err, saved) {
      if(err) {
        reject(err);
      } else {
        resolve(saved);
      }
    });
  });  
};
/**
 * Show the current rack
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var rack = req.rack ? req.rack.toJSON() : {};
  res.json(rack);
};

exports.verifyUniqueCode = function (req, res) {
  Rack.find({uniqueCode: req.query.uniqueCode, uniqueCodeExpiry:{$gte:new Date()}}).populate(['user', 'bottle']).exec(function(err, detail) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(detail);
    }
  });
};


/**
 * List of racks
 */
exports.rackListByUserId = function (req, res) {
  Rack.find({user: req.query.userId,uniqueCodeExpiry:{$gte:new Date()},remainingVolume: {$gt: 0}}).populate('bottle').sort('-created').exec(function (err, racks) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(racks);
    }
  });
};

/**
 * rack middleware
 */
exports.rackById = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Rack is invalid'
    });
  }

  Rack.findById(id).exec(function (err, rack) {
    if (err) {
      return next(err);
    } else if (!rack) {
      return res.status(422).send({
        message: 'No rack with that identifier has been found'
      });
    }
    req.rack = rack;
    next();
  });
};
