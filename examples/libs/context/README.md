# Context Library Example
An example [radpack] library using [rollup][rollup-url] with context driven entries.


## Scripts
| cmd | description |
| --- | --- |
| `npm run build` | generates `dist/radpack.json`. |
| `npm run watch` | (Re)Runs `build` when local changes detected. |


## Entries
| path | description |
| --- | --- |
| `@radpack/example-context-lib` | Returns [a] or [b] based on context `flag`. |


[a]: ./src/a/index.js
[b]: ./src/b/index.js
[radpack]: ../../../
[rollup-url]: https://rollupjs.org/
