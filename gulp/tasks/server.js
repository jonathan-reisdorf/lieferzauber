'use strict';

var gulp = require('gulp'),
  paths = require('../config').paths;

gulp.task('server', function() {
  var connect = require('gulp-connect');

  return connect.server({
    port : 1347,
    root : paths.public.root
  });
});