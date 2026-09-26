# Jorge Hernández Galeano — personal website

A bilingual personal site for projects, publications, articles, and a knowledge garden. English lives at `/`; Spanish lives at `/es/`.

**Website:** https://jhernandezga.github.io

**Start here:** [Content guide / Guía de contenido](CONTENT_GUIDE.md)

## Everyday editing

| What you want to change | Where to edit |
| --- | --- |
| Name, introduction, interests, profile links, CV links | `_data/profile.yml` |
| About page in English or Spanish | `about.md` or `es/sobre-mi.md` |
| A project | One Markdown file in `_projects/` |
| A paper or publication | One Markdown file in `_publications/` |
| An essay or Medium article | One Markdown file in `_writing/` |
| A garden note | One Markdown file in `_notes/` |
| Navigation labels and grouping | `_data/navigation.json` |
| Interface translations | `_data/labels.json` |

Adding an entry automatically updates its collection and the homepage's latest additions. Titles, summaries, dates, topics, and note stages come from the entry's metadata. No page layout needs to be copied or edited.

## Navigation

- **Explore:** Home and Projects.
- **Library:** Publications, Writing, and Knowledge garden.
- **Profile:** About & CV.

The sidebar stays visible on desktop; the Menu button opens it on smaller screens. Entries have a link back to their collection. Longer entries have an automatic table of contents. Populated collections have text search and topic filters. Without JavaScript, navigation and every published entry remain accessible.

## Publishing

Keep GitHub Pages configured to **Deploy from a branch → main → /(root)**. GitHub builds the Jekyll site whenever a commit is pushed to `main`. All source folders, including `_layouts`, `_includes`, `_data`, `assets`, and `es`, must be committed.

The website uses Jekyll's built-in collections and Liquid layouts with no custom plugins or external font requests. Existing section addresses are preserved.

## Local development (optional)

With Ruby and Bundler available:

```sh
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000. Use `bundle exec jekyll build` for a production build. The Gemfile matches the Jekyll 3.10 version supported by GitHub Pages' branch publishing. Build output, development dependencies, content templates, scripts, and this guide are excluded from the public site.

## Design and content files

- `_layouts/`: shared home, collection, entry, and profile layouts.
- `_includes/`: shared icons and content cards.
- `assets/css/site.css`: responsive appearance.
- `assets/js/site.js`: mobile menu, collection search, topic filter, and table of contents.
- `templates/`: English and Spanish starter content, unpublished by default.
- `scripts/New-Entry.ps1`: optional shortcut for creating a new entry.

The public introduction follows the existing profile copy. No projects, publications, qualifications, or results have been invented.
