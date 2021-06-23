# Library Examples
These examples are used in other [app][apps] and [client][clients] examples. Libraries are built using [rollup][rollup-url] and [radpack], and require little configuration to get started. If you make any changes in an example after following the [getting started] steps, simply go into the example directory and run `npm run build` or `npm run watch` if available.

| name | description |
| --- | --- |
| [basic] | The primary library used in example [apps] and [clients]. |
| [context] | An example library using context to serve multiple files via a single entry. |
| [logger] | A basic library used by [basic] and [context] to help log info by consuming [apps] and [clients]. |


[basic]: ./basic/
[context]: ./context/
[logger]: ./logger/
[apps]: ../apps/
[clients]: ../clients/
[getting started]: ../#getting-started
[radpack]: ../../
[rollup-url]: https://rollupjs.org/
