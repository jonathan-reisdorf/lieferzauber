module.exports = ['CommonUi',  function(CommonUi) {
  'use strict';
  var self = this;

  self.create = function() {
    var instance = {
      items : null,
      busy : false,
      cbQueue : []
    };

    instance.apply = function(resource, cb, reqParams, reqBody) {
      if (cb && instance.items) {
        return cb(instance.items);
      }

      if (cb) {
        instance.cbQueue.push(cb);
      }

      if (instance.busy) {
        return;
      }

      instance.busy = true;

      function fnSuccess(response) {
        if (response) {
          instance.items = response;

          instance.cbQueue.forEach(function(cb) {
            cb(instance.items);
            instance.busy = false;
          });
        } else {
          CommonUi.notifications.throwError();
          instance.busy = false;
        }
      }

      function fnErr() {
        CommonUi.notifications.throwError();
        instance.busy = false;
      }

      resource(reqParams, reqBody || fnSuccess, reqBody ? fnSuccess : fnErr, reqBody ? fnErr : null);
    };

    return instance;
  };

  return self;
}];