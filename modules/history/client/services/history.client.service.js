angular.module('history').service('historyService', ['Restangular',
  function (Restangular) {
    var _this = this;

    _this.verifyBottleCode = function (bottleCode) {
        return Restangular.one('api/rack/UniqueCode').get(bottleCode);      
    };
    _this.getSuperAdminReports = function(paginationObject) {
      return Restangular.one('api/history/all').get(paginationObject);
    };
    _this.savePaymentReceipt = function(paymentReceipt) {
      return Restangular.all('api/paymentStatus').post(paymentReceipt);
    };
    _this.checkPaymentStatus = function(paymentReceiptId) {
      return Restangular.all('api/paymentStatusById').get(paymentReceiptId);
    };
    _this.cancelPaymentRequest = function(updatedPayementReceipt) {
      return Restangular.all('api/paymentStatusById/'+updatedPayementReceipt._id).customPUT(updatedPayementReceipt);      
    }
    _this.deductVolumeFromUserAccount = function(volume) {
      return Restangular.all('api/history').post(volume);
    };
    _this.checkCurrentBottleStock = function(bottleAndHotelId) {
      return Restangular.one('api/product/stockByBottleId').get(bottleAndHotelId);
    };
  }
]);