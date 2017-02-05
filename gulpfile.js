const gulp = require('gulp');
const wiredep = require('wiredep').stream;
const rm = require('gulp-rm');
const browserify = require('gulp-browserify');
const inject = require('gulp-inject');

gulp.task('clean', () => {
    return gulp.src('./build', {read: false})
        .pipe(rm())
});

gulp.task('css', ['clean'], () => {
    return gulp.src('./src/css/**/*')
        .pipe(gulp.dest('./build'));
});

gulp.task('js', ['clean'], () => {
    return gulp.src('./src/**/*.js')
        .pipe(gulp.dest('./build'));
});

gulp.task('html', ['clean'], () => {
    return gulp.src('./src/views/**/*.html')
        .pipe(gulp.dest('./build'));
});

gulp.task('inject', ['clean', 'css', 'js', 'html'], () => {
    return gulp.src('./src/index.html')
        .pipe(wiredep())
        .pipe(inject(gulp.src([
            './src/js/app.js',
            './src/js/services/**/*',
            './src/js/controllers/**/*',
        ])))
        .pipe(gulp.dest('./build'));
});


gulp.task('build', ['inject']);