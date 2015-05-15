/*jslint node: true */
"use strict";
let gulp = require('gulp');
let mocha = require('gulp-mocha');
let istanbul = require('gulp-istanbul');
let gutil = require('gulp-util');

gulp.task('mocha', () => {
  return gulp.src(['server/**/*.js'])
          .pipe(istanbul())
          .pipe(istanbul.hookRequire())
          .on('error', gutil.log)
          .on('finish', () => {
            gulp.src(['server/test/*.js'])
            .pipe(mocha())
            .on('error', gutil.log)
            .pipe(istanbul.writeReports())
            .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
          })
            .on('error', gutil.log);
});

gulp.task('watch', () => gulp.watch(['server/**'], ['mocha']));
