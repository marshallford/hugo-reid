import gulp from 'gulp'
import { spawn } from 'child_process'
import gutil from 'gulp-util'
import htmlmin from 'gulp-htmlmin'
import BrowserSync from 'browser-sync'
import del from 'del'
import webpack from 'webpack'
import webpackConfig from './webpack.config.js'

const browserSync = BrowserSync.create()
const hugoBin = 'hugo'
const defaultArgs = ['-d', '../dist', '-s', 'site']

gulp.task('hugo', (cb) => buildSite(cb))
gulp.task('hugo-preview', (cb) => buildSite(cb, ['--buildDrafts', '--buildFuture']))

gulp.task('bundle', (cb) => webpackBundle(cb))
gulp.task('clean', () => cleanDist())
gulp.task('minify', () =>
  gulp.src('dist/**/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist')))

gulp.task('build', gulp.series('clean', 'bundle', 'hugo', 'minify'))
gulp.task('build-preview', gulp.series('clean', 'bundle', 'hugo-preview', 'minify'))

gulp.task('browser-sync', () => startBrowserSync())

gulp.task('server', gulp.series('bundle', 'hugo', 'browser-sync'))

const startBrowserSync = () => {
  browserSync.init({
    server: {
      baseDir: './dist',
    },
  })
  gulp.watch(['./src/**/*'], gulp.series('bundle'))
  gulp.watch('./site/**/*', gulp.series('hugo'))
}

const webpackBundle = (cb) => {
  webpack(webpackConfig, (err, stats) => {
    if (err) throw new gutil.PluginError('webpack', err)
    gutil.log('[webpack]', stats.toString({
      colors: true,
      progress: true,
      modules: false,
      children: false,
    }))
    browserSync.reload()
    cb()
  })
}

const buildSite = (cb, options) => {
  const args = options ? defaultArgs.concat(options) : defaultArgs
  const child = spawn(hugoBin, args, { stdio: 'inherit' })
  child.on('exit', err => {
    if (!err) browserSync.reload()
    cb()
  })
  return child
}

const cleanDist = () =>
  del([
    'dist/*.*',
  ])
