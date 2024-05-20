/* eslint-disable node/no-process-env */
"use strict";
const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const { codecovWebpackPlugin } = require("@codecov/webpack-plugin");

const common = require("@clusterio/web_ui/webpack.common");

module.exports = (env = {}) => merge(common(env), {
	context: __dirname,
	entry: "./web/index.jsx",
	output: {
		path: path.resolve(__dirname, "dist", "web"),
	},
	plugins: [
		new webpack.container.ModuleFederationPlugin({
			name: "gridworld",
			library: { type: "var", name: "plugin_gridworld" },
			exposes: {
				"./": "./index.js",
				"./package.json": "./package.json",
				"./web": "./web/index.jsx",
			},
			shared: {
				"@clusterio/lib": { import: false },
				"@clusterio/web_ui": { import: false },
				"antd": { import: false },
				"react": { import: false },
				"react-dom": { import: false },
				"react-router": { import: false },
				"react-router-dom": { import: false },
			},
		}),
		codecovWebpackPlugin({
			enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
			bundleName: "example-webpack-bundle",
			uploadToken: process.env.CODECOV_TOKEN,
		}),
	],
});
