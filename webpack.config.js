const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: './src/index.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},
	devtool: 'inline-source-map',
	devServer: {
		static: './dist',
		hot: true,
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
					},
				},
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: 'asset/resource',
			},
			{
				test: /\.(ttf|woff|woff2|eot)$/,
				type: 'asset/resource',
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'Flappy Bird',
			template: './src/index.html',
		}),
		new CopyWebpackPlugin({
			patterns: [
				{ from: 'src/assets', to: 'assets' },
			],
		}),
	],
};
