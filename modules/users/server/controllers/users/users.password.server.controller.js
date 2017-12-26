'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  nodemailer = require('nodemailer'),
  async = require('async'),
  Passport = mongoose.model('Passport'),
  crypto = require('crypto'),
  postmark = require('postmark');

var smtpTransport = nodemailer.createTransport(config.mailer.options);
/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function (req, res, next) {
  async.waterfall([
    // Generate random token
    function (done) {
      crypto.randomBytes(20, function (err, buffer) {
        var token = buffer.toString('hex');
        done(err, token);
      });
    },
    // Lookup user by username
    function (token, done) {
      if (req.body.username) {
        // console.log('username', req.body.username);
        User.findOne({
          email: req.body.username
        }, '-salt -password', function (err, user) {
          if (!user) {
            return res.status(400).send({
              message: 'No account with that username has been found'
            });
          } else {
            Passport.findOne({
              provider: 'local',
              userId: user
            }, function (err, pass) {
              if (err) {
                return res.status(400).send({
                  message: 'No account with that email has been found'
                });
              } else {
                if (!pass) {
                  return res.status(400).send({
                    message: 'It seems like you signed up using your social account'
                  });
                } else {
                  user.resetPasswordToken = token;
                  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                  user.save(function (err) {
                    done(err, token, user);
                  });
                }
              }
            });
          }
        });
      } else {
        return res.status(400).send({
          message: 'Username field must not be blank'
        });
      }
    },
    function (token, user, done) {
      res.render(path.resolve('modules/users/server/templates/reset-password-email'), {
        name: user.displayName,
        appName: config.app.title,
        url: 'http://' + req.headers.host + '/api/auth/reset/' + token
      }, function (err, emailHTML) {
        done(err, emailHTML, user);
      });
    },
    // If valid email, send reset email using service
    function (emailHTML, user, done) {

      var client = new postmark.Client(config.mailer.postmarkServerToken);
      var options = {
        'From': config.mailer.from,
        'To': user.email,
        'Subject': 'Password Reset',
        'HtmlBody': emailHTML
      };
      client.sendEmail(options, function (err, success) {
        if (!err) {
          res.send({
            message: 'An email has been sent to the provided email with further instructions.'
          });
        } else {
            return res.status(400).send({
              message: 'Failure sending email'
            });
        }
      });    
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
};

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function (req, res) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function (err, user) {
    if (!user) {
      return res.redirect('/password/reset/invalid');
    }

    res.redirect('/password/reset/' + req.params.token);
  });
};

/**
 * Reset password POST from email token
 */
exports.reset = function (req, res, next) {
  // Init Variables
  var passwordDetails = req.body;
  var message = null;

  async.waterfall([

    function (done) {
      User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      }, function (err, user) {
        if (!err && user) {
          Passport.findOne({userId:user._id}, function(err, passport) {
            if (err) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              passport.password = passwordDetails.newPassword;
              passport.save(function(err, updated) {
                if (err) {
                  return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                  });
                } else {
                  user.resetPasswordToken = undefined;
                  user.resetPasswordExpires = undefined;
      
                  user.save(function (err) {
                    if (err) {
                      return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                      });
                    } else {
                      res.json({status: true, user: user, message: 'Password updated successfully'});
                    }
                  });
                }  
              });
            }  
          });
        } else {
          return res.status(400).send({
            message: 'Password reset token is invalid or has expired.'
          });
        }
      });
    },
    function (user, done) {
      res.render('modules/users/server/templates/reset-password-confirm-email', {
        name: user.displayName,
        appName: config.app.title
      }, function (err, emailHTML) {
        done(err, emailHTML, user);
      });
    },
    // If valid email, send reset email using service
    function (emailHTML, user, done) {
      var mailOptions = {
        to: user.email,
        from: config.mailer.from,
        subject: 'Your password has been changed',
        html: emailHTML
      };

      smtpTransport.sendMail(mailOptions, function (err) {
        done(err, 'done');
      });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
};

/**
 * Change Password
 */
exports.changePassword = function (req, res, next) {
  // Init Variables
  var passwordDetails = req.body;
  var userId = '';
  var message = null;
  if ( req.user || req.body.userId ) {
    if(req.body.userId) {
      userId = req.body.userId;
    } else {
      userId = req.user._id;
    }
    if (passwordDetails.newPassword) {
      User.findById(userId, function (err, user) {
        if (!err && user) {
          Passport.findOne({userId:user._id}, function(err, passport) {
            var returnVaule = passport.authenticate(passwordDetails.currentPassword);
            if (returnVaule === true) {
              if (err) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                passport.password = passwordDetails.newPassword;
                passport.save(function(err, updated) {
                  if (err) {
                    return res.status(400).send({
                      message: errorHandler.getErrorMessage(err)
                    });
                  } else {
                    res.send({status: true, message: 'Password changed successfully'});
                  }  
                });
              }
            } else {
            res.send({status:false, message: 'Current password is incorrect'});
          }  
          });
        } else {
          res.status(400).send({status: false, message: 'User is not found'});
        }
      });
    } else {
      res.status(400).send({status:false,
        message: 'Please provide a new password'
      });
    }
  } else {
    res.status(400).send({status:false,
      message: 'User is not signed in'
    });
  }
};


/**
 * Contact us
 */
exports.contactUs = function (req, res) {
  // Init Variables
  var message = req.body.message;
  var user = req.user;
  sendContactUsMail(user,message,req,res);
  return res.send(user);
};

function sendContactUsMail(user, message,req, res) {
  res.render('modules/users/server/templates/contactus-email', {
    name: user.displayName,
    email: user.email,
    phone: user.phone,
    message: message
  }, 
  function (err, emailHTML) {
      var client = new postmark.Client(config.mailer.postmarkServerToken);
    var options = {
      'From': config.mailer.from,
      'To': 'bvault.business@gmail.com',
      'Subject': 'You have new message from '+user.displayName,
      'HtmlBody': emailHTML
    };
    client.sendEmail(options, function (err, success) {
      if (!err) {
        console.info('Email Sent Successfully!');
      } else {
        console.info('Error sending mail');
        console.info(err);
      }
    });
  });
};

