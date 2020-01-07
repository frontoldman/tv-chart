const path = require('path')

module.exports = {
  entry: {
    main: path.resolve(__dirname, './src/index.ts'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './build'),
  },
  resolve: {
    extensions: ['.ts'],
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [{
          loader: 'awesome-typescript-loader',
          options: {
            useCache: false,
            forceIsolatedModules: true,
          },
        }],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [],
  devServer: {
    contentBase: path.join(__dirname, "build"),
    compress: true,
    port: 9000
  },
  watch: true,
}
