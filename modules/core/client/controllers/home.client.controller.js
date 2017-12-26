angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$state',
  function ($scope, Authentication, $state) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    var _this = this;
    _this.userRole = '';
    _this.hideNavbar = false;
    
    _this.initFunction = function() {
      if(Authentication.user) {
        _this.userRole = Authentication.user.roles[Authentication.user.roles.length-1];
        _this.changeState();      
      } else {
        _this.hideNavbar = true;
        $state.go('authentication.signin');                        
      }
    };

    _this.changeState = function() {
      if(_this.userRole == 'superAdmin') {
        $state.go('advertisement.list');          
      } else if(_this.userRole == 'admin') {
        $state.go('history.transact');          
      } else {
      }
    };
  }
]);
