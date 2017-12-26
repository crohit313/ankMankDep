angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'authenticationService', 'Upload', 'notificationService', 'uploadService', 'hotelService', 
  function ($scope, $state, $http, $location, $window, Authentication, authenticationService, Upload, notificationService, uploadService, hotelService) {
   var _this = this;   
    _this.authentication = Authentication;
    _this.credentials = {};
    _this.folderName = 'ProfilePictures';
    _this.aswUrl = '';
    _this.userRole = '';
    var fileUploadUrl = 'api/users/profilePicture';
    // Get an eventual error defined in the URL query string:
    _this.error = $location.search().err;
    
    _this.login = true;

    // If user is signed in then redirect back home
    _this.initFunction = function () {
      $scope.$emit('hideSideNavBar', true);
      if(Authentication.user) {
        _this.setAwsCredentials();
        _this.userRole = Authentication.user.roles[Authentication.user.roles.length-1];
        _this.changeCurrentState();
      }
    };
    _this.toggleNavbarStatus = function() {
      alert('You are leaving this page');
      $scope.$emit('hideSideNavBar', false);
    } 

    _this.showCard = function(){
      _this.login = !_this.login;  
  };

    _this.signUp = function () {
      authenticationService.userSignUp(_this.credentials).then(function(user) {
        notificationService.successNotification('Sign Up successfully');
        _this.authentication.user = user;
        _this.changeCurrentState();
        }, function(err) {
        notificationService.errorNotification('Sign Up Unsuccessfull');
      });
    };

    _this.signIn = function () {
      
      $http.post('/api/auth/signin', _this.credentials).success(function (response) {
        _this.authentication.user = response;
        notificationService.successNotification('Sign In Successfully');
        _this.userRole = Authentication.user.roles[Authentication.user.roles.length-1];        
        _this.changeCurrentState();

      }).error(function (response) {
        notificationService.errorNotification(response.message);
      });
    };
    
    _this.changeCurrentState = function() {
      if(_this.userRole == 'superAdmin') {
        $state.go('advertisement.list');          
      } else if(_this.userRole == 'admin') {
        $state.go('history.transact');          
      } else {
        $state.go('authentication.signin');                  
      }
    };

    _this.signOut = function () {
      authenticationService.userSignOut().then(function(user) {
        notificationService.successNotification('Sign Out successfully');
        Authentication = null;
        $state.go($state.previous.state.name || 'authentication.signin', $state.previous.params);
      }, function(err) {
        notificationService.errorNotification('Sign Out Unsuccessfull');
      });
    };

    _this.setAwsCredentials = function() {
     if(!uploadService.config.bucketName) {
      uploadService.getCredentials().then(function(response){
        uploadService.config = response;
        _this.awsUrl = _this.uploadService.getAwsUrl()+_this.folderName+'/';
      }, function(err) {
        notificationService.errorNotification(err.message);
      });
     } 
    };

    _this.setPreview = function (file) {

      if(_this.imageUrl) {
        
        _this.deleteOldProfilePicture(_this.credentials.imageUrl);
      }
      uploadService.getBase64DataUrl(file).then(function(urls){
        _this.imageUrl = urls;
        _this.uploadFile(file);
      });
    };

    _this.uploadFile = function (file) {

      _this.file.name = Date.now()+'.'+_this.file.type.split('/')[1];
      uploadService.uploadFileToAws(_this.file, _this.folderName).then(function (resp) {
        _this.credentials.imageUrl = resp;
      }, function (resp) {
          notificationService.errorNotification(err.message);
      });
    };

    _this.deleteOldProfilePicture = function (fileName) {
      uploadService.deleteFileFromAws(_this.folderName, fileName).then(function(success) {
        notificationService.successNotification('File deleted from Aws');
      }, function(err) {
        notificationService.errorNotification(err.message);
      })
    }
    // OAuth provider request
    _this.callOauthProvider = function (url) {
      var redirect_to;

      if ($state.previous) {
        redirect_to = $state.previous.href;
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url + (redirect_to ? '?redirect_to=' + encodeURIComponent(redirect_to) : '');
    };
  }
]);
