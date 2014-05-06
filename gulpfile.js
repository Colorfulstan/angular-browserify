var browserify = require('browserify')
  , clean = require('gulp-clean')
  , connect = require('gulp-connect')
  , gulp = require('gulp')
  , jshint = require('gulp-jshint')
  , ngmin = require('gulp-ngmin')
  , source = require('vinyl-source-stream')
  , streamify = require('gulp-streamify')
  , uglify = require('gulp-uglify')
  ;

/*
 * Useful tasks:
 * - gulp fast: browserifies, no minification, does not start server.
 * - gupl watch: starts server, browserify & live reload on changes,
 *               no minification.
 * - gulp: browserifies and minifies, does not start server.
 *
 * At development time, you should usually just have run 'gulp watch' in the
 * background.
 */

gulp.task('clean', function() {
  return gulp.src(['./app/ngmin', './app/dist'], { read: false })
  .pipe(clean())
  ;
});

gulp.task('lint', function() {
  return gulp.src([
    'gulpfile.js',
    'app/js/**/*.js',
    '!app/js/third-party/**',
  ])
  .pipe(jshint('.jshintrc'))
  .pipe(jshint.reporter('default'))
  ;
});

gulp.task('browserify', function() {
  return browserify('./app/js/app.js')
  .bundle({ debug: true })
  .pipe(source('app.js'))
  .pipe(gulp.dest('./app/dist/'))
  .pipe(connect.reload())
  ;
});

gulp.task('ngmin', function() {
  return gulp.src([
    'app/js/**/*.js',
    '!app/js/third-party/**',
  ])
  .pipe(ngmin())
  .pipe(gulp.dest('./app/ngmin'))
  ;
});

gulp.task('browserify-min', ['ngmin'], function() {
  return browserify('./app/ngmin/app.js')
  .bundle()
  .pipe(source('app.min.js'))
  .pipe(streamify(uglify({ mangle: false })))
  .pipe(gulp.dest('./app/dist/'))
  ;
});

gulp.task('server', function() {
  connect.server({
    root: 'app',
    livereload: true,
  });
});

gulp.task('watch', function() {
  gulp.start('server');
  gulp.watch([
    'app/js/**/*.js',
    '!app/js/third-party/**',
  ], ['fast']);
});

gulp.task('fast', ['clean'], function() {
  gulp.start('lint', 'browserify');
});

gulp.task('default', ['clean'], function() {
  gulp.start('lint', 'browserify', 'browserify-min');
});
