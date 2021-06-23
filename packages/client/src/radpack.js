import Radpack from '@radpack/core';

export default class extends Radpack {

  register(config, options) {
    return super.register(config, { base: document.location.href, ...options });
  }

  define() {
    const { instance = this } = document.currentScript || {};
    super.define.apply(instance, arguments);
  }

  _fetchExport(exp, cache) {
    return new Promise((resolve, reject) => {
      // Attach promise handlers (called in define)
      cache.resolve = resolve;
      cache.reject = reject;
      // Load/Run Script
      document.head.appendChild(Object.assign(document.createElement('script'), {
        crossOrigin: 'Anonymous',
        onerror: reject,
        src: cache.url,
        instance: this
      }));
    });
  }

  async _fetchJson(cache) {
    const res = await fetch(cache.url);
    if (!res.ok) {
      throw Error(await res.text());
    }
    return res.json();
  }

  _setRegisters(registers) {
    registers.forEach(register => this._setExports(this._getExports(register)));
  }

}
