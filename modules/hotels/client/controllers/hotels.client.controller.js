angular.module('hotels').controller('hotelsController', ['$scope', '$rootScope', '$stateParams', '$state', '$location', 'Authentication', 'hotelService', '$log', 'notificationService', '$modal', 'authenticationService', 'uploadService','$timeout','drinkTypeService',
  function ($scope, $rootScope, $stateParams, $state, $location, Authentication, hotelService, $log, notificationService, $modal, authenticationService,uploadService,$timeout,drinkTypeService) {
    var log = $log.log,
    _this = this;
    _this.authentication = Authentication;    
    _this.hotel = new Object();
    _this.user = new Object();    
    _this.hotelList = [];
    _this.file = [];
    _this.editMode = false;
    _this.showLoading = false;
    _this.showUploadButton = false;    
    _this.hotelsType = ['A', 'B', 'C'];
    _this.imageUrl = '';
    _this.message = "";
    _this.drinkTypeList = [];
    _this.folderName = 'Hotels';
    _this.password = {};
    _this.slideInterval = 3000;
    _this.hideCarosoul = false;
    _this.currentImageIndex = 0;
    _this.noWrapSlides = false;
    _this.formSubmitted = false;    
    _this.slides = [];

    //Init function
    _this.initFunction = function() {
      _this.showLoading = true;
      $rootScope.$emit('activeState', 'hotels');
      if(Authentication.user) {
        _this.userRole = Authentication.user.roles[Authentication.user.roles.length-1];
        _this.setAwsCredentials(); 
      }
      if($stateParams.hotelId) {
        _this.editMode = true;
        _this.gethotelById();
      }else if(_this.authentication.user) {
        if(_this.userRole == 'admin') {
          _this.editMode = true;
          _this.getHotelByAdminId(_this.authentication.user._id);
        }
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
    //get hotel by id
    _this.gethotelById = function () {
      hotelService.getHotelById($stateParams.hotelId).then(function(hotel) {
        _this.hotel = {}; 
        _this.hotel = hotel;
        log('array', _this.hotel.imageUrl);
        if(_this.hotel.imageUrl.length) {
          _this.setSlideImages();
        } else {
          _this.showLoading = false;          
        }
      }, function(err) {
        _this.showLoading = false;
        notificationService.errorNotification(err.message);                              
      });
    };
    //get hotel by admin id
    _this.getHotelByAdminId = function(adminId) {
      hotelService.getMyHoteldetail({adminId: adminId}).then(function(hotelByAdminId) {
        _this.hotel = hotelByAdminId[0];
        if(_this.hotel.imageUrl && _this.hotel.imageUrl.length) {
          _this.setSlideImages();
        } else {
          _this.showLoading = false;
          
        }
      }, function(err) {
        _this.showLoading = false;
        notificationService.errorNotification(err.message);
      });
    };

    _this.setSlideImages = function() {
      _this.slides = [];
      angular.forEach(_this.hotel.imageUrl, function(imageName, index) {
        var obj = {image:_this.awsUrl+imageName}
        _this.slides.push(obj);
      });
      _this.showLoading = false;
      if(_this.hideCarosoul) {
        _this.updateHotel();
      }
    };

    _this.deleteHotelImage  = function(slide, slideIndex) {
      if(slide !==undefined &&  slide.image) {
        _this.hideCarosoul = true;
        var selectedImageName = slide.image.split(''+_this.awsUrl)[1];
        uploadService.deleteFileFromAws(_this.folderName, selectedImageName).then(function(response) {
          _this.slides.splice(slideIndex, 1);
          if(_this.hotel.imageUrl.length) {
            var deletedImageIndex  = _this.hotel.imageUrl.indexOf(selectedImageName); 
            _this.hotel.imageUrl.splice(deletedImageIndex, 1);
            _this.updateHotel();            
          }
        }, function(err) {
          notificationService.errorNotification(err.data.message);
        });
      }
    };

    //Get all drint type
    _this.getAllDrinkType = function () {
      
      drinkTypeService.getDrinkTypeList().then( function(drinkTypeList) {
          _this.drinkTypeList = drinkTypeList;
      }, function(err) {
          notificationService.errorNotification('Failed to fetch drink type list');
      });
    };
    //Set image preview
    _this.setPreview = function (files) {
      if(files.length) {
        var count = 0;
        _this.hideCarosoul = true;
        angular.forEach(files, function (file, index) {
          file.name = file.lastModified+'.'+file.type.split('/')[1];          
          uploadService.uploadFileToAws(file, _this.folderName)
          .then(function(fileName){
            count++;
            _this.progress = index / files.length;
            _this.hotel.imageUrl.push(fileName);
            if(count == files.length) {
              _this.setSlideImages();
            }                
          });
        });
      }
    };

    // Create or Update the hotel
    _this.createUpdate = function () {
      if(_this.editMode) {
        _this.updateHotel();
      } else {
        _this.createHotelAdmin();
      }
    };
    _this.setHotelAddress = function() {
      
      if(angular.isObject(_this.hotel.address)) {
        if(_this.hotel.address.getPlace().geometry.location != undefined){
        var location = _this.hotel.address.getPlace().geometry.location;
        _this.hotel.lat = location.lat();
        _this.hotel.lng = location.lng();
        _this.hotel.address = _this.hotel.address.getPlace().formatted_address;
        }
      } else {
        if(_this.hotel.address == '') {
          delete _this.hotel.lat;
          delete _this.hotel.lng;
        }
      }
    };

    _this.createHotelAdmin = function (formValid) {
      _this.formSubmitted = true;
      if(formValid && _this.hotel.lat && _this.hotel.lng && _this.hotel.password == _this.hotel.confirmPassword) {
        _this.user = {
          firstName: _this.hotel.name,
          phone: _this.hotel.phone,
          email: _this.hotel.email,
          password: _this.hotel.password,
          username: _this.hotel.name,
          admin: true
        };
        authenticationService.userSignUp(_this.user).then(function(user) {
          if(user) {
            _this.formSubmitted = false;
            var hotelAdminDetails = {};
            _this.hotel.admin = user._id; 
            angular.copy(_this.hotel, hotelAdminDetails);            
            Authentication.user = user;          
            delete hotelAdminDetails.email;
            delete hotelAdminDetails.password;
            delete hotelAdminDetails.confirmPassword;
            _this.createHotel(hotelAdminDetails);
          }
        }, function(err) {
          notificationService.errorNotification(err.data.message);
        });
      }
    };
    _this.createHotel = function(hotelAdminDetails) {
      hotelService.createHotel(hotelAdminDetails).then(function(response) {
        notificationService.successNotification('Hotel Created Successfully');
        $state.transitionTo('history.transact', $stateParams, { reload: true, inherit: false, notify: true });                  
      },function (err) {
        notificationService.errorNotification(err.data.message);                      
      });
    };
    _this.updateHotel = function() {
      if(_this.hotel.lat && _this.hotel.lng) {
        hotelService.updateHotel(_this.hotel).then(function(response) {
          if(!_this.hideCarosoul) {
            notificationService.successNotification('Hotel Updated Successfully');
            // if(_this.userRole == 'superAdmin') {
              // _this.hotel = {};
              // $state.transitionTo('hotels.list', $stateParams, { reload: true, inherit: false, notify: true });          
            // }
          } else {
            _this.hideCarosoul = false;
          }            
        }, function(err) {
          log('err', err);
          notificationService.errorNotification(err.data.message);          
        });
      } else {
        notificationService.errorNotification('Enter valid address');
      }
    };
    _this.deleteHotel = function(hotelId) {
      if(hotelId) {
        hotelService.deleteHotel(hotelId).then(function(deletedHotel) {
          notificationService.successNotification('Hotel Deleted Successfully');          
          _this.getAllHotels();
        }, function(err) {
          if(err) {
            notificationService.errorNotification(err.data.message);
          }
        });
      }
    };
    _this.openModal = function (hotelId) {
      $modal.open({
        templateUrl: 'modules/core/views/modal.client.view.html',
        backdrop: true, 
        windowClass: 'modal',
        controller: function ($scope, $modalInstance, $log) {
          $scope.modal = {};
          $scope.modal.header = 'Confirmation Required';
          $scope.modal.message = 'Are you sure to delete this hotel?';
          $scope.submit = function () {
              if(hotelId) {
                _this.deleteHotel(hotelId);
              }
              $modalInstance.dismiss('cancel');
          };
          $scope.cancel = function () {
              $modalInstance.dismiss('cancel'); 
          };
        }
      });
    };
    _this.openDeleteHotelImageModal = function (slide, slideIndex) {
      $modal.open({
        templateUrl: 'modules/core/views/modal.client.view.html',
        backdrop: true, 
        windowClass: 'modal',
        controller: function ($scope, $modalInstance, $log) {
          $scope.modal = {};
          $scope.modal.header = 'Confirmation Required';
          $scope.modal.message = 'Are you sure to delete this image?';
          $scope.submit = function () {
              if(slide) {
                _this.deleteHotelImage(slide, slideIndex);
              }
              $modalInstance.dismiss('cancel');
          };
          $scope.cancel = function () {
              $modalInstance.dismiss('cancel'); 
          };
        }
      });
    };
    _this.openChangePasswordModal = function () {
      $modal.open({
        templateUrl: 'modules/hotels/views/change-password-client-view.html',
        backdrop: true, 
        windowClass: 'modal',
        controller: function ($scope, $modalInstance, $log) {
          $scope.modal = {};
          $scope.modal.header = 'Change Password';
          $scope.submit = function (password) {
              if(password){
                if(password.newPassword === password.confirmNewPassword && password.newPassword !== undefined && password.confirmNewPassword ){
                  if(password.newPassword !== password.currentPassword){
                    hotelService.changePasword(password).then(function(response){
                      if(response.status){
                        notificationService.successNotification('Password changed successfully');
                        $modalInstance.dismiss('cancel');
                      }else{
                        notificationService.errorNotification(response.message);
                      }
                    },function(err){
                      if(err) {
                        notificationService.errorNotification(err.data.message);
                      }
                    });
                  }else{
                    notificationService.errorNotification('New password and Current password can not be same.');
                  }
                }else{
                  notificationService.errorNotification('New password and Confirm new Password must be same.');
                }
              }else{
                notificationService.errorNotification('Current password can not be left blank.');
              }
          };
          
          $scope.cancel = function () {
            _this.password = undefined;
            $modalInstance.dismiss('cancel'); 
          };
        }
      });
    };
  }
]);