angular.module('advertisement').service('advertisementService', ['Restangular',
  function (Restangular) {
    var _this = this;
    _this.createAdvertisement = function (advertisement) {
      return Restangular.all('api/advertisements').post(advertisement);      
    };
    _this.getAdvertisements = function (pageNumberObject) {
      return Restangular.all('api/advertisements').getList(pageNumberObject);
    };

    _this.getAdvertisementById = function (advertisementId) {
      return Restangular.one('api/advertisements/'+advertisementId).get();
    };
    
    _this.updateAdvertisement = function (advertisement) {
      return Restangular.all('api/advertisements/'+advertisement._id).customPUT(advertisement);
    };
    _this.deleteAdvertisement = function (advertisementId) {
      return Restangular.all('api/advertisements/'+advertisementId).remove();
    };
  }
]);