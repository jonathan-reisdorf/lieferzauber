module.exports = ['$routeParams', 'CommonUi', 'CommonStorage', 'StorageRestaurants', function($routeParams, CommonUi, CommonStorage, StorageRestaurants) {
  'use strict';
  var self = this;

  self.categories = {
    items : [],
    select : function(category) {
      this.active = category || this.items[Math.round(Math.random() * (this.items.length - 1))];
    }
  };

  self.restaurants = {
    items : [],
    storage : StorageRestaurants,
    load : function(address) {
      CommonUi.busy = true;
      this.items = [];
      self.categories.items = [];

      this.storage.get(address.city.toLowerCase(), address.zipcode, function(response) {
        CommonUi.busy = false;
        if (response.data) {
          self.restaurants.items = response.data;
          self.restaurants.items.map(function(restaurant) {
            return (restaurant && restaurant.general) ? restaurant.general.main_category : false;
          }).filter(function(category) {
            return !!category;
          }).forEach(function(category) {
            if (self.categories.items.indexOf(category) === -1) {
              self.categories.items.push(category);
            }
          });

          self.categories.select();
        }
      });

    }
  };

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
      self.restaurants.load(address);
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