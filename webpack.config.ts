import 'webpack-dev-server'
import process from 'node:process'
import type * as webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const [, , , mode] = process.argv

export default {
  name: "Goold ol' Days",
  dotenv: true,
  context: process.cwd(),
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  devServer: {
    hot: true,
    host: '0.0.0.0',
    port: Number(process.env.PORT || 6969),
  },
  mode: mode === 'production' ? 'production' : 'development',
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
  },
  experiments: {
    css: true,
    backCompat: true,
    outputModule: true,
    futureDefaults: true,
  },
  target: 'web',
  module: {
    rules: [
      {
        loader: 'ts-loader',
        test: /\.([cm]?ts|tsx)$/,
        options: { transpileOnly: true },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      scriptLoading: 'module',
      template: './src/index.html',
    }),
  ],
} satisfies webpack.Configuration
