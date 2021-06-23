const start = Date.now();
const isWeb = typeof document !== 'undefined';
const isIntegration = !isWeb && typeof process !== 'undefined' && process.env.NODE_ENV === 'integration';

export default (id, exports) => {
  const took = Date.now() - (globalThis.start || start);
  const html = [
    `<p>${ id } (${ took }ms):</p>`,
    `<pre><code>${ JSON.stringify(exports, null, 2) }</code></pre>`
  ].join('\n');
  if (isIntegration) {
    console.log(JSON.stringify({ id, took, exports }));
  } else {
    console.log(`%s (%dms): %o`, id, took, exports);
  }
  if (isWeb) {
    document.body.innerHTML += html;
  } else {
    return html;
  }
};
