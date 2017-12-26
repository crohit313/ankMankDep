'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Advertisement = mongoose.model('advertisement'),
    _   = require('lodash'),
    Async = require('async'),
    ObjectId = mongoose.ObjectID,
    fs = require('fs'),
    itemsPerPage = 8,
    config = require(path.resolve('./config/config')),     
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
   

    /**
 * Create an advertisement
 */
exports.create = function (req, res) {
  var advertisement = new Advertisement(req.body);

  advertisement.save( function(err, saved) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
       return res.json(advertisement);
    }
  })
};

exports.getCredentials = function (req, res) {

res.send(config.aws);

};
/**
 * Show the current advertisement
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var advertisement = req.advertisement ? req.advertisement.toJSON() : {};
  return res.json(advertisement);
};

/**
 * Delete the current advertisement
 */
exports.deleteAdvertisement = function(req, res) {

  var advertisement = req.advertisement;
  advertisement.remove(function(err, deleted) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(advertisement);
    }
  });
};

/**
 * Update the current advertisement
 */
exports.updateAdvertisement = function(req, res) {

  var advertisement = _.extend(req.advertisement, req.body);
  advertisement.save( function(err, updatedAdvertisement) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(advertisement);
    }
  });
};

/**
 * List of advertisements
 */
exports.getAdvertisementList = function (req, res) {
  var skipNumber  = 0;
  if(req.query.pageNumber) {
    skipNumber = itemsPerPage*(req.query.pageNumber - 1);
  }
  Advertisement.find({}).skip(skipNumber).limit(itemsPerPage).sort('created').exec(function (err, advertisementList) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(advertisementList);
    }
  });
};

/**
 * List of advertisements by current date
 */
exports.getAdvertisementListByDate = function (req, res) {

  Advertisement.find({$and:[{startDate:{$lte:new Date()}},{endDate:{$gte:new Date()}},{isActive: true}]}).sort('-created').exec(function (err, advertisementList) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(advertisementList);
    }
  });
}; 



/**
 * advertisement middleware
 */
exports.advertisementById = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Advertisement is invalid'
    });
  }

  Advertisement.findById(id).exec(function (err, advertisement) {
    if (err) {
      return next(err);
    } else if (!advertisement) {
      return res.status(422).send({
        message: 'No advertisement with that identifier has been found'
      });
    }
    req.advertisement = advertisement;
    next();
  });
};
