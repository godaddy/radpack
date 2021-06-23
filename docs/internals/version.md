---
layout: default
title:  "Versioning"
tags: [version, semver]
parent: "The Internals"
nav_order: 2
permalink: /internals/version
redirect_from:
  - /version
---

# Versioning
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

Surely if Radpack supports [semantic versioning](https://semver.org/) the
`radpack.json` configuration will get far too large for the client? This
would be true if we supported tracking of every version.



## Semantic versioning lite

Radpack supports only a browser-optimized subset of semantic versioning. By
default, when a build is performed, only major versions of exports are
retained.

```sh
something@1.0.0 deployed
something@1.0.1 deployed, @1.0.0 is dropped
something@1.1.0 deployed, @1.0.1 is dropped
```

In some cases this is too strict, and you may opt to also retain minor versions (
enabled by supplying `keepMinor: true` to the rollup plugin). This is discouraged,
but may be neccessary in some cases.

```sh
something@1.0.0 deployed
something@1.0.1 deployed, @1.0.0 is dropped
something@1.1.0 deployed, nothing is dropped
```

In the last example, two versions of `something` will be found in `radpack.json`.


## Auto upgrades

As the above examples imply, minor and patch updates by default will automatically
be used at the time of deployment. This means if you're using shared dependencies
(ala `something-shared/radpack.json`) that you can deploy shared exports independently
of applications. This is a balance of velocity and stability, and while this pattern
may not be ideal for some dependencies, most can safely be done using this method.


## Version pinning

Automatic deployments of dependencies out of band of your application can seem
pretty scary. Thanks to *version pinning*, it's less scary. At the time you
build your application with Radpack, your dependencies are "pinned" to the
current major version, or if explicitly set as a `(dev|peer)?Dependency`
that version will be used instead. Whatever version you select,
only the nearest *available* version will be used at run-time.

Let's go over some example scenarios:

* You build your application with version `1.0.0` of a dependency, and it is
  later upgraded to version `2.0.0`. Until the next time you build and deploy
  your application, clients will continue to receive the intended version
  `1.0.0`.
* Your application has a `devDependency` that points to version `1.0.0`, but
  the only version that is retained is `1.0.1` (since we do not hold onto old patches),
  so instead of blowing up the run-time radpack will use the nearest available version,
  which is `1.0.1`. Additionally if a build is performed after `2.0.0` is released,
  the application will still point to `^1` as it was explicitly set as a dependency.
* You build your application with version `1.0.0` of a dependency, and you
  explicitly set `peerDependency` of `latest`. After deployment of version `2.0.0`,
  your next application build will start to receive `2.0.0`. Not recommended!
* You build your application with version `1.0.0` of a dependency, and you
  explicitly set `peerDependency` of `*`. Upon deployment of version `2.0.0`,
  out of band of your application, your clients will start to receive
  `2.0.0`. Not recommended!


## Static versioning

Despite precautions in place from build-time version pinning, auto-patch upgrades
may still be undesired. Radpack does not force this behavior.
If a given application needs to avoid dynamic versioning, it may instead register
a URL pointing to a copy of `radpack.json` performed at application build time. If
a URL is not desired, you may opt to simply embed the config in your code, like so:

#### Example
{: .no_toc }

{% highlight javascript %}
radpack.register({ /* contents of radpack.json */ });
{% endhighlight %}


## Versioning patterns

In addition to explicit versions (`1.0.0`) to coincide with version pinning,
there is also support for [caret ranges](https://docs.npmjs.com/misc/semver#caret-ranges-123-025-004)
(`^1.0`) and [tilde ranges](https://docs.npmjs.com/misc/semver#tilde-ranges-123-12-1)
(`~1.0`). Basic versioning control helps strike a balance between velocity and stability.


## Next

Learn how the run-time [loader]({{site.baseurl}}/internals/loader) works.
