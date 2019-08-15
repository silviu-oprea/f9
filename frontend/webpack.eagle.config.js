const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: [
        '@babel/polyfill',
        './src/js/eagle_index.js'
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/eagle_bundle.js'
    },
    devServer: {
        contentBase: './dist'
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'eagle.html',
            template: './src/eagle.html'
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/, // All JS files
                exclude: /node_modules/, // except what is inside node_modules
                use: {
                    loader: 'babel-loader' // should use this loader
                }
            }
        ]
    }
};
