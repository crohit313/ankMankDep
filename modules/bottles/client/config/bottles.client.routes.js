// Setting up route
angular.module('bottles').config(['$stateProvider',
  function ($stateProvider) {
    // bottles state routing
    $stateProvider
      .state('bottles', {
        abstract: true,
        url: '/bottles',
        template: '<ui-view/>'
      })
      .state('bottles.list', {
        url: '',
        templateUrl: 'modules/bottles/views/list-bottle.client.view.html'
        
      })
      .state('bottles.create', {
        url: '/create',
        templateUrl: 'modules/bottles/views/create-bottle.client.view.html',
        roles: ['superAdmin']
      })
      .state('bottles.edit', {
        url: '/:bottleId/edit',
        templateUrl: 'modules/bottles/views/create-bottle.client.view.html',
        roles: ['admin','superAdmin']
      })
      .state('bottles.manage', {
        url: '/manage/:hotelId',
        templateUrl: 'modules/bottles/views/manage-bottle.client.view.html',
        roles: ['admin','superAdmin']
      })
      .state('drinkType', {
        abstract: true,
        url: '/drinkType',
        template: '<ui-view/>',
        data: {
          roles: ['admin', 'superAdmin']
        }
      })
      .state('drinkType.list', {
        url: '',
        templateUrl: 'modules/bottles/views/list-drink-type.client.view.html'
      })
      .state('drinkType.create', {
        url: '/create',
        templateUrl: 'modules/bottles/views/create-drink-type.client.view.html',
        roles: ['superAdmin']
      })
      .state('drinkType.edit', {
        url: '/:drinkTypeId/edit',
        templateUrl: 'modules/bottles/views/create-drink-type.client.view.html',
        roles: ['superAdmin']
      });
  }
]);
