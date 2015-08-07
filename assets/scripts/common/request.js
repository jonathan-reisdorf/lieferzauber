module.exports = ['$resource', '$http', 'CommonConfig', function($resource, $http, CommonConfig) {
  'use strict';

  var generateResource = function(route, endpoint, paramDefaults, actions, options) {
    if (actions) {
      angular.forEach(actions, function(action) {
        action.url = CommonConfig.endpoints[endpoint] + action.url;
      });
    }

    return $resource((endpoint ? CommonConfig.endpoints[endpoint] : '/') + route, paramDefaults, actions, options);
  };
  $http.defaults.headers.common.Authentication = 'LH api-key=BqFXeTedMu1LQazCYZznkzyL5CFffcWIDW7GEpmCFVAPLi1dA4cdt76BnXkyEuqWAbCf8ZWtADOzaz5851LQj1dlppQVZSxPPAe0cA0g7Tn2GoXWTdfStKk5yrKrrB0J';

  return {
    users : generateResource('users/', 'lieferheld', null, {
      register : {
        method : 'POST',
        url : 'users/'
      }
    }),
    restaurants : generateResource('restaurants/', 'lieferheld', null, {})
  };
}];