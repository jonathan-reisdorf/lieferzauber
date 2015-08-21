module.exports = ['CommonRequest', 'StorageService',  function(CommonRequest, StorageService) {
  'use strict';
  var self = this,
    actions = StorageService.create();

  self.create = function(cb) {
    actions.apply(CommonRequest.users.register, cb, {}, {});
  };

  self.update = function(userId, userData, cb) {
    actions.apply(CommonRequest.users.update, cb, {
      userId : userId
    }, userData);
  };

  return self;
}];