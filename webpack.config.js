const path = require("path");

module.exports = {
  mode: "production",
  entry: { "content-script": "./src/content-script.ts" },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  module: {
    rules: [{ test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ }],
  },
  resolve: { extensions: [".ts", ".js"] },
};
