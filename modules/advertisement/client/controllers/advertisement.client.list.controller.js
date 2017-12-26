// hotels controller
angular.module('advertisement').controller('advertisementListController', ['$scope', '$stateParams', '$state', '$location', 'Authentication', '$log', 'notificationService', '$modal', 'Upload', 'uploadService', 'advertisementService',
  function ($scope, $stateParams, $state, $location, Authentication, $log, notificationService, $modal, Upload, uploadService, advertisementService) {
    var log = $log.log,
    _this = this;
    _this.authentication = Authentication;
    _this.advertisementList = [];
    _this.folderName = 'Advertisements';
    _this.awsUrl = '';
    _this.currentDate = new Date();
    _this.currentPage = 1;
    _this.itemsPerPage = 8;
    _this.showLoading = false;
    _this.userRole = '';

    _this.initFunction = function () {
      _this.showLoading = true;
      if(Authentication.user) {
        _this.userRole = Authentication.user.roles[Authentication.user.roles.length-1];
      }
      _this.getAdvertisementList({pageNumber: _this.currentPage});
      _this.setAwsCredentials();
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
    _this.isActive = function() {

    };
    _this.getAdvertisementList = function(paginationObject) {

      advertisementService.getAdvertisements(paginationObject).then(function(advertisementList) {
        if(advertisementList.length) {
          _this.advertisementList = [];
          _this.advertisementList = advertisementList;
        } else {
          if(_this.currentPage > 1) {
            notificationService.errorNotification('No data found for the next page');
            _this.advertisementListByPage('decrease');                      
          } else {
            _this.advertisementList = [];            
            _this.showLoading = false;
          }
        }
        _this.showLoading = false;
      }, function(err) {
        _this.showLoading = false;
        notificationService.errorNotification(err.data.message);
      });
    };


    _this.deleteAdvertisement = function(advertisement) {

      advertisementService.deleteAdvertisement(advertisement._id).then( function( response) {
        notificationService.successNotification('Advertisement Deleted Successfully');
        // _this.deleteAdvertisementFile(advertisement.imageUrl);
        _this.getAdvertisementList({pageNumber:_this.currentPage});
      }, function(err) {
        _this.showLoading = false;
        notificationService.errorNotification(err.data.message);
      });
    };

    _this.openModal = function (advertisement) {
      _this.open = $modal.open({
        templateUrl: 'modules/core/views/modal.client.view.html',
        backdrop: true, // setting backdrop allows us to close the modal window on clicking outside the modal window
        windowClass: 'modal', // windowClass - additional CSS class(es) to be added to a modal window template
        controller: function ($scope, $modalInstance, $log) {
          $scope.modal = {};
          $scope.modal.header = 'Confirmation Required';
          $scope.modal.message = 'Are you sure to delete this advertisement?';
          $scope.submit = function () {
            _this.showLoading = true;
            _this.deleteAdvertisement(advertisement);
            $modalInstance.dismiss('cancel');
          };
          $scope.cancel = function () {
            $modalInstance.dismiss('cancel'); 
          };
        }
      });
    };

    _this.advertisementListByPage = function(subject) {

      if(subject == 'decrease') {
        _this.currentPage -- ;
        _this.getAdvertisementList({pageNumber: _this.currentPage});
      } else if(subject == 'increase'){
        _this.currentPage ++ ;
        _this.getAdvertisementList({pageNumber: _this.currentPage});
      }
    };
  }
]);  