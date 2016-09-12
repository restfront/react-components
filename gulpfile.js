(function () {
    'use strict';

    const gulp = require('gulp');
    const gulpSass = require('gulp-sass');
    const gulpConcat = require('gulp-concat');
    const gulpUglify = require('gulp-uglify');
    const gulpHtmlReplace = require('gulp-html-replace');
    const gulpReplace = require('gulp-replace');
    const gulpStreamify = require('gulp-streamify');
    const vinylSourceStream = require('vinyl-source-stream');
    const browserify = require('browserify');
    const watchify = require('watchify');
    const babelify = require('babelify');
    const fsExtra = require('fs-extra');
    const yargsArgv = require('yargs').argv;

    const NODE_ENV = (process.env.NODE_ENV || '').trim() || 'development';
    const BUILD_NUMBER = (process.env.BUILD_NUMBER || '').trim() || 'unknown';

    const CONST = {
        HTML: './examples/index.html',
        OUT: 'build.js',
        DEST: './build',
        DEST_SCRIPTS: './build',
        ENTRY_POINT: './examples/app.jsx',
        SOURCE_STYLES: './examples/styles/**/*.scss',
        DEST_STYLES: './build'
    };

    const variables = {
        isDebug: false,
        serverUrl: '',
        version: ''
    };

    gulp.task('default', function () {
        if (NODE_ENV === 'production') {
            variables.isDebug = false;
            variables.serverUrl = '';
            variables.version = yargsArgv.ver || BUILD_NUMBER;

            return gulp.start('production');
        } else {
            variables.isDebug = true;
            variables.serverUrl = 'http://localhost:13070';
            variables.version = 'dev';

            return gulp.start('watch');
        }
    });

    gulp.task('production', ['html', 'styles', 'vendor'], function () {
        return createBrowserify()
            .bundle()
            .pipe(vinylSourceStream(CONST.OUT))
            .pipe(gulpStreamify(gulpUglify()))
            .pipe(gulp.dest(CONST.DEST_SCRIPTS));
    });

    gulp.task('watch', ['html', 'styles', 'vendor'], function () {
        gulp.watch(CONST.HTML, ['html']);
        gulp.watch(CONST.SOURCE_STYLES, ['styles']);

        var watcher = watchify(
            createBrowserify()
        );

        return watcher
            .on('update', function () {
                watcher
                    .bundle()
                    .on('error', function (e) {
                        console.error(e.toString());
                    })
                    .pipe(vinylSourceStream(CONST.OUT))
                    .pipe(gulp.dest(CONST.DEST_SCRIPTS));
                console.log('[' + new Date() + '] Updated');
            })
            .bundle()
            .on('error', function (e) {
                console.error(e.toString());
            })
            .pipe(vinylSourceStream(CONST.OUT))
            .pipe(gulp.dest(CONST.DEST_SCRIPTS));
    });

    gulp.task('html', function () {
        return gulp.src(CONST.HTML)
            .pipe(gulpHtmlReplace({
                'js': CONST.OUT
            }))
            .pipe(gulpReplace('@@gulpServerUrl', variables.serverUrl))
            .pipe(gulpReplace('@@gulpVersion', variables.version))
            .pipe(gulp.dest(CONST.DEST));
    });

    gulp.task('styles', function () {
        return gulp.src(CONST.SOURCE_STYLES)
            .pipe(gulpSass())
            .pipe(gulpConcat('app.css'))
            .pipe(gulp.dest(CONST.DEST_STYLES));
    });

    /* Копирование сторонних библиотек из node_modules */
    gulp.task('vendor', function () {
        // Убедимся в наличии папок
        fsExtra.ensureDir('./examples/vendor/');
        fsExtra.ensureDir('./build/vendor/');

        // bootstrap
        fsExtra.ensureDir('./examples/vendor/bootstrap/');
        fsExtra.copy('./node_modules/bootstrap/dist/', './examples/vendor/bootstrap/', {});
        fsExtra.ensureDir('./build/vendor/bootstrap/');
        fsExtra.copy('./node_modules/bootstrap/dist/', './build/vendor/bootstrap/', {});

        // font-awesome
        fsExtra.ensureDir('./examples/vendor/font-awesome/');
        fsExtra.copy('./node_modules/font-awesome/css', './examples/vendor/font-awesome/css', {});
        fsExtra.copy('./node_modules/font-awesome/fonts', './examples/vendor/font-awesome/fonts', {});
        fsExtra.ensureDir('./build/vendor/font-awesome/');
        fsExtra.copy('./node_modules/font-awesome/css', './build/vendor/font-awesome/css', {});
        fsExtra.copy('./node_modules/font-awesome/fonts', './build/vendor/font-awesome/fonts', {});

        // react-virtualized
        fsExtra.ensureDir('./examples/vendor/react-virtualized/');
        fsExtra.copy('./node_modules/react-virtualized/styles.css', './examples/vendor/react-virtualized/styles.css', {});
        fsExtra.ensureDir('./build/vendor/react-virtualized/');
        fsExtra.copy('./node_modules/react-virtualized/styles.css', './build/vendor/react-virtualized/styles.css', {});
    });

    function createBrowserify() {
        var params = {
            entries: [CONST.ENTRY_POINT],
            transform: [
                babelify.configure({
                    ignore: /node_modules/,
                    presets: ['es2015', 'react', 'stage-2']
                })
            ],
            require: [
                /*'jszip'*/
            ]
        };

        if (variables.isDebug) {
            params.debug = true;
            params.cache = {};
            params.packageCache = {};
            params.fullPaths = true;
        }

        return browserify(params);
    }
})();