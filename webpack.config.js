/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check

"use strict";

const path = require("path");
const HtmlPlugin = require("html-webpack-plugin");
const FilemanagerWebpackPlugin = require("filemanager-webpack-plugin");

/**@type {import('webpack').Configuration}*/
module.exports = function(env, argv) {
  env = env || {};
  return [getExtensionConfig(env), getWebViewsConfig(env)];
};

function getExtensionConfig(env) {
  return {
    name: "extension",
    target: "node", // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
    node: {
      __dirname: false
    },
    mode: env.production ? "production" : "development",
    entry: "./src/extension.ts", // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: {
      // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
      path: path.resolve(__dirname, "dist"),
      filename: "extension.js",
      libraryTarget: "umd",
      devtoolModuleFilenameTemplate: "../[resource-path]"
    },
    devtool: "source-map",
    externals: {
      vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    },
    resolve: {
      // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
      extensions: [".ts", ".js"]
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true,
                experimentalWatchApi: true
              }
            }
          ]
        }
      ]
    }
  };
}

function getWebViewsConfig(env) {
  const plugins = [
    new HtmlPlugin({
      excludeAssets: [/.+-styles\.js/],
      // excludeChunks: ["welcome"],
      template: "drag-drop/index.html",
      filename: path.resolve(__dirname, "dist/webviews/drag-drop.html"),
      inject: true,
      // inlineSource: env.production ? '.(js|css)$' : undefined,
      minify: env.production
        ? {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyCSS: true
          }
        : false
    })
  ];
  return {
    name: "webviews",
    context: path.resolve(__dirname, "src/webviews"),
    mode: env.production ? "production" : "development",
    entry: {
      "drag-drop": "drag-drop/index.ts",
    }, // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist/webviews"),
      publicPath: "{{root}}/dist/webviews/"
    },
    devtool: "source-map",
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
      modules: [path.resolve(__dirname, "src/webviews"), "node_modules"]
    },
    plugins: plugins,

    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
              options: {
                configFile: "webview.tsconfig.json",
                transpileOnly: true,
                experimentalWatchApi: true
              }
            }
          ]
        }
      ]
    }
  };
}
