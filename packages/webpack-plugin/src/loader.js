import { Template } from 'webpack';
import loaderUtils from 'loader-utils';

export default function radpackLoader() {
  const {
    name,
    deps = [],
    hot = this.hot,
    preload = true
  } = loaderUtils.getOptions(this) || {};
  const request = loaderUtils.stringifyRequest(this, this.resourcePath);
  deps.forEach(this.addDependency);
  return Template.asString([
    `function loadEntry() {`,
    Template.indent([
      `var entry = import(`,
      Template.indent([
        preload
          ? Template.toNormalComment(`webpackPreload: true`)
          : '',
        name
          ? Template.toNormalComment(`webpackChunkName: ${ JSON.stringify('radpack~' + name) }`)
          : '',
        request
      ]),
      ');',
      `if (typeof RADPACK_RESULT !== 'undefined') {`,
      Template.indent([
        `RADPACK_RESULT.default = entry;`
      ]),
      `}`,
      `return entry;`
    ]),
    `}`,
    Template.asString(hot ? [
      `if (module.hot) {`,
      Template.indent([
        `module.hot.accept(${ request }, loadEntry);`
      ]),
      `}`
    ] : ''),
    `export default loadEntry();`
  ]);
}
