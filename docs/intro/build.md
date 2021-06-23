---
layout: default
title:  "Build application"
categories: [Introduction]
tags: [build]
parent: "Introduction"
nav_order: 3
permalink: /intro/build
redirect_from:
  - /build
---



# Build application to consume radpack exports
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

There are 2 steps necessary to take advantage of **radpack**:

1. [Export shared dependencies]({{site.baseurl}}/intro/exports)
2. [Build application to consume radpack exports]({{site.baseurl}}/intro/build)


## Hello World

A hello-world app referencing our dependencies that have been exported to radpack.

**No code change required!**

#### Example
{: .no_toc }

{% highlight javascript %}
// hello-world.js
import export1 from 'export1';
import export2 from 'export2';

console.log(`Hello ${export1} and ${export2}!`);
{% endhighlight %}


## Webpack

Now that you've [exported your shared dependencies]({{site.baseurl}}/exports),
you'll need to update your Webpack configuration. Now when your application is
built, any dependencies/exports that exist within `radpack` will no longer be bundled
with your application. If at any time more than one application consumes a given
export, you've effectively deduplicated and may not even be aware when it happens.

#### Example
{: .no_toc }

{% highlight javascript %}
const RadpackPlugin = require('@radpack/webpack-plugin');

module.exports = {
  entry: { entry1: './hello-world.js' },
  plugins: [
    RadpackPlugin({
      register: 'http://{MYCDN}/radpack/radpack.json'
    })
  ]
};
{% endhighlight %}




## That's it

While there's much more we can do with Radpack, you've now completed the basics
of your first application powered by radpack exports.



## Next

See how the [dependency graph]({{site.baseurl}}/internals/graph) works.
