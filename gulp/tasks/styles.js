'use strict';

var gulp = require('gulp'),
  paths = require('../config').paths;

gulp.task('styles:clean', function() {
  return require('del').sync(paths.public.root + '**/*.{css,map}');
});

gulp.task('styles', ['styles:clean'], function() {
  var sass       = require('gulp-sass'),
    prefix     = require('gulp-autoprefixer'),
    path       = require('path'),
    gutil      = require('gutil'),
    sourcemaps = require('gulp-sourcemaps');

  return gulp.src(paths.assets.styles, { base : path.join(process.cwd(), paths.assets.root) })
    .pipe(sourcemaps.init())
    .pipe(sass({includePaths: ['./' + paths.assets.root  + ' css']}))
    .on('error', gutil.log)
    .pipe(prefix('last 1 version'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.public.root));
});