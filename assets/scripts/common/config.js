module.exports = ['$translateProvider', function ($translateProvider) {
  'use strict';

  var self = this;

  self.$get = function() {
    return self;
  };

  self.endpoints = {
    lieferheld : 'https://www.lieferheld.de/api/'
  };

  $translateProvider.translations('de', require('../translations/de'));
  $translateProvider.preferredLanguage('de');
}];