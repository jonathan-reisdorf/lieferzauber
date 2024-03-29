module.exports = ['$translateProvider', '$resourceProvider', '$locationProvider', '$httpProvider', 'CommonUiProvider', function ($translateProvider, $resourceProvider, $locationProvider, $httpProvider, CommonUi) {
  'use strict';

  var self = this;

  self.$get = function() {
    return self;
  };

  $httpProvider.defaults.withCredentials = true;
  $httpProvider.interceptors.push(['$q', function($q) {
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

        if (rejection.data && rejection.data.errors) {
          rejection.data.errors.forEach(function(error) {
            CommonUi.notifications.throwError(error ? (error.error_code + ': ' + error.error_message) : 'ERR #000');
          });
        } else {
          CommonUi.notifications.throwError('MESSAGE.GENERIC.' + rejection.status);
        }

        return $q.reject(rejection);
      }
    };
  }]);

  $locationProvider.html5Mode(true);

  self.endpoints = {
    lieferheld : '/api/',
    gmaps : '/maps/api/geocode/'
  };

  self.stripTrailing = {
    lieferheld : false,
    gmaps : true
  };

  $translateProvider.translations('de', require('../translations/de'));
  $translateProvider.translations('en', require('../translations/en'));
  $translateProvider.preferredLanguage((navigator.language || navigator.userLanguage).indexOf('de') !== -1 ? 'de' : 'en');
}];