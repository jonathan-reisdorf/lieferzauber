module.exports = ['$routeParams', 'CommonUi', 'CommonStorage', function($routeParams, CommonUi, CommonStorage) {
  'use strict';
  var self = this;

  self.addresses = {
    items : CommonStorage.get('addresses') || [],
    editing : false,
    edit : function(address) {
      this.editing = address || {};
    },
    select : function() {
      this.editing = false;
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

  self.addresses.active = self.addresses.items[0];

  self.ui = CommonUi;
}];