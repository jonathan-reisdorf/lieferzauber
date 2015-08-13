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

      self.restaurants.generateMenu(self.restaurants.active, self.restaurants.active.minOrderValue, self.restaurants.active.deliveryFees);
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
    select : function(restaurant) {
      if (!restaurant) {
        restaurant = this.selectRandom();
      }
      if (!restaurant) { return (this.active = false); }

      StorageRestaurants.getDetails(restaurant.id, function(restaurantDetails) {
        self.restaurants.generateMenu(restaurantDetails, restaurant.min_order_value, restaurant.delivery_fees[0]);
      });
    },
    generateMenu : function(restaurantDetails, minOrderValue, deliveryFees) {
      var config = {
        minPerPerson : 5.5,
        maxPerPersonFactor : 2,
        popularityChance : 2 / 3,
        fancyFlavorChance : 1 / 4,
        subItemsPerPerson : 0.5,
        preferedMealSizeFactor : 0.5
      };

      var menu = restaurantDetails.menu;

      var mealItems = [],
        totalSum = 0,
        mainDish,
        sideDish,
        tries,
        isOdd,
        i;

      for (i = 0; i < parseInt(self.hungryPeople.val); i++) {
        mainDish = null;
        sideDish = null;
        isOdd = i % 2;

        for (tries = 0; tries < 5; tries++) {
          if (mainDish) {
            continue;
          }

          mainDish = StorageRestaurants.mealItems.generate(menu, true, config, 0);
          if (tries < 4 && mainDish && mainDish.priceToBuy > (config.minPerPerson * config.maxPerPersonFactor)) {
            mainDish = null;
          }
        }

        if (mainDish) {
          totalSum += mainDish.priceToBuy;
          mealItems.push(mainDish);
        }

        if ((mainDish ? mainDish.priceToBuy : 0) < config.minPerPerson || !isOdd) {
          for (tries = 0; tries < 3; tries++) {
            if (sideDish) {
              continue;
            }

            sideDish = StorageRestaurants.mealItems.generate(menu, false, config, 0);
            if (sideDish && sideDish.priceToBuy > config.minPerPerson) {
              sideDish = null;
            }
          }

          if (sideDish) {
            totalSum += sideDish.priceToBuy;
            mealItems.push(sideDish);
          }
        }
      }

      while (totalSum < minOrderValue) {
        sideDish = StorageRestaurants.mealItems.generate(menu, false, config, 0);

        if (sideDish) {
          totalSum += sideDish.priceToBuy;
          mealItems.push(sideDish);
        }
      }

      if (deliveryFees.amount) {
        totalSum += (deliveryFees.threshold && totalSum > deliveryFees.threshold) ? 0 : deliveryFees.amount;
      }

      this.activeMenu = {
        price : totalSum,
        items : mealItems
      };

      this.active = {
        id : restaurantDetails.id,
        name : restaurantDetails.name || restaurantDetails.general.name,
        ratingAvg : restaurantDetails.ratingAvg || restaurantDetails.rating.average,
        minOrderValue : minOrderValue,
        deliveryFees : deliveryFees,
        menu : menu
      };
    },
    selectRandom : function() {
      return StorageRestaurants.selectRandomByCategory(this.items, self.categories.active);
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