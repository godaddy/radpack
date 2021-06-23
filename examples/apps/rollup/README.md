# Rollup App Example
An example [radpack] application built using [rollup][rollup-url] to run the [basic library][basic]. Unlike the [webpack] example, a [runtime] is not automatically provided to instantiate a [radpack] server instance and apply [build configurations][config].


## Scripts
| cmd | description |
| --- | --- |
| `npm start` | Builds and then runs the [runtime]. |
| `npm run build` | Uses [rollup config][config] to generate `dist` content. |

[runtime]: ./runtime.js
[config]: ./rollup.config.js
[webpack]: ../webpack/
[basic]: ../../libs/basic/
[radpack]: ../../../
[rollup-url]: https://rollupjs.org/
