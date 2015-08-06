'use strict';

var angular = require('angular');
require('angular-resource');
require('angular-route');
require('angular-hotkeys');

var application = angular.module('application', ['ngResource', 'ngRoute', 'cfp.hotkeys']);

require('./common/directives')(application);
require('./common/filters')(application);

/*
  application
    .factory('CommonStorage', require('./storage'))
    .controller('AppCtrl', require('./app'));
*/