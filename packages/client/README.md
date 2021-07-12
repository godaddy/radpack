# @radpack/client
The client-side runtime package. This is automatically imported into applications built using [@radpack/webpack-plugin] and targeting the [web](webpack-target). For server-side usage, use [@radpack/server].

[Documentation](https://godaddy.github.io/radpack)


## Installation
```sh
npm install @radpack/client
```


## Usage
You can import the client directly if using your own build process:
```js
import radpack from '@radpack/client';
```

Otherwise, import a minified browser bundled script that sets a global `radpack` variable:
```html
<!-- Relative -->
<script src="./node_modules/@radpack/client/lib/browser.js"></script>
<!-- UNPKG -->
<script src="https://unpkg.com/@radpack/client"></script>
```


[@radpack/server]: ../server/
[@radpack/webpack-plugin]: ../webpack-plugin/
[webpack-target]: https://v4.webpack.js.org/configuration/target/
