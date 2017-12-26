angular.module('bottles').service('drinkTypeService', ['Restangular',
  function (Restangular) {
    var _this = this;

    // to create or list the drink type 
    _this.createDrinkType = function (drinktype) {
        return Restangular.all('api/drinkType').post(drinktype);
    };
    _this.getDrinkTypeList = function () {
        return Restangular.all('api/drinkType').getList();
    };

    //To get drink type by id or to update ,delete the drinktype
    _this.getDrinkTypeById = function (drinktypeId) {
      return Restangular.one('api/drinkType/'+drinktypeId).get();
    };
    _this.updateDrinkType = function (drinktype) {
      return Restangular.one('api/drinkType/'+drinktype._id).customPUT(drinktype);
    };
    _this.deleteDrinkType = function (drinktypeId) {
      return Restangular.one('api/drinkType/'+drinktypeId).remove();
    };
  }
]);    