const path = require('path');
const NodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const stats = {
  hash: false,
  entrypoints: false,
  assets: false,
  chunks: false,
  exclude: /node_modules/,
}

const backend = {
  name: 'Backend',
  entry: './backend/app.ts',
  mode: 'development',
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: [NodeExternals()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        context: 'backend',
        from: '**/*pug',
        to: './'
      },
    ]),
  ],
  stats,
};

const frontend = {
  name: 'Frontend',
  entry: './frontend/src/main.ts',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  output: {
    filename: 'client.js',
    path: path.resolve(__dirname, 'dist/static')
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        context: 'static',
        from: '**/*',
        to: './'
      },
    ]),
  ],
  stats,
};

module.exports = [
  backend,
  frontend,
]
