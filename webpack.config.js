const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  target: 'node',
  mode: 'production',
  externals: [nodeExternals()], // removes node_modules from your final bundle
  entry: './src/index.ts', // make sure this matches the main root of your code
  output: {
    path: path.join(__dirname, 'dist'), // this can be any path and directory you want
    filename: 'app.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    minimize: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader'],
      },
    ],
  },
}

