var path = require('path'),
mongoose = require('mongoose'),
DrinkType = mongoose.model('DrinkType'),
    _  = require('lodash'),
errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


// Create Drink Type
exports.create = function(req, res) {
    var drinkType = new DrinkType(req.body);
    drinkType.save( function(err, savedDrinkType) {
        if(err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(drinkType);
        }
    });
};

//update the drink type
exports.update = function (req, res) {
    var drinkType = _.extend(req.drinkType, req.body);
    drinkType.save(function(err, success) {
        if(err) {
            res.status(422).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(drinkType);
        }
    });
};

//To delete the drink type
exports.delete = function (req, res) {
    var drinkType = req.drinkType;
    drinkType.remove( function(err, deletedDrinkType) {
        if(err) {
            return res.status(404).send({
                message: errorHandler.getErrorMessage()
            });
        } else {
            return res.json(drinkType);
        } 
    });
};

//List all drink type
exports.list = function (req, res) {
   
    DrinkType.find( function(err, DrinkTypeList) {
        if(err) {
            return res.status(404).send({
                message: errorHandler.getErrorMessage()
            });
        } else {
            return res.json(DrinkTypeList);
        }
    });
};

//Drink type by id
exports.getDrinkTypeById = function(req, res) {
    if(req.drinkType) {
        return res.json(req.drinkType);
    }
};

//Middleware
exports.drinkTypeById = function (req, res, next, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
          message: 'Drink type is invalid'
        });
    }
    
    DrinkType.findById(id).exec(function (err, drinkType) {
        if (err) {
            return next(err);
        } else if (!drinkType) {
            return res.status(404).send({
            message: 'No drink type with that identifier has been found'
            });
        }
        req.drinkType = drinkType;
        next();
    });
};