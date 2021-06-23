---
layout: default
title:  "Export dependencies"
tags: [exports]
parent: "Introduction"
nav_order: 2
permalink: /intro/exports
redirect_from:
  - /exports
---


# Export shared dependencies
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

There are 2 steps necessary to take advantage of **radpack**:

1. [Export shared dependencies]({{site.baseurl}}/intro/exports)
2. [Build application to consume radpack exports]({{site.baseurl}}/intro/build)


## Our exports

We can export anything, but for the sake of this example we'll keep it simple.

#### Example
{: .no_toc }

{% highlight javascript %}
// export1.js
export default () => 'export1';
{% endhighlight %}

{% highlight javascript %}
// export2.js
export default () => 'export2';
{% endhighlight %}



## Export shared dependencies

Building your application with radpack will
not benefit you until you've exported something.

#### Example
{: .no_toc }

{% highlight javascript %}
// RadpackExports / rollup.config.js
import radpack from '@radpack/rollup-plugin';

export default {
  …, // your rollup config
  input: { export1: ‘./export1.js’, export2: ‘./export2.js’ },
  plugins: [radpack({ /*register: radpackUrl*/ })]
}
{% endhighlight %}

In the above contrived rollup example, we're exporting
two entries, and rollup will take care of the rest. If you've
not yet deployed anything, you have no need to register.


## Deploy exported dependencies

Once you're ready to deploy your exported dependencies, you can copy the `dist` folder
to wherever you host your assets. In this folder you'll see `radpack.json` and the
bundled asset files in `export1` and `export2` folders. You can copy as-is, and
overwrite any existing files. `radpack.json` file is the only mutable file in `dist`,
so if you're leveraging a CDN you may want to optimize accordingly. All `*.js` files
are immutable as their content hash will reside in their filename, and as a result
can be cached for any length you desire.



## Next

Let's take a look at how [building an application]({{site.baseurl}}/intro/build) works.
