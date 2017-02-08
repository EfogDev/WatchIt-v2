const gulp = require('gulp');
const wiredep = require('wiredep').stream;
const replace = require('gulp-replace');
const inject = require('gulp-inject');
const watch = require('gulp-watch');
const del = require('del');

gulp.task('clean', () => {
    return del.sync('./build/**');
});

gulp.task('package', ['clean'], () => {
    return gulp.src('./package.json')
        .pipe(gulp.dest('./build'));
});

gulp.task('css', ['clean', 'package'], () => {
    return gulp.src('./src/css/**/*')
        .pipe(gulp.dest('./build/css'));
});

gulp.task('js', ['clean', 'package', 'css'], () => {
    return gulp.src('./src/**/*.js')
        .pipe(gulp.dest('./build'));
});

gulp.task('html', ['clean', 'package', 'css', 'js'], () => {
    return gulp.src('./src/views/**/*.html')
        .pipe(gulp.dest('./build/views'));
});

gulp.task('images', ['clean', 'package', 'css', 'js', 'html'], () => {
    return gulp.src('./src/images/**/*')
        .pipe(gulp.dest('./build/images'));
});

gulp.task('fonts', ['clean', 'package', 'css', 'js', 'html', 'images'], () => {
    return gulp.src('./src/fonts/**/*')
        .pipe(gulp.dest('./build/fonts'));
});

gulp.task('bower', ['clean', 'package', 'css', 'js', 'html', 'images', 'fonts'], () => {
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

gulp.task('build:dev', ['clean', 'package', 'css', 'js', 'html', 'images', 'fonts', 'inject:dev']);
gulp.task('build:prod', ['clean', 'package', 'css', 'js', 'html', 'images', 'fonts', 'bower', 'inject:dev']);

gulp.task('watch', ['clean', 'build:dev'], () => {
    return watch('./src/**/*', () => gulp.start(['clean', 'package', 'css', 'js', 'html', 'images', 'fonts', 'inject:dev', 'build:dev']));
});

gulp.task('default', ['watch']);