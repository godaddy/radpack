---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: default
title: Introduction
has_children: true
nav_order: 1
description: "Radpack fuses the best of both worlds by taking advantage of build-time bundling, with graph-based run-time loading to prevent wasteful waterfalls"
tags: [intro]
permalink: /intro/
redirect_from:
  - /
---

# Introduction

![Radpack]({{site.baseurl}}/static/radpack.jpg)


Bundlers like Webpack do a great job at providing a toolset needed to
deliver an optimal out-of-the-box delivery solution for your end-users.
Most loaders on the other hand, are focused on delivering only the requested
assets, as they are needed, and have a much higher cacheability. Radpack
fuses the [best of both worlds]({{site.baseurl}}/intro/compare) by taking advantage of
[build-time bundling]({{site.baseurl}}/intro/build), with
[graph-based]({{site.baseurl}}/internals/graph) run-time loading to prevent
wasteful waterfalls.


## Enterprise focus

While Radpack has the potential to serve a wide area of use cases, it's
focus is on serving the neglected Enterprise space.

#### Description
{: .no_toc }
```text
Enterprise build plugin for end-user-optimized isomorphic just-in-time dependency loader.
```

Let's break that down:

* Enterprise
  * Multi-application dependency sharing
  * Unopinionated packaging requirements (webpack, “applets”, rollup, etc)
  * Deployments out-of-band of applications (optional)
  * Versioning
* Build plugin
  * Optimize run-time, including dependency graphing, at build time
  * Support for webpack and rollup -- more in the future
* End-user optimized
  * End-user experience is optimized over developer experience
* Isomorphic
  * Seamless dependency sharing between client and server
* Just in time dependency loader
  * Load only what’s needed, when it’s needed

But let's take a step back for a moment, and start with the basics.


## Definitions

There are a few definitions that are useful to understand prior to
integrating Radpack.

* **Entry** - A pattern common amongst bundlers, entries are effectively
  named exports of the shared thing you're exporting. Ex: `myEntry: './some/path'`
* **Export** - In the context of Radpack, exports are simply the
  the things you're exporting to be consumed/shared by others.
* **Registry** - A collection of exports that may span many entries and even
  projects. The intention behind a registry is to provide a single source
  of truth (many exports) for applications to consume. The size and boundaries
  for a single registry should be determined by the needs of cross-application
  dependency usage.
* **Producer** - Whoever exports a registry is a producer.
* **Consumer** - Whoever bundles with a registry is a consumer.
* **Runtime** - Responsible for loading a registry and the requested assets
  on demand.



## Next

[Compare radpack with bundlers and loaders]({{site.baseurl}}/intro/compare).
