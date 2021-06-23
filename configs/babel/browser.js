const targets = require('./targets');

module.exports = {
  presets: [['@babel/preset-env', {
    bugfixes: true,
    targets: targets.browser
  }]]
};
