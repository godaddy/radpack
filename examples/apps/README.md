# App Examples
These examples are [radpack] server-side implementations for consuming [libraries][libs]. They can be combined with [client][clients] examples, or use as-is to render HTML on the server. To run an example after following the [getting started] steps, simply go into the example directory and run `npm start`.

| name                    | description                                                                                 |
|-------------------------|---------------------------------------------------------------------------------------------|
| [basic]                 | A very simple example.                                                                      |
| [context]               | Similar to [basic], but using the power of context.                                         |
| [http]                  | An example API using [http][http-url].                                                      |
| [express]               | Similar to [http], but using [express][express-url].                                        |
| [rollup]                | A simple [rollup][rollup-url] example.                                                      |
| [webpack]               | A very simple [webpack][webpack-url] example with minimal configuration.                    |
| [webpack-hydrate]       | Similar to [webpack], but uses a [webpack client] for the front-end.                        |
| [webpack-hydrate-react] | Similar to [webpack], but uses a [webpack client] and [react][react-url] for the front-end. |


[basic]: ./basic/
[http]: ./http/
[express]: ./express/
[context]: ./context/
[rollup]: ./rollup/
[webpack]: ./webpack/
[webpack-hydrate]: ./webpack-hydrate/
[webpack-hydrate-react]: ./webpack-hydrate-react/
[libs]: ../libs/
[clients]: ../clients/
[getting started]: ../#getting-started
[webpack client]: ../clients/webpack/
[radpack]: ../../
[http-url]: https://nodejs.org/docs/latest-v12.x/api/http.html
[express-url]: https://expressjs.com/
[rollup-url]: https://rollupjs.org/
[webpack-url]: https://v4.webpack.js.org/
[react-url]: https://reactjs.org/
