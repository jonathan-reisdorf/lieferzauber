module.exports = ['$translateProvider', '$resourceProvider', '$locationProvider', '$httpProvider', 'CommonUiProvider', function ($translateProvider, $resourceProvider, $locationProvider, $httpProvider, CommonUi) {
  'use strict';

  var self = this;

  self.$get = function() {
    return self;
  };

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

  self.endpoints = {
    lieferheld : '/api/'
  };

  $resourceProvider.defaults.stripTrailingSlashes = false;

  $translateProvider.translations('de', require('../translations/de'));
  $translateProvider.preferredLanguage('de');
}];