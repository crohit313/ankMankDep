angular.module('hotels').controller('hotelListController', ['$scope', '$stateParams', '$state', '$location', 'Authentication', 'hotelService', '$log', 'notificationService', '$modal', 'authenticationService', 'uploadService','$timeout',
  function ($scope, $stateParams, $state, $location, Authentication, hotelService, $log, notificationService, $modal, authenticationService,uploadService,$timeout) {
    var log = $log.log,
    _this = this;
    _this.authentication = Authentication;    
    _this.hotel = {};
    _this.user = {};    
    _this.hotelList = [];
    _this.editMode = false;
    _this.showLoading = false;
    _this.currentPage = 1;
    _this.itemsPerPage = 8;
    _this.hotelsType = ['A', 'B', 'C'];
    _this.imageUrl = '';
    _this.awsUrl = '';
    _this.folderName = 'Hotels';

    //Init function
    _this.initFunction = function() {
      _this.showLoading = true;
      _this.setAwsCredentials();
      if(_this.authentication.user) {
        _this.userRole = Authentication.user.roles[Authentication.user.roles.length-1];        
        if(_this.userRole == 'superAdmin') {
          _this.getAllHotels();
        }
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
    //get hotel list
    _this.getAllHotels = function () {
      hotelService.getHotelList({pageNumber: _this.currentPage}).then(function(hotelList) {
          if(hotelList.length) {
            _this.hotelList = [];
            _this.hotelList = hotelList;
            _this.showLoading = false;
          } else {
            if(_this.currentPage > 1) {
                notificationService.errorNotification('No data found for the next page');
                _this.hotelListByPage('decrease');                
            } else {
              _this.hotelList = [];              
              _this.showLoading = false;
            }
          }
      }, function(err) {
        _this.showLoading = false;
        notificationService.errorNotification(err.data.message);
      });
    };
    _this.deleteHotel = function(hotelId) {
      if(hotelId) {
        hotelService.deleteHotel(hotelId).then(function(deletedHotel) {
          notificationService.successNotification('Hotel Deleted Successfully');          
          _this.getAllHotels();
        }, function(err) {
          _this.showLoading = false;
          if(err) {
            notificationService.errorNotification(err.data.message);
          }
        });
      }
    };
    _this.openModal = function (hotel) {
      $modal.open({
        templateUrl: 'modules/core/views/modal.client.view.html',
        backdrop: true, 
        windowClass: 'modal',
        controller: function ($scope, $modalInstance, $log) {
          $scope.modal = {};
          $scope.modal.header = 'Confirmation Required';
          $scope.modal.message = 'Are you sure to delete this hotel?';
          $scope.submit = function () {
              if(hotel) {
                _this.showLoading = true;
                _this.deleteHotel(hotel._id);
              }
              $modalInstance.dismiss('cancel');
          };
          $scope.cancel = function () {
              $modalInstance.dismiss('cancel'); 
          };
        }
      });
    };
    _this.hotelListByPage = function(subject) {
        if(subject == 'decrease') {
          _this.currentPage -- ;
          _this.getAllHotels({pageNumber: _this.currentPage});
        } else if(subject == 'increase'){
          _this.currentPage ++ ;
          _this.getAllHotels({pageNumber: _this.currentPage});
        }
    };
  }
]);