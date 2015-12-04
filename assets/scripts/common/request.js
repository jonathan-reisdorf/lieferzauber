module.exports = ['$resource', '$http', '$cookies', 'CommonConfig', function($resource, $http, $cookies, CommonConfig) {
  'use strict';

  var defaultAuth = 'LH api-key=BqFXeTedMu1LQazCYZznkzyL5CFffcWIDW7GEpmCFVAPLi1dA4cdt76BnXkyEuqWAbCf8ZWtADOzaz5851LQj1dlppQVZSxPPAe0cA0g7Tn2GoXWTdfStKk5yrKrrB0J';

  var generateResource = function(route, endpoint, paramDefaults, actions, options) {
    if (actions) {
      angular.forEach(actions, function(action) {
        action.url = CommonConfig.endpoints[endpoint] + action.url + '/';
      });
    }

    options = options || {
      stripTrailingSlashes : CommonConfig.stripTrailing[endpoint]
    };

    return $resource((endpoint ? CommonConfig.endpoints[endpoint] : '/') + route + '/', paramDefaults, actions, options);
  };
  $http.defaults.headers.common.Authentication = defaultAuth;
  $cookies.put('_ra_ref.RA-220628-1.bd3a', '["753313","",1449235518,""]');

  return {
    users : generateResource('users', 'lieferheld', null, {
      register : {
        method : 'POST',
        url : 'users'
      },
      update : {
        method : 'PUT',
        url : 'users/:userId'
      }
    }),
    orders : generateResource('users/:userId/orders', 'lieferheld', {
      userId : '@user_id',
      orderId : '@id'
    }, {
      update : {
        method : 'PUT',
        url : 'users/:userId/orders/:orderId'
      }
    }),
    restaurants : generateResource('restaurants', 'lieferheld', null, {
      getDetails : {
        method : 'GET',
        url : 'restaurants/:restaurantId'
      }
    }),
    geocode : generateResource('json', 'gmaps', { sensor : false }),
    setToken : function(token) {
      $http.defaults.headers.common.Authentication = defaultAuth + ',token=' + token;
    }
  };
}];
