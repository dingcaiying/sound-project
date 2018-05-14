var ProvidePlugin = require('webpack').ProvidePlugin;
var path = require('path');
var autoprefixer = require('autoprefixer');

var SRC = path.resolve(__dirname, 'src');

module.exports = {
    entry: [
      `${SRC}/js/main.js`,
    ],
    module: {
      loaders: [
        {
          test: /assets\/images/,
          loader: 'file?name=assets/images/[name].[ext]',
          exclude: /node_modules/,
        },
        {
          test: /assets\/music/,
          loader: 'file?name=assets/music/[name].[ext]',
          exclude: /node_modules/,
        },
        {
          test: /\.(woff|woff2|eot|otf|ttf)$/,
          loader: 'file?name=assets/fonts/[name].[ext]',
          exclude: /node_modules/,
        },
        {
          test: /\.(js|jsx)$/,
          loader: 'babel',
          exclude: /node_modules/,
        },
        {
          test: /\.html$/,
          loader: 'file?name=[name].[ext]',
          exclude: /node_modules/,
        },
      ]
    },
    postcss: function() {
      return [autoprefixer];
    },
    plugins: [
      new ProvidePlugin({
        $: 'jquery',
        THREE: `${SRC}/js/lib/three.js`,
      })
    ], 
    resolve: {
      extensions: ['', '.js', '.css'],
      alias: {
        'three-extras': path.resolve(`${__dirname}/node_modules/three/examples/js/`),
      }
    }
};
