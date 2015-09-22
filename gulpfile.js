var gulp = require('gulp'),
    connect = require('gulp-connect'),
    opn = require('opn'),
    less = require('gulp-less'),
    plumber = require('gulp-plumber');

var onError = function(error) {
    console.log(error);
};

// Server

gulp.task('connect', function() {
    connect.server({
        root: 'example/',
        livereload: true,
        port: 8080
    })
});


gulp.task('open', function() {
    opn('http://localhost:8080')
});



// Watchers

gulp.task('html', function() {
    gulp.src('example/*.html')
        .pipe(connect.reload());
});


gulp.task('js', function() {
    gulp.src('example/js/*.js')
        .pipe(connect.reload());
});


gulp.task('watch', function() {
    gulp.watch(['example/*.html'], ['html']);
    gulp.watch(['example/js/*.js'], ['js']);
    gulp.watch(['example/less/**/*.less'], ['less']);
});



// Builds

gulp.task('less', function() {
    gulp.src('example/less/styles.less')
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(less())
        .pipe(gulp.dest('./example/css'))
        .pipe(connect.reload());
});


// Main Tasks

gulp.task('default', ['connect', 'less', 'watch', 'open'])