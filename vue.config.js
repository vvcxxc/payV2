const CompressionWebpackPlugin = require('compression-webpack-plugin');
const productionGzipExtensions = ['js', 'css'];
const isProduction = process.env.NODE_ENV === 'production';
module.exports = {
    outputDir: process.env.outputDir,
    assetsDir: './',
    configureWebpack: config => {
        if (isProduction) {
          config.plugins.push(new CompressionWebpackPlugin({
            algorithm: 'gzip',
            test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
            threshold: 10240,
            minRatio: 0.8
          }))
        }
      },
    // runtimeCompiler: true, //关键点在这
    // devServer: {
    //   host: '169.254.19.113',
    //   port: 8000,
    //   https: false,
    //   hotOnly: false,
    //   proxy: null, // 设置代理
    //   before: app => {}
    // }
}