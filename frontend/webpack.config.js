const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: [
        '@babel/polyfill',
        './src/js/animals_index.js'
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/bundle.js'
    },
    devServer: {
        contentBase: './dist'
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'animals.html',
            template: './src/animals.html'
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
