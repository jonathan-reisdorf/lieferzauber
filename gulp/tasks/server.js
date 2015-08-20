'use strict';

var gulp = require('gulp'),
  paths = require('../config').paths;

gulp.task('server', function() {
  var connect = require('gulp-connect');

  var proxyMiddleware = require('http-proxy-middleware');

  var proxyLieferheld = proxyMiddleware('/api', {
    target : 'https://www.lieferheld.de',
    changeOrigin : true
  });
  var proxyGmaps = proxyMiddleware('/maps/api/geocode/json', {
    target : 'https://maps.googleapis.com',
    changeOrigin : true
  });

  return connect.server({
    port : 1347,
    root : paths.public.root,
    middleware : function() {
      return [proxyLieferheld, proxyGmaps];
    }
  });
});