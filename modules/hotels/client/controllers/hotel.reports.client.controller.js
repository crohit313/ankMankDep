
angular.module('hotels').controller('hotelReportController', ['$scope', '$rootScope', '$stateParams', '$state', '$location', 'Authentication', 'hotelService', '$log', 'notificationService', '$modal', 'authenticationService', 'hotelService', 'drinkTypeService',
    function ($scope, $rootScope, $stateParams, $state, $location, Authentication, hotelService, $log, notificationService, $modal, authenticationService, hotelService, drinkTypeService) {

        var log = $log.log,
        _this = this;
        _this.authentication = Authentication;    
        _this.hotel = {};
        _this.user = {};
        _this.userRole = '';
        _this.showLoading = false;
        _this.showStatusLoading = false;    
        _this.currentPage = 1;
        _this.currentShowStatusLoadingIndex = null;
        _this.itemsPerPageForSuperAdmin = 100;
        _this.reportList = [];
        _this.drinkTypeList = [];
        _this.selectedDrinkType = {};
        _this.filterdList = [];

        //Init function
        _this.initFunction = function() {
            _this.showLoading = true;
            if(Authentication.user) {
            _this.userRole = Authentication.user.roles[Authentication.user.roles.length-1];
            }
            if($stateParams.hotelId) {
                $rootScope.$emit('activeState', 'hotels');                
                _this.getCurrentHotelReport($stateParams.hotelId);            
            } else {
                _this.getHotelByAdminId();
            }
            _this.getAllDrinkType();
        };

        //get hotel by admin id
        _this.getHotelByAdminId = function() {
            hotelService.getMyHoteldetail({adminId: _this.authentication.user._id}).then(function(hotelByAdminId) {
                if(hotelByAdminId) {
                    _this.getCurrentHotelReport(hotelByAdminId[0]._id);
                } else {
                    _this.showLoading = false;
                    notificationService.errorNotification('Error in processing request');
                }
            }, function(err) {
                notificationService.errorNotification(err.message);
            })
        };
        _this.getCurrentHotelReport = function(hotelId) {
            if(hotelId !== null) {
                hotelService.getHotelReportById({pageNumber:_this.currentPage, itemsPerPageForSuperAdmin:_this.itemsPerPageForSuperAdmin, hotelId: hotelId}).then(function(reportList) {
                    if(reportList.length) {
                        var reportArray = [];
                        angular.forEach(reportList, function(obj, index) {
                            if(obj.bottle != null) {
                             if (obj.bottle.type.type !== 'Beer') {
                                    if(obj.manageHotelProduct.products.length) {
                                        obj.cost = Math.ceil(obj.consumedVolume/30*obj.manageHotelProduct.products[0].costByHotel);                                    
                                    }
                                } else {
                                    if(obj.manageHotelProduct && obj.manageHotelProduct.products.length) {
                                        obj.cost = obj.consumedVolume/1*obj.manageHotelProduct.products[0].costByHotel;                                                                    
                                    }
                                }
                                reportArray.push(obj);
                            }
                        });
                    }
                    _this.reportList = reportArray; 
                    _this.filterdList = _this.reportList;
                    _this.showLoading = false;    
                }, function(err) {
                    _this.showLoading = false;
                    notificationService.errorNotification(err.message);
                });
            } else {
                _this.showLoading = false;
            }
        };
        
        _this.changePaymentStatus = function(report, index) {
            _this.currentShowStatusLoadingIndex = index;
            _this.showStatusLoading = true;
            if(_this.userRole == 'superAdmin') {
                report.status = !report.status;
                hotelService.changePaymentStatus(report).then(function(updatedReport){
                    notificationService.successNotification('Status updated successfully');
                    _this.showStatusLoading = false;
                }, function(err){
                    _this.showStatusLoading = false;
                    notificationService.errorNotification(err.data.message);
                });
            }
        };
        //get All Drink Types
        _this.getAllDrinkType = function () {
            drinkTypeService.getDrinkTypeList().then( function(drinkTypeList) {
                _this.drinkTypeList = drinkTypeList;
            }, function(err) {
                notificationService.errorNotification('Failed to fetch drink type list');
            });
        };

        _this.changeDrinkType = function() {
            _this.filterdList = [];
            if (_this.selectedDrinkType) {
                _this.filterdList = _.filter(_this.reportList, function (report) {
                    if (_this.selectedDrinkType.type === report.bottle.type.type) return report;
                });
            }else {
                _this.filterdList = _this.reportList;
            }
        }
    }
])