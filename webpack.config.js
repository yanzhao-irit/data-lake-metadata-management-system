'use strict';

const Webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const buildDirectory = path.join(__dirname, 'build');

module.exports = {
  mode: 'development',
  entry: {
    app: './src/renderer.js'
  },
  output: {
    filename: './src/renderer.js',
    path: buildDirectory,
  },
  devtool: false,
  devServer: {
    contentBase: buildDirectory,
    port: 8080
  },

  stats: {
    colors: true,
    reasons: true
  },

  plugins: [
	new HtmlWebpackPlugin({filename:'unStructured.html',template: 'src/assets/unStructured.html', chunks: ['unStructured']}),
	new HtmlWebpackPlugin({filename:'semiStructured.html',template: 'src/assets/semiStructured.html', chunks: ['semiStructured']}),
    new HtmlWebpackPlugin({filename:'index.html',template: 'src/assets/index.html', chunks: ['app']})
  ],
  target: 'electron',
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.js', '.jsx']
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|ico|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ]
  },
};

