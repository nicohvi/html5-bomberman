/*jslint node: true */
"use strict";
let gulp = require('gulp');
let mocha = require('gulp-mocha');
let istanbul = require('gulp-istanbul');
let gutil = require('gulp-util');

gulp.task('test', () => {
  gulp.src('./server/**/*.js')
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', () => {
      gulp.src('./server/test/*.js')
        .pipe(mocha({ reporter: 'spec' }))
        .on('error', gutil.log)
        .pipe(istanbul.writeReports()); 
    });
});

gulp.task('watch', () => gulp.watch(['server/**'], ['test']));
