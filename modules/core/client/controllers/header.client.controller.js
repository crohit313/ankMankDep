angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus', 'uploadService',
  function ($scope, $state, Authentication, Menus, uploadService) {
    // Expose view variables
    $scope.$state = $state;
    var _this = this;
    _this.imageUrl = '';
    _this.awsUrl = '';
    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    _this.setAwsCredentials = function() {
      if(!uploadService.config.bucketName) {
       uploadService.getCredentials().then(function(response){
         uploadService.config = response;
         _this.awsUrl = 'https://s3.amazonaws.com/'+uploadService.config.bucketName+'/';
        //  _this.imageURL = Authentication.user.imageUrl;
         $scope.authentication = Authentication;         
       }, function(err) {
         notificationService.errorNotification(err.message);
       });
      } 
     };
    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);
