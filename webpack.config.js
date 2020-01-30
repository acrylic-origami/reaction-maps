const path = require('path');
const webpack = require('webpack');

module.exports = [
  {
    entry: './js-src/index.js',
    mode: 'development',
    output: {
      path: path.resolve(__dirname),
      filename: 'public/js/index.main.react.js'
    },
    devtool: 'none',
    module: {
      rules: [
        {test: /\.(js|jsx)$/, use: 'babel-loader', exclude: /node_modules/},
        {
          test: /node_modules\/vanilla-jsx\/lib\/.*\.(js|jsx)$/,
          use: 'babel-loader'
        }
      ]
    },
    node: {
      fs: 'empty'
    },
  }];