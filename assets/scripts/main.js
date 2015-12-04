'use strict';

var angular = require('angular');
require('angular-resource');
require('angular-route');
require('angular-translate');
require('angular-hotkeys');
require('angular-cookies');

var application = angular.module('application', ['ngResource', 'ngRoute', 'ngCookies', 'pascalprecht.translate', 'cfp.hotkeys']);

require('./common/directives')(application);
require('./common/filters')(application);

application
  .provider('CommonUi', require('./common/ui'))
  .provider('CommonConfig', require('./common/config'))

  .config(require('./common/route'))

  .factory('CommonStorage', require('./common/storage'))
  .factory('CommonRequest', require('./common/request'))

  .factory('StorageService', require('./storage/service'))
  .factory('StorageUsers', require('./storage/users'))
  .factory('StorageRestaurants', require('./storage/restaurants'))
  .factory('StorageOrders', require('./storage/orders'))

  .controller('ViewMainCtrl', require('./views/main'))
;
