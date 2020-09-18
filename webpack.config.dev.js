// const path = require('path');
const webpack = require('webpack')

module.exports = Object.assign(require('./webpack.config.js'), {
  watch: true,
  plugins: [
    new webpack.EnvironmentPlugin([
      'VERIDA_ENVIRONMENT',
      'VERIDA_APP_NAME',
      'VERIDA_APP_HOST',
      'VERIDA_SERVERS_CUSTOM_APP_SERVER_URL',
      'VERIDA_SERVERS_CUSTOM_DID_SERVER_URL'
    ])
  ]
})