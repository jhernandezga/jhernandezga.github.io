# Adding and maintaining content / Añadir y mantener contenido

## Quick start

1. Choose a template from `templates/` (project, publication, article, or note; English or Spanish).
2. Create a file in the matching folder below and paste the template.
3. Fill in the title, description, date, tags, and body. Replace `your-slug` in the permalink with a short unique address such as `sparse-ct`.
4. Change `published: false` to `published: true` when the entry is ready.
5. Commit and push. The relevant collection and latest additions update automatically.

| Content | Folder | Example filename |
| --- | --- | --- |
| Project / Proyecto | `_projects` | `sparse-ct-en.md` |
| Publication / Publicación | `_publications` | `paper-title-en.md` |
| Article / Artículo | `_writing` | `article-title-es.md` |
| Note / Nota | `_notes` | `inverse-problems-en.md` |

Use GitHub's **Add file → Create new file** and enter the complete path, such as `_notes/my-idea-en.md`. You can edit existing files through the pencil button. You do not need to edit HTML, navigation, or a collection index to add an item.

## Inicio rápido en español

1. Copia la plantilla en español de `templates/` en la carpeta correspondiente de la tabla.
2. Rellena el título, resumen, fecha, temas y texto. Cambia `your-slug` por una dirección corta y única, sin espacios ni acentos.
3. Mantén `lang: es`. Cuando esté listo, cambia a `published: true`.
4. Guarda, haz commit y push. La entrada aparecerá automáticamente en su colección y en las últimas incorporaciones.

## Metadata: the block between the opening `---` lines

```yaml
title: "A clear, descriptive title"
description: "A one-sentence summary for the collection card."
lang: en
date: 2026-09-26
permalink: /notes/my-idea/
tags: [Imaging, Inverse problems]
published: true
```

- Keep quotes around titles and summaries; escape an internal quote as `\"`.
- Use dates as `YYYY-MM-DD`. For publications, use the publication date.
- Use a list for tags, even with one topic: `[Imaging]`. Reuse topic names consistently; they automatically become filter choices.
- Give every entry a unique permalink. Avoid changing it after sharing the page.
- `published: false` excludes an entry from the built website. It does **not** make files private in a public GitHub repository. Keep private drafts outside this repository.

## Optional local shortcut

Run from the repository folder in PowerShell:

```powershell
./scripts/New-Entry.ps1 -Type note -Language es -Slug problemas-inversos -Title "Problemas inversos"
```

Choose `project`, `publication`, `article`, or `note`. The command copies the appropriate template, fills in the title and current date, and creates a draft. It never replaces an existing file. If local policy blocks scripts, use the GitHub editing method above.

## Two languages

Maintain separate English and Spanish entries so you control each translation. The site lists only entries matching the current language. Add a `translation` address to each entry to connect the language switch directly:

English:
```yaml
lang: en
permalink: /notes/inverse-problems/
translation: /es/notas/problemas-inversos/
```

Spanish:
```yaml
lang: es
permalink: /es/notas/problemas-inversos/
translation: /notes/inverse-problems/
```

Create both pages before adding the reciprocal links. If no translation is available, the switch is explicitly labeled as a link to the other language's homepage. An article can exist in just one language.

## Garden notes

Use `status: seed`, `status: growing`, or `status: evergreen` in both languages; the interface translates the stage names. Add `updated: YYYY-MM-DD` when a note changes substantially. Link to another note in the text:

```markdown
[A related idea]({{ '/notes/my-idea/' | relative_url }})
```

You can also add an optional related-notes list in the opening metadata:

```yaml
related:
  - title: "A related idea"
    url: /notes/my-idea/
```

These are manual connections. There are no automatic backlinks or graph views.

## Projects, papers, and Medium

- Projects may use `repository: "https://github.com/your-account/your-project"` to display a repository button.
- Papers can use `external_url: "https://doi.org/your-doi"` for a link to the original, with a citation and summary in the body.
- For Medium, use `external_url: "your-full-article-url"` and write a brief summary in the body. The original article remains on Medium; nothing imports automatically.
- Remove unused optional fields or leave the template's quoted empty string. Only fill in links you actually have.

## Profile and CV

Edit `_data/profile.yml` to change the name, the introduction and interests in each language, or the GitHub and Medium profile links. Leave `medium: ""` until you have a URL to show.

Upload your CV PDFs to `assets/files/`. Set `cv` under each language to `/assets/files/cv-en.pdf` or `/assets/files/cv-es.pdf`. Both can point to the same file if desired. The download button appears only when a path is configured; upload the file first.

## Formatting

Use `## Heading` and `### Subheading`; the page already has its main title. Two or more second-level headings generate an automatic table of contents. Other useful Markdown:

```markdown
**Bold text** and *emphasis*

- A list item
- Another item

[Descriptive link](https://example.com)

![Meaningful image description]({{ '/assets/images/my-image.png' | relative_url }})
```

Keep paragraphs short, introduce the question or problem first, and distinguish your own contribution from background work.
