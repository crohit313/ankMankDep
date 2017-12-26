'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  sha512 = require('js-sha512'),
  payumoney_shakey = require('payumoney-shakey'),
  config = require(path.resolve('./config/config')),
  crypto = require('crypto'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

exports.getServerGeneratedHash = function(req, res) {
  var hashRequest = req.body;
  var hash = getHash(hashRequest.key, hashRequest.txnid, hashRequest.amount, hashRequest.productinfo, hashRequest.firstname, hashRequest.email, config.payUMoney.salt);
  return res.json({payment_hash: hash});
}

function getHash(key, txnid, amount, productinfo, firstname, email, salt) {
  var shasum = crypto.createHash('sha512'),
  dataSequence = key + '|' + txnid + '|' + amount + '|' + productinfo + '|' + firstname + '|' + email + '|||||||||||' + salt;
  var resultKey = shasum.update(dataSequence).digest('hex');
  return resultKey;       
};