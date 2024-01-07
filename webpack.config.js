const path = require("path")

module.exports = (env) => {
    return {
        mode: env.mode,
        entry: ['babel-polyfill', path.resolve(__dirname, "./wysiwyg4all.js")],
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: './wysiwyg4all.js',
            libraryTarget: 'window'
        },
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                }
            ]
        }
    }
}
