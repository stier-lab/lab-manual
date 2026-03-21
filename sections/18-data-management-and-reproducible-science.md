# Data Management and Reproducible Science

## Why This Matters

I was fortunate to train with Craig Osenberg, who instilled in me the importance of transparency and rigor in how we handle data and report results. Good data management protects your work, supports reproducibility, and keeps publicly funded data accessible to other researchers. It also protects you. Years from now, you will be glad you documented what you did.

## Data Storage & Backup

- All research data should be backed up in at least two locations (e.g., UCSB Box + external hard drive, or NAS + UCSB Box). Note: Google Drive is limited to 150 GB per account, so use the lab NAS or UCSB Box (unlimited) for large datasets.
- Do not rely solely on a personal laptop. Hard drives fail.
- The lab NAS (stier-nas1) is backed up regularly. You can maintain a personal folder there for your project data.
- UCSB Box provides unlimited cloud storage as an added backup option.

## File and Folder Naming Conventions

Consistent naming is not glamorous, but it is one of the highest-leverage habits in research. Named well, files sort themselves, searches work, and a labmate can find your data without asking you. Named poorly, nothing is findable six months later.

**Date format:** Always use `YYYYMMDD` (e.g., `20260315`). This sorts correctly on every operating system and avoids ambiguity between US (MM/DD) and international (DD/MM) conventions. Use it in filenames, folder names, and notebook entries.

**File names:** Use the pattern `YYYYMMDD_project_description.ext`. Separate words with underscores. Avoid spaces, special characters, and accented letters. Keep names descriptive but concise.

Examples:
- `20260315_moorea_coral_growth_raw.csv`
- `20260401_pocillopora_thermal_stress_analysis.R`
- `20260315_fieldnotes_backreef_site3.md`

**Folder structure:** Every project should follow the standard lab template (see `Lab Projects > Example Folder` in Google Drive):

```
project-name/
├── admin/          # permits, agreements, budgets
├── data/
│   ├── raw/        # untouched original data — never edit these files
│   └── processed/  # cleaned, transformed data ready for analysis
├── code/           # analysis scripts, numbered in execution order
├── figures/        # output figures
├── notes/          # field notes, meeting notes, planning docs
└── writing/        # manuscript drafts
```

Each `data/` directory must include a `README.md` explaining variables, units, collection methods, and any known issues.

**Version control for code:** Use Git and push to the lab GitHub organization. For manuscripts, use descriptive filenames with dates rather than "final_v2_FINAL.docx."

## Data Formatting & Documentation

- Store data in CSV format as the primary archival format. Excel is fine for data entry, but CSV provides long-term readability.
- Use simple, flat structure: rows and columns, no embedded subtables or summary calculations within data files.
- Include a metadata file (README) with every dataset explaining variables, units, collection methods, and any known issues.

### Column Naming Conventions

Use `fish_case` for all column headers: lowercase, words separated by underscores, no spaces or special characters. (Yes, other labs call this snake_case. We are a marine lab.) Keep names short but unambiguous. Include units in the column name or document them in the README — do not embed units in data cells.

**Good:**
```
site_id, date, species, colony_id, depth_m, temp_c, growth_rate_cm_yr, treatment
```

**Bad:**
```
Site ID, Date Collected, Species Name, Colony #, Depth (m), Temperature, Growth Rate, Treat.
```

The bad version has spaces, parentheses, abbreviations without context, and ambiguous names. The good version is machine-readable, self-documenting, and will not break in R or Python.

### Example: A Well-Formatted Data File

`20260601_moorea_coral_growth_raw.csv`:

```csv
site_id,date,species,colony_id,depth_m,temp_c,growth_rate_cm_yr,treatment
LTER1,2026-06-01,pocillopora_meandrina,PM001,3.2,27.4,1.83,control
LTER1,2026-06-01,pocillopora_meandrina,PM002,3.5,27.3,2.01,control
LTER2,2026-06-01,pocillopora_meandrina,PM003,5.1,26.8,1.45,shaded
LTER2,2026-06-01,pocillopora_meandrina,PM004,4.8,26.9,1.62,shaded
```

Key points:
- Dates in ISO 8601 format (`YYYY-MM-DD`) within data cells
- Species names in lowercase with underscores (matches taxonomic databases)
- One observation per row, one variable per column
- No merged cells, no color-coding, no summary rows
- Colony IDs use a consistent prefix + number scheme

### README Template for Datasets

Every `data/` directory must include a `README.md`. At minimum:

```markdown
# Dataset: [Project Name]

## Description
Brief description of what this dataset contains and why it was collected.

## Collection
- **Dates:** 2026-06-01 to 2026-08-15
- **Location:** Mo'orea, French Polynesia (LTER1: -17.4732, -149.8018)
- **Method:** SCUBA surveys at 3-5m depth along permanent transects
- **Collected by:** [Names]

## Variables

| Column | Description | Units | Notes |
|--------|-------------|-------|-------|
| site_id | LTER site identifier | — | LTER1 = Haapiti, LTER2 = Tiahura |
| date | Date of observation | YYYY-MM-DD | |
| species | Coral species | — | Genus_species, lowercase |
| colony_id | Unique colony tag | — | Prefix = species abbreviation |
| depth_m | Depth at colony | meters | Measured with dive computer |
| temp_c | Water temperature at colony | degrees Celsius | HOBO logger, ± 0.2°C |
| growth_rate_cm_yr | Linear extension rate | cm per year | Measured from stained reference |
| treatment | Experimental treatment | — | control, shaded |

## Known Issues
- PM003 tag was replaced on 2026-07-12 after original was lost
- Temperature logger at LTER2 had a 3-day gap (2026-07-04 to 2026-07-06)

## Related Files
- Analysis code: `../../code/01_coral_growth_analysis.R`
- Field notebook: `../../notes/20260601_fieldnotes_coral_survey.md`
```

Adapt this template to your project. The goal is that a labmate — or future you — can understand the data without asking anyone.

## Organizing a Multi-Project Research Program

Most graduate students and postdocs end up with multiple related projects under one research theme. When a single Drive folder grows from 3 experiments to 15, it needs structure beyond the single-project template above. Here is how we handle it.

**Number your projects chronologically.** Give each experiment or study a sequential number and a descriptive name with the year it started:

```
Projects/
├── 01_wound_intensity_growth_2022/
├── 02_wound_type_airbrush_dremel_2022/
├── 03_island_size_healing_rate_2022/
├── 04_wound_respiration_2023/
├── 05_gene_expression_near_far_2023/
└── ...
```

Each project folder follows the standard template (data/, code/, notes/, figures/). The numbering gives you and your collaborators an instant sense of chronology and scale.

**Create a Drive Map.** When your research folder has more than about 5 projects, write a top-level `README` or Drive Map document explaining the structure: what each project is, how they relate to each other, and where to find key resources. This is the single most useful thing you can do for a new collaborator (or for yourself after a summer away). Keep it updated.

**Separate methods from projects.** Protocols that are used across multiple projects belong in a shared `Methods/` folder at the top level, not buried inside individual project folders. One subfolder per protocol:

```
Methods/
├── buoyant_weight/
├── chlorophyll_assay/
├── histology/
├── PAM_fluorometry/
└── wounding_protocol/
```

This prevents the same protocol from drifting into five slightly different versions across five project folders.

**Letter your manuscripts.** When you have multiple papers in preparation, letter them (A, B, C, D) in priority order. Each manuscript folder should contain the working draft, figures, analysis code, and previous versions in an `old/` subfolder.

**Track project status.** For large research programs, maintain a simple tracking sheet (Google Sheet or similar) with one row per project: current status, lead person, next milestone, and target date. Review it quarterly during IDP meetings.

**This structure works for dissertations too.** A dissertation is a multi-project research program. If you set up your Drive folder this way from the start — numbered projects mapping to chapters, lettered manuscripts tracking your publication pipeline, shared methods, and a Drive Map — you will not have to reorganize anything when it is time to write up. Your chapter folders are already your project folders. Your lettered manuscripts are already your chapters. The students who finish fastest are the ones whose dissertation was organized before they knew it was.

## Lab and Field Notebooks

Document your methods as you go, not after the fact. You will forget details faster than you think. By the time you sit down to write a paper, the specifics of how you set up an experiment, calibrated an instrument, or processed a sample will be fuzzy at best.

- **Keep a lab/field notebook.** The format is up to you: a physical notebook, a digital document, or a dedicated app. What matters is that you use it consistently and that it is backed up. Physical notebooks should be photographed or scanned regularly. Digital entries should follow the same `YYYYMMDD` naming convention used for data files (e.g., `20260315_fieldnotes_backreef_thermal.md`).
- **Update your notebook within 48 hours.** Notes taken in the field or at the bench should be cleaned up and backed up within two days, while the details are still fresh. Waiting until the end of the week — or worse, the end of the field season — guarantees lost information.
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
- [ ] **File organization.** Follow the lab naming conventions: include project name, date, and descriptive content in filenames. Use the established Google Drive folder structure (see the Technology and Digital Tools section).

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

The lab has a detailed policy covering post-departure project completion, including milestone timelines, authorship expectations, and what happens if progress stalls. The strong expectation is that you publish your own work, and the policy is designed to support that outcome with clear deadlines and continued access to lab resources. See the Completing Projects After Departure section for the full details, including the Exit Plan Meeting process and role-specific timelines.

For work funded by external grants, data archiving requirements from the funding agency (e.g., NSF, NOAA) apply. These requirements can mandate public data availability on a specific timeline.

## Research Data Ownership

Under the [UC Research Data Policy](https://www.ucop.edu/research-policy-analysis-coordination/policies-guidance/research-data/research-data-policy-faqs.html) (effective July 2022), the University of California — not individual researchers — owns research data generated during university research. The PI serves as data steward on behalf of the university and funder, not as personal owner.

What this means in practice:

- **Your right to use your data:** Lab members retain the right to use data from their own projects for dissertations, publications, and career development. The PI's stewardship role is to ensure data integrity, proper attribution, and compliance with funding requirements — not to restrict reasonable academic use.
- **Taking data when you leave:** You may take copies of data you generated. Email the PI describing your planned use. Absent a response within 30 days, approval is assumed. For grant-funded data, a [Data Transfer and Use Agreement](https://tia.ucsb.edu/forms-policies/) through UCSB TIA may be required.
- **Grant-funded data:** Data archiving requirements from the funding agency (e.g., NSF, NOAA) apply and can mandate public availability on a specific timeline.

This does not change the lab's practical data management policies above. It means your data practices must meet both lab and university standards.

For the lab's AI use policy, see the separate AI Use Policy section.
