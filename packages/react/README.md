# @radpack/react
React based tooling for hydrating and loading radpack assets.

[Documentation](https://godaddy.github.io/radpack)
![Logo](../../docs/static/radpack-logo.svg)


## Installation
```sh
npm install @radpack/react
```


## Usage
You can import the Provider/Consumer directly if using your own build process:
```js
import { Provider, Consumer } from '@radpack/react';
```

Otherwise, import a minified browser bundled script after loading [@radpack/client] that sets a global `radpack.
react.Provider` and `radpack.react.Consumer` variable:
```html
<!-- Relative -->
<script src="./node_modules/@radpack/react/lib/browser.js"></script>
<!-- UNPKG -->
<script src="https://unpkg.com/@radpack/react"></script>
```

[@radpack/client]: ../client/
