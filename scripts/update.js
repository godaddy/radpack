const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const findUp = require('find-up');
const glob = promisify(require('glob'));

const cwd = path.resolve(__dirname, '../');
const cwdPkgPath = path.join(cwd, 'package.json');

const cachedSemvers = {};

async function fix(cwd, deps = {}) {
  let hasChanges = false;
  const updated = Object.fromEntries(
    await Promise.all(Object.entries(deps).map(async ([dep, semver]) => {
      const pkg = await findUp(`node_modules/${ dep }/package.json`, { cwd });
      if (!pkg) {
        throw Error(`The dependency '${ dep }' doesn't appear to be installed, please install in '${ cwd }'`);
      }
      if (!(pkg in cachedSemvers)) {
        cachedSemvers[pkg] = require(pkg).version;
      }
      let prefix = semver.charAt(0);
      if (!isNaN(prefix)) {
        prefix = '';
      }
      const newSemver = prefix + cachedSemvers[pkg];
      if (newSemver !== semver) {
        hasChanges = true;
      }
      return [dep, newSemver];
    }))
  );
  return hasChanges ? updated : false;
}

async function update() {
  const cwdPkg = await fs.readFile(cwdPkgPath, 'utf8');
  const lineEnding = cwdPkg.substr(cwdPkg.lastIndexOf('}') + 1);

  const files = await Promise.all([
    cwdPkgPath,
    glob('packages/*/package.json', { cwd, absolute: true }),
    glob('packages/*/*/package.json', { cwd, absolute: true }),
    glob('examples/*/*/package.json', { cwd, absolute: true })
  ]).then(arr => arr.flat().sort());

  await Promise.all(files.map(async file => {
    const pkg = require(file);
    const pwd = path.dirname(file);
    const [dependencies, devDependencies] = await Promise.all([
      fix(pwd, pkg.dependencies),
      fix(pwd, pkg.devDependencies)
    ]);
    if (!dependencies && !devDependencies) {
      return false;
    }
    if (dependencies) {
      pkg.dependencies = dependencies;
    }
    if (devDependencies) {
      pkg.devDependencies = devDependencies;
    }

    await fs.writeFile(file, JSON.stringify(pkg, null, 2) + lineEnding);
  }));
}

module.exports = update();
