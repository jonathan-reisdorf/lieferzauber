module.exports = ['$routeParams', 'CommonUi', 'CommonStorage', 'StorageRestaurants', function($routeParams, CommonUi, CommonStorage, StorageRestaurants) {
  'use strict';
  var self = this;

  self.restaurants = StorageRestaurants;

  self.addresses = {
    items : CommonStorage.get('addresses') || [],
    editing : false,
    edit : function(address) {
      this.editing = address || {};
    },
    select : function(address) {
      this.editing = false;
      if (!address) { return; }

      this.active = address;

      self.restaurants.get('berlin', 10115, function(data) {
        console.log(data);
      });
    },
    cancel : function() {
      this.editing = false;
    },
    save : function() {
      var newAddress = this.editing;

      if (!newAddress.id) {
        angular.extend(newAddress, { id : new Date().getTime() });
        this.items.push(newAddress);
      }

      CommonStorage.set('addresses', this.items);
      this.editing = false;
    }
  };

  self.addresses.select(self.addresses.items[0]);

  self.ui = CommonUi;
}];