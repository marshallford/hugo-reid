import { resolve } from 'path'
import webpack from 'webpack'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import AssetsPlugin from 'assets-webpack-plugin'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'

const isProd = process.env.NODE_ENV === 'production'
const addPlugin = (add, plugin) => add ? plugin : undefined
const removeEmpty = array => array.filter(i => !!i)

export default {
  context: resolve(__dirname, 'src'),
  entry: resolve(__dirname, 'src', 'js'),
  devtool: isProd ? false : 'cheap-module-source-map',
  output: {
    path: resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: `[name]${isProd ? '.[hash]' : ''}.js`,
  },
  module: {
    rules: [
      {
        test: /\.((jpe?g)|(gif)|(png)|(eot)|(woff)|(woff2)|(ttf)|(svg))(\?v=\d+\.\d+\.\d+)?$/,
        loader: `file-loader?name=[name]${isProd ? '.[hash]' : ''}.[ext]`,
      },
      {
        loader: 'babel-loader',
        test: /\.js?$/,
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
          comments: false,
          presets: [
            ['env', {
              modules: false,
            }],
          ],
        },
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract([
          { loader: 'css-loader', options: { sourceMap: !isProd, importLoaders: 2 } },
          { loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              sourceMap: !isProd,
              plugins: () => [autoprefixer(), cssnano({preset: 'default'})],
            },
          },
          { loader: 'sass-loader', options: { sourceMap: !isProd } },
        ]),
      },
    ],
  },
  plugins: removeEmpty([
    new ExtractTextPlugin(`styles${isProd ? '.[hash]' : ''}.css`),
    new webpack.HashedModuleIdsPlugin(),
    addPlugin(isProd, new webpack.optimize.UglifyJsPlugin()),
    new AssetsPlugin({ path: resolve(__dirname, 'site', 'data'), filename: 'webpack.json' }),
  ]),
}
