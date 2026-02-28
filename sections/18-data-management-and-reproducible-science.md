# Data Management and Reproducible Science

## Why This Matters

Since I started as a graduate student, the field has moved toward reproducibility and open science. These are welcome changes. They make our science better and more trustworthy, even though they add work. I was fortunate to train with Craig Osenberg, who instilled in me the importance of transparency and rigor in how we handle data and report results. That ethos shapes how this lab operates.

Good data management protects your work, supports reproducibility, and keeps publicly funded data accessible to the scientific community. It also protects you. Years from now, you will be glad you documented what you did.

## Data Storage & Backup

- All research data should be backed up in at least two locations (e.g., UCSB Box + external hard drive, or NAS + UCSB Box). Note: Google Drive is limited to 150 GB per account, so use the lab NAS or UCSB Box (unlimited) for large datasets.
- Do not rely solely on a personal laptop. Hard drives fail.
- The lab NAS (stier-nas1) is backed up regularly. You can maintain a personal folder there for your project data.
- UCSB Box provides unlimited cloud storage as an added backup option.

## Data Formatting & Documentation

- Store data in CSV format as the primary archival format. Excel is fine for data entry, but CSV provides long-term readability.
- Use simple, flat structure: rows and columns, no embedded subtables or summary calculations within data files.
- Avoid special characters in column headers.
- Include a metadata file (README) with every dataset explaining variables, units, collection methods, and relevant context.
- Use clear, consistent naming conventions for files and variables. Include date stamps in filenames.

## Lab and Field Notebooks

Document your methods as you go, not after the fact. You will forget details faster than you think. By the time you sit down to write a paper, the specifics of how you set up an experiment, calibrated an instrument, or processed a sample will be fuzzy at best.

- **Keep a lab/field notebook.** The format is up to you: a physical notebook, a digital document, or a dedicated app. What matters is that you use it consistently and that it is backed up. Physical notebooks should be photographed or scanned regularly.
- **Record enough detail that someone else could reproduce your work.** Include dates, locations, equipment used, settings, deviations from protocol, and anything unexpected. If you modified a standard procedure, note what you changed and why.
- **For fieldwork (especially Mo'orea):** Record site coordinates, environmental conditions, water temperature, depth, tide state, weather, and anything that might affect your data. Take photos of your setup. These details are invaluable when interpreting results months later.
- **Videos of methods** can be extremely useful, especially for complex field or lab procedures. A short video of your sampling technique or experimental setup is worth pages of written description.
- Store your notebook entries alongside your project data on the lab NAS or Google Drive so they are accessible to the lab after you leave.

## Post-Fieldwork Data Processing

After returning from fieldwork (especially Mo'orea), prioritize data organization while everything is still fresh. Do this within the first two weeks back.

### Post-Fieldwork Checklist

- [ ] **Organize and back up all field data.** Upload raw data files to the lab NAS and at least one cloud backup (UCSB Box or Google Drive). Do not leave data only on field laptops or SD cards.
- [ ] **Annotate field notes.** Review your field notebook entries and add any clarifying details while you still remember them. Scan or photograph physical notebooks and store digital copies alongside your data.
- [ ] **Create or update README files.** Every dataset directory should have a README explaining: what the data are, when and where they were collected, collection methods, variable definitions and units, any known issues or deviations from protocol.
- [ ] **Inventory unprocessed samples.** Create a list of all samples, images, and specimens that still need processing. Include storage location, priority, and estimated processing time.
- [ ] **QA/QC your data.** Review datasets for obvious errors: impossible values, missing entries, duplicate records, and inconsistencies between field sheets and digital entries. Flag suspicious values and verify against original field sheets while the field context is fresh.
- [ ] **Log collection totals.** For Mo'orea: record species collected, quantities, and sites in the shared collection tracking sheet. This is required for the annual bilan des prelevements report to DIREN.
- [ ] **File organization.** Follow the lab naming conventions: include project name, date, and descriptive content in filenames. Use the established Google Drive folder structure (see the Stier Lab Digital Tools section).

### What Belongs Where

| Content | Location |
|---------|----------|
| Raw data files (CSV, images) | Lab NAS + UCSB Box |
| Analysis code | GitHub (lab org) |
| Field notebooks (scans) | Google Drive (Stier Lab > People > [Your Name]) |
| Manuscripts in progress | Google Drive (Stier Lab > Lab Projects > [Project]) |
| Published data packages | Dryad, Zenodo, or BCO-DMO |

## Code & Analysis

- Write code so that someone else (or future you) can understand it. Comment your code. Use consistent style.
- Make your analysis reproducible: someone should be able to run your code on your raw data and reproduce your results.
- Archive your code alongside your data in a repository (e.g., [GitHub](https://github.com/), [Dryad](https://datadryad.org/), [Zenodo](https://zenodo.org/)) when you publish.

## Coding and Analysis Tools

- **R** is the primary language in the lab. Most analyses, figures, and data processing are done in R.
- We use **RStudio** as our development environment and **RStudio Projects** to organize work. Using projects keeps your file paths relative and your work portable. Do not use `setwd()` in scripts.
- **Tidyverse** packages (dplyr, ggplot2, tidyr, etc.) are widely used in the lab. The [Tidyverse style guide](https://style.tidyverse.org/) is a good starting point for learning clean, readable coding habits.
- **R Markdown** and **Quarto** are valuable for creating reproducible analyses that combine code, results, and narrative in a single document. Consider using them for analysis reports and supplementary materials.
- **GitHub** is used for version control and collaboration on code. All analysis code for published papers should live in a lab GitHub repository.
- If you are new to R, talk to labmates. There is always someone willing to help you get started. Learning to code is a normal part of joining the lab, and no one expects you to arrive as an expert.

## Lab Policy on Data After Departure

When you leave the lab, archive your research data and code on the lab NAS and/or Google Drive with appropriate metadata. This applies to research conducted primarily within the Stier Lab. For work conducted under other PIs or external funding with separate data requirements, follow those policies.

No one will publish your unpublished data without your permission for at least three years after your departure. After three years, I may work with you to publish the data, with you as lead author. If you are unreachable after reasonable efforts, I may publish the work with appropriate attribution. The strong expectation is that you publish your own work within a couple of years of graduating.

For work funded by external grants, data archiving requirements from the funding agency (e.g., NSF, NOAA) apply. These requirements can mandate public data availability on a specific timeline.

## Research Data Ownership

Under the UC Research Data Policy (effective July 2022), the University owns research data generated during university research. Students must collect, manage, and share research data in accordance with their discipline's standards, UC/UCSB policies, and applicable legal requirements. Data from grant-funded research must be FAIR (Findable, Accessible, Interoperable, Reusable). This does not change the lab's practical policies above. It means your data practices must meet both lab and university standards.

For the lab's AI use policy, see the separate AI Use Policy section.
