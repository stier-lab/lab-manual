# Ocean Recoveries Lab Manual

Lab manual for the Stier Lab (Ocean Recoveries Lab) in the Department of Ecology, Evolution, and Marine Biology at UC Santa Barbara.

**Read the manual:** [stier-lab.github.io/lab-manual](https://stier-lab.github.io/lab-manual/)

## What's in here

The manual covers everything a new or current lab member needs: onboarding, safety, communication norms, graduate program guidance, funding, mentoring, authorship, data management, fieldwork in Mo'orea, and more. It is written in first person by Adrian Stier and is intended as a living document that evolves with the lab.

## Structure

```
sections/           30 markdown files, one per topic
onboarding-checklist.md
working-agreement.md
config.json         Section metadata (IDs, titles, nav groups)
template.html       HTML shell with CSS, JS, sidebar, placeholders
build.js            Build script: markdown → HTML
```

The source of truth is the markdown in `sections/`. Everything else is generated.

## Editing content

1. Edit any markdown file in `sections/` (or `onboarding-checklist.md` / `working-agreement.md`).
2. Run `npm run build`.
3. Open `Stier_Lab_Manual.html` in a browser to check your changes.
4. Commit and push. GitHub Pages serves `index.html` automatically.

## Adding a new section

1. Create a new markdown file in `sections/` (e.g., `31-new-topic.md`). Start with an `# H1` heading.
2. Add an entry to `config.json` in the appropriate nav group:
   ```json
   { "file": "31-new-topic.md", "id": "new-topic", "title": "New Topic", "num": "31" }
   ```
3. Run `npm run build`.

## Changing the design

Edit `template.html` (CSS, JavaScript, layout). The build script replaces three placeholders:

- `{{NAV_ITEMS}}` — sidebar navigation links
- `{{SECTIONS}}` — section HTML content
- `{{DATE}}` — current date string

## Setup

Requires Node.js.

```sh
npm install
npm run build
```

## Build output

- `Stier_Lab_Manual.html` — standalone HTML file (can be opened directly)
- `index.html` — identical copy for GitHub Pages
- `Stier_Lab_Manual_YYYY-MM-DD.md` — combined markdown snapshot

## License

This manual is specific to the Stier Lab at UCSB. You are welcome to use it as a template for your own lab manual with attribution.
