// bottles controller
angular.module('bottles').controller('manageBottlesController', ['$scope', '$rootScope', '$stateParams', '$state', '$location', 'Authentication', 'bottleService', '$log', 'notificationService', '$modal', 'drinkTypeService', '$timeout', 'uploadService', 'hotelService',
  function ($scope, $rootScope, $stateParams, $state, $location, Authentication, bottleService, $log, notificationService, $modal, drinkTypeService, $timeout, uploadService, hotelService) {
    var log = $log.log,
    _this = this;
    _this.authentication = Authentication;
    _this.bottleList = [];
    _this.drinkTypeList = [];
    _this.manageHotelProduct = {};
    _this.hotel = {};
    _this.bottle = [];
    _this.showcheckbox= true;
    _this.showLoading = false;
    _this.dataLoadedInArray = false;
    _this.paginationForDrinkType = false;
    _this.disablePageNavigation = false;
    _this.currentPage = 1;
    _this.currentPageDrinkType = 1;   
    _this.itemsPerPage = 8;
    _this.userRole = '';
    _this.awsUrl = '';
    _this.previousDrinkTypeId = '';
    _this.folderName = 'Bottles';
    _this.selectedBottleType = {};

    _this.initFunction = function() {

      _this.showLoading = true;
      _this.setAwsCredentials();
      if(Authentication.user){
        _this.userRole = Authentication.user.roles[Authentication.user.roles.length-1]; 
      }
      if($stateParams.hotelId) {
        _this.getHotelById();
        $rootScope.$emit('activeState', 'hotels');
      } else {
        _this.getHotelByAdminId();        
      }
    };

    _this.renderIfSuperAdmin = function() {

      if(_this.userRole !== '' && _this.userRole == 'superAdmin') {
        return true;
      } else {
        return false;
      }
    };

    _this.renderIfAdmin = function() {

      if(_this.userRole !== '' && _this.userRole == 'admin') {
        return true;
      } else {
        return false;
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

    _this.getHotelById = function() {

      hotelService.getHotelById($stateParams.hotelId).then(function(hotel) {
        _this.hotel = hotel;
        _this.getManageProductByHotelId();
      }, function(err) {
          notificationService.errorNotification(err.message);
      });
    };
    //get hotel by admin id
    _this.getHotelByAdminId = function() {

      hotelService.getMyHoteldetail({adminId: _this.authentication.user._id}).then(function(hotelByAdminId) {
        _this.hotel = hotelByAdminId[0];
        _this.getManageProductByHotelId();
      }, function(err) {
          notificationService.errorNotification(err.message);
      });
    };    

    _this.getManageProductByHotelId = function() {

      bottleService.getProductByHotelId({hotelId:_this.hotel._id}).then(function(hotelProductObject) {
        _this.getBottlesByPreviousSelectedType();
        if(hotelProductObject._id) {
          _this.manageHotelProduct = hotelProductObject;
        } else {
          _this.manageHotelProduct = {
            hotel: _this.hotel._id,
            products: []
          }
        }
      },function(err) {
        notificationService.errorNotification(err.message);
      });
    };

    _this.getBottlesByPreviousSelectedType = function() {
      if ($state.previous && $state.previous.state.name === 'hotels.update') {
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

    }

    _this.getAllBottles = function (pageNumberObject, hideLoading) { 
      if(_this.disablePageNavigation) {
        _this.disablePageNavigation = false;        
      }
      bottleService.getBottleList(pageNumberObject).then(function(bottleList) {
        if(bottleList.length) {
          _this.bottle = [];
          _this.bottleList = [];
          _this.bottleList = bottleList;
          angular.forEach(_this.bottleList, function(bottle, index) {            
            _this.checkUncheckProduct(index, bottle._id);
          });
        } else {
          if(_this.currentPage > 1) {
            _this.disablePageNavigation = true;
            notificationService.errorNotification('No data found for the selected page');
            _this.currentPage --;
            _this.showLoading = false;            
          } else {
            _this.bottle = [];            
            _this.bottleList = [];            
            _this.showLoading = false;
          }
        }
      }, function(err) {
        _this.showLoading = false;
        notificationService.errorNotification(err.message);
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
        _this.currentPage = 1        
        bottleService.getBottleListByDrinkType({pageNumber: _this.currentPageDrinkType, drinkTypeId: drinkType._id}).then(function(bottleListByDrinkType) {
          if(bottleListByDrinkType.length) {
            _this.bottle = [];
            _this.bottleList = [];
            _this.bottleList = bottleListByDrinkType;
            _this.previousDrinkTypeId = drinkType._id;
            angular.forEach(_this.bottleList, function(bottle, index) {
              _this.checkUncheckProduct(index, bottle._id);
            });
          } else {
            if(_this.currentPageDrinkType > 1) {
              notificationService.errorNotification('No data found for the selected page');
              _this.currentPageDrinkType -- ;
              _this.disablePageNavigation = true;
            }
            _this.showLoading = false;                          
          }
        }, function(err) {
          notificationService.errorNotification(err.data.message);
        });
      } else if(_this.paginationForDrinkType) {
        _this.paginationForDrinkType = false;
        _this.currentPageDrinkType = 1;
        _this.getAllBottles({pageNumber: _this.currentPage});
      }
    };
      //get All Drink Types
    _this.getAllDrinkType = function () {
      drinkTypeService.getDrinkTypeList().then( function(drinkTypeList) {
          _this.drinkTypeList = drinkTypeList;
          _this.setPreviousSelectedOption(_this.drinkTypeList, _this.selectedBottleType);
      },function(err) {
        _this.showLoading = false;  
        notificationService.errorNotification('Failed to fetch drink type list');
      });
    };

    _this.checkUncheckProduct = function(index, bottleId) {

      if(_this.manageHotelProduct.products.length) {
        _this.bottle[index] = {
          checked : false,
          costByHotel: ''
        }
        $timeout(function() {
          angular.forEach(_this.manageHotelProduct.products, function (products) {
            if(products.bottleId == bottleId) {
              _this.bottle[index] = {
                checked : products.checked,
                costByHotel: products.costByHotel ? products.costByHotel: 0
              }
            }
            if(index == _this.bottleList.length - 1) {
              _this.showLoading = false;            
              _this.dataLoadedInArray = true;
            }
          });
        },0);
      } else {
        _this.showLoading = false;        
        _this.dataLoadedInArray = true;        
      }
    };
    _this.createCheckedProductList = function(index,bottleId){
      if(_this.userRole == 'superAdmin') {
        if(_this.manageHotelProduct.products.length && _this.dataLoadedInArray) {
          var count = 0;
          angular.forEach(_this.manageHotelProduct.products, function (products, productIndex) {
            if(count == 0) {
              if(products.bottleId == bottleId){
                _this.manageHotelProduct.products[productIndex].checked = _this.bottle[index].checked;
                _this.updateManageHotelProduct();
                count++
              } else {
                if(productIndex == _this.manageHotelProduct.products.length - 1) {
                  var productObj = {
                    bottleId: bottleId,
                    checked: true
                  }
                  _this.manageHotelProduct.products.push(productObj);
                  _this.updateManageHotelProduct();
                  count++
                }
              }
            }
          });
        } else {
          var productStatus = {bottleId: bottleId, checked: true};
          _this.manageHotelProduct.products.push(productStatus);
          _this.createManageHotelProduct({hotelId: _this.hotel._id, products:[productStatus]});
        }
      } else {
        _this.bottle[index].checked =!_this.bottle[index].checked; 
      }
    };

    _this.createManageHotelProduct = function(product) {

      bottleService.addManageHotelProduct(product).then(function(response) {
        _this.manageHotelProduct = response;
        notificationService.successNotification('Product updated successfully');
      }, function(err) {
        notificationService.errorNotification(err.message);
      })
    };

    _this.updateManageHotelProduct = function (){

      bottleService.updateManageHotelProduct(_this.manageHotelProduct).then(function(response){
        notificationService.successNotification('Product updated successfully');
      },function(err){
        notificationService.errorNotification(err.data.message);
      });
    };

    _this.updateCostByHotel = function(index, bottleId) {
    if(_this.bottle[index].costByHotel > 0){
      if(_this.manageHotelProduct.products.length && _this.dataLoadedInArray) {
        var count = 0;
        angular.forEach(_this.manageHotelProduct.products, function (products, productIndex) {
          if(count == 0) {
            if(products.bottleId == bottleId){
              _this.manageHotelProduct.products[productIndex].costByHotel = _this.bottle[index].costByHotel;
              _this.updateManageHotelProduct();
              count++
            } else {
              if(productIndex == _this.manageHotelProduct.products.length - 1) {
                var productObj = {
                  costByHotel: _this.bottle[index].costByHotel,
                  bottleId: bottleId,
                  checked: false
                }
                _this.manageHotelProduct.products.push(productObj);
                _this.updateManageHotelProduct();
                count++
              } else {
                if(productIndex == _this.manageHotelProduct.products.length - 1) {
                  var productObj = {
                    costByHotel: _this.bottle[index].costByHotel,
                    bottleId: bottleId,
                    checked: false
                  }
                  _this.manageHotelProduct.products.push(productObj);
                  _this.updateManageHotelProduct();
                  count++
                }
              }
            }
          }  
          });
        } else {
          var productStatus = {costByHotel:_this.bottle[index].costByHotel!== undefined ? _this.bottle[index].costByHotel: 0, bottleId: bottleId, checked: true};
          _this.manageHotelProduct.products.push(productStatus);
          _this.createManageHotelProduct({hotelId: _this.hotel._id, products:[productStatus]});
        }
      }else{
        notificationService.errorNotification('Cost can not be less than or equal to zero.');
      }  
    };

    _this.manageHotelProductListByPage = function(subject) {

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

    _this.saveToRootScope = function() {
      $rootScope.drinkType = _this.selectedOption;
      $rootScope.pageNumber = _this.currentPage
      $rootScope.currentPageDrinkType = _this.currentPageDrinkType
    };

    _this.emptyRootScopeDrinkType = function() {
      $rootScope.drinkType = {};
      $rootScope.pageNumber = 1;
      // $rootScope.currentPageDrinkType = 1;
    };

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
    };

  }
]);