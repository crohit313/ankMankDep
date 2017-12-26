angular.module('bottles').service('bottleService', ['Restangular',
  function (Restangular) {
    var _this = this;
    _this.createBottle = function (bottle) {
      return Restangular.all('api/bottles').post(bottle);      
    };
    _this.getBottleList = function (pageNumber) {
      return Restangular.all('api/bottles').getList(pageNumber);
    };
    _this.getBottleListByDrinkType = function (pageNumberObject) {
      return Restangular.all('api/bottlesByTypeFilter').getList(pageNumberObject);
    };
    _this.getBottleById = function (bottleId) {
      return Restangular.one('api/bottles/'+bottleId).get();
    };
    _this.updateBottle = function (bottle) {
      return Restangular.all('api/bottles/'+bottle._id).customPUT(bottle);
    };
    _this.deleteBottle = function (bottleId) {
      return Restangular.all('api/bottles/'+bottleId).remove();
    };
    _this.getProductByHotelId = function(id) {
      return Restangular.one('api/product').get(id);
    };
    _this.addManageHotelProduct = function(hotelProduct) {
      return Restangular.all('api/product').post(hotelProduct);
    }

    _this.updateManageHotelProduct = function(updatedHotelProduct) {
      return Restangular.all('api/updateProduct/'+updatedHotelProduct._id).customPUT(updatedHotelProduct);
    }
  }
]);