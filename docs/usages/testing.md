---
layout: default
title:  "Testing with Radpack"
tags: [testing, proxy, local, middleware]
parent: "Use Cases"
nav_order: 4
permalink: /usages/testing
redirect_from:
  - /testing
---


# Testing with Radpack
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

There are two main features provided with radpack out of the box to aid with testing
of shared dependencies: one for local development and one for soft deployments.


## Local Proxy

If you want to test a radpack export in your local application before
deploying changes to the export, this is easily achieved by leveraging the `radpack local`
CLI. This command effectively detects for changes in `node_modules` (for radpack exports only),
and serves a dynamic `radpack.json` registry via a URL set in `process.env.RADPACK_LOCAL`.

The `radpack local` command has quite a few options (see `radpack local --help`), but most of the defaults should suffice.

{% highlight bash %}
radpack local [cwd]

local proxy mode

Positionals:
  cwd  Root directory to detect locally linked radpack dependencies in
                                    [string] [default: process.cwd()]

Options:
  --version       Show version number                                  [boolean]
  --help          Show help                                            [boolean]
  --port          Port to listen on                     [number] [default: 3723]
  --host          Host to listen on              [string] [default: "localhost"]
  --tts           Time to stale if you wish for auto-refresh
                                                           [number] [default: 0]
  --warm          Preload linked directories           [boolean] [default: true]
  --route         Root path to make available     [string] [default: "/radpack"]
  --dist          Folder of distribution files        [string] [default: "dist"]
  --statics       Folder of static assets to serve      [string] [default: "./"]
  --staticsRoute  Route of static assets          [string] [default: "/statics"]
  --run           Run zero or more custom child commands   [array] [default: []]
  --open          Open zero or more browser URL's          [array] [default: []]
{% endhighlight %}

By using the `radpack local` service for loading bundles from the browser or Node, you can serve a `radpack.json`
that reflects your locally linked radpack dependencies.

Also be sure to check out `examples/clients/basic` for a working example.



## Node Middleware

As demonstrated in the [server usage document]({{site.baseurl}}/server), middleware may be
leveraged to provide per-route testing of a `radpack.json` registry that is not
yet live. This is also referred to as a soft deployment.

#### Example
{: .no_toc }

{% highlight javascript %}
import middleware from '@radpack/server/middleware';

radpack.register(process.env.RADPACK_URL);

const getRadpack = middleware(radpack);

app.get('/', [getRadpack], async (req, res) => {
  // Important: Use radpack provided by middleware to support overrides
  const { default: handler } = await res.locals.radpack('radpack-rollup-server-example/home');
  return handler(req, res);
});
{% endhighlight %}

The role of the middleware is to detect a `?radpack=URL` querystring and load
the desired registry by setting `res.locals.radpack` to a unique instance to avoid
conflict with the shared global instance.



## Client Middleware

Just kidding! This middleware is not yet available. But the querystring behavior
provided by the **Node Middleware** would be easy enough to emulate on the client
if desired.


## Next

Check out [frequently asked questions]({{site.baseurl}}/more/faq).
