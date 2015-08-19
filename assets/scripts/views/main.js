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

      self.restaurants.regenerateMenu();
    }
  };

  self.categories = {
    items : [],
    select : function(category) {
      this.active = category || this.active || this.items[Math.round(Math.random() * (this.items.length - 1))];
      self.restaurants.select();
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
    select : function(restaurant, excludeRestaurantId) {
      if (!restaurant) {
        restaurant = this.selectRandom(excludeRestaurantId);
      }
      if (!restaurant) { return (this.active = false); }

      StorageRestaurants.getDetails(restaurant.id, function(restaurantDetails) {
        self.restaurants.generateMenu(restaurantDetails, restaurant.min_order_value, restaurant.delivery_fees[0]);
      });
    },
    mealConfig : {
      minPerPerson : 5.5,
      maxPerPersonFactor : 2,
      popularityChance : 2 / 3,
      fancyFlavorChance : 1 / 4,
      subItemsPerPerson : 0.5,
      preferedMealSizeFactor : 0.5
    },
    regenerateMenu : function() {
      this.generateMenu(this.active, this.active.minOrderValue, this.active.deliveryFees);
    },
    generateMenu : function(restaurantDetails, minOrderValue, deliveryFees) {
      var menu = restaurantDetails.menu;

      var mealItems = [],
        mainDish,
        sideDish;

      for (var i = 0; i < parseInt(self.hungryPeople.val); i++) {
        mainDish = null;
        sideDish = null;

        if ((mainDish = this.generateMainDish(menu))) {
          mealItems.push(mainDish);
        }

        if ((mainDish ? mainDish.priceToBuy : 0) < this.mealConfig.minPerPerson || i % 2 === 0) {
          if ((sideDish = this.generateSideDish(menu))) {
            mealItems.push(sideDish);
          }
        }
      }

      this.active = {
        id : restaurantDetails.id,
        name : restaurantDetails.name || restaurantDetails.general.name,
        ratingAvg : restaurantDetails.ratingAvg || restaurantDetails.rating.average,
        minOrderValue : minOrderValue,
        deliveryFees : deliveryFees,
        menu : menu
      };

      this.activeMenu = this.finalizeMeal(mealItems);
    },
    finalizeMeal : function(mealItems) {
      var totalSum = 0,
        sideDish;

      mealItems.forEach(function(mealItem) {
        totalSum += mealItem.priceToBuy;
      });

      while (totalSum < this.active.minOrderValue) {
        if ((sideDish = this.generateSideDish(this.active.menu, false)) || (sideDish = this.generateSideDish(this.active.menu, true))) {
          totalSum += sideDish.priceToBuy;
          mealItems.push(sideDish);
        }
      }

      if (this.active.deliveryFees.amount) {
        totalSum += (this.active.deliveryFees.threshold && totalSum > this.active.deliveryFees.threshold) ? 0 : this.active.deliveryFees.amount;
      }

      return {
        price : totalSum,
        items : mealItems
      };
    },
    generateMainDish : function(menu) {
      var mainDish, tries;

      for (tries = 0; tries < 5; tries++) {
        if (mainDish) {
          continue;
        }

        mainDish = StorageRestaurants.mealItems.generate(menu, true, this.mealConfig, 0);
        if (tries < 4 && mainDish && mainDish.priceToBuy > (this.mealConfig.minPerPerson * this.mealConfig.maxPerPersonFactor)) {
          mainDish = null;
        }
      }

      return mainDish;
    },
    generateSideDish : function(menu, removeConstraints) {
      var sideDish, tries;

      for (tries = 0; tries < 3; tries++) {
        if (sideDish) {
          continue;
        }

        sideDish = StorageRestaurants.mealItems.generate(menu, false, this.mealConfig, 0);
        if (!removeConstraints && sideDish && sideDish.priceToBuy > this.mealConfig.minPerPerson) {
          sideDish = null;
        }
      }

      return sideDish;
    },
    addSideDish : function() {
      var sideDish;
      if ((sideDish = this.generateSideDish(this.active.menu, false)) || (sideDish = this.generateSideDish(this.active.menu, true))) {
        this.activeMenu = this.finalizeMeal(this.activeMenu.items.concat(sideDish));
      } else {
        CommonUi.notifications.throwError();
      }
    },
    selectRandom : function(excludeRestaurantId) {
      return StorageRestaurants.selectRandomByCategory(this.items, self.categories.active, excludeRestaurantId);
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