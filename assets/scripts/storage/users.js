module.exports = ['CommonRequest', 'StorageService',  function(CommonRequest, StorageService) {
  'use strict';
  var self = this,
    actions = StorageService.create();

  self.create = function(cb) {
    actions.apply(CommonRequest.users.register, cb, {}, {});
  };

  return self;
}];