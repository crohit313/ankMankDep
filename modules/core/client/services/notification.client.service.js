//Articles service used for communicating with the articles REST endpoints
angular.module('core').service('notificationService', ['Notification',
  function (Notification) {
    var _this = this;
    _this.successNotification = function (message) {
        Notification.success({message:'<i class="glyphicon glyphicon-ok"></i>'+' '+message,
        delay: 3500,
        positionX: 'right',
        positionY: 'bottom', replaceMessage: true});          
    };
    _this.errorNotification = function (message) {
        Notification.error({message:'<i class="glyphicon glyphicon-remove"></i>'+' '+message,
        delay: 5000,
        positionX: 'right',
        positionY: 'bottom', replaceMessage: true});          
    };
  }
]);
