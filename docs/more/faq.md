---
layout: default
title:  "FAQ"
parent: "More"
nav_order: 1
permalink: /more/faq
redirect_from:
  - /more
  - /faq
---


# Frequently Asked Questions
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---


## Why is a greater number of smaller files desired?

* Embracing HTTP/2+ but still encouraging 4KB+ chunks to take full advantage of compression
* Greatly improving cacheability, including efficiencies across application deployments
* Allowing more code sharing without requiring applications to know or care about other consuming applications


## Why do I need a "radpack.json" registry?

In order to enable downloading assets in parallel, we need to know the entire [dependency graph]({{site.baseurl}}/internals/graph) up front. Without this, we would only know about sub-dependencies once parent dependencies have been loaded, giving us the unwanted waterfall loading pattern that often plagues applications.


## Why use AMD (Asynchronous Module Definition)?

Radpack doesn't have a strict requirement on AMD, but AMD was a great fit (and well
understood) solution to resolve how to break load, eval, and execution steps into
separate stages. This in effect allows us to download and evaluate all nested
dependencies in parallel out-of-order which optimizes network and CPU utilization.

Because radpack controls both the build-time (via plugins) and run-time, it's feasible
to utilize other formats in the future.
