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

  return self;
}];