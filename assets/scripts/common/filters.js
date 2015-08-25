module.exports = function(application) {
  'use strict';

  application
    .filter('raw', ['$sce', function($sce) {
      return function(val) {
        return $sce.trustAsHtml(val);
      };
    }]);
};