
'use strict';

var gulp  = require('gulp'),
  paths = require('../config').paths;

gulp.task('styles:watch', function () {
  gulp.watch(paths.assets.styles, ['styles']);
});

gulp.task('scripts:watch', function () {
  gulp.watch(paths.assets.jshint, ['scripts']);
});

gulp.task('templates:watch', function () {
  gulp.watch(paths.assets.templates, ['templates']);
});

gulp.task('copy:watch', function () {
  gulp.watch(paths.assets.copy, ['copy']);
});

gulp.task('watch', ['styles:watch', 'scripts:watch', 'templates:watch', 'copy:watch']);