// Import Node.js path module for handling file paths
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // Define the entry point where webpack starts bundling
  entry: './src/index.jsx',
  
  // Configure how and where webpack outputs bundles
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  
  // Define rules for how webpack should handle different types of files
  module: {
    rules: [
      {
        // Handle JavaScript and JSX files using babel-loader
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        // Handle CSS files using style-loader and css-loader
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  
  // Configure how webpack resolves module imports
  resolve: {
    extensions: ['.js', '.jsx']
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  
  // Development server configuration
  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    historyApiFallback: true, // Enables SPA routing
    port: 3000,
    hot: true,
    open: true  // Opens browser automatically
  },
  
  // Set build mode to development for better debugging
  mode: 'development'
};