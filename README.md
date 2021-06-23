# radpack
Rapid Application Development Packaging


## What is it?

> Infusing the greatest benefits of modern bundlers (Webpack, Rollup) and loaders (SystemJS, RequireJS)
> into an all-inclusive build and run-time solution optimized for the end-user experience.

Bundlers like Webpack do a great job at providing a toolset needed to
deliver an optimal out-of-the-box delivery solution for your end-users.
Most loaders on the other hand, are focused on delivering only the requested
assets, as they are needed. Radpack fuses the best of both worlds
by taking advantage of build-time bundling, with graph-based run-time loading.

| Feature | radpack | bundlers | loaders |
| --- | --- | --- | --- |
| Zero Config Runtime | [:x:](# "radpack requires configuration that describes exports graph") | :white_check_mark: | :white_check_mark: |
| Parallel Parent/Child Downloads | :white_check_mark: | [:white_check_mark:](# "Everything is bundled in parent") | :x: |
| Parallel Download of Deeply Nested Resources | :white_check_mark: | [:white_check_mark:](# "Everything is bundled in parent") | :x: |
| Download only what's needed, when it's needed | :white_check_mark: | [:question:](# "Partial") | :white_check_mark: |
| -> High Cache Rates | :white_check_mark: | :x: | :white_check_mark: |
| Background Downloads of Optional Resources | :white_check_mark: | :x: | :x: |
| Modern browser bundles | :white_check_mark: | :x: | :x: |
| Resource sharing across applications | :white_check_mark: | :x: | [:question:](# "Possible but difficult") |
| Multi-App Auto Dedupe | :white_check_mark: | :x: | :white_check_mark: |
| Server-side Support | :white_check_mark: | :x: | [:question:](# "Minimal") |
| Legacy IE11+ Support | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| Support Webpack Chunks | :white_check_mark: | :white_check_mark: | :x: |
| Babel Support | :white_check_mark: | n/a | [:question:](# "Not first class") |
| Webpack Support | :white_check_mark: | n/a | [:question:](# "Not first class") |
| Rollup Support | :white_check_mark: | n/a | [:question:](# "Not first class") |


## Documentation

Live Docs: https://github.com/pages/godaddy/radpack/

[Authoring documentation](./docs.md)


## Packages
| Name | Description |
| --- | --- |
| [@radpack/core](./packages/core/) | Core common functionality |
| [@radpack/cli](./packages/cli/) | Various CLI helpers and services |
| [@radpack/client](./packages/client/) | Client (browser) runtime |
| [@radpack/server](./packages/server/) | Server (node) runtime |
| [@radpack/build](./packages/build/) | Core build functionality |
| [@radpack/rollup-plugin](./packages/rollup-plugin/) | Rollup build plugin |
| [@radpack/webpack-plugin](./packages/webpack-plugin/) | Webpack build plugin |


## Examples
[Several application, client, and library examples](./examples/)


## Publishing
Each package independently manages its semver and is updated using [lerna](https://github.com/lerna/lerna). Run `npx lerna publish` to [publish](https://github.com/lerna/lerna/tree/main/commands/publish) all modified packages, or run `npx lerna version <semver type>` in each package you want to individually [version bump](https://github.com/lerna/lerna/tree/main/commands/version) and then at the root run `npx lerna publish from-package`.
