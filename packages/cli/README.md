# @radpack/cli
Various CLI helper utilities and services to use for more advanced radpack use cases.

[Documentation](https://godaddy.github.io/radpack)


## Installation
```sh
npm install --save-dev @radpack/cli
```


## Usage
```sh
radpack --help
```


### register
Resolve a radpack registry file/url.
```sh
radpack register <file|url>
```
| Option | Description | Default |
| --- | --- | --- |
| `--cwd` | Working directory | `process.cwd()` |
| `--optional` | Fail silently | `false` |
| `-o` `--out` | Output file | `false` |
| `--help` | Show help | `false` |
| `--version` | Show version number | `false` |


### merge
Merge multiple radpack registry files.
```sh
radpack merge ...<file|glob>
```
| Option | Description | Default |
| --- | --- | --- |
| `--cwd` | Working directory | `process.cwd()` |
| `-f` `--file` | Registry file name | `radpack.json` |
| `-o` `--out` | Output file | `false` |
| `--help` | Show help | `false` |
| `--version` | Show version number | `false` |


### local
Run a local server and proxy to serve locally installed/linked radpack packages.
```sh
radpack local <cwd>
```
| Option | Description | Default |
| --- | --- | --- |
| `--port` | Port to listen | `3723` |
| `--host` | Host to listen | `locahost` |
| `--statics` | Static directory | `process.cwd()` |
| `--dist` | Folder for registry files | `/dist` |
| `--route` | Proxy route  | `/radpack` |
| `--staticsRoute` | Static route | `/statics` |
| `--run` | Run after server listening | `false` |
| `--open` | Open after `--run` | `false` |
| `--help` | Show help | `false` |
| `--version` | Show version number | `false` |

