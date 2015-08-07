module.exports = ['$routeParams', 'CommonUi', 'CommonStorage', 'StorageRestaurants', function($routeParams, CommonUi, CommonStorage, StorageRestaurants) {
  'use strict';
  var self = this;

  self.hungryPeople = {
    val : 1,
    changed : function() {
      this.val = parseInt(this.val);
      if (isNaN(this.val)) {
        this.val = 1;
      }

      self.restaurants.generateMenu(true);
    }
  };

  self.categories = {
    items : [],
    select : function(category) {
      this.active = category || this.active || this.items[Math.round(Math.random() * (this.items.length - 1))];
      self.restaurants.generateMenu();
    }
  };

  self.restaurants = {
    items : [],
    storage : StorageRestaurants,
    load : function(address) {
      CommonUi.busy = true;
      this.items = [];
      this.active = null;
      self.categories.active = null;
      self.categories.items = [];

      this.storage.get(address.city.toLowerCase(), address.zipcode, function(response) {
        if (response.data) {
          self.restaurants.items = StorageRestaurants.filterRelevant(response.data);
          self.restaurants.items.map(function(restaurant) {
            return restaurant.general.main_category;
          }).forEach(function(category) {
            if (self.categories.items.indexOf(category) === -1) {
              self.categories.items.push(category);
            }
          });

          self.categories.select();
          self.restaurants.selectRandom();
        }

        CommonUi.busy = false;
      });
    },
    generateMenu : function(skipInitialSelection) {
      if (!skipInitialSelection) {
        this.selectRandom();
      }

      if (!this.active) { return; }
      console.log(this.active);
      // todo: generate the actual menu
    },
    selectRandom : function() {
      this.active = StorageRestaurants.selectRandomByCategory(this.items, self.categories.active);
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