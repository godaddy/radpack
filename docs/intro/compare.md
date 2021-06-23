---
layout: default
title:  "Feature comparison"
nav_order: 1
parent: "Introduction"
tags: [compare, bundlers, loaders]
permalink: /intro/compare
redirect_from:
  - /compare
---

# Feature Comparison

A brief glimpse of the benefits Radpack affords us.

| Feature | radpack | bundlers | loaders |
| --- | --- | --- | --- |
| [Resource sharing across applications]({{site.baseurl}}/intro/exports) | :white_check_mark: | :x: | [:question:](# "Possible but difficult") |
| [Multi-App Auto Dedupe]({{site.baseurl}}/intro/build) | :white_check_mark: | :x: | :white_check_mark: |
| [Out of App deployments]({{site.baseurl}}/internals/version) | :white_check_mark: | :x: | :x: |
| [Server-side Support]({{site.baseurl}}/usages/server) | :white_check_mark: | :x: | [:question:](# "Minimal") |
| [Parallel Parent/Child Downloads]({{site.baseurl}}/internals/graph) | :white_check_mark: | [:white_check_mark:](# "Everything is bundled in parent") | :x: |
| [Parallel Download of Deeply Nested Resources]({{site.baseurl}}/internals/graph) | :white_check_mark: | n/a | :x: |
| [Download only what's needed, when it's needed]({{site.baseurl}}/internals/loader) | :white_check_mark: | sometimes | :white_check_mark: |
| -> [High Cache Rates]({{site.baseurl}}/more/faq) | :white_check_mark: | :x: | :white_check_mark: |


The above likely creates more questions than it answers, and will become more clear in the
next few pages.



## Next

Next up, let's take a look at [exporting shared dependencies]({{site.baseurl}}/intro/exports).
