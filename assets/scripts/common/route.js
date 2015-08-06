module.exports = ['$routeProvider', '$locationProvider', '$httpProvider', 'CommonUiProvider', function($routeProvider, $locationProvider, $httpProvider, CommonUi) {
  'use strict';


  $httpProvider.defaults.withCredentials = true;
  $httpProvider.interceptors.push(['$q', '$translate', function($q, $translate) {
    return {
      request : function(config) {
        CommonUi.busy = true;
        return config;
      },
      requestError : function(rejection) {
        return $q.reject(rejection);
      },
      response : function(response) {
        CommonUi.busy = false;
        return response;
      },
      responseError: function(rejection) {
        CommonUi.busy = false;

        $translate('MESSAGE.GENERIC.' + rejection.status).then(function(translation) {
          CommonUi.notifications.autoRemove(CommonUi.notifications.add('ERROR', translation));
        });

        return $q.reject(rejection);
      }
    };
  }]);

  $locationProvider.html5Mode(true);

  $routeProvider
    .when('/', {
      templateUrl : 'views/main.html',
      controller : 'ViewMainCtrl as main'
    })
    .when('/:category', {
      templateUrl : 'views/main.html',
      controller : 'ViewMainCtrl as main'
    })
    .otherwise({
      redirectTo : '/'
    });
}];