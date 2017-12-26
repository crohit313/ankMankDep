angular.module('core').directive('sideNavBar', function($sce) {
    return {
        restrict: 'AEC',
        templateUrl: '/modules/core/views/sideNav.client.view.html',
        controller: 'sideNavController',
        controllerAs: 'navController'
    };
    });