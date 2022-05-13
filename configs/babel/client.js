const targets = require('./targets');

module.exports = {
  presets: [['@babel/preset-env', {
    bugfixes: true,
    targets: {
      ...targets.node,
      ...targets.browser
    }
  }], '@babel/preset-react']
};
