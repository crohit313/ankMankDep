angular.module('users').service('authenticationService', ['Restangular',
function (Restangular) {

  var _this = this;

  _this.userSignUp = function (userCredentials) {
    return Restangular.all('api/auth/signup').post(userCredentials);      
  };
  _this.userSignOut = function (userCredentials) {
    return Restangular.one('api/auth/signOut').get();      
  };
}
]);