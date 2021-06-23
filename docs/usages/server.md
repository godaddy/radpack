---
layout: default
title:  "Server dependency sharing"
tags: [ssr, server]
parent: "Use Cases"
nav_order: 2
permalink: /usages/server
redirect_from:
  - /server
---


# Server-side dependency sharing
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

Depending on your usage, server-side dependency sharing could be simple or more
involved. Here we'll focus on what is believed to be the most common two usages.


## Route or Middleware based dependencies

The idea here is to dynamically load each HTTP route handler dynamically from external bundles. Since we're not
bundling the entire application, only the routes themselves will become radpack'ified
and [gain the many benefits of shared dependencies]({{site.baseurl}}/compare).

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

### Why middleware?

Not required, but by leveraging radpack's middleware utility you gain the benefit of the
[local proxy]({{site.baseurl}}/testing) as well as ability to provide a `?radpack=URL`
querystring override which is super useful when doing soft deploys that you wish to test.


## Example

Also be sure to check out `examples/apps/rollup` for a working example.


## Applications without bundler

If you have no desire to use a bundler with your server code, "vanilla" radpack is
certainly an option. Which brings us to our next topic,
[applications without a bundler]({{site.baseurl}}/no-bundle).


## Next

See how [applications without a bundler]({{site.baseurl}}/usages/no-bundle) work.
