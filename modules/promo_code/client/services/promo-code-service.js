angular.module('promoCode').service('promoCodeService', ['Restangular',
function (Restangular) {
  var _this = this;

    _this.getAllPromoCode = function(){
      return Restangular.one('api/promoCodes').get();      
    };
    _this.saveNewPromoCode = function(newPromoCode){
      return Restangular.one('api/promoCode').customPOST(newPromoCode);
    };
    _this.getPromoCode = function(existingPromoCodeId){
      return Restangular.one('api/promoCodeById/'+existingPromoCodeId).get();
    };
    _this.updatePromoCode = function(updatedPromoCode){
      return Restangular.one('api/promoCodeById/'+updatedPromoCode._id).customPUT(updatedPromoCode);
    };
    _this.deletePromoCode = function(promoCode){
      return Restangular.one('api/promoCodeById/'+promoCode._id).remove();

    };
  }
]);