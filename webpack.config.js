const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const currentDir = path.resolve(__dirname, 'src');

const buildHTMLFileList = (dir, fileList) => {
  const files = fs.readdirSync(dir);
  fileList = fileList || [];

  files.forEach(file => {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      fileList = buildHTMLFileList(path.join(dir, file), fileList);
    }
    else {
      fileList.push(path.join(dir, file));
    }
  });

  const filteredList = fileList.filter(el => el.includes('.html'));

  return filteredList;
}

const htmlFileList = buildHTMLFileList(currentDir);

module.exports = (env, argv) => ({

  entry: [
    path.resolve(__dirname, 'src/assets/js/main.js')
  ],

  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'webgl-grid/assets/js/main.js',
    publicPath: '/'
  },

  devtool: 'source-map',

  devServer: {
    contentBase: path.join(__dirname, 'public'),
    watchContentBase: true,
    stats: 'errors-only',
    port: 8080,
    compress: true,
    // writeToDisk: true
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'src')],
        exclude: [/node_modules/, /swiper/],
        use: [{
          loader: 'babel-loader'
        }]
      },

      {
        test: /\.(scss|sass)$/,
        include: [path.resolve(__dirname, 'src', 'assets', 'scss')],
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                url: false,
                sourceMap: true,
                importLoaders: 2
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true
              }
            }
          ]
        })
      }
    ]
  },

  plugins: htmlFileList.map(file => {
    return new HtmlWebpackPlugin({
      template: file,
      filename: file.replace('src', 'public/webgl-grid'),
      // inlineSource: argv.mode === 'production' ? '.(js|css)$' : false,
      inlineSource: argv.mode === 'production' ? '.(css)$' : false,
      inject: false
    })
  })
  .concat([
    new HtmlWebpackInlineSourcePlugin(),
    new ExtractTextPlugin({
      filename: 'webgl-grid/assets/css/main.css'
    }),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, 'src/assets/img'),
      to: path.resolve(__dirname, 'public/webgl-grid/assets/img'),
      ignore: ['*.js', '*.scss', '*.sass']
    }])
  ])
});