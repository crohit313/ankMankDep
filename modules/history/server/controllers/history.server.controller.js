'use strict'

// Require dependencies

  var path = require('path'),
      _ = require('lodash'),
      mongoose = require('mongoose'),
      Consumed = mongoose.model('Consumed'),
      consumedModelName = 'Consumed',
      Rack = mongoose.model('Rack'),
      randomstring = require("randomstring"),
      Hotel = mongoose.model('Hotel'),
      rackModelName = 'Rack',
      Activity = mongoose.model('Activity'),
      Promise = require('promise'),
      Async = require('async'),
      postmark = require('postmark'),
      config = require(path.resolve('./config/config')),
      itemsPerPage = 15,
      itemsPerPageForSuperAdmin = 100,
      uniqueCodeSetting = {length: 6,charset: 'alphanumeric',capitalization: 'uppercase'},
      errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

    


  // Apis

  exports.deductVolumeByCode = function(req, res) {

    if(req.body.uniqueCode && req.body.consumedVolume) {
      Rack.find({uniqueCode: req.body.uniqueCode, uniqueCodeExpiry:{$gte:new Date()}}, function(err, rackItem) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          var rackItemObj = rackItem[0];
          if(rackItemObj.remainingVolume >= req.body.consumedVolume) {
            rackItemObj.remainingVolume = rackItemObj.remainingVolume - req.body.consumedVolume;
            rackItemObj.uniqueCode = randomstring.generate(uniqueCodeSetting);
            rackItemObj.save(function(err, updated) {
              if (err) {
                return res.status(422).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                saveConsumed(req, res, rackItem).then(function(result) {
                    res.send({status: true, data:result, message: req.body.consumedVolume+' Volume deducted from the user account successfully'});
                });    
              }    
            }); 
          } else {
            res.json({message: 'Insufficient volume in user account'});
          }
        }
      });
    }
  };

  function saveConsumed(req, res, rackItem){
    var invoice = req.body;
    return new Promise(function (resolve, reject){
      var currentDate = new Date();
      var consumedObj = {
        
        user: rackItem[0].user,
        bottle: rackItem[0].bottle,
        hotel: invoice.hotelId,
        consumedVolume: invoice.consumedVolume,
        uniqueCode: invoice.uniqueCode,
        purchasedType: rackItem[0].purchasedType,
        date:currentDate.toLocaleDateString()

      }
      
      var consumed = new Consumed(consumedObj);
      consumed.save(function(err, saved) {
        if (err) {
          reject(err);
        } else {
          var consumedObj = saved.toObject();
          var activityObj = {
            user: rackItem[0].user,
            action: 'Consumed',
            object: consumedObj._id,
            refTable: consumedModelName,
            date:currentDate.toLocaleDateString()
          }

          sendInvoiceMail(req,res);
          var activity = new Activity(activityObj);
          activity.save(function(err, saved) {
            if(err){
              reject(err);
            } else {
              resolve(saved);
            }
          });
        }
      });
    });
  };

  function sendInvoiceMail(req, res) {
    var invoice = req.body;
    var currentDate = new Date();
    var emailTempletData = {
      hotelName: invoice.hotelName,
      date: currentDate.toLocaleDateString(),
      userName: invoice.userName,
      bottleName: invoice.bottleName,
      uniqueCode: invoice.uniqueCode,
      quantity: invoice.consumedVolume,
      unit: invoice.unit,
      cost: invoice.cost,
      taxPercentage: invoice.taxPercentage,
      tax: invoice.tax,
      status: invoice.status,
      hotelEmail: invoice.hotelEmail,
      userEmail: invoice.userEmail
    }
    
    if (emailTempletData) {
      res.render('modules/history/server/templates/payment-invoice', {
        invoice: emailTempletData
      },
      function (err, emailHTML) {
        var options = [
          {
            'From': config.mailer.from,
            'To': emailTempletData.userEmail,
            'Subject': 'Payment receipt from '+emailTempletData.hotelName,
            'HtmlBody': emailHTML
          },
          {
            'From': config.mailer.from,
            'To': emailTempletData.hotelEmail,
            'Subject': 'Payment receipt from '+emailTempletData.hotelName,
            'HtmlBody': emailHTML
          },
          {
            'From': config.mailer.from,
            'To': 'bvault.business@gmail.com',
            'Subject': 'Payment receipt from '+emailTempletData.hotelName,
            'HtmlBody': emailHTML
          }
        ];

        var client = new postmark.Client(config.mailer.postmarkServerToken);
        client.sendEmailBatch(options, function (err, success) {
          if (!err) {
            console.info('Email Sent Successfully!');
          } else {
            console.info('Error sending mail');
            console.info(err);
          }
        });
      });
    }
  };

  exports.read = function(req, res) {
    var skipNumber = 0;
    if(req.query.pageNumber) {
      skipNumber = itemsPerPage*(req.query.pageNumber - 1);
      // Activity.find({user: req.query.userId}).populate({path:'object', populate:{path: 'bottle hotel', select: '_id name unit address'}}).skip(skipNumber).limit(itemsPerPage).sort('-created').exec(function(err, activityList) {
      Activity.find({user: req.query.userId}).populate({path:'object', populate:{path: 'bottle', select: '_id name unit'}}).skip(skipNumber).limit(itemsPerPage).sort('-created').exec(function(err, activityList) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          if(activityList.length) {
            populateHotel(activityList).then(function(populatedHotel) {
              res.json(populatedHotel)
            }, function(err) {
              return res.status(422).send({
                message: errorHandler.getErrorMessage(err)
              });
            });
          } else {
            res.json(activityList);
          }
        }  
      });
    } else {
      return res.send({message: 'Invalid page number'});
    }
  };

  function populateHotel(activityList){
    return new Promise(function (resolve, reject){
      var tempActivityList = [];
      Async.forEach(activityList,function(singleActivity,callback) {
        var activity = singleActivity.toObject();
        if(activity.action == 'Consumed') {
          Hotel.findOne({_id: activity.object.hotel}, function(err, hotel) {
            if(!err) {
              activity.object.hotel = {};
              activity.object.hotel=hotel
              tempActivityList.push(activity);
            } else {
              tempActivityList.push(activity);
            }
            callback();                                
          });
        } else {
          tempActivityList.push(activity);
          callback();                              
        }
      },function(err,data) {
        //sort the array in descending order by date
        tempActivityList.sort(function(a,b){
          return new Date(b.created) - new Date(a.created);
        });
        resolve(tempActivityList);
      });
      
    })
  };  