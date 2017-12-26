angular.module('core').directive('headerTemplate', function($sce) {
    return {
        restrict: 'AEC',
        templateUrl: '/modules/core/views/headerTemplate.client.html',
        controller: 'sideNavController',
        controllerAs: 'navController'
    };
    });