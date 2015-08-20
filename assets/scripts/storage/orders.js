module.exports = ['CommonRequest', 'StorageService',  function(CommonRequest, StorageService) {
  'use strict';
  var self = this,
    actions = StorageService.create();

  self.create = function(userId, restaurantId, cb) {
    actions.apply(CommonRequest.orders.save, cb, {}, {
      user_id : userId,
      restaurant_id : restaurantId
    });
  };

  self.update = function(orderData, cb) {
    actions.apply(CommonRequest.orders.update, cb, {}, orderData);
  };

  return self;
}];