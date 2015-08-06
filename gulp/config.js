'use strict';

var ASSETS_DIR = 'assets/';
var PUBLIC_DIR = 'public/';

var config = {
  paths : {
    assets : {
      styles : ASSETS_DIR + 'styles/**/*.{sass,scss}',
      scripts : ASSETS_DIR + 'scripts/main.js',
      jshint : ASSETS_DIR + 'scripts/**/*.js',
      copy : ASSETS_DIR + 'static/**/*',
      templates : ASSETS_DIR + 'templates/**/*.html',
      root : ASSETS_DIR
    },
    public : {
      root : PUBLIC_DIR,
      scripts : PUBLIC_DIR + 'scripts',
    }
  }
};

module.exports = config;