const path = require('path');
const fs = require('fs');
const { BannerPlugin } = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// Read the LICENSE file
const license = fs.readFileSync(path.resolve(__dirname, 'LICENSE'), 'utf8').replace('[xxxx]', new Date().getFullYear());

module.exports = [
    {
        // cdn
        mode: 'production',
        target: 'web',
        entry: './wysiwyg4all.js',
        output: {
            filename: 'wysiwyg4all.js',
            libraryTarget: 'umd'
        },
        resolve: {
            extensions: ['.js'],
        },
        devtool: 'source-map',
        plugins: [
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                reportFilename: 'bundle-report.html',
                openAnalyzer: false,
                excludeAssets: [/node_modules/]
            }),
            new BannerPlugin({
                banner: `
/**
 * @license
${license}
 */
                `.trim(),
                raw: true
            })
        ],
    },
    {
        // CommonJS build
        mode: 'production',
        target: 'node',
        entry: './wysiwyg4all.js',
        output: {
            filename: 'wysiwyg4all.cjs',
            libraryTarget: 'commonjs2'
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: ['.js'],
        },
        devtool: 'source-map',
        plugins: [
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                reportFilename: 'bundle-report-commonjs.html',
                openAnalyzer: false,
                excludeAssets: [/node_modules/]
            }),
            new BannerPlugin({
                banner: `
/**
 * @license
${license}
 */
                `.trim(),
                raw: true
            })
        ],
    }
];