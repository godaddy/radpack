---
layout: default
title:  "Dependency Graph"
tags: [graph]
parent: "The Internals"
permalink: /internals/graph
nav_order: 1
redirect_from:
  - /graph
---


# Dependency Graph
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

Anytime you run a radpack build, be it for your [application]({{site.baseurl}}/build)
or [shared dependencies]({{site.baseurl}}/exports), the most critical output is the
`radpack.json` file that describes the dependency graph. This in turn allows the Radpack run-time loader to understand when a resource is imported, to download all child resources (and their children, and so on), **all in parallel**. Unlike conventional loaders that have little to no up-front configuration and result in complex and poor performing waterfall sequences, Radpack instead takes advantage of the dependency graph determined at build-time.

This in turn provides the benefits of both on-demand loading of loaders, and of
anti-waterfall mechanics offered by bundlers.

## Crude Example

#### Example
{: .no_toc }

{% highlight javascript %}
// shared1.js
import shared2 from './shared2';

export default async () => 'shared1' + shared2();
{% endhighlight %}

{% highlight javascript %}
// shared2.js
export default () => 'shared2';
{% endhighlight %}

By importing `shared1`, be it statically or dynamically, both `shared1` and `shared2` will
be downloaded **in parallel**. No further optimizations needed on your part. Of course
since you're [exporting shared dependencies with rollup]({{site.baseurl}}/exports), you're
also gaining the benefits of creating logical shared chunks beyond the entry files. This
helps combat unnecessarily small chunks all while balancing chunk (files) of shared logic
across exports to accelerate load times and improve caching.


## Radpack.json

#### Example
{: .no_toc }

{% highlight json %}
{
  "exports": {
    "radpackProject": {
      "v": [
        [1,0,1]
      ],
      "d": [
        [
          "export1",
          [{
              "v": [0],
              "f": "export1-82cb69d7.js"
            }]
        ]
      ]
    }
  }
}
{% endhighlight %}

Needless to say the `radpack.json` registry is intended to optimize the run-time (network
and compute), so don't let the above scare you.

Here is a simplified view using a more human-friendly format (for illustration only):

#### Example
{: .no_toc }

{% highlight json %}
{
  "exports": {
    "radpackProject": {
      "entries": {
        "export1": [{
          "version": "1.0.1",
          "file": "export1-82cb69d7.js"
        }]
      }
    }
  }
}
{% endhighlight %}

Luckily for you, the radpack registry isn't something intended for human review.


## Next

Learn how [versioning]({{site.baseurl}}/internals/version) works.
