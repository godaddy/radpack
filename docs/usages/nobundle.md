---
layout: default
title:  "Applications without bundler"
tags: [bundleless]
parent: "Use Cases"
nav_order: 3
permalink: /usages/no-bundle
redirect_from:
  - /no-bundle
---


# Applications without bundler
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

While Radpack's Webpack plugin makes life easier, applications without bundlers
can benefit equally from radpack as well.

After you've [exported shared dependencies]({{site.baseurl}}/exports), you can
then consume those dependencies with the radpack loader.

#### Example
{: .no_toc }

{% highlight javascript %}
import radpack from 'radpack';

radpack.register(radpackUrl);

(async () => {
  const [export1, export2] = await radpack(['export1', 'export2']);

  console.log(`Hello ${export1} & ${export2}`);
})();
{% endhighlight %}


## Future improvements

Eventually we hope to further improve the above use case by adding new plugin
support, likely in babel, to permit mapping static and dynamic imports back
to radpack for consistency with existing rollup and webpack plugins.

In the future the above example could potentially look more like:

#### Example
{: .no_toc }

{% highlight javascript %}
import export1 from 'export1';
import export2 from 'export2';

console.log(`Hello ${export1} & ${export2}`);
{% endhighlight %}


## Next

See how [testing with radpack]({{site.baseurl}}/usages/testing) works.
