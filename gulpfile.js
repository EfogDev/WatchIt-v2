const gulp = require('gulp');
const wiredep = require('wiredep').stream;
const clean = require('gulp-clean');
const browserify = require('gulp-browserify');
const replace = require('gulp-replace');
const inject = require('gulp-inject');
const watch = require('gulp-watch');

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

gulp.task('fonts', ['clean'], () => {
    return gulp.src('./src/fonts/**/*')
        .pipe(gulp.dest('./build/fonts'));
});

gulp.task('images', ['clean'], () => {
    return gulp.src('./src/images/**/*')
        .pipe(gulp.dest('./build/images'));
});

gulp.task('bower', ['clean'], () => {
    return gulp.src('./bower_components/**/*')
        .pipe(gulp.dest('./build/bower_components'));
});

gulp.task('inject:dev', ['clean', 'package', 'css', 'js', 'html', 'images', 'fonts'], () => {
    return gulp.src('./src/index.html')
        .pipe(wiredep())
        .pipe(inject(gulp.src([
            './build/js/app.js',
            './build/js/services/**/*',
            './build/js/controllers/**/*',
            './build/js/directives/**/*',
            //styles
            './build/css/**/*'
        ])))
        //electronize
        .pipe(replace(/<script src="\/build\/(.*?)"><\/script>/gim, (match, path) => {
            return `<script>require("./${path}");</script>`;
        }))
        .pipe(replace(/<link rel="stylesheet" href="\/build\/css\/(.*?)"/gim, (match, path) => {
            return `<link rel="stylesheet" href="./css/${path}"`;
        }))
        .pipe(gulp.dest('./build'));
});

gulp.task('inject:prod', ['clean', 'package', 'css', 'js', 'html', 'images', 'fonts', 'bower'], () => {
    return gulp.src('./src/index.html')
        .pipe(wiredep())
        .pipe(inject(gulp.src([
            './build/js/app.js',
            './build/js/services/**/*',
            './build/js/controllers/**/*',
            './build/js/directives/**/*',
            //styles
            './build/css/**/*'
        ])))
        //electronize
        .pipe(replace(/<script src="\/build\/(.*?)"><\/script>/gim, (match, path) => {
            return `<script>require("./${path}");</script>`;
        }))
        .pipe(replace(/<script src="\.\.\/(.*?)"><\/script>/gim, (match, path) => {
            return `<script src="..\/${path}"><\/script>`;
        }))
        .pipe(replace(/<link rel="stylesheet" href="\/build\/css\/(.*?)"/gim, (match, path) => {
            return `<link rel="stylesheet" href="./css/${path}"`;
        }))
        .pipe(replace(/<link rel="stylesheet" href="\.\.\/(.*?)"/gim, (match, path) => {
            return `<link rel="stylesheet" href="./${path}"`;
        }))
        .pipe(gulp.dest('./build'));
});

gulp.task('build:dev', ['inject:dev']);
gulp.task('build:prod', ['inject:prod']);

gulp.task('watch', ['build:dev'], () => {
    return watch('./src/**/*', () => gulp.start('build:dev'));
});

gulp.task('default', ['watch']);