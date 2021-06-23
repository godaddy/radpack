---
layout: default
title:  "Loader"
tags: [loader]
parent: "The Internals"
nav_order: 3
permalink: /internals/loader
redirect_from:
  - /loader
---

# Loader architecture
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

Here we see the two most commonly used run-time calls in Radpack.

#### Example
{: .no_toc }

{% highlight javascript %}
radpack.register('https://some-domain.com/my-app/radpack.json'); // non-blocking
const something = await radpack('something');
{% endhighlight %}



## Registering

The act of registering one or more configurations provides a domain-centric
mechanic for how you share your dependencies. Though you never
need to wait for the completition of a register, optionally you can do so:

#### Example
{: .no_toc }

{% highlight javascript %}
await radpack.register([url1, url2]);
{% endhighlight %}

As shown above, registers also allow for any number of radpack configurations. You can also provide objects instead of urls, or a combination of both.

#### Example
{: .no_toc }

{% highlight javascript %}
await radpack.register({
  url: 'https://some-domain.com/radpack.json',
  vars: {
    // automatically generated based on url, but can be overridden
    baseUrl: 'https://some-domain.com'
  }
});
{% endhighlight %}


## Loading

#### Example
{: .no_toc }

{% highlight javascript %}
const something = await radpack('something');
{% endhighlight %}

The `radpack` function behaves similar to dynamic imports in that it takes a
path and returns a promise. In fact, anytime you use dynamic imports
(ala `import('./something')`) the Radpack build system will rewrite this to
`radpack('./something')` (more or less). The primary distinction is that
Radpack knows everything about your application and shared dependencies
(thanks to `radpack.register`), and is able to intellegently resolve to the
correct file(s) without the need for full paths.



## The Internals

This pretty much sums up the loader pattern.

![NPM]({{site.baseurl}}/static/radpack.png)



## Next

Learn how to [merge exports across multiple projects]({{site.baseurl}}/usages/merge-exports).
