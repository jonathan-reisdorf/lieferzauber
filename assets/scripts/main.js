'use strict';

var angular = require('angular');
require('angular-resource');
require('angular-route');
require('angular-translate');
require('angular-hotkeys');

var application = angular.module('application', ['ngResource', 'ngRoute', 'pascalprecht.translate', 'cfp.hotkeys']);

require('./common/directives')(application);
require('./common/filters')(application);

application
  .provider('CommonConfig', require('./common/config'))

  .config(require('./common/route'))

  .factory('CommonStorage', require('./common/storage'))
  .provider('CommonUi', require('./common/ui'))

  .controller('ViewMainCtrl', require('./views/main'))
;