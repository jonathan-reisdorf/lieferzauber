module.exports = ['CommonRequest', 'StorageService',  function(CommonRequest, StorageService) {
  'use strict';
  var self = this,
    actions = StorageService.create();

  self.get = function(city, zipcode, latitude, longitude, cb) {
    actions.apply(CommonRequest.restaurants.get, cb, {
      city : city,
      zipcode : zipcode,
      fields : 'general,rating,availability,payment_methods,min_order_value,delivery_fees,uri',
      sort_by : 'default',
      closest_per_chain : true,
      offset : 0,
      limit : 0,
      lat : latitude,
      lon : longitude
    }, {});
  };

  self.filterRelevant = function(restaurants) {
    return restaurants.filter(function(restaurant) {
      if (!restaurant.general || !restaurant.rating || !restaurant.payment_methods) {
        return false;
      }

      return restaurant.general.open && restaurant.general.delivery_home && restaurant.general.reachable && restaurant.general.online &&
        restaurant.rating.average >= 3.75 && restaurant.min_order_value && restaurant.payment_methods.filter(function(paymentMethod) {
          return paymentMethod.name === 'cash';
        }).length;
    });
  };

  self.selectRandom = function(restaurants, excludedRestaurantIds, config, numberOfPeople) {
    var maxAmount = config.minPerPerson * config.maxPerPersonFactor * numberOfPeople;
    var restaurantsSelection = angular.copy(restaurants.filter(function(restaurant) {
      return excludedRestaurantIds.indexOf(restaurant.id) === -1 && restaurant.min_order_value <= maxAmount;
    }));

    return restaurantsSelection[Math.round(Math.random() * (restaurantsSelection.length - 1))];
  };

  self.getDetails = function(city, zipcode, latitude, longitude, restaurantId, cb) {
    actions.apply(CommonRequest.restaurants.getDetails, cb, {
      restaurantId : restaurantId,
      city : city,
      zipcode : zipcode,
      lat : latitude,
      lon : longitude
    }, {});
  };

  self.mealItems = {
    generate : function(menu, isMain, config, tryCount) {
      if (!menu || !menu.sections || !config) {
        return null;
      }

      var selectedTier = (menu.popular_items && Math.random() < config.popularityChance) ?
        menu.popular_items :
        menu.sections[Math.round(Math.random() * (menu.sections.length - 1))].items;

      var selectedItems = selectedTier.filter(function(menuItem) {
        return (isMain ? menuItem.main_item : true);
      });

      if (!selectedItems.length) {
        return tryCount > 10 ? null : this.generate(menu, isMain, config, tryCount + 1);
      }

      var selectedItem = selectedItems[Math.round(Math.random() * (selectedItems.length - 1))];
      return this.specify(config, angular.copy(selectedItem));
    },
    specify : function(config, mealItem, branch) {
      if (!branch && !mealItem.priceToBuy) {
        mealItem.priceToBuy = 0;
        mealItem.quantity = 1;
      }

      if (!branch) {
        branch = mealItem;
      }

      if (branch.sizes && branch.sizes.length) {
        branch.size = branch.sizes[Math.ceil((branch.sizes.length - 1) * config.preferedMealSizeFactor)];
        mealItem.priceToBuy += branch.size.price;
      }

      if (branch.sizes) {
        delete branch.sizes;
      }

      if (branch.flavors) {
        var pickedItem;
        switch (branch.flavors.structure) {
          case '-1':
            branch.flavors.items.map(function(flavorItem) {
              return self.mealItems.specify(config, mealItem, flavorItem);
            });
            break;
          case '0':
            pickedItem = branch.flavors.items[Math.round(Math.random() * (branch.flavors.items.length - 1))];
            branch.flavors.items = Math.random() < config.fancyFlavorChance ? [self.mealItems.specify(config, mealItem, pickedItem)] : [];
            break;
          case '1':
            pickedItem = branch.flavors.items[Math.round(Math.random() * (branch.flavors.items.length - 1))];
            branch.flavors.items = [self.mealItems.specify(config, mealItem, pickedItem)];
            break;
          default:
            delete branch.flavors;
        }
        delete branch.flavors.structure;
      }

      return branch;
    }
  };

  return self;
}];