angular.module('promoCode').controller('createEditPromoCodeController', ['$scope', '$rootScope', '$stateParams', '$state', '$location', 'Authentication', 'hotelService', '$log', 'notificationService', '$modal', 'authenticationService', 'uploadService','$timeout','drinkTypeService','promoCodeService',
function ($scope, $rootScope, $stateParams, $state, $location, Authentication, hotelService, $log, notificationService, $modal, authenticationService,uploadService,$timeout,drinkTypeService,promoCodeService) {
  var log = $log.log,
  _this = this;
  _this.promoCodeList = [];
  _this.startDatePickerOpened = false;
  _this.endDatePickerOpened = false;
  _this.editMode = false;
  _this.newPromo = {};
  _this.promo_id = {};
  _this.showLoading = false;
  _this.currentDate = new Date();

    _this.initFunction = function(){
        _this.showLoading = true;
        $rootScope.$emit('activeState', 'promoCode');
        _this.setDatePickerOptions(); 
        if($stateParams.promo_id) {
            _this.promo_id = $stateParams.promo_id;
            _this.editMode = true; 
            _this.editPromoCode();
        }else{
            _this.showLoading = false;
        }   
    };
    _this.savePromoCode = function(){
        _this.showLoading = true;
        if(_this.newPromo.promoCode && _this.newPromo.discount && _this.newPromo.minAmmountForDiscount){
            promoCodeService.saveNewPromoCode(_this.newPromo).then(function(savedPromoCode){
                if(savedPromoCode){
                    //_this.promoCodeList = savedPromoCode;
                    notificationService.successNotification('Promo Code saved successfully.');
                    _this.showLoading = false;
                }
            },function(err){
                _this.showLoading = false;
                if(err.message !== undefined) {
                    notificationService.errorNotification(err.message);
                }else {
                    notificationService.errorNotification("Promo-code is already used");
                }
            });
        }else{
            _this.showLoading = false;
            notificationService.errorNotification('Kindly fill-up the required fields.');
        }
        
    };
    _this.editPromoCode = function(){
        _this.showLoading = true;
        promoCodeService.getPromoCode(_this.promo_id).then(function(existingPromoCode){
            if(existingPromoCode){
                 _this.newPromo = existingPromoCode;
                 _this.showLoading = false;
            }
        },function(err){
            _this.showLoading = false;
            notificationService.errorNotification(err.data.message);
        });
    };

    _this.checkDate = function() {
        var currentDate = new Date();
        
        if(_this.newPromo.startDate > _this.newPromo.endDate){
          _this.newPromo.endDate = currentDate;
          notificationService.errorNotification('Start date can not be greater than or equal to end date.');
          _this.dateValidatioError = false;
        }else{
          _this.dateValidatioError = true;
        }
      };
    _this.updatePromoCode = function (updatedPromoCode) {
        _this.showLoading = true;
        promoCodeService.updatePromoCode(updatedPromoCode).then(function(existingPromoCode){
            if(existingPromoCode){
                 _this.newPromo = existingPromoCode;
                 notificationService.successNotification('PromoCode updated successfully.');
                 _this.showLoading = false;
            }
        },function(err){
            _this.showLoading = false;
            if(err.message !== undefined) {
                notificationService.errorNotification(err.message);
            }else {
                notificationService.errorNotification("Promo-code is already used");
            }
            
        });
    };

    _this.toggleStartDatePicker = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        _this.startDatePickerOpened = ! _this.startDatePickerOpened;
    };
  
    _this.toggleEndDatePicker = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        _this.endDatePickerOpened = ! _this.endDatePickerOpened;
    };


    _this.setDatePickerOptions = function () {
        _this.options ={
            formatDay: 'd',
            showWeeks: false,
            showButtonBar: false
        }
        _this.newPromo.startDate = new Date();
        _this.newPromo.endDate = new Date();
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