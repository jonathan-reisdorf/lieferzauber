module.exports = ['CommonRequest', 'StorageService',  function(CommonRequest, StorageService) {
  'use strict';
  var self = this,
    actions = StorageService.create();

  self.get = function(city, zipcode, cb) {
    actions.apply(CommonRequest.restaurants.get, cb, {
      city : city,
      zipcode : zipcode,
      fields : 'general,rating,availability,payment_methods,min_order_value,delivery_fees,uri',
      sort_by : 'default',
      closest_per_chain : true,
      offset : 0,
      limit : 0
    }, {});
  };

  self.filterRelevant = function(restaurants) {
    return restaurants.filter(function(restaurant) {
      if (!restaurant.general || !restaurant.general.main_category || !restaurant.rating || !restaurant.payment_methods) {
        return false;
      }

      return restaurant.general.open && restaurant.general.delivery_home && restaurant.general.reachable && restaurant.general.online &&
        restaurant.rating.average >= 3.75 && restaurant.payment_methods.filter(function(paymentMethod) {
          return paymentMethod.name === 'cash';
        }).length;
    });
  };

  self.selectRandomByCategory = function(restaurants, category) {
    var restaurantsSelection = angular.copy(restaurants.filter(function(restaurant) {
      return restaurant.general.main_category === category;
    }));

    return restaurantsSelection[Math.round(Math.random() * (restaurantsSelection.length - 1))];
  };

  return self;
}];