const path = require('path');
const express = require('express');

module.exports = {
  plugins: {
    presets: [
      '@gasket/nextjs'
    ],
    remove: [
      '@gasket/plugin-redux'
    ],
    add: [
      '@radpack/gasket-plugin',
      // Work around to register and serve local files, not required
      {
        name: 'express-static-libs',
        hooks: {
          express(gasket, app) {
            app.use('/libs', express.static(path.resolve('../../libs')));
          }
        }
      }]
  },
  environments: {
    local: {
      radpack: {
        register: [
          'http://localhost:8080/libs/basic/dist/radpack.json',
          'http://localhost:8080/libs/logger/dist/radpack.json'
        ],
        registerOptions: {
          retries: 0
        }
      }
    }
  },
  radpack: {
    register: [
      'http://localhost:80/libs/basic/dist/radpack.json',
      'http://localhost:80/libs/logger/dist/radpack.json'
    ]
  }
};
