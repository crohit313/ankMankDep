// bottles controller
angular.module('bottles').controller('bottlesCreateUpdateController', ['$scope', '$stateParams', '$state', '$location', 'Authentication', 'bottleService', '$log', 'notificationService', '$modal', 'drinkTypeService', '$timeout', 'uploadService', '$rootScope',
  function ($scope, $stateParams, $state, $location, Authentication, bottleService, $log, notificationService, $modal, drinkTypeService, $timeout, uploadService, $rootScope) {
    var log = $log.log,
    _this = this;
    _this.authentication = Authentication;
    _this.bottle = {};
    _this.file = {}; 
    _this.bottle.price = [];    
    _this.bottlesType = [];
    _this.drinkTypes = [];
    _this.editMode = false;
    _this.showLoading = false;
    _this.showOnlyPlatinum = false;
    _this.selectedBottleType = {}; 
    _this.imageUrl = '';
    _this.awsUrl = '';
    _this.userRole = '';
    _this.folderName = 'Bottles';
    
    //Init function
    _this.initFunction = function() {
      _this.showLoading = true;
      $rootScope.$emit('activeState', 'bottles');
      _this.getAllDrinkType();
      _this.setAwsCredentials();
      _this.setPriceArray(); 
      if(Authentication.user) {
        _this.userRole = Authentication.user.roles[Authentication.user.roles.length-1];            
      }
    };

    $rootScope.$on('reFetchDrinkType', function(ev, args) {
      _this.getAllDrinkType();
    });

    //get All the Drink Types
    _this.getAllDrinkType = function () {
      drinkTypeService.getDrinkTypeList().then( function(drinkTypeList) {
        _this.drinkTypes = [];
        _this.drinkTypes = drinkTypeList;
        if($stateParams.bottleId) {
          _this.editMode = true;
          _this.getBottleById();
        } else {
          _this.showLoading = false;
        }
      }, function(err) {
          notificationService.errorNotification('Error in processing request');
      });
    };

    //Set aws creadentials
    _this.setAwsCredentials = function() {
      uploadService.getCredentials().then(function(response){
        uploadService.config = response;
        _this.awsUrl = uploadService.getAwsUrl()+_this.folderName+'/';
      }, function(err) {
        notificationService.errorNotification(err.message);
      });
    };

    _this.setPreview = function (file) {
      if(file !== null) {
        uploadService.getBase64DataUrl(file).then(function(urls){
          $timeout(function() {
            _this.imageUrl = '';
            _this.imageUrl = urls;          
          },0);
        });
      }
    };
    //get Bottle by id
    _this.getBottleById = function () {
      bottleService.getBottleById($stateParams.bottleId).then(function(bottle) {
        if(bottle) {
          _this.bottle = {};
          _this.bottle = bottle;
          _this.imageUrl = _this.awsUrl+_this.bottle.imageUrl;
          angular.forEach(_this.drinkTypes, function(drinkType, index) {
            if(drinkType._id == bottle.type) {
              _this.selectedBottleType = drinkType;
              _this.setSelectedBottleType(drinkType); 
            }
          });
          _this.showLoading = false;
        }
      }, function(err) {
        _this.showLoading = false;
        notificationService.errorNotification(err.meesage);
      });
    };

    // Create or Update the bottle
    _this.createUpdate = function () {

      if (!_this.validation()) {
        notificationService.errorNotification('All fields are required');
        return;
      }

      if(_this.showOnlyPlatinum) {
        _this.bottle.price.splice(2, 1);
        _this.bottle.price.splice(1,1);
        _this.bottle.price[0].label = 'Platinum';        
      } else {
        _this.bottle.price[0].label = 'Platinum'
        _this.bottle.price[1].label = 'Gold';
        _this.bottle.price[2].label = 'Silver';
      }
      log(_this.bottle);      
      if(_this.file.name) {
        var file = _this.file;
        file.name = Date.now()+'.'+file.type.split('/')[1];
        uploadService.uploadFileToAws(file, _this.folderName)
        .then(function(fileName){
          if(_this.bottle.imageUrl !== '') {
            _this.deleteBottleOldFile(_this.bottle.imageUrl);
          }
          _this.bottle.imageUrl = fileName;
          if(_this.editMode) {
            _this.updateBottle();
           } else {
            _this.createBottle();
           }
        });  
      } else {
        if(_this.editMode) {
          _this.updateBottle();
         } else {
          _this.createBottle();
         }
      }
    };

    _this.deleteBottleOldFile = function(fileName) {
      uploadService.deleteFileFromAws(_this.folderName, fileName).then( function(response) {
      }, function(err) {
        notificationService.errorNotification(err.message);
      });
    };

    _this.createBottle = function () {
      bottleService.createBottle(_this.bottle).then(function(response) {
        if(response) {
          notificationService.successNotification('Bottle Created Successfully');
          _this.bottle = {};
          $state.transitionTo('bottles.list', $stateParams, { reload: true, inherit: false, notify: true });          
        }
      }, function(err) {
        notificationService.errorNotification(err.data.message);
      });
    };

    _this.updateBottle = function () {
      bottleService.updateBottle(_this.bottle).then(function(response) {
        if(response) {
          notificationService.successNotification('Bottle Updated Successfully');            
          // _this.bottle = {};
          // $state.transitionTo('bottles.list', $stateParams, { reload: true, inherit: false, notify: true });          
        } else {
          notificationService.errorNotification('Failed to update bottle');                        
        }
      });
    };

    _this.setSelectedBottleType = function (type) {
      _this.bottle.type = type._id;
      _this.bottle.unit = type.unit;
      if(type.type == 'Wine' || type.type == 'Beer') {
        _this.showOnlyPlatinum = true;
      } else {
        _this.showOnlyPlatinum = false;
      }
    };
    
    _this.setPriceArray = function (label, price) {
      _this.bottle.price.push({label: 'Platinum'});
      _this.bottle.price.push({label: 'Gold'});
      _this.bottle.price.push({label: 'Silver'});
    };

    _this.validation = function() {
      var isValid = false;
      if(_this.showOnlyPlatinum) {
        if (_this.bottle.price[0].price > 0 && _this.bottle.price[0].volume > 0) {
          isValid = true;
        }        
      } else {
        if (_this.bottle.price[0].price > 0 && _this.bottle.price[0].volume > 0 && _this.bottle.price[1].price > 0 && _this.bottle.price[1].volume > 0 && _this.bottle.price[2].price > 0 && _this.bottle.price[2].volume > 0) {
          isValid = true;
        }
      }
      return isValid;
    }
  }
]);
