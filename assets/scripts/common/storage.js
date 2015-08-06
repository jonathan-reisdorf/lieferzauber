module.exports = [function() {
  'use strict';

  var self = {
    get : function(key) {
      var data = localStorage.getItem('main');
      data = data ? JSON.parse(data) : {};
      return key ? data[key] : data;
    },
    set : function(key, value) {
      var data = self.get();
      data[key] = value;
      localStorage.setItem('main', JSON.stringify(data));
      return data;
    }
  };

  return self;
}];