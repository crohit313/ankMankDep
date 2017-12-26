// hotels controller
angular.module('bottles').controller('drinkTypeController', ['$scope', '$stateParams', '$state', '$location', 'Authentication', 'drinkTypeService', '$log', 'notificationService', '$modal', '$rootScope',
  function ($scope, $stateParams, $state, $location, Authentication, drinkTypeService, $log, notificationService, $modal, $rootScope) {
    var log = $log.log,
    _this = this;
    _this.authentication = Authentication;
    _this.userRole = Authentication.user.roles[Authentication.user.roles.length-1];
    _this.drinkType = {};
    _this.drinkTypeList = [];
    _this.model = {};
    _this.editMode = false;
    _this.showLoading = true;
    
    _this.initFunction = function() {
        _this.showLoading = true;
        if (Authentication.user) {
            _this.getAllDrinkType();
        }
    };

    //get All Drink Types
    _this.getAllDrinkType = function () {
        drinkTypeService.getDrinkTypeList().then( function(drinkTypeList) {
            _this.drinkTypeList = drinkTypeList;
            _this.model = {
                drinkTypeList:_this.drinkTypeList,
                selected: {}
            };
            _this.showLoading = false;
        }, function(err) {
            _this.showLoading = false;
            notificationService.errorNotification('Failed to fetch drink type list');
        });
    };
    //Create or Update Drink Type
    _this.createUpdateDrinkType = function (drinkType) {
        _this.showLoading = true;
        if(_this.editMode) {
            // To update the drink type
            drinkTypeService.updateDrinkType(drinkType).then( function(drinkType) {
                $rootScope.$emit('reFetchDrinkType', true);
                notificationService.successNotification('Drink type updated successfully');
                _this.editMode = false;
                _this.drinkType = {};
                _this.showLoading = false;

            }, function(err) {
                _this.showLoading = false;
                notificationService.errorNotification(err.data.message);
            });
        } else {
            // To create the drink type
            drinkTypeService.createDrinkType(_this.drinkType).then( function(response) {
                $rootScope.$emit('reFetchDrinkType', true);                
                notificationService.successNotification('Drink Type Added Successfully');
                _this.drinkType = {};
                _this.getAllDrinkType();
            }, function(err) {
                _this.showLoading = false;
                notificationService.errorNotification(err.data.message);
            });
        }
    };

    //To delete the drink type
    _this.deleteDrinkType = function (drinkTypeId) {
        drinkTypeService.deleteDrinkType(drinkTypeId).then( function(drinkType) {
            $rootScope.$emit('reFetchDrinkType', true);            
            notificationService.successNotification('Drink type deleted successfully');
            _this.getAllDrinkType();
        }, function(err) {
            _this.showLoading = false;
            notificationService.errorNotification('Failed to delete the drink type');
        });
    };

    //To open the confirmation modal
    _this.openModal = function (drinkTypeId) {
        $modal.open({
          templateUrl: 'modules/core/views/modal.client.view.html',
          backdrop: true, // setting backdrop allows us to close the modal window on clicking outside the modal window
          windowClass: 'modal', // windowClass - additional CSS class(es) to be added to a modal window template
          controller: function ($scope, $modalInstance, $log) {
            $scope.modal = {};
            $scope.modal.header = 'Confirmation Required';
            $scope.modal.message = 'Are you sure to delete this drink type?';
            $scope.submit = function () {
                _this.showLoading = true;
                _this.deleteDrinkType(drinkTypeId);
                $modalInstance.dismiss('cancel');
            };
            $scope.cancel = function () {
              $modalInstance.dismiss('cancel'); 
            };
          }
        });
    };

    _this.openDrinkTypeModal = function (bottle) {
        $modal.open({
          templateUrl: 'modules/bottles/views/list-drink-type.client.view.html',
          backdrop: true, // setting backdrop allows us to close the modal window on clicking outside the modal window
          windowClass: 'modal', // windowClass - additional CSS class(es) to be added to a modal window template
          controller: function ($scope, $modalInstance, $log) {
            $scope.closeDrinkTypeModal = function() {
            if(_this.editMode) {
                _this.editMode = !_this.editMode;
                _this.drinkType = {};
            }
            $modalInstance.dismiss('cancel');                 
            };
          }    
        });
      };


    // gets the template to ng-include for a table row / item
    _this.getTemplate = function (contact) {
        if (contact._id === _this.model.selected._id) return 'edit';
        else return 'display';
    };

    _this.editContact = function (contact) {
        _this.model.selected = angular.copy(contact);
        _this.editMode = true;
    };

    _this.saveContact = function (idx) {
        _this.model.drinkTypeList[idx] = angular.copy(_this.model.selected);
        _this.createUpdateDrinkType(_this.model.selected);
        _this.cancel();
    };

    _this.cancel = function () {
        _this.editMode = false;
        _this.model.selected = {};
    };
  }  
]);