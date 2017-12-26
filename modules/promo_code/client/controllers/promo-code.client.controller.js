angular.module('promoCode').controller('promoCodeController', ['$scope', '$stateParams', '$state', '$location', 'Authentication', 'hotelService', '$log', 'notificationService', '$modal', 'authenticationService', 'uploadService','$timeout','drinkTypeService','promoCodeService','$window',
function ($scope, $stateParams, $state, $location, Authentication, hotelService, $log, notificationService, $modal, authenticationService,uploadService,$timeout,drinkTypeService,promoCodeService,$window) {
  var log = $log.log,
  _this = this;
  _this.showLoading = false;
  _this.promoCodeList = [];
  _this.wantToDelete = false;

    _this.initFunction = function() {
        _this.getPromoCodeList();
    }

    _this.getPromoCodeList = function(){
        _this.showLoading = true;        
        promoCodeService.getAllPromoCode().then(function(promoCodeList){
            if(promoCodeList){
                _this.promoCodeList = promoCodeList;
                _this.showLoading = false;
            }
        },function(err){
            _this.showLoading = false;
            notificationService.errorNotification(err.message);
        });
    };

    _this.deletePromoCode = function(promoCode) {
        _this.showLoading = true; 
        var index = _this.promoCodeList.indexOf(promoCode);
        _this.promoCodeList.splice(index, 1);
        _this.deletePromoCodefromDB(promoCode);
    };

    _this.deletePromoCodefromDB = function (promoCode) {
        promoCodeService.deletePromoCode(promoCode).then(function(deletedPromoCode){
            if(deletedPromoCode){
                 notificationService.successNotification('PromoCode deleted successfully.');
                 _this.showLoading = false; 
            }
        },function(err){
            notificationService.errorNotification(err.message);
        });
    };
    _this.openModal = function (promoCode) {
        $modal.open({
          templateUrl: 'modules/core/views/modal.client.view.html',
          backdrop: true, 
          windowClass: 'modal',
          controller: function ($scope, $modalInstance, $log) {
            $scope.modal = {};
            $scope.modal.header = 'Confirmation Required';
            $scope.modal.message = 'Are you sure to delete this promo code?';
            $scope.submit = function () {
                if(promoCode) {
                  _this.deletePromoCode(promoCode);
                }
                $modalInstance.dismiss('cancel');
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel'); 
            };
          }
        });
      }; 
}
]);