// bottles controller
angular.module('bottles').controller('bottleListController', ['$scope', '$rootScope','$stateParams', '$state', '$location', 'Authentication', 'bottleService', '$log', 'notificationService', '$modal', 'drinkTypeService', '$timeout', 'uploadService',
  function ($scope, $rootScope, $stateParams, $state, $location, Authentication, bottleService, $log, notificationService, $modal, drinkTypeService, $timeout, uploadService) {
    var log = $log.log,
    _this = this;
    _this.authentication = Authentication;
    _this.bottleList = [];
    _this.bottlesType = [];
    _this.drinkTypes = [];
    _this.unitArray = ['ml', 'pints'];
    _this.currentPage = 1;
    _this.itemsPerPage = 8;
    _this.showLoading = false;
    _this.dataLoadedInArray = false;
    _this.paginationForDrinkType = false;
    _this.disablePageNavigation = false;
    _this.currentPageDrinkType = 1;    
    _this.selectedBottleType = {};
    _this.folderName = 'Bottles';  
    _this.userRole = '';

    _this.initFunction = function() {
      _this.showLoading = true;
      
      if ($state.previous && $state.previous.state.name === 'bottles.edit') {
        if ($rootScope.drinkType && $rootScope.drinkType.type !== undefined) {
          _this.selectedBottleType = $rootScope.drinkType;
          _this.previousDrinkTypeId = _this.selectedBottleType._id;
          _this.currentPageDrinkType = $rootScope.currentPageDrinkType;
          _this.bottleListByDrinkType($rootScope.drinkType);
          _this.emptyRootScopeDrinkType();
        }else {
          if ($rootScope.pageNumber) {
            _this.currentPage = $rootScope.pageNumber;
          }
          _this.getAllBottles({pageNumber: _this.currentPage});
          _this.emptyRootScopeDrinkType();
        }

      } else {
        _this.getAllBottles({pageNumber: _this.currentPage});
        _this.emptyRootScopeDrinkType();
      }

      _this.getAllDrinkType();
      _this.setAwsCredentials();
      
      if(Authentication.user) {
        _this.userRole = Authentication.user.roles[Authentication.user.roles.length-1];            
      }
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

    //get bottle list
    _this.getAllBottles = function (pageNumber) {
      if(_this.disablePageNavigation) {
        _this.disablePageNavigation = false;        
      }
      bottleService.getBottleList(pageNumber).then (function(bottleList) {
        _this.showLoading = false;
        if(bottleList.length) {
          _this.bottleList = [];
          _this.bottleList = bottleList;
          _this.showLoading = false;
        } else {
          if(_this.currentPage > 1) {
            _this.disablePageNavigation = true;            
            notificationService.errorNotification('No data found for the selected page');
            _this.currentPage --;
            _this.getAllBottles({pageNumber: _this.currentPage});
          }
        }
      }, function(err) {
        _this.showLoading = false;
        notificationService.errorNotification('Error in processing the request');
      });
    };


    _this.bottleListByDrinkType = function(drinkType) {
      _this.showLoading = true;
      if(_this.disablePageNavigation) {
        _this.disablePageNavigation = false;        
      }
      if(drinkType) {
        if(_this.previousDrinkTypeId !== drinkType._id) {
          _this.currentPageDrinkType = 1;
        }
        _this.paginationForDrinkType = true;
        _this.currentPage = 1;
        bottleService.getBottleListByDrinkType({pageNumber: _this.currentPageDrinkType, drinkTypeId: drinkType._id}).then(function(bottleListByDrinkType) {
          if(bottleListByDrinkType.length) {
            _this.bottle = [];
            _this.bottleList = [];
            _this.bottleList = bottleListByDrinkType;
            _this.previousDrinkTypeId = drinkType._id;
          } else {
            if(_this.currentPageDrinkType > 1) {
              _this.disablePageNavigation = true;
              _this.currentPageDrinkType -- ;
              notificationService.errorNotification('No data found for the selected page');
            }
          }
          _this.showLoading = false;          
        }, function(err) {
          _this.showLoading = false;          
          notificationService.errorNotification(err.data.message);
        });
      } else if(_this.paginationForDrinkType) {
        _this.paginationForDrinkType = false;
        _this.currentPageDrinkType = 1;
        _this.getAllBottles({pageNumber: _this.currentPage});
      }
    };

    //get All the Drink Types
    _this.getAllDrinkType = function () {
      drinkTypeService.getDrinkTypeList().then( function(drinkTypeList) {
        _this.showLoading = false;
        _this.drinkTypes = drinkTypeList;
        _this.setPreviousSelectedOption(_this.drinkTypes, _this.selectedBottleType);
      }, function(err) {
          _this.showLoading = false;
          notificationService.errorNotification('Failed to fetch drink type list');
      });
    };

    // Delete the bottle
    _this.deleteBottle = function(bottleId) {
      bottleService.deleteBottle(bottleId).then(function(response) {
        if(response) {
          notificationService.successNotification('Bottle Deleted Successfully');
          _this.getAllBottles();
        } else {
          _this.showLoading = false;
          notificationService.errorNotification('Failed to delete bottle');
        }
      }, function(err) {
        _this.showLoading = false;
        notificationService.errorNotification(err.data.message);
      });
      };
  
    _this.openModal = function (bottle) {
      $modal.open({
        templateUrl: 'modules/core/views/modal.client.view.html',
        backdrop: true, // setting backdrop allows us to close the modal window on clicking outside the modal window
        windowClass: 'modal', // windowClass - additional CSS class(es) to be added to a modal window template
        controller: function ($scope, $modalInstance, $log) {
          $scope.modal = {};
          $scope.modal.header = 'Confirmation Required';
          $scope.modal.message = 'Are you sure to delete this bottle?';
          $scope.submit = function () {
            _this.showLoading = true;
            _this.deleteBottle(bottle._id);
            $modalInstance.dismiss('cancel');
          };
          $scope.cancel = function () {
            $modalInstance.dismiss('cancel'); 
          };

        }
      });
    };
    
    _this.bottleListByPage = function(subject) {

      _this.showLoading = true;
      if(_this.paginationForDrinkType) {
        if(subject == 'decrease') {
          if(_this.disablePageNavigation) {
            _this.disablePageNavigation = false;
          }
          _this.currentPageDrinkType -- ;
          _this.bottleListByDrinkType({pageNumber: _this.currentPageDrinkType, _id: _this.previousDrinkTypeId});
        } else if(subject == 'increase'){
          _this.currentPageDrinkType ++ ;
          _this.bottleListByDrinkType({pageNumber: _this.currentPageDrinkType, _id: _this.previousDrinkTypeId});
        }
      } else {
        if(subject == 'decrease') {
          if(_this.disablePageNavigation) {
            _this.disablePageNavigation = false;
          }
          _this.currentPage -- ;
          _this.getAllBottles({pageNumber: _this.currentPage});
        } else if(subject == 'increase'){
          _this.currentPage ++ ;
          _this.getAllBottles({pageNumber: _this.currentPage});
        }
      }
    };

    _this.setSetectedBottleType = function (type) {
      _this.bottle.type = type._id;
      if(!_this.editMode) {
        _this.setPriceArray();
        if(type.type == 'Wine' || type.type == 'Beer') {
          _this.showOnlyPlatinum = true;
          _this.bottle.price.splice(2, 1);
          _this.bottle.price.splice(1,1);
          _this.bottle.price[0].volume = _this.bottle.volume;
        } else {
          _this.showOnlyPlatinum = false;
        }
      } else {
        if(type.type == 'Wine' || type.type == 'Beer') {
          _this.showOnlyPlatinum = true;
        }  
      } 
    };

    _this.saveToRootScope = function() {
      $rootScope.drinkType = _this.selectedOption;
      $rootScope.pageNumber = _this.currentPage
      $rootScope.currentPageDrinkType = _this.currentPageDrinkType
    }

    _this.emptyRootScopeDrinkType = function() {
      $rootScope.drinkType = {};
      $rootScope.pageNumber = 1;
      // $rootScope.currentPageDrinkType = 1;
    }

    _this.setPreviousSelectedOption = function(drinkTypes, previousSelectedType) {
      if (previousSelectedType) {
        var option = {};
        angular.forEach(drinkTypes, function(drinkType, index) {
          if (drinkType.type === previousSelectedType.type) {
            option = drinkType;
          }
        });
        _this.selectedOption = option;
      }
    }
  
  }
]);  