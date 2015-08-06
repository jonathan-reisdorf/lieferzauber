'use strict';

var gulp = require('gulp'),
  paths = require('../config').paths;

gulp.task('templates', function() {
  return gulp.src(paths.assets.templates)
    .pipe(gulp.dest(paths.public.root));
});