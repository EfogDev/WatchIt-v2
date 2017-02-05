const gulp = require('gulp');
const wiredep = require('wiredep').stream;
const clean = require('gulp-clean');
const browserify = require('gulp-browserify');
const replace = require('gulp-replace');
const inject = require('gulp-inject');

gulp.task('clean', () => {
    return gulp.src('./build', {read: false})
        .pipe(clean({force: true}))
});

gulp.task('package', ['clean'], () => {
    return gulp.src('./package.json')
        .pipe(gulp.dest('./build'));
});

gulp.task('css', ['clean'], () => {
    return gulp.src('./src/css/**/*')
        .pipe(gulp.dest('./build/css'));
});

gulp.task('js', ['clean'], () => {
    return gulp.src('./src/**/*.js')
        .pipe(gulp.dest('./build'));
});

gulp.task('html', ['clean'], () => {
    return gulp.src('./src/views/**/*.html')
        .pipe(gulp.dest('./build/views'));
});

gulp.task('bower', ['clean'], () => {
    return gulp.src('./bower_components/**/*')
        .pipe(gulp.dest('./build/bower_components'));
});

gulp.task('inject', ['clean', 'package', 'css', 'js', 'html', 'bower'], () => {
    return gulp.src('./src/index.html')
        .pipe(wiredep())
        .pipe(inject(gulp.src([
            './build/js/app.js',
            './build/js/services/**/*',
            './build/js/controllers/**/*',
            //styles
            './build/css/**/*'
        ])))
        //electronize
        .pipe(replace(/<script src="..\/(.*?)"><\/script>/gim, (match, path) => {
            return `<script>require("./${path}");</script>`;
        }))
        .pipe(replace(/<script src="\/build\/(.*?)"><\/script>/gim, (match, path) => {
            return `<script>require("./${path}");</script>`;
        }))
        .pipe(replace(/<link rel="stylesheet" href="\/build\/(.*?)"/gim, (match, path) => {
            return `<link rel="stylesheet" href="./${path}"`;
        }))
        .pipe(gulp.dest('./build'));
});

gulp.task('build', ['inject']);

gulp.task('watch', ['build'], () => {
    return gulp.watch('./src/**/*', ['build']);
});

gulp.task('default', ['watch']);