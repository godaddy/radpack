# Webpack Hydrate App Example
An example [radpack] application using [webpack@5][webpack-url] and [express][express-url] to run the [basic library][basic].


## Scripts
| cmd | description |
| --- | --- |
| `npm start` | Builds and runs the [server], then opens http://localhost:3000/. |
| `npm run build` | Uses [webpack config][config] to generate `dist` content for both the [client] and [server]. |

[client]: ./src/client/index.js
[server]: ./src/server/index.js
[config]: ./webpack.config.js
[basic]: ../../libs/basic/
[radpack]: ../../../
[webpack-url]: https://webpack.js.org/
[express-url]: https://expressjs.com/
