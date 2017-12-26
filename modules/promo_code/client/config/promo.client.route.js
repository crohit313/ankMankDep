angular.module('promoCode').config(['$stateProvider',
function ($stateProvider) {
  $stateProvider
  .state('promoCode', {
    abstract: true,
    url: '/promoCode',
    template: '<ui-view/>',
    data: {
      roles: ['superAdmin']
    }
  })
  .state('promoCode.list', {
    url: '/list',
    templateUrl: 'modules/promo_code/views/list-promo-code.client.view.html'
  })
  .state('promoCode.create', {
    url: '/create',
    templateUrl: 'modules/promo_code/views/create-edit-promo.client.view.html'
  })
  .state('promoCode.edit', {
    url: '/:promo_id/edit',
    templateUrl: 'modules/promo_code/views/create-edit-promo.client.view.html'
  });
}
]);