module.exports = function CommonUiProvider() {
  'use strict';

  var self = this,
    services = {};

  self.$get = ['$rootScope', '$filter', '$timeout', function($rootScope, $filter, $timeout) {
    services.$scope = $rootScope;
    services.$filter = $filter;
    services.$timeout = $timeout;
    return self;
  }];

  self.locked = false;
  self.busy = false;
  self.hidden = false;

  self.notifications = {
    items : {},
    assignSlot : function(key) {
      if (this.items[key]) {
        return this.assignSlot(key + 1);
      }

      return key;
    },
    add : function(type, message) {
      var key = this.assignSlot(64062313200000 - (new Date().getTime()));

      this.items[key] = {
        type : type.toLowerCase(),
        message : message,
        hidden : false
      };

      if(services.$scope && !services.$scope.$$phase) {
        services.$scope.$apply();
      }

      return key;
    },
    hide : function(key) {
      if (this.items[key]) {
        this.items[key].hidden = true;
      }
    },
    remove : function(key) {
      if (this.items[key]) {
        delete this.items[key];
      }
    },
    reset : function() {
      this.items = {};
    },
    autoRemove : function(key, timeout) {
      if (!services.$timeout) {
        return;
      }

      services.$timeout(function() {
        self.notifications.hide(key);
      }, timeout || 8000);

      services.$timeout(function() {
        self.notifications.remove(key);
      }, (timeout || 8000) + 300);
    },
    throwError : function() {
      self.notifications.throwMessage.apply(this, ['error', null].concat(Array.prototype.slice.call(arguments)));
    },
    throwMessage : function(type, timeout, translation) {
      var origArguments = arguments;
      translation = services.$filter('translate')(translation || 'MESSAGE.GENERIC.ERROR');
      Array.prototype.slice.call(arguments, 3).map(function(replacement) {
        translation = translation.replace('%%', replacement);
      });

      if (!services.$filter) {
        return setTimeout(function() {
          self.notifications.throwMessage.apply(this, Array.prototype.slice.call(origArguments));
        }, 200);
      }

      self.notifications.autoRemove(self.notifications.add(type, translation), timeout);
    }
  };
};