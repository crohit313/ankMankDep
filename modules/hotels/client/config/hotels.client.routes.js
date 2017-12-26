// Setting up route
angular.module('hotels').config(['$stateProvider',
  function ($stateProvider) {
    // hotels state routing
    $stateProvider
      .state('hotels', {
        abstract: true,
        url: '/hotels',
        template: '<ui-view/>',
        data: {
          roles: ['user', 'admin', 'superAdmin']
        }
      })
      .state('hotels.list', {
        url: '',
        templateUrl: 'modules/hotels/views/list-hotel.client.view.html'
      })
      .state('hotels.create', {
        url: '/create',
        data: {
          roles: []
        },
        templateUrl: 'modules/hotels/views/create-hotel.client.view.html'
      })
      .state('hotels.edit', {
        url: '/:hotelId/edit',
        templateUrl: 'modules/hotels/views/create-hotel.client.view.html',
        roles: ['superAdmin']
      })
      .state('hotels.update', {
        url: '/update/:hotelId',
        templateUrl: 'modules/hotels/views/hotel-profile-info-update.html',
        roles: ['superAdmin', 'admin']
      })
      .state('hotels.reports', {
        url: '/report/:hotelId',
        templateUrl: 'modules/hotels/views/reports-hotel.client.view.html',
        roles: ['admin']
      });
  }
]);
