// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ui.router', 'ngSanitize','ui.bootstrap', 'ui.utils', 'angularFileUpload', 'ngMask', 'restangular', 'ui-notification', 'gm', 'ngFileUpload','ngTableToCsv'];
  // '720kb.datepicker'
  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
console.log(moduleName);
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();
