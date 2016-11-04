const path = require('path');
const webpack = require('webpack');

module.exports = {
    context: __dirname,
    debug: true,
    devtool: 'source-map',
    entry: [
        './TypeAheadFacade.js'
    ],
    output: {
        path: path.join(__dirname, 'client/build'),
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
        new webpack.optimize.DedupePlugin()
    ]
};
