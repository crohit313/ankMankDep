angular.module('advertisement').controller('advertisementController', ['$scope', '$rootScope', '$stateParams', '$state', '$location', 'Authentication', '$log', 'notificationService', 'Upload', 'uploadService', 'advertisementService', '$filter', '$timeout',
  function ($scope, $rootScope, $stateParams, $state, $location, Authentication, $log, notificationService, Upload, uploadService, advertisementService, $filter, $timeout) {
    var log = $log.log,
    _this = this;
    _this.authentication = Authentication;
    _this.userRole = Authentication.user.roles[Authentication.user.roles.length-1];
    _this.advertisement = {};
    _this.file = new Object();
    _this.datePicker = {};
    _this.folderName = 'Advertisements';
    _this.awsUrl = '';
    _this.imageUrl = '';
    _this.editMode = false;
    _this.showLoading = false;
    _this.startDatePickerOpened = false;
    _this.endDatePickerOpened = false;
    _this.dateValidatioError = false;
    _this.currentDate = new Date();

    //Init Function
    _this.initFunction = function () {
      $rootScope.$emit('activeState', 'advertisement');
      _this.showLoading = true;
      _this.setDatePickerOptions();   
      _this.setAwsCredentials();
      if($stateParams.advertisementId) {
        _this.getAdvertisementById();
        _this.editMode = true;
      } else {
        _this.showLoading = false;
        _this.advertisement.isActive = true;
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

    _this.setDatePickerOptions = function () {
      _this.options ={
        formatDay: 'd',
        showWeeks: false,
        showButtonBar: false
      };
      _this.advertisement.startDate = new Date();
      _this.advertisement.endDate = new Date();
    };
    

    _this.getAdvertisementById = function() {
      advertisementService.getAdvertisementById($stateParams.advertisementId).then( function(advertisement) {
        _this.advertisement = advertisement;        
        $timeout(function() {
          _this.advertisement.isActive = advertisement.isActive;
        },0);        
        _this.checkDate();
        _this.imageUrl = _this.awsUrl+advertisement.imageUrl;
        _this.showLoading = false;
      }, function(err) {
        _this.showLoading = false;
        notificationService.errorNotification(err.data.message);
      });
    };

    _this.setPreview = function (file) {
      if(file !== null) {
        uploadService.getBase64DataUrl(file).then(function(urls){
          _this.imageUrl = urls;
        }); 
      }
    };
 
    _this.createUpdateAdvertisement = function() {
      if(_this.file.name && _this.dateValidatioError) {
        var file = new Object();
        file = _this.file;
        uploadService.uploadFileToAws(file, _this.folderName)
        .then(function(fileName){
          if(_this.advertisement.imageUrl) {
            // _this.deleteAdvertisementFile(_this.advertisement.imageUrl);
          }
          _this.advertisement.imageUrl = fileName;
          if(_this.editMode) {
            _this.updateAdvertisement();
           } else {
            _this.createAdvertisement();
           }
        });  
      } else {
        if(_this.dateValidatioError){
          if(_this.editMode) {
            _this.updateAdvertisement();
           } else {
            _this.createAdvertisement();
           }
        }
        
      }
    };

    _this.checkDate = function() {
      var curDate = new Date();
      
      if(_this.advertisement.startDate > _this.advertisement.endDate){
        _this.advertisement.endDate = _this.currentDate;
        notificationService.errorNotification('Start date can not be greater than end date.');
        _this.dateValidatioError = false;
      }else{
        _this.dateValidatioError = true;;
      }
    };

    _this.deleteAdvertisementFile = function(fileName) {
      uploadService.deleteFileFromAws(_this.folderName, fileName).then( function(response) {
      }, function(err) {
        notificationService.errorNotification(err.message);
      });
    };

    _this.createAdvertisement = function () {
      advertisementService.createAdvertisement(_this.advertisement).then(function(response) {
        notificationService.successNotification('Advertisement Uploaded Successfully');
        $state.transitionTo('advertisement.list', $stateParams, { reload: true, inherit: false, notify: true });        
      }, function(err) {
        notificationService.errorNotification(err.data.message);
      });
    };

    _this.updateAdvertisement = function () {
      advertisementService.updateAdvertisement(_this.advertisement).then(function(response) {
        notificationService.successNotification('Advertisement Updated Successfully');
        // $state.transitionTo('advertisement.list', $stateParams, { reload: true, inherit: false, notify: true });        
      }, function(err) {
        notificationService.errorNotification(err.data.message);
      });
    };
  
    
    _this.toggleStartDatePicker = function($event) {
      if(_this.endDatePickerOpened) {
        _this.endDatePickerOpened = ! _this.endDatePickerOpened;        
      }
      $event.preventDefault();
      $event.stopPropagation();
      _this.startDatePickerOpened = ! _this.startDatePickerOpened;
    };

    _this.toggleEndDatePicker = function($event) {
      if(_this.startDatePickerOpened) {
        _this.startDatePickerOpened = ! _this.startDatePickerOpened;        
      }
      $event.preventDefault();
      $event.stopPropagation();
      _this.endDatePickerOpened = ! _this.endDatePickerOpened;
    };
  }
]);