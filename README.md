# Your personal website

A GitHub Pages starter for projects, publications, essays, a knowledge garden, and a CV. It uses GitHub's built-in Jekyll support, so you can maintain content from the GitHub website. No local installation is required to publish it.

This bilingual starter is personalized from your public GitHub profile (https://github.com/jhernandezga). It is not yet published. Your CV, Medium URL, project write-ups, and publications still need to be added. No invented projects or publications are included.

## First-time setup

1. Sign in to GitHub and create a new **public** repository named `jhernandezga.github.io`, using your exact username. A repository is the folder GitHub uses to store your website. Turn on **Add README** so the main branch exists. If this exact repository already exists, review it before uploading anything.
2. Extract the starter ZIP on your computer. Open the extracted folder: you should see `_config.yml`, `index.html`, and the other files.
3. In the repository, use **Add file → Upload files**. Drag all the extracted files and folders into the upload area, then commit the changes. Upload the contents, not the ZIP and not an enclosing folder. Confirm that `_layouts` and `_data` also uploaded.
4. Edit `_config.yml`: your name and website address are already filled in; leave `baseurl` empty. Keep quotation marks around text values.
5. Review the English introduction in `index.html` and `about.md`, and the Spanish versions in `es/index.html` and `es/sobre-mi.md`. The navigation is in `_data/navigation.yml`.
6. Open **Settings → Pages**. Under **Source**, choose **Deploy from a branch**. Select **main** and **/(root)**, then **Save**.
7. Wait for the Pages deployment to finish; first publication can take up to 10 minutes. Open `https://jhernandezga.github.io`. The repository's Actions tab shows deployment progress or errors.

Your site and files in this public repository will be public. Use the version of your CV you want to share publicly.

## How the site is organized

| Section | Index page | Content folder |
|---|---|---|
| Home | index.html | Edit the introduction here |
| Projects | projects.html | _projects |
| Publications | publications.html | _publications |
| Writing / Medium | writing.html | _writing |
| Knowledge garden | garden.html | _notes |
| About & CV | about.md | assets for your CV PDF |

## Add a project, publication, article, or note

1. Open the matching file in `templates/` and copy its contents.
2. Use **Add file → Create new file** in GitHub.
3. Name it `_projects/my-project.md`, `_publications/my-paper.md`, `_writing/my-article.md`, or `_notes/my-idea.md`.
4. Paste the template; replace the title, summary, date, and body. Keep the opening and closing `---` lines. Dates use YYYY-MM-DD. Use the publication date for papers and articles.
5. Commit the change. The appropriate section automatically lists the new entry, newest first.

The templates folder is excluded from the website. Keep unpublished private drafts outside the public repository.

For garden notes, use `status: seed`, `status: growing`, or `status: evergreen`. Update `updated` when revising a note; keep `date` as the original creation date. Link related notes using `[Related idea]({{ '/notes/my-idea.html' | relative_url }})` (use the actual published path).

## Add your CV

Upload your PDF as `assets/cv.pdf`. In `about.md`, replace the CV placeholder with:

```markdown
[Download my CV (PDF)]({{ '/assets/cv.pdf' | relative_url }})
```

## Add Medium articles

Create one entry per article in `_writing`. Give it a short description and a direct link to the Medium article. Full copies are optional. Nothing imports automatically.

## Markdown basics

Use `## Heading` for a section, `**bold**` for emphasis, `- item` for a list, and `[link label](https://example.com)` for a link. Leave blank lines between paragraphs. Most ongoing work only needs Markdown; the shared appearance lives in `assets/style.css` and `_layouts/default.html`.

## Official setup references

- https://docs.github.com/en/pages/quickstart
- https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll

## Validation status

The starter's file structure and local references were checked. A full Jekyll build and live deployment still need to be verified on GitHub; Ruby/Jekyll are not installed in the preparation environment.

## English and Spanish

English is at `/`; Spanish is at `/es/`. Every main page includes a language switch. Interface text and the introduction are translated; new articles are translated manually so you control the meaning.

Each content entry must include `lang: en` or `lang: es` in its opening metadata. The indexes show only entries in their language. To publish an item in both languages, create two files, for example `_notes/my-idea-en.md` and `_notes/mi-idea-es.md`. For stable addresses and a direct language switch, add explicit metadata:

English file:
```yaml
lang: en
permalink: /notes/my-idea/
translation: /es/notas/mi-idea/
```

Spanish file:
```yaml
lang: es
permalink: /es/notas/mi-idea/
translation: /notes/my-idea/
```

Without `translation`, the language switch goes to the other language's homepage. Translate note statuses too: `semilla`, `en crecimiento`, or `consolidada` in Spanish. The status text is free-form.

When adding a CV, update both About pages. You can use one PDF or separate English and Spanish versions. Change the overall description in `_config.yml`, or add `description:` to an individual page for a language-specific description.
