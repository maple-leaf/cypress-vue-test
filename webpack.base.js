const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    resolve: {
        modules: ["node_modules"],
        extensions: [".js", ".css", ".vue"],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
        },
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    }
                }
            },
            {
                test: /\.vue$/,
                use: {
                    loader: 'vue-loader',
                }
            },
            {
                test: /\.html$/,
                use: {
                    loader: 'html-loader',
                }
            },
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
    ]
};
