// Setting up route
angular.module('advertisement').config(['$stateProvider',
  function ($stateProvider) {
    // advertisement state routing
    $stateProvider
      .state('advertisement', {
        abstract: true,
        url: '/advertisement',
        template: '<ui-view/>',
        data: {
          roles: ['superAdmin']
        }
      })
      .state('advertisement.list', {
        url: '',
        data: {stateName:'Advertisement'},
        templateUrl: 'modules/advertisement/views/list-ads.client.view.html'
      })
      .state('advertisement.create', {
        url: '/create',
        data: {stateName:'Advertisement'},
        templateUrl: 'modules/advertisement/views/create-ads.client.view.html'
      })
      .state('advertisement.edit', {
        url: '/:advertisementId/edit',
        data: {stateName:'Advertisement'},
        templateUrl: 'modules/advertisement/views/create-ads.client.view.html'
      });
  }
]);
