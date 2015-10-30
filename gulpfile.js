var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minify = require('gulp-minify-css'),
    preprocess = require('gulp-preprocess'),
    shell = require('gulp-shell'),
    del = require('del'),
    ghpages = require('gulp-gh-pages')

// Static server with proxy
gulp.task('default', ['build', 'watch'], function () {
  browserSync.init({
    port: 8888,
    files: ["src/*.html", "src/lib/**"],
    server: {
      baseDir: ["./dist", "./"]
    },
    open: false,
    notify: false,
    inject: true
  })
})

var generateLess = function () {
  return gulp.src('./src/assets/less/main.less')
    .pipe(less())
    .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
    .pipe(minify())
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(browserSync.stream())
}

gulp.task('less', ['clean'], generateLess)
gulp.task('less:watch', generateLess)

var generateHTML = function() {
  return gulp.src('./src/*.html')
    .pipe(preprocess({context: { NODE_ENV: 'development'}}))
    .pipe(gulp.dest('./dist/'))
}

gulp.task('preprocess', ['clean'], generateHTML)
gulp.task('preprocess:watch', generateHTML)

var copyFiles = function() {
  var files = ['testfile']
  return gulp.src(files, { cwd: './src/' })
    .pipe(gulp.dest('./dist/'))
}

gulp.task('copy', ['clean'], copyFiles)
gulp.task('copy:watch', copyFiles) 

gulp.task('watch', ['build'], function() {
  gulp.watch('./src/assets/less/**/*.less', ['less:watch'])
  gulp.watch('./src/*.html', ['preprocess:watch'])
  gulp.watch(['./src/**/*', '!./src/*.html', '!./src/assets/less/**/*'], ['copy:watch'])
})

gulp.task('build', ['clean', 'preprocess', 'less', 'copy'])

gulp.task('clean', function(cb) {
  del(['./dist/**/*'], cb)
})

gulp.task('deploy', ['build'], function() {
  return gulp.src('./dist/**/*')
    .pipe(ghpages({force: true}))
})