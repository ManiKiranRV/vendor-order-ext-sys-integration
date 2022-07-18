const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './src/consume.ts',
    mode: 'development',
    target: 'node',
    module: {
        rules: [
            {
                test: /.ts$/,
                use: ['ts-loader']
            },
            {
                test: /.js$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    },
    node: {
        __dirname: false,
        __filename: false,
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            moment: 'moment/src/moment'
        },
        modules: [
            path.resolve('src'),
            path.resolve('node_modules'),
            'node_modules'
        ]
    },
    output: {
        filename: 'consume.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'commonjs2'
    },
    externals: [ nodeExternals() ]
}
