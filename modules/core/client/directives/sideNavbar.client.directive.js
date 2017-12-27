angular.module('core').directive('sideNavBar', function($scope) {
    console.log('in directive')
    return {
        restrict: 'AEC',
        templateUrl: '/modules/core/views/sideNav.client.view.html',
        controller: 'sideNavController',
        controllerAs: 'navController'
    };
    });