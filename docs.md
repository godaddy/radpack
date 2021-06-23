# radpack docs

This document is intended for those authoring documentation. If you're looking
for documentation, you can view the latest at https://github.com/pages/godaddy/radpack/


## How do docs work?

Documentation is built via [Jekyll](https://jekyllrb.com/docs/installation/), and
hosted via [Github Pages](https://pages.github.com/).


## Local development

Following the [standard instructions](https://help.github.com/en/enterprise/2.19/user/github/working-with-github-pages/creating-a-github-pages-site-with-jekyll)
provided by GitHub Pages.

After you've satisfied the [Prerequisites](https://help.github.com/en/enterprise/2.19/user/github/working-with-github-pages/creating-a-github-pages-site-with-jekyll#prerequisites),
you can run your local instance via:

```sh
npm run docs
```

And begin viewing at `http://localhost:4000/`.

If you experience issues, check out [Jekyll on Github Pages](https://jekyllrb.com/docs/github-pages/).


## Folder structure

Structure of `docs/` is standard [Jekyll](https://jekyllrb.com/docs/installation/):

* `_layouts` - `default` and custom layouts go here.
* `_site` - Do not alter this folder directly, Jenkyll will generate this for you.
* `images` - Custom images can go here.
* `{NAME}.md` - Whatever markdown files you create will be available at `/{NAME}`.
* `_config.yml` - Jekyll config file. Default properties, theme, etc can be provided here.
* `_posts` - A collection of documents that will be visible in the navigation bar.


## Theme

The current theme is [Architect](https://github.com/pages-themes/architect), and is
[one of many](https://pages.github.com/themes/) available.
