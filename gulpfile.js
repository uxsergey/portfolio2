//========================= Setings folders =================================

const source_folder = "src",
    project_folder = "dist",
    scriptsFileName = "scripts.min.js",
    stylesFileName = "style.min.css";

let path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
        style: './' + `css/${stylesFileName}`,
        script: './' + `js/${scriptsFileName}`
    },
    src: {

        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/main.js",
        modules: source_folder + "/js/modules/*.js",
        img: source_folder + "/img/**/*.+(png|jpg|gif|ico|svg|webp)",
        fonts: source_folder + "/fonts/*.ttf"
    },

    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.+(png|jpg|gif|ico|svg|webp)"

    },
    clean: "./" + project_folder + "/",
};


// ===========================================================================

// =========================== Gulp plugins ==================================

let gulp = require("gulp");
let browserSync = require("browser-sync").create();
let fileinclude = require("gulp-file-include");
let del = require("del");
let scss = require("gulp-sass");
let autoprefixer = require("gulp-autoprefixer");
let sourcemaps = require("gulp-sourcemaps");
let groupMedia = require("gulp-group-css-media-queries");
let uglify = require("gulp-uglify");
let inject = require("gulp-inject-string");
let rename = require('gulp-rename');
let cleancss = require('gulp-clean-css');
let concat = require('gulp-concat');
let imagemin = require("gulp-imagemin");
let cheerio = require("gulp-cheerio");
let svgSprite = require("gulp-svg-sprite");
let ttf2woff = require("gulp-ttf2woff");
let ttf2woff2 = require("gulp-ttf2woff2");
let fonter = require("gulp-fonter");
let babel = require("gulp-babel");


let fs = require("fs");

//Rollup
let source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    rollup = require('@rollup/stream'),

    // *Optional* Depends on what JS features you want vs what browsers you need to support
    // *Not needed* for basic ES6 module import syntax support
    babelRoll = require('@rollup/plugin-babel'),
    commonjs = require('@rollup/plugin-commonjs');
// Add support for importing from node_modules folder like import x from 'module-name
let { nodeResolve } = require('@rollup/plugin-node-resolve');
let rollupMain = require('rollup');


// ===========================================================================
// ============================= All Setings =================================

//HTHL Task
gulp.task("html", function() { // setting html
    return gulp.src(path.src.html)
        .pipe(fileinclude({
            prefix: '@',
            basepath: '@file'
        }))
        .pipe(
            inject.after('</title>',
                `<link rel="stylesheet" href="${path.build.style}" />`)
        )
        .pipe(
            inject.wrap('</body',
                `<script src="${path.build.script}"></script>\n`)
        )
        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.stream());

});

//Styles Task
gulp.task("css", function() { // setting css
    return gulp.src(path.src.css)
        .pipe(sourcemaps.init())
        .pipe(
            scss({
                outputStyle: "expanded", //compressed
            })
        )
        .pipe(groupMedia())
        .pipe(rename({ suffix: '.min', prefix: '' }))
        .pipe(autoprefixer({
            overrideBrowserslist: ["defaults"],
            cascade: true,
        }))
        .pipe(cleancss({ level: { 1: { specialComments: 0 } } }))
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.stream());

});


//JS Task
gulp.task('js', function() {
    return rollup({
            // Point to the entry file
            input: path.src.js,

            // Apply plugins
            plugins: [
                uglify(),
                rename(function(path) {
                    if (path.extname === '.js') {
                        path.basename += '.min';
                    }
                }),
                babel(),
                commonjs({
                    include: 'node_modules/**',
                }),
                nodeResolve({
                    mainFields: ['modules'],
                })
            ],

            // Enable source maps support
            sourcemap: true,

            // Use cache for better performance
            // cache: cache,

            // Note: these options are placed at the root level in older versions of Rollup
            output: {

                // Output bundle is intended for use in browsers
                // (iife = "Immediately Invoked Function Expression")
                format: 'iife',

                // Show source code when debugging in browser
                sourcemap: true

            }
        })
        .on('bundle', function(bundle) {
            // Update cache data after every bundle is created
            cache = bundle;
        })
        // Name of the output file.
        .pipe(source('scripts.js'))
        .pipe(buffer())

    // The use of sourcemaps here might not be necessary, 
    // Gulp 4 has some native sourcemap support built in
    .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('.'))

    // Where to send the output file

    .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.stream());
});





// gulp.task("js", function() {
//     // setting js
//     return gulp.src([path.src.js, path.src.modules])

//     .pipe(fileinclude({
//             prefix: '@',
//             basepath: '@file'
//         }))
//         .pipe(babel({
//             presets: ["@babel/preset-env"]
//         }))
//         .pipe(concat('scripts.min.js'))
//         .pipe(uglify())
//         .pipe(gulp.dest(path.build.js))
//         .pipe(browserSync.stream());

// });

gulp.task("img", function() { // setting image
    return gulp.src(path.src.img)
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: true }],
                interlaced: true,
                optimizationLevel: 7, // 0 to 7
            })
        )
        .pipe(gulp.dest(path.build.img))
        .pipe(browserSync.stream());
});

gulp.task('otf', async function() { // setting .otf to .ttf
    gulp.src([source_folder + "/fonts/*.otf"])
        .pipe(fonter({ formats: ['ttf'] }))
        .pipe(gulp.dest(path.build.fonts));

});

gulp.task('fonts', async function() { // setting fonts => .ttf to .woff and .woff2
    gulp.src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(gulp.dest(path.build.fonts));
    gulp.src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(gulp.dest(path.build.fonts));

});

gulp.task("svg", function() { // "gulp svg"
    return gulp.src([source_folder + "/img/svg/**/*.svg"])
        .pipe(
            cheerio({
                run: function($) {
                    $("[fill]").removeAttr("fill");
                    $("[stroke]").removeAttr("stroke");
                    $("[style]").removeAttr("style");
                    $("[viewBox]").removeAttr("viewBox");
                },
                parserOptions: { xmlMode: true },
            })
        )
        .pipe(
            svgSprite({
                mode: {
                    stack: {
                        sprite: "../sprite.svg",
                        example: true,
                    },
                },
            })
        )
        .pipe(gulp.dest(path.build.img));
});

gulp.task("browser-sync", function() { // setting browser
    browserSync.init({
        server: {
            baseDir: "./" + project_folder + "/",
        },
        port: 3000,
        browser: ["chrome", "firefox"],
        notify: false,
    });
});

gulp.task('clean', function() { // setting clean
    return del(path.clean);
});



gulp.task('watch', function() { // setting watch
    gulp.watch([path.watch.html], gulp.parallel('html'));
    gulp.watch([path.watch.css], gulp.parallel('css'));
    gulp.watch([path.watch.js], gulp.parallel('js'));
    gulp.watch([path.watch.img], gulp.parallel('img'));
});

let srcFonts = source_folder + "/scss/base/_fonts.scss";

const fontsStyle = (done) => {
    let file_content = fs.readFileSync(srcFonts);

    fs.writeFile(srcFonts, "", cb);
    fs.readdir(source_folder + "/fonts/", function(err, items) {
        if (items) {
            let c_fontname;
            for (var i = 0; i < items.length; i++) {
                let fontname = items[i].split(".");
                fontname = fontname[0];
                let font = fontname.split("-")[0];
                let weight = checkWeight(fontname);

                if (c_fontname != fontname) {
                    fs.appendFile(
                        srcFonts,
                        '@include font-face("' +
                        font +
                        '", "' +
                        fontname +
                        '", ' +
                        weight +
                        ");\r\n",
                        cb
                    );
                }
                c_fontname = fontname;
            }
        }
    });

    done();
};

// ===========================================================================
// ========================== "gulp build" ===================================

gulp.task('build', gulp.series('clean', gulp.parallel('js', 'css', 'html', 'img', 'fonts', 'svg', fontsStyle)));

// ===========================================================================
// =============== default function, after command "gulp" ====================

gulp.task('default', gulp.parallel('build', 'watch', 'browser-sync'));

// ===========================================================================
// ============================= Utils =======================================

const checkWeight = (fontname) => {
    let weight = 400;
    switch (true) {
        case /Thin/.test(fontname):
            weight = 100;
            break;
        case /ExtraLight/.test(fontname):
            weight = 200;
            break;
        case /Light/.test(fontname):
            weight = 300;
            break;
        case /Regular/.test(fontname):
            weight = 400;
            break;
        case /Medium/.test(fontname):
            weight = 500;
            break;
        case /SemiBold/.test(fontname):
            weight = 600;
            break;
        case /Semi/.test(fontname):
            weight = 600;
            break;
        case /Bold/.test(fontname):
            weight = 700;
            break;
        case /ExtraBold/.test(fontname):
            weight = 800;
            break;
        case /Heavy/.test(fontname):
            weight = 700;
            break;
        case /Black/.test(fontname):
            weight = 900;
            break;
        default:
            weight = 400;
    }
    return weight;
};

function cb() {}