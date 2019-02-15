const path = require('path');
const baseConfig = require('./webpack.base.js');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

baseConfig.module.rules[0].use.options['plugins'] = ['istanbul'];

const config = webpackMerge(baseConfig, {
    mode: 'development',
    entry: './main.js',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 8080,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
        }),
    ]
});
module.exports = config;
