const path = require('path');
const webpack = require('webpack');

module.exports = {
    context: __dirname,
    entry: [
        './TypeAheadFacade.js'
    ],
    output: {
        path: path.join(__dirname, 'client/dist'),
        filename: 'TypeAheadFacade.js',
        libraryTarget: 'var',
        library: ['com', 'package', 'TypeAheadFacade']
    },
    node: {
        console: true,
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
};
