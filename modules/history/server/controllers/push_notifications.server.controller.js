'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  config = require(path.resolve('./config/config')),
  https = require('https'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Send a Notification
 */
exports.sendNotification = function (req, res) {
  var playerId = req.body.playerId,
    message = req.body.message,
    paymentReceiptId = req.body.paymentReceiptId;

  var headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': 'Basic ' + config.oneSignal.oneSignalApiKey
  };

  var options = {
    'host': 'onesignal.com',
    'port': 443,
    'path': '/api/v1/notifications',
    'method': 'POST',
    'headers': headers
  };

  var data = {
    app_id: config.oneSignal.oneSignalAppId,
    contents: { 'en': message },
    ios_badgeCount: 1,
    ios_badgeType: 'Increase',
    android_background_data: true
  };

  if (playerId !== '' && playerId !== undefined) {
    data.include_player_ids = [playerId];
  }

  data.data = {
    // 'message': message,
    // 'hotelName': hotelName,
    // 'bottleName': bottleName,
    // 'bottleCode': bottleCode,
    // 'quantity': quantity,
    // 'tax': tax,
    // 'cost': cost,
    'paymentReceiptId': paymentReceiptId
  };

  // console.info('----- Sending Push Notification -------');

  var request = https.request(options, function (response) {
    response.on('data', function (data) {
      console.log('Response:');
      console.log(JSON.parse(data));
    });
  });

  request.on('error', function (e) {
    console.log('ERROR:');
    console.log(e);

    return res.status(422).send({
      message: errorHandler.getErrorMessage(e)
    });
  });

  request.write(JSON.stringify(data));
  request.end();
  res.json({});
};
