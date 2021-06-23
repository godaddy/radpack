# Radpack Examples
This is the root of the [radpack] examples created to help on-board developers on how to provide and consume [radpack libraries][libs].

| name | description |
| --- | --- |
| [apps] | Examples for accessing [libraries][libs] on the server. |
| [clients] | Examples for accessing [libraries][libs] on a browser. |
| [libs] | Various examples on how to export a [library][libs] used in [apps] and [clients]. |


## Getting Started
To run the examples locally you will need to clone the [radpack] repository locally and install the dependencies:
```sh
git clone git@github.com:godaddy/radpack.git
cd radpack
npm install
```

Build the packages and examples from the [radpack] root:
```sh
npm run build
```

Then start an [app][apps] or [client][clients] example:
```sh
cd ./examples/clients/basic
npm start
```


[apps]: ./apps/
[clients]: ./clients/
[libs]: ./libs/
[radpack]: ../
