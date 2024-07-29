module.exports = {
  webpack: {
    configure: {
      resolve: {fallback: {fs: false, path:require.resolve("path-browserify")}}
    },
    rules: [{
      test: /\.wasm$/,
      type: "asset/inline",
    }]
  }
}
