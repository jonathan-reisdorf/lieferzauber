'use strict';

var gulp = require('gulp'),
  paths = require('../config').paths;

gulp.task('scripts:clean', function() {
  return require('del').sync(paths.public.root + '**/*.js');
});

gulp.task('scripts:jshint', function() {
  var jshint = require('gulp-jshint');

  return gulp.src(paths.assets.jshint)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('scripts', ['scripts:jshint', 'scripts:clean'], function() {
  var browserify   = require('browserify'),
    source         = require('vinyl-source-stream'),
    buffer         = require('vinyl-buffer'),
    sourcemaps     = require('gulp-sourcemaps'),
    gutil          = require('gutil');

  return browserify({
    entries: paths.assets.scripts
  }).bundle()
    .on('error', gutil.log)
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.public.scripts));
});