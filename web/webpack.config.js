/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

'use strict'

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: __dirname + "/lib/main.js",
    output: {
        path: __dirname + '/entry/js',
        filename: 'bundle-[hash].js',
    },

    devtool: 'eval-source-map',
    devServer: {
        contentBase: __dirname + '/entry/views',
        historyApiFallback: true,
        inline: true,
        hot: true
    },

    module: {
        rules: [
            {
                test: /\.js(x)?$/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.less$/,
                loader: 'less-loader'
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader",
                        // options: {
                        //     modules: true
                        // }
                    }
                ]
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                loader: "file-loader"
            }
        ]
    },
    plugins: [
        // generate bundle nae hash
        new HtmlWebpackPlugin({
            template: __dirname + "/views/index.html"
        }),
        // hot load of one component
        new webpack.HotModuleReplacementPlugin(),

        // new ExtractTextPlugin("styles.css"),
    ]
};