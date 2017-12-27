'use strict';

/**
 * Module dependencies.
 */
var config = require('../config'),
	mongoose = require('./mongoose'),
	mongo = require('mongoose'),
	express = require('./express'),
	chalk = require('chalk'),
	Async = require('async');	

// Initialize Models
mongoose.loadModels();
module.exports.loadModels = function loadModels() {
	mongoose.loadModels();
};

module.exports.init = function init(callback) {

	mongoose.connect(function (db) {
		// Initialize express
		var app = express.init(db);
		if (callback) callback(app, db, config);

	});
};

module.exports.start = function start(callback) {
	var _this = this;
	var User = mongo.model('User'),
		Passport = mongo.model('Passport');
	
	_this.init(function(app, db, config) {

		// Start the app by listening on <port>
		app.listen(config.port, function() {

			// Logging initialization
			console.log('--');
			console.log(chalk.green(config.app.title));
			console.log(chalk.green('Environment:\t\t\t' + process.env.NODE_ENV));
			console.log(chalk.green('Port:\t\t\t\t' + config.port));
			console.log(chalk.green('Database:\t\t\t\t' + config.db.uri));
			if (process.env.NODE_ENV === 'secure') {
				console.log(chalk.green('HTTPs:\t\t\t\ton'));
			}
			console.log('--');
			createSuperAdmin();

			if (callback) callback(app, db, config);
		});

	});
	function createSuperAdmin () {
		User.find({}, function(err, users) {
			if (err) {
				// console.log('err', err);
			} else if(!users.length) {
				//Single super admin//
				console.log('hello in super')
				var superAdmin = {
					displayName : 'superAdmin',
					username : 'superAdmin',
					phone : '(888)-894-4443',
					imageUrl : 'modules/users/client/img/profile/default.png',
					roles : ['user', 'admin',
							'superAdmin'
					],
					email : 'bvault.business@gmail.com',
					lastName : 'Bvault',
					firstName : 'superAdmin',
				};
				var superUser = new User(superAdmin);
				superUser.save(function(err,saved) {
					if(!err) {
						var pass = new Passport();
						pass.provider = 'local';
						pass.password = 'superAdmin';
						pass.userId = superUser;
						// Remove sensitive data before login
						pass.save( function(err, savedPassport) {
							if (err) {
								return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
								});
							}
						});		
					}
				});			

				//Multiple superAdmin//
				// var superAdminArray = [],
				// 	superAdmin = {};
				// for(var i=0; i<3; i++) {
				// 	superAdmin = {
				// 		displayName : 'superAdmin '+i,
				// 		username : 'superAdmin '+i,
				// 		phone : '(789)-789-7867',
				// 		imageUrl : 'modules/users/client/img/profile/default.png',
				// 		roles : ['user', 'admin',
				// 				'superAdmin'
				// 		],
				// 		email : 'bvault.business+'+i+'@gmail.com',
				// 		lastName : 'Xarba',
				// 		firstName : 'superAdmin '+i,
				// 	};
				// 	superAdminArray.push(superAdmin);
				// };
				// Async.each(superAdminArray,function(superAdminObj, done) {
				// 	var superUser = new User(superAdminObj);
				// 	superUser.save(function(err,saved) {
				// 		if(!err) {
				// 			var pass = new Passport();
				// 			pass.provider = 'local';
				// 			pass.password = 'superAdmin';
				// 			pass.userId = superUser;
				// 			// Remove sensitive data before login
				// 			pass.save( function(err, savedPassport) {
				// 				if (err) {
				// 					return res.status(400).send({
				// 					message: errorHandler.getErrorMessage(err)
				// 					});
				// 				}
				// 			});		
				// 		}
				// 	})
					
				// })
			} else {
				// console.log('********* superAdmin exist *************');
			}
		})
		
	};

};
