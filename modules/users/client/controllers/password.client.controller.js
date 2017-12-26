angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', '$rootScope','notificationService',
  function ($scope, $stateParams, $http, $location, Authentication, $rootScope , notificationService) {
    $scope.authentication = Authentication;
    var _this = this;
    _this.passwordDetails = {};
    _this.passwordMatched = false;
    _this.showMessage = false;
    //Flip card
    $scope.isCardRevealed = false;
    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function () {
      $scope.success = $scope.error = null;
      if($scope.credentials){
        $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
          // Show user success message and clear form
          $scope.credentials = null;
          $scope.success = response.message;
  
        }).error(function (response) {
          // Show user error message and clear form
          $scope.credentials = null;
          $scope.error = response.message;
        });
      }else{
        notificationService.errorNotification('Kindly fill user email Id.');
      }
      
    };

    _this.matchPassword = function(){
      _this.showMessage = true;
      if(_this.passwordDetails.newPassword === _this.passwordDetails.verifyPassword) {
        _this.passwordMatched = true;
      } else {
        _this.passwordMatched = false;
      }  
    };
    // Change user password
    _this.resetUserPassword = function (valid) {
      $scope.success = $scope.error = null;
      if(valid) {
        $http.post('/api/auth/reset/' + $stateParams.token, _this.passwordDetails).success(function (response) {
          // If successful show success message and clear form
          _this.passwordDetails = null;
          // console.log('response', response);
          // Attach user profile
          Authentication.user = response.user;
          if(Authentication.user) {
            var rolesLength = Authentication.user.roles.length;
            if(rolesLength == 1) {
              $rootScope.hideNavbar = true;
              $rootScope.isUser = true;
            }
          }
          // And redirect to the index page
          $location.path('/password/reset/success');
        }).error(function (response) {
          $scope.error = response.message;
        });      
      } else {
        console.log('form is invalid');
      }
    };  
  }
]);
