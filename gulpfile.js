(function () {
    'use strict';

    const gulp = require('gulp');
    const gulpSass = require('gulp-sass');
    const gulpConcat = require('gulp-concat');
    const gulpUglify = require('gulp-uglify');
    const gulpHtmlReplace = require('gulp-html-replace');
    const gulpReplace = require('gulp-replace');
    const gulpStreamify = require('gulp-streamify');
    const gulpBabel = require('gulp-babel');
    const vinylSourceStream = require('vinyl-source-stream');
    const browserify = require('browserify');
    const watchify = require('watchify');
    const babelify = require('babelify');
    const fsExtra = require('fs-extra');
    const yargsArgv = require('yargs').argv;
    const browserSync = require('browser-sync').create();

    const NODE_ENV = (process.env.NODE_ENV || '').trim() || 'development';
    const BUILD_NUMBER = (process.env.BUILD_NUMBER || '').trim() || 'unknown';

    const CONST = {
        lib: {
            SRC: './lib/es/**/*.js',
            DEST: './lib/commonjs'
        },
        examples: {
            HTML: './examples/index.html',
            OUT: 'build.js',
            DEST: './build',
            DEST_SCRIPTS: './build',
            ENTRY_POINT: './examples/app.jsx',
            SOURCE_STYLES: './examples/styles/**/*.scss',
            DEST_STYLES: './build'
        }
    };

    const CONFIG = {
        isDebug: false,
        serverUrl: '',
        version: '',
        babel: {
            ignore: /node_modules/,
            presets: ['es2015', 'react', 'stage-2']
        },
        browserSync: {
            port: 13072,
            open: false,
            server: {
                baseDir: CONST.examples.DEST
            }
        }
    };

    gulp.task('default', function () {
        if (NODE_ENV === 'production') {
            CONFIG.isDebug = false;
            CONFIG.serverUrl = '';
            CONFIG.version = yargsArgv.ver || BUILD_NUMBER;

            return gulp.start('production');
        } else {
            CONFIG.isDebug = true;
            CONFIG.serverUrl = 'http://localhost:13070';
            CONFIG.version = 'dev';

            return gulp.start('watch');
        }
    });

    gulp.task('production', ['lib', 'examples:html', 'examples:styles', 'examples:vendor'], function () {
        return createBrowserify()
            .bundle()
            .pipe(vinylSourceStream(CONST.examples.OUT))
            .pipe(gulpStreamify(gulpUglify()))
            .pipe(gulp.dest(CONST.examples.DEST_SCRIPTS));
    });

    gulp.task('watch', ['lib', 'examples:html', 'examples:styles', 'examples:vendor'], function () {
        gulp.watch(CONST.lib.SRC, ['lib']);
        gulp.watch(CONST.examples.HTML, ['examples:html']);
        gulp.watch(CONST.examples.SOURCE_STYLES, ['examples:styles']);

        browserSync.init(CONFIG.browserSync);

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
                    .pipe(vinylSourceStream(CONST.examples.OUT))
                    .pipe(gulp.dest(CONST.examples.DEST_SCRIPTS))
                    .pipe(browserSync.stream());
                console.log('[' + new Date() + '] Updated');
            })
            .bundle()
            .on('error', function (e) {
                console.error(e.toString());
            })
            .pipe(vinylSourceStream(CONST.examples.OUT))
            .pipe(gulp.dest(CONST.examples.DEST_SCRIPTS))
            .pipe(browserSync.stream());
    });

    gulp.task('lib', function () {
        return gulp.src(CONST.lib.SRC)
            .pipe(gulpBabel(CONFIG.babel))
            .pipe(gulp.dest(CONST.lib.DEST))
            .pipe(browserSync.stream());
    });

    gulp.task('examples:html', function () {
        return gulp.src(CONST.examples.HTML)
            .pipe(gulpHtmlReplace({
                'js': CONST.examples.OUT
            }))
            .pipe(gulpReplace('@@gulpServerUrl', CONFIG.serverUrl))
            .pipe(gulpReplace('@@gulpVersion', CONFIG.version))
            .pipe(gulp.dest(CONST.examples.DEST))
            .pipe(browserSync.stream());
    });

    gulp.task('examples:styles', function () {
        return gulp.src(CONST.examples.SOURCE_STYLES)
            .pipe(gulpSass())
            .pipe(gulpConcat('app.css'))
            .pipe(gulp.dest(CONST.examples.DEST_STYLES))
            .pipe(browserSync.stream());
    });

    /* Копирование сторонних библиотек из node_modules */
    gulp.task('examples:vendor', function () {
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
            entries: [CONST.examples.ENTRY_POINT],
            transform: [
                babelify.configure(CONFIG.babel)
            ],
            require: [
                /*'jszip'*/
            ]
        };

        if (CONFIG.isDebug) {
            params.debug = true;
            params.cache = {};
            params.packageCache = {};
            params.fullPaths = true;
        }

        return browserify(params);
    }
})();