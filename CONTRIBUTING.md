# Contributing to the Lab Manual

This manual is a living document. If something is out of date, unclear, or missing, please help fix it.

## How to suggest changes

**If you're comfortable with Git:** Edit the relevant markdown file in `sections/`, run `npm run build`, and open a pull request.

**If you're not:** Open an issue on GitHub describing what should change, or message Adrian or Molly on Slack.

## Style guidelines

- Write in plain, direct language. Avoid jargon where possible.
- The manual is written in first person (Adrian's voice). Maintain that voice when editing existing sections.
- Use markdown formatting: `**bold**` for emphasis, `[link text](url)` for links, `-` for bullet lists.
- Keep sections focused. If a topic is getting long, consider splitting it.
- When referencing UCSB policies or external resources, include a link.
- Phone numbers use the format `(805) 893-XXXX`.
- Use "postdoc" (not "post-doc"), "fieldwork" (not "field work"), and "well-being" (not "wellbeing").

## Building locally

```sh
npm install    # first time only
npm run build  # after any edit
```

Then open `Stier_Lab_Manual.html` in a browser to preview.
