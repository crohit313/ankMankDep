angular.module('hotels').service('hotelService', ['Restangular',
  function (Restangular) {
    var _this = this;
    _this.createHotel = function (hotel) {
      return Restangular.all('api/hotels').post(hotel);      
    };
    _this.getHotelList = function (paginationObject) {
      return Restangular.all('api/hotels').getList(paginationObject);
    };
    _this.getHotelById = function (hotelId) {
      return Restangular.one('api/hotels/'+hotelId).get();
    };
    _this.updateHotel = function (hotel) {
      return Restangular.all('api/hotels/'+hotel._id).customPUT(hotel);
    };
    _this.deleteHotel = function (hotelId) {
      return Restangular.all('api/hotels/'+hotelId).remove();
    };
    _this.changePasword = function(password){
      return Restangular.all('api/users/password').customPOST(password);
    };
    _this.getMyHoteldetail = function(adminId) {
      return Restangular.one('api/hotelByAdminId').get(adminId);
    };
    _this.getHotelReportById = function(paginationObjectWithHotelId) {
      return Restangular.one('api/historyByHotelId').get(paginationObjectWithHotelId);
    };
    _this.changePaymentStatus = function(report) {
      return Restangular.one('api/changeStatus/'+report._id).customPUT(report);      
    };
    _this.getProductByHotelId = function(id) {
      return Restangular.all('api/hotel/product').get(id);
    };
  }
]);