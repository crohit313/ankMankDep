'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  User = mongoose.model('User');

/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables
  var user = req.user;
  // console.log('this is the user', user);
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  if (user) {
    // Merge existing user
    user = _.extend(user, req.body);
    user.updated = Date.now();
    user.displayName = user.firstName + ' ' + user.lastName;

    user.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.login(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.json(user);
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};


/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};

exports.userByID = function (req, res, next, id) {
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: 'User is invalid'
      });
    }
  
    User.findById(id).exec(function (err, user) {
      if (err) {
        return next(err);
      } else if (!user) {
        return res.status(422).send({
          message: 'No user with that identifier has been found'
        });
      }
      req.user = user;
      next();
    });
  };
  