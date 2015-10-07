module.exports = ['$routeParams', '$translate', 'CommonUi', 'CommonRequest', 'CommonStorage', 'StorageRestaurants', 'StorageUsers', 'StorageOrders', function($routeParams, $translate, CommonUi, CommonRequest, CommonStorage, StorageRestaurants, StorageUsers, StorageOrders) {
  'use strict';
  var self = this;

  self.showImprint = false;

  self.hungryPeople = {
    val : 1,
    changed : function() {
      this.val = parseInt(this.val);
      if (isNaN(this.val)) {
        this.val = 1;
      }

      if (self.restaurants.active) {
        self.restaurants.regenerateMenu();
      } else {
        self.restaurants.select();
      }
    }
  };

  self.order = {
    active : false,
    finished : false,
    start : function() {
      this.userData = CommonStorage.get('userData');

      if (!this.userData) {
        return StorageUsers.create(function(userData) {
          CommonStorage.set('userData', userData);
          self.order.start();
        });
      }

      CommonRequest.setToken(this.userData.token);
      StorageOrders.create(this.userData.user.id, self.restaurants.active.id, this.addDetails.bind(this));
    },
    addDetails : function(order) {
      if (!order.payment || !order.payment.method || order.payment.method.name !== 'cash') {
        return CommonUi.notifications.throwError('ERR #100');
      }

      order.user_id = this.userData.user.id;
      // order.restaurant_id = self.restaurants.active.id;
      order.sms_confirmation = true;

      angular.extend(order.delivery_address.address, self.addresses.active);
      delete order.delivery_address.address.id;
      delete order.delivery_address.id;
      delete order.delivery_address.uri;

      /* order.user_location = {
        latitude : order.delivery_address.address.latitude,
        longitude : order.delivery_address.address.longitude
      }; */

      order.sections = [{
        items : self.restaurants.getCleanedMealData()
      }];

      order.payment = {
        method : angular.extend({}, self.restaurants.active.paymentMethod, { fast_lane : false })
      };

      order.operation = 'validate';
      StorageOrders.update(order, this.finish.bind(this));
    },
    finish : function(order) {
      var processingErrors = Object.keys(order.validity).filter(function(validityProp) {
        return !order.validity[validityProp];
      });

      if (processingErrors.length) {
        return processingErrors.forEach(function(processingError) {
          CommonUi.notifications.throwError('MESSAGE.INVALID_' + processingError.toUpperCase());
        });
      }

      // @todo: should I update order_price_details?

      order.operation = 'final';
      order.user_id = this.userData.user.id;

      StorageOrders.update(order, this.exit.bind(this));
    },
    exit : function(order) {
      this.finished = true;

      var addedUserData = {
        name : order.delivery_address.address.name,
        lastname : order.delivery_address.address.lastname,
        phone : order.delivery_address.address.phone,
        email : order.delivery_address.address.email
      };

      StorageUsers.update(this.userData.user.id, addedUserData);

      angular.extend(this.userData.user.general, addedUserData);
      CommonStorage.set('userData', this.userData);
    }
  };

  self.restaurants = {
    items : [],
    excluded : [],
    storage : StorageRestaurants,
    load : function(address) {
      CommonUi.busy = true;
      this.items = [];
      this.active = null;
      self.order.active = false;

      this.storage.get(address.city.toLowerCase(), address.zipcode, address.latitude, address.longitude, function(response) {
        if (response.data) {
          self.restaurants.items = self.restaurants.storage.filterRelevant(response.data);
          self.restaurants.select();
        }

        CommonUi.busy = false;
      });
    },
    select : function(restaurant, excludeRestaurantId) {
      self.order.active = false;

      if (excludeRestaurantId) {
        this.excluded.push(excludeRestaurantId);
      }

      if (!restaurant) {
        restaurant = this.selectRandom();
      }
      if (!restaurant) { return (this.active = false); }

      var address = self.addresses.active || {};
      StorageRestaurants.getDetails(address.city.toLowerCase(), address.zipcode, address.latitude, address.longitude, restaurant.id, function(restaurantDetails) {
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
    addMealItem : function(mealItems, newMealItem) {
      var isUnique = true;

      mealItems.forEach(function(mealItem) {
        if (angular.equals(mealItem, newMealItem)) {
          mealItem.priceToBuy += newMealItem.priceToBuy;
          mealItem.quantity += newMealItem.quantity;
          isUnique = false;
        }
      });

      if (isUnique) {
        mealItems.push(newMealItem);
      }

      return mealItems;
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
          this.addMealItem(mealItems, mainDish);
        }

        if ((mainDish ? mainDish.priceToBuy : 0) < this.mealConfig.minPerPerson || i % 2 === 0) {
          if ((sideDish = this.generateSideDish(menu))) {
            this.addMealItem(mealItems, sideDish);
          }
        }
      }

      this.active = {
        id : restaurantDetails.id,
        name : restaurantDetails.name || restaurantDetails.general.name,
        paymentMethod : restaurantDetails.paymentMethod || restaurantDetails.payment_methods.filter(function(paymentMethod) {
          return paymentMethod.name === 'cash';
        })[0],
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
          this.addMealItem(mealItems, sideDish);
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
    selectRandom : function() {
      return StorageRestaurants.selectRandom(this.items, this.excluded, this.mealConfig, self.hungryPeople.val);
    },
    getCleanedMealData : function() {
      var data = angular.copy(this.activeMenu.items),
        validProperties = ['id', 'name', 'flavors', 'size', 'quantity'];

      data.forEach(function(mealItem) {
        Object.keys(mealItem).forEach(function(mealItemProp) {
          if (validProperties.indexOf(mealItemProp) === -1) {
            delete mealItem[mealItemProp];
          }
        });
      });

      return data;
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

      CommonRequest.geocode.get({
        address : [newAddress.street_name, newAddress.street_number, newAddress.zipcode, newAddress.city, 'DE'].join(', ')
      }, function(geoData) {
        if (!geoData.results || !geoData.results.length) {
          return CommonUi.notifications.throwError('MESSAGE.ERROR_LOCATION.NONE');
        }

        if (geoData.results.length > 1) {
          return CommonUi.notifications.throwError('MESSAGE.ERROR_LOCATION.TOO_MANY');
        }

        geoData = geoData.results[0].geometry;

        if (geoData.location_type !== 'ROOFTOP') {
          CommonUi.notifications.throwMessage('warning', null, 'MESSAGE.ERROR_LOCATION.WRONG_TYPE');
        }

        angular.extend(newAddress, {
          latitude : geoData.location.lat,
          longitude : geoData.location.lng
        });

        if (!newAddress.id) {
          angular.extend(newAddress, { id : new Date().getTime() });
          self.addresses.items.push(newAddress);
        }

        CommonStorage.set('addresses', self.addresses.items);
        self.addresses.select(newAddress);
      });
    }
  };

  self.addresses.select(self.addresses.items[0]);

  self.locale = {
    getCurrent : function() {
      return $translate.use();
    },
    change : function() {
      return $translate.use(this.getCurrent() === 'de' ? 'en' : 'de');
    }
  };

  self.ui = CommonUi;
}];