module.exports = ['$routeProvider', function($routeProvider) {
  'use strict';

  $routeProvider
    .when('/', {
      templateUrl : 'views/main.html',
      controller : 'ViewMainCtrl as main'
    })
    .otherwise({
      redirectTo : '/'
    });
}];