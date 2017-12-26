angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'uploadService', 'notificationService', 'Users',
  function ($scope, $timeout, $window, Authentication, uploadService, notificationService, Users) {
    var _this = this;
    _this.file = {};
    _this.user = {};
    _this.user = Authentication.user;
    _this.userRole = Authentication.user.roles[Authentication.user.roles.length-1];    
    _this.folderName = 'ProfilePictures';
    _this.awsUrl = '';

    _this.initFunction = function () {
      _this.setAwsCredentials();
    };

    _this.setAwsCredentials = function() {
      
      uploadService.getCredentials().then(function(response){
        uploadService.config = response;
        _this.awsUrl = 'https://s3.amazonaws.com/'+uploadService.config.bucketName+'/';
        _this.imageURL = Authentication.user.imageUrl; 
      }, function(err) {
        notificationService.errorNotification(err.message);
      });
     };
    // Called after the user selected a new picture file
    _this.setPreview = function (fileItem) {
      uploadService.getBase64DataUrl(fileItem).then(function(urls){
        _this.awsUrl = '';
        _this.imageURL = urls;
      });
    };

    _this.changeProfilePicture = function (picture) {
      var OldProfilePicName = _this.user.imageUrl.split('/')[1];
      uploadService.deleteFileFromAws(_this.folderName, OldProfilePicName).then(function(success) {

        _this.file.name = _this.user._id+'.'+_this.file.type.split('/')[1];
        uploadService.uploadFileToAws(_this.file, _this.folderName).then(function(fileUrl) {
          _this.user.imageUrl = fileUrl;
          notificationService.successNotification('Profile Changed Successfully');
          var user = new Users(_this.user);
          user.$update(function (response) {
            Authentication.user = response;
          }, function (response) {
            notificationService.errorNotification(response.data.message);
          });
        }, function(err) {
          notificationService.errorNotification('Fail to change the profile picture');
        });
      }, function(err){
        notificationService.errorNotification(err.message);
      });
      
    };
  }
]);
