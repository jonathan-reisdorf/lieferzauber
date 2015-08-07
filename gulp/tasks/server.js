'use strict';

var gulp = require('gulp'),
  paths = require('../config').paths;

gulp.task('server', function() {
  var connect = require('gulp-connect');

  var proxyMiddleware = require('http-proxy-middleware'),
    context = '/api',
    options = {
      target : 'https://www.lieferheld.de',
      changeOrigin : true
    };

  var proxy = proxyMiddleware(context, options);

  var server = connect.server({
    port : 1347,
    root : paths.public.root,
    middleware : function() {
      return [proxy];
    }
  });

  return server;
});