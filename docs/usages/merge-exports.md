---
layout: default
title:  "Merging exports"
tags: [merge, exports]
parent: "Use Cases"
nav_order: 1
permalink: /usages/merge-exports
redirect_from:
  - /usages
  - /merge-exports

---


# Merging exports across multiple projects
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

You're not required to export all dependencies from a single project, though that
is the simplest option. If you have no need for merging multiple radpack projects
into a single `radpack.json`, you can skip this lesson.


## Why merge multiple projects under a single radpack registry?

This is largely an organizational preference, and this article exists for those
that prefer to organize dependencies across many projects.


## Registry structure

As explained in [dependency graph]({{site.baseurl}}/graph), the most important bits
of the `radpack.json` registry is simply the top level `{ "exports": { } }`. Contained
within the `exports` object is the name of each export, which is generally the
same as the project name (`package.json -> name`).

#### Example
{: .no_toc }

{% highlight json %}
{
  "exports": {
    "radpackRepo1": { },
    "radpackRepo2": { }
  }
}
{% endhighlight %}


## Merging updated registry with current live registry

This is likely the most common pattern for merging registries, which is to
take the "live" registry (used in production, containing the latest exports
of each radpack project), and to replace (not merge) the desired export key
with the contents of the newly updated project.

Luckily radpack has a handy CLI to handle simple tasks like these:

#### Example
{: .no_toc }

{% highlight bash %}
radpack merge 'https://YOURCDN/radpack/radpack.json' ./dist/radpack.json --out ./radpack.json
{% endhighlight %}

In the above example, you're loading the "live" registry (URL or file path), then merging
the local changes from `./dist/radpack.json` and producing the final `./radpack.json` that
you intend to eventually deploy as the new live registry.

`radpack merge [files..] --out outputName`

The `merge` command permits any number of files (and/or URL's), and order matters. The
shallow merge is performed from left to right.


## Merging multiple radpack registries

Depending on your needs, another possible pattern is to merge all project registries at deployment time, ignoring the current "live" registry.

This pattern feels similar to the previous example but with any number of inputs.

#### Example
{: .no_toc }

{% highlight bash %}
radpack merge ./export1/dist/radpack.json ./export2/dist/radpack.json \
  ./export3/dist/radpack.json --out ./radpack.json
{% endhighlight %}


## Next

See how the [server dependencies]({{site.baseurl}}/usages/server) works.
