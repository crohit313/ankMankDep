// Setting up route
angular.module('bottles').config(['$stateProvider',
  function ($stateProvider) {
    // bottles state routing
    $stateProvider
    .state('history', {
        abstract: true,
        url: '/history',
        template: '<ui-view/>',
        data: {
          roles: ['user', 'admin', 'superAdmin']
        }
      })
      .state('history.transact', {
        url: '/transact',
        templateUrl: 'modules/history/views/transact.admin.client.view.html',
        roles: ['admin']
      });
    }
]);