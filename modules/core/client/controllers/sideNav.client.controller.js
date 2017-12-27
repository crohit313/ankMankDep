angular.module('core').controller('sideNavController', ['$scope', '$rootScope', '$stateParams', '$state', 'Authentication', 'notificationService', 'authenticationService', '$window', '$timeout', '$location',
  function ($scope, $rootScope, $stateParams, $state, Authentication, notificationService, authenticationService, $window, $timeout, $location) {
      var _this = this;
	  console.log('inside controller')
      _this.hideNavbar = false;
      _this.authentication = Authentication.user;
      var stateNameArray = ['advertisement', 'bottles', 'hotels', 'promoCode'];      
      // This provides Authentication context.


    $rootScope.$on('activeState', function(ev, stateName) {
      if(stateName) {
        _this.setActiveClass(stateName);
        _this.setInactiveClass(stateName);              
      }
    });

    _this.setActiveClass = function(stateName) {

      $timeout(function() {
        angular.element( document.querySelector( '#'+stateName ) ).addClass('active'); 
      },0);
    };
    
    _this.setInactiveClass = function(stateName) {
  
      $timeout(function() {
        angular.forEach(stateNameArray, function(name, index) {
          if(name !== stateName) {
            angular.element( document.querySelector( '#'+name ) ).removeClass('active'); 
          }
        });
      },0);
    };
      // password
    _this.renderIfSuperAdmin = function() {
      if(Authentication.user) {
        var role =  Authentication.user.roles[Authentication.user.roles.length-1];
        if(role == 'superAdmin') {
          return true;
        }
      } else {
        return false;
      }
    };

    _this.renderIfAdmin = function() {
      if(Authentication.user) {
        var role =  Authentication.user.roles[Authentication.user.roles.length-1];
        if(role == 'admin') {
          return true;
        }
      } else {
        return false;
      }
    };

    _this.signOut = function () {
      authenticationService.userSignOut().then(function(response) {
        notificationService.successNotification('Sign Out successfully');
        $timeout(function() {
          $window.user = null;
          Authentication.user = null;
          $scope.userRole = '';
          $state.go('authentication.signin');
        },0);
      }, function(err) {
        notificationService.errorNotification('Sign Out Unsuccessfull');
      });
    };

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      var path = $location.path();
      if(path == '/authentication/signin' || path == '/termsAndConditions' || path.split('/')[1] == 'password') {
        _this.hideNavbar = true;
      } else {
        _this.hideNavbar = false;              
        _this.checkAllowedPolicy(event, toState, toParams, fromState, fromParams);
      }
      
    });

    _this.checkAllowedPolicy = function(event, toState, toParams, fromState, fromParams) {
      if(Authentication.user) {
        var role =  Authentication.user.roles[Authentication.user.roles.length-1];          
      } else {
        $state.transitionTo('authentication.signin');
        // return;
      }
      // if(toState!== undefined && toState.roles && toState.roles.length && fromState !== undefined) {
      //   var doesItExist = toState.roles.indexOf(role);
      //   if(doesItExist == -1) {
      //     console.log(fromState);
      //     if(fromState.name == "") {
      //       if(role == 'superAdmin') {
      //         $state.transitionTo('advertisement.list');          
              
      //       } else if(role == 'admin') {
      //         $state.transitionTo('history.transact');          
              
      //       } else {
      //         $state.transitionTo('authentication.signin');                        
      //       }
      //     } else {
      //       $state.transitionTo(fromState.name);            
      //     }
      //   }
      // }    
    };
  }
]);