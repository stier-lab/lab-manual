# Annual Maintenance Guide

This manual contains ~45 URLs, ~30 phone numbers, ~20 named personnel, ~40 dollar amounts, and ~40 email addresses spread across 32 markdown files. These change over time. This guide documents how to keep things current.

## Quick Start

```sh
npm run audit
```

This runs `audit.js`, which takes about 30 seconds. It checks every URL in the manual for liveness and verifies key facts (personnel, travel rates, phone numbers) against live web sources. Results print to the console and are saved to `audit-report.md`.

## What the Audit Checks

### 1. URL Liveness (automatic)

The script extracts every URL from all markdown files, deduplicates them, and checks each one:

- **OK** — Page loads normally
- **Broken** — 4xx/5xx response (page removed or URL changed)
- **Redirected** — Page loads but the URL has changed. Update to the final destination
- **Timeout** — Server did not respond in 10 seconds
- **Auth-blocked** — Page redirects to UCSB SSO login (cannot verify automatically)
- **Soft 404** — Server returns 200 but the page says "not found"

### 2. Content/Fact Checks (hand-curated)

The `CONTENT_CHECKS` array in `audit.js` (lines 12-160) contains ~17 checks for things that change. Each check fetches a source page and searches for specific text patterns. Categories:

| Category | What changes | How often |
|----------|-------------|-----------|
| **Personnel** | Dept chair, grad advisor, library liaison, etc. | When people leave/arrive |
| **Travel rates** | Mileage rate, meal caps, lodging cap, rental car IDs | Annually (Jan for mileage, Sep for meals) |
| **Fellowships** | Senate travel grant amounts, NSF GRFP eligibility rules | Annually |
| **Campus services** | Phone numbers for CAPS, Title IX, OISS, DSP | Rarely, but check anyway |
| **Graduate Division** | Mentoring page, counselor names | When staff turn over |

### 3. What it does NOT check

- **Email addresses** — No automated way to verify
- **Internal procedures** — Whether the lab's own processes are still accurate
- **PDF-linked content** — Some UCSB policies are in PDFs linked from pages, not on the pages themselves
- **Content behind SSO** — Gateway, UC Learning Center, etc.

## Annual Review Procedure

Run this at the start of each academic year (September) or whenever something feels off.

### Step 1: Run the audit

```sh
npm run audit
```

### Step 2: Fix broken links

Open `audit-report.md`. The **Broken Links** table shows dead URLs with their file and line number. For each one:

1. Search the web for the current URL of that resource
2. Edit the markdown file (`sections/XX-topic.md`) with the corrected URL
3. If the resource no longer exists, remove the link or replace with an alternative

### Step 3: Update redirected URLs

The **Redirected URLs** table shows links that work but point to an old address. Update the markdown to use the final destination URL. Skip redirects that go to login pages (Gateway, RAMS, library search) — those are normal.

### Step 4: Review flagged content

The **Content Needing Review** section lists facts where the automated check couldn't confirm the manual's value. For each one:

1. Visit the source URL manually
2. Check whether the manual's stated value is still correct
3. If the value has changed, update the markdown file
4. If the source URL itself has changed (common for UCSB pages), update the `url` field in the `CONTENT_CHECKS` array in `audit.js`

**Common false positives:** The meal rates, lodging cap, and rental car IDs often show as "not found" because UCSB puts the actual numbers in linked PDFs (G-28 bulletin) rather than on the landing page. Verify these manually via the BFS website.

### Step 5: Check fetch errors

Items under **Fetch Errors** couldn't be reached at all. Reasons include:

- **Timeout** — Site was slow; try again later
- **ECONNREFUSED / DNS errors** — Site may be permanently down (e.g., myIDP went offline in 2025)
- **403** — Site blocks automated requests; check manually in a browser

### Step 6: Rebuild and push

```sh
npm run build
git add -A
git commit -m "Annual manual audit: update URLs and content"
git push
```

## Updating the Audit Script

When you need to add, remove, or modify a content check, edit the `CONTENT_CHECKS` array in `audit.js` (starts at line 12). Each check has:

```js
{
  category: 'Travel Rates',       // Grouping label for the report
  label: 'IRS mileage rate',      // Human-readable name
  url: 'https://...',             // Source page to fetch
  manualValue: '$0.725/mile',     // What the manual currently says
  searchPatterns: ['0.725'],      // Strings to search for in the page text
  file: 'sections/22-travel.md',  // Where this fact appears in the manual
  notes: 'Updates in January',    // Optional context
}
```

**Tips:**
- `searchPatterns` are case-insensitive substring matches against the page text (HTML stripped)
- Use simple, distinctive strings — a phone number like `893-4411` is better than `805`
- If a source URL changes, update it here so future audits work
- If a person leaves and is replaced, update both the `manualValue` and `searchPatterns`

## Known Limitations

- **myIDP** (myidp.sciencecareers.org): The AAAS myIDP service went offline. Three URLs in `onboarding-checklist.md` reference it. Consider replacing with an alternative IDP tool if it doesn't come back.
- **UCSB page restructuring**: UCSB periodically reorganizes websites. Source URLs in `CONTENT_CHECKS` may need updating even when the facts haven't changed.
- **Rate limiting**: The script waits 500ms between requests to avoid being blocked. A full run takes ~30 seconds.
- **BFS travel rates**: The actual dollar amounts are in the G-28 Travel Policy bulletin (PDF), not on the BFS landing page. The content check will often show "not found" even when the manual is correct. Verify manually at [bfs.ucsb.edu](https://bfs.ucsb.edu/travel_entertainment/travel-planning).

## File Reference

| File | Purpose |
|------|---------|
| `audit.js` | The audit script (run with `npm run audit`) |
| `audit-report.md` | Generated report (gitignored, not committed) |
| `sections/*.md` | Source content — edit these to fix issues |
| `config.json` | Section metadata — tells the audit which files to scan |
| `build.js` | Rebuilds HTML after edits (`npm run build`) |

## History

| Date | Notes |
|------|-------|
| 2026-02-27 | Initial audit script created. Found 15 redirected URLs, 6 content items needing review, 9 fetch errors. All flagged content values confirmed correct via manual web checks. |
| 2026-02-28 | Updated 12 redirected URLs to final destinations. Confirmed Kristen Labonte still library liaison, meal/lodging rates current, NSF GRFP eligibility current, DSP phone current. |
