
angular.module('history').controller('historyController', ['$scope', '$stateParams', '$state', '$location', 'Authentication', 'hotelService', '$log', 'notificationService', 'historyService', '$timeout','PushNotificationService', '$interval', '$modal',
function ($scope, $stateParams, $state, $location, Authentication, hotelService, $log, notificationService, historyService, $timeout,PushNotificationService, $interval, $modal){
  var log = $log.log,
  paymentStatusCheck = '',
  openModal = '',
  closeModal = '',
  _this = this;
  _this.showModal = false;
  _this.authentication = Authentication;
  _this.bottle = {};
  _this.uniqueCode = '';
  _this.bottleDetails = {};
  _this.pendingConfirmtion = false;
  _this.user = {};
  _this.date = new Date();
  _this.paymentReceipt = {};
  _this.updatedPaymentReceipt = {};
  _this.paymentReceiptId = '';
  _this.paymentReceiptStatus = '';
  _this.showPaymentReceipt = false;
  _this.showOverlay = false;
  _this.showUniqueCodeLoading = false;
  _this.delayInMiliSeconds = 3000;
  _this.timeLimitToCheckPaymentStatusInMiliSeconds = 1800000;
  _this.count = _this.timeLimitToCheckPaymentStatusInMiliSeconds / _this.delayInMiliSeconds;

  _this.initFunction = function() {
    if(Authentication.user) {
      _this.getHotelByAdminId();
    }
  };

  //get hotel by admin id
  _this.getHotelByAdminId = function() {
    hotelService.getMyHoteldetail({adminId: _this.authentication.user._id}).then(function(hotelByAdminId) {
      _this.hotel = hotelByAdminId[0];
    }, function(err) {
      _this.showLoading = false;
      notificationService.errorNotification(err.data.message);
    });
  };

  _this.verifyBottleCode = function(){
    _this.showUniqueCodeLoading = true;
    if(_this.uniqueCode){
      historyService.verifyBottleCode({uniqueCode: _this.uniqueCode}).then (function(bottle) {
        if(bottle.length){
          _this.checkStockForSelectedBottle(bottle);
        }else{
          _this.emptyBottleInfo();
          _this.showUniqueCodeLoading = false;
          notificationService.errorNotification('Kindly enter a valid code');
          
        }
      }, function(err) {
        _this.emptyBottleInfo();
        _this.showUniqueCodeLoading = false;
        notificationService.errorNotification('Error in processing the request');
      });
    }else{
      _this.emptyBottleInfo();
      _this.showUniqueCodeLoading = false;
      notificationService.errorNotification('Please enter bottle code.');
    }
  };

  _this.checkStockForSelectedBottle = function(bottleDetails) {
    var ids = {bottleId:  bottleDetails[0].bottle._id, hotelId: _this.hotel._id}
    historyService.checkCurrentBottleStock(ids).then(function(bottleStatus) {
      if(bottleStatus.status) {
        _this.bottleDetails = bottleDetails;        
        _this.user = _this.bottleDetails[0].user;
        _this.bottle.uniqueCode = _this.uniqueCode;
        _this.pendingConfirmtion = true;
        _this.showUniqueCodeLoading = false;
        _this.bottle.consumedQuantity = null;
      } else {
        _this.emptyBottleInfo();        
        _this.showUniqueCodeLoading = false;        
        notificationService.errorNotification('We do not serve this Drink.');
      }
    }, function(err) {
      _this.showUniqueCodeLoading = false;              
      notificationService.errorNotification(err.data.message);
    });
  };

  _this.emptyBottleInfo = function(){
    _this.bottleDetails = {};
  };

  _this.setPaymentStatus = function() {
    if(_this.bottleDetails[0]){
      if(_this.bottle.consumedQuantity > 0) {
        if(_this.bottleDetails[0].remainingVolume >= _this.bottle.consumedQuantity) {
          _this.showOverlay = true;
          _this.paymentReceipt = {
            user: _this.user._id,
            hotel: _this.hotel._id,
            bottle: _this.bottleDetails[0].bottle._id,
            uniqueCode: _this.bottleDetails[0].uniqueCode,
            cost: Math.round(_this.bottleDetails[0].costPerUnit * _this.bottle.consumedQuantity),
            quantity: _this.bottle.consumedQuantity,
            status: 'Accepted'
          }
          historyService.savePaymentReceipt(_this.paymentReceipt).then(function(paymentReceipt) {
            if(paymentReceipt._id) {
              _this.paymentReceiptId = paymentReceipt._id;
              _this.deductVolume(_this.paymentReceiptId);
            }
          }, function(err) {
            notificationService.errorNotification(err.data.message);
          });
        } else {
          notificationService.errorNotification('Insufficient balance in stock');
        }
      } else {
        notificationService.errorNotification('Invalid quantity');
      }
    }else{
      notificationService.errorNotification('You have not entered any bottle code. Kindly submit it.');
    }
  };

  // _this.checkPaymentStatus = function(invoiceData) {
  //   paymentStatusCheck = $interval(function() {
  //     historyService.checkPaymentStatus(_this.paymentReceiptId).then(function(response) {
  //       _this.updatedPaymentReceipt = response;
  //       if(response.status === 'Accepted') {
  //         $interval.cancel(paymentStatusCheck);
  //         _this.paymentInvoice = invoiceData;
  //         _this.paymentInvoice.status = response.status;
  //         _this.deductVolume();
  //       } else if(response.status === 'Cancelled') {
  //         $interval.cancel(paymentStatusCheck);
  //         _this.showOverlay = false;          
  //         notificationService.errorNotification('Payment Cancelled By The User');
  //       }
  //     }, function(err) {
  //       notificationService.errorNotification(err.data.message);
  //     });
  //   }, _this.delayInMiliSeconds, _this.count);
  // };

  // _this.cancelPaymentRequest = function() {
  //   $interval.cancel(paymentStatusCheck);    
  //   _this.updatedPaymentReceipt.cancelledByAdmin = true;
  //   _this.updatedPaymentReceipt.status = 'Cancelled';
  //   _this.updatedPaymentReceipt.lastUpdated = Date.now();

  //   historyService.cancelPaymentRequest(_this.updatedPaymentReceipt).then(function(response) {
  //     notificationService.errorNotification('You have canceled the payment request');
  //     _this.clearCurrentPayment();
  //   }, function(err) {
  //     notificationService.errorNotification(err.message);
  //   }); 
  // };

  _this.deductVolume = function(paymentReceiptId,invoiceData) {
    var taxAmount = Math.round(_this.paymentReceipt.cost * _this.hotel.taxPercentage / 100);
    var data = {
      'bottleName': _this.bottleDetails[0].bottle.name,
      'quantity': _this.bottle.consumedQuantity,
      'tax': taxAmount,
      'cost': _this.paymentReceipt.cost,
      'unit': _this.bottleDetails[0].bottle.unit,
      'status': 'Accepted',
      'taxPercentage' : _this.hotel.taxPercentage,
      'uniqueCode': _this.uniqueCode,
      'consumedVolume': _this.bottle.consumedQuantity,
      'hotelId': _this.hotel._id,
      'hotelName': _this.authentication.user.displayName,
      'hotelEmail': _this.authentication.user.email,
      'userName': _this.user.displayName,
      'userEmail': _this.user.email
    };

    historyService.deductVolumeFromUserAccount(data).then(function(response) {
      _this.paymentInvoice = data;
      _this.showPaymentReceipt = true;
      notificationService.successNotification('Payment Successfull');
      var notificationData = {
        'message': 'Payment notification from '+ _this.authentication.user.displayName,
        'playerId': _this.user.deviceToken,
        'paymentReceiptId': paymentReceiptId
      }
      _this.sendNotification(notificationData);
    }, function(err) {
      notificationService.errorNotification(err.message);
    });
  };

  _this.sendNotification = function(data) {
    PushNotificationService.sendNotification(data).then(function (response) {
      // notificatoin sent successfully
    }, function (errorResponse) {
      // notificatoin not sent successfully
    });
  };


  _this.clearCurrentPayment = function() {
    _this.uniqueCode = '';
    _this.bottle = {};
    _this.paymentInvoice = {};
    _this.paymentReceiptId = '';
    _this.bottleDetails = {};
    _this.showOverlay = false;
    _this.showPaymentReceipt = false;
  };

  // _this.resendPaymentRequest = function() {
  //   _this.sendNotification(_this.paymentReceiptId);
  //   $interval.cancel(paymentStatusCheck);    
  //   notificationService.successNotification('Re-sending the payment request'); 
  // };
}
]);