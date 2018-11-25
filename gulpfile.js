'use strict';

let gulp = require('gulp'),
    babel = require('gulp-babel'),
    autoprefixer = require('autoprefixer'),
    postcss = require('gulp-postcss'),
    rimRaf = require('rimraf'),
    uglify = require('gulp-uglify-es').default,
    watch = require('gulp-watch'),
    preFixer = require('gulp-autoprefixer'),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass'),
    rigger = require('gulp-rigger'),
    cssMin = require('gulp-cssnano'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    notify = require('gulp-notify'),
    sourceMaps = require('gulp-sourcemaps'),
    gutil = require('gulp-util'),
    clip = require('gulp-clip-empty-files'),
    gulpSequence = require('gulp-sequence');


let path = {
    //готовые после сборки файлы
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        php: 'build/php/'
    },
    //исходники
    src: {
        html: 'src/*.html',
        js:    'src/js/main.js',
        style: 'src/style/main.scss',
        img: 'src/img/*.*',
        php: 'src/php/mail.php'
    },
    //изменения
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/*.*',
        php: 'src/php/**/*.php'
    },
    clean: './build'
};
// Web-Server
gulp.task('webserver', function () {
   browserSync({
       server: {
           baseDir: './build'
       },
       host: 'localhost',
       port: '3000',
       tunnel: true
   });
});

// Сборищик для HTML
gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(clip())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true})); //перезапускаем сервер
});

// Сборщик скриптов
gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(sourceMaps.init())                //Инициализация sourceMaps
        .pipe(babel({ presets: ['@babel/env'] }))
        .pipe(concat('main.min.js'))
        .pipe(uglify().on('error', gutil.log))  //Минификация
        .pipe(sourceMaps.write())               //Прописка карты
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

//Сборщик стилей
gulp.task('style:build', function () {
   gulp.src(path.src.style)
       .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
       .pipe(sass())
       // .pipe(autoprefixer()) //Префиксы для всех браузеров
       .pipe(sourceMaps.init())
       // .pipe(postcss([ autoprefixer() ]))
       .pipe(cssMin('main.css.min'))
       .pipe(sourceMaps.write())
       .pipe(gulp.dest(path.build.css))
       .pipe(reload({stream: true}));
});

//Сборщик пхп
gulp.task('php:build', function () {
   gulp.src(path.src.php)
       .pipe(gulp.dest(path.build.php))
       .pipe(reload({stream: true}));
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'image:build',
    'php:build'
]);

// Отследить изменения в файлах
gulp.task('watch', function () {
   watch([path.watch.js], function (event, callback) {
       gulp.start('js:build');
   });
   watch([path.watch.html], function (event, callback) {
       gulp.start('html:build');
   });
   watch([path.watch.style], function (event, callback) {
       gulp.start('style:build');
   });
   watch([path.watch.img], function (event, callback) {
       gulp.start('image:build');
   });
   watch([path.watch.php], function (event, callback) {
      gulp.start('php:build');
   });
});

// Сжатие картинок
gulp.task('image:build', function (callback) {
   return(gulp.src(path.src.img))
       .pipe(imagemin([
           imagemin.gifsicle({interlaced: true}),
           imagemin.jpegtran({progressive: true}),
           imagemin.optipng({optimizationLevel: 5}),
           imagemin.svgo({
               plugins: [
                   {removeViewBox: true},
                   {cleanupIDs: false}
               ]
           })
       ]))
       .pipe(gulp.dest(path.build.img, callback))
       .pipe(reload({stream: true}));
});

//Очистка
gulp.task('clean', function (callback) {
   rimRaf(path.clean, callback);
});

gulp.task('default', function (callback) {
    gulpSequence('build', 'webserver', 'watch', callback);
});
