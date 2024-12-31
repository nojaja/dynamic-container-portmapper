const src = __dirname + "/src"
const dist = __dirname + "/dist"
const webpack = require('webpack')

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  target: 'node',
  devServer: {
    contentBase: dist
  },
  context: src,
  entry: {
    'tcp': './tcp_index.js',
    'udp': './udp_index.js',
    'cc': './cc_index.js',
    'index': './index.js'
  },
  output: {
    filename: './[name].bundle.js',
    sourceMapFilename: './map/[id].[chunkhash].js.map',
    chunkFilename:'./chunk/[id].[chunkhash].js',
    path: dist,
    publicPath:"",
    libraryExport: 'default',
    libraryTarget: 'umd'
  },
  module: {
  },
  resolve: {
    modules: ['node_modules']
  },
}