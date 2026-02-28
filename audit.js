const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const RATE_LIMIT_MS = 500;
const TIMEOUT_MS = 10000;
const USER_AGENT = 'StierLab-ManualAudit/1.0 (academic-use)';
const REPORT_FILE = path.join(ROOT, 'audit-report.md');
const COOKIES_FILE = process.argv.includes('--cookies')
  ? (process.argv[process.argv.indexOf('--cookies') + 1] || path.join(ROOT, 'cookies.txt'))
  : null;

// ─── Cookie support ─────────────────────────────────────────────────────────

let cookiesByDomain = {};

function loadCookies() {
  if (!COOKIES_FILE) return;
  if (!fs.existsSync(COOKIES_FILE)) {
    console.log(`Warning: Cookie file not found: ${COOKIES_FILE}\n`);
    return;
  }
  const lines = fs.readFileSync(COOKIES_FILE, 'utf8').split('\n');
  for (const line of lines) {
    if (line.startsWith('#') || !line.trim()) continue;
    const parts = line.split('\t');
    if (parts.length < 7) continue;
    const [domain, , , , , name, value] = parts;
    const cleanDomain = domain.replace(/^\./, '');
    if (!cookiesByDomain[cleanDomain]) cookiesByDomain[cleanDomain] = [];
    cookiesByDomain[cleanDomain].push(`${name}=${value}`);
  }
  const domainCount = Object.keys(cookiesByDomain).length;
  const cookieCount = Object.values(cookiesByDomain).reduce((s, a) => s + a.length, 0);
  console.log(`Loaded ${cookieCount} cookies for ${domainCount} domains from ${COOKIES_FILE}\n`);
}

function getCookieHeader(url) {
  try {
    const hostname = new URL(url).hostname;
    const matching = [];
    for (const [domain, cookies] of Object.entries(cookiesByDomain)) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        matching.push(...cookies);
      }
    }
    return matching.length > 0 ? matching.join('; ') : null;
  } catch { return null; }
}

function buildHeaders(url) {
  const headers = { 'User-Agent': USER_AGENT };
  const cookie = getCookieHeader(url);
  if (cookie) headers['Cookie'] = cookie;
  return headers;
}

// ─── Hand-curated content checks ─────────────────────────────────────────────

const CONTENT_CHECKS = [
  // Personnel
  {
    category: 'Personnel',
    label: 'EEMB Department Chair',
    url: 'https://www.eemb.ucsb.edu/people/faculty',
    manualValue: 'Todd Oakley',
    searchPatterns: ['Todd Oakley'],
    file: 'sections/06-valuable-contacts.md',
  },
  {
    category: 'Personnel',
    label: 'Faculty Graduate Advisor',
    url: 'https://www.eemb.ucsb.edu/people/leadership',
    manualValue: 'Hillary Young',
    searchPatterns: ['Hillary Young'],
    file: 'sections/06-valuable-contacts.md',
  },
  {
    category: 'Personnel',
    label: 'Staff Graduate Advisor',
    url: 'https://www.eemb.ucsb.edu/people/leadership',
    manualValue: 'Mengshu Ye',
    searchPatterns: ['Mengshu Ye'],
    file: 'sections/06-valuable-contacts.md',
  },
  {
    category: 'Personnel',
    label: 'Graduate Division Academic Counselor',
    url: 'https://www.graddiv.ucsb.edu/staff',
    manualValue: 'Ryan Sims',
    searchPatterns: ['Ryan Sims'],
    file: 'sections/21-mental-health-resources.md',
  },
  {
    category: 'Personnel',
    label: 'EEMB Library Liaison',
    url: 'https://www.library.ucsb.edu/staff/kristen-labonte',
    manualValue: 'Kristen Labonte',
    searchPatterns: ['Labonte'],
    file: 'sections/24-library-services-and-suggestions.md',
  },

  // Travel rates
  {
    category: 'Travel Rates',
    label: 'IRS mileage reimbursement rate',
    url: 'https://www.gsa.gov/travel/plan-book/transportation-airfare-pov-etc/privately-owned-vehicle-pov-mileage-reimbursement',
    manualValue: '$0.725/mile (January 2026)',
    searchPatterns: ['0.725'],
    file: 'sections/22-travel.md',
    notes: 'Updates annually in January',
  },
  {
    category: 'Travel Rates',
    label: 'UC domestic meal caps (breakfast/lunch/dinner)',
    url: 'https://bfs.ucsb.edu/travel_entertainment/travel-planning',
    manualValue: 'Breakfast $34, Lunch $59, Dinner $103',
    searchPatterns: ['meal', 'travel'],
    file: 'sections/22-travel.md',
    notes: 'Exact rates are in the G-28 bulletin PDF, not on this page. Verify manually at BFS.',
  },
  {
    category: 'Travel Rates',
    label: 'UC domestic lodging cap',
    url: 'https://bfs.ucsb.edu/travel_entertainment/travel-planning',
    manualValue: '$333/night',
    searchPatterns: ['lodging'],
    file: 'sections/22-travel.md',
    notes: 'Exact cap is in the G-28 bulletin PDF, not on this page. Verify manually at BFS.',
  },
  {
    category: 'Travel Rates',
    label: 'Rental car contract IDs',
    url: 'https://chemengr.ucsb.edu/car-rentals-travel-packages',
    manualValue: 'Hertz 72130, Enterprise XZ32A01',
    searchPatterns: ['72130', 'XZ32A01'],
    file: 'sections/22-travel.md',
  },

  // Fellowships & awards
  {
    category: 'Fellowships',
    label: 'Academic Senate Doctoral Student Travel Grant',
    url: 'https://senate.ucsb.edu/grants/doctoral-student-travel/',
    manualValue: '$250 virtual, $900 domestic, $1500 international',
    searchPatterns: ['doctoral', 'travel'],
    file: 'sections/14-graduate-student-funding.md',
    notes: 'Exact amounts are in the application PDF. Verify at senate.ucsb.edu.',
  },
  {
    category: 'Fellowships',
    label: 'NSF GRFP eligibility',
    url: 'https://www.nsfgrfp.org/applicants/applicant-eligibility.html',
    manualValue: 'Only first-year graduate students eligible (FY2026)',
    searchPatterns: ['first-year graduate student'],
    file: 'sections/14-graduate-student-funding.md',
    notes: 'Eligibility changed for FY2026 solicitation',
  },

  // Campus services
  {
    category: 'Campus Services',
    label: 'CAPS phone number',
    url: 'https://caps.sa.ucsb.edu/',
    manualValue: '(805) 893-4411',
    searchPatterns: ['893-4411'],
    file: 'sections/21-mental-health-resources.md',
  },
  {
    category: 'Campus Services',
    label: 'Title IX phone number',
    url: 'https://titleix.ucsb.edu/',
    manualValue: '(805) 893-2701',
    searchPatterns: ['893-2701'],
    file: 'sections/03-safety.md',
  },
  {
    category: 'Campus Services',
    label: 'OISS phone number',
    url: 'https://oiss.ucsb.edu/',
    manualValue: '(805) 893-2929',
    searchPatterns: ['893-2929'],
    file: 'sections/06-valuable-contacts.md',
  },
  {
    category: 'Campus Services',
    label: 'DSP phone number',
    url: 'https://dsp.sa.ucsb.edu/dsp-office-hours-contact-information',
    manualValue: '(805) 893-2668',
    searchPatterns: ['893.2668'],
    file: 'sections/03-safety.md',
  },
  {
    category: 'Campus Services',
    label: 'Hosford Clinic student cost',
    url: 'https://education.ucsb.edu/clinics-centers/hosford-clinic-office/potential-clients-resources/fees-privacy',
    manualValue: '$25 for UCSB students',
    searchPatterns: ['25'],
    file: 'sections/21-mental-health-resources.md',
  },

  // Graduate Division
  {
    category: 'Graduate Division',
    label: 'Grad Division mentoring page',
    url: 'https://www.graddiv.ucsb.edu/mentoring-students',
    manualValue: 'Mentoring resources page',
    searchPatterns: ['mentor'],
    file: 'sections/16-mentoring-and-advising-structure.md',
  },
];

// ─── File discovery ──────────────────────────────────────────────────────────

function getMarkdownFiles() {
  const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'config.json'), 'utf8'));
  const files = [];
  for (const group of config.navGroups) {
    for (const sec of group.sections) {
      files.push(path.join(ROOT, 'sections', sec.file));
    }
  }
  for (const sec of config.appendix) {
    files.push(path.join(ROOT, sec.file));
  }
  return files;
}

// ─── URL extraction ──────────────────────────────────────────────────────────

function extractUrls(filepath) {
  const lines = fs.readFileSync(filepath, 'utf8').split('\n');
  const results = [];
  const relFile = path.relative(ROOT, filepath);

  lines.forEach((line, idx) => {
    const seen = new Set();

    // Markdown links: [label](url)
    const mdLinkRe = /\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
    let match;
    while ((match = mdLinkRe.exec(line)) !== null) {
      const url = match[2].replace(/[.,;)>]+$/, '');
      seen.add(url);
      results.push({ url, file: relFile, line: idx + 1, label: match[1] });
    }

    // Bare URLs not already captured
    const bareRe = /https?:\/\/\S+/g;
    while ((match = bareRe.exec(line)) !== null) {
      const url = match[0].replace(/[.,;)>]+$/, '');
      if (!seen.has(url)) {
        results.push({ url, file: relFile, line: idx + 1, label: '' });
      }
    }
  });

  return results;
}

function deduplicateUrls(urlEntries) {
  const map = new Map();
  for (const entry of urlEntries) {
    if (!map.has(entry.url)) {
      map.set(entry.url, { url: entry.url, locations: [] });
    }
    map.get(entry.url).locations.push({ file: entry.file, line: entry.line, label: entry.label });
  }
  return Array.from(map.values());
}

// ─── HTTP helpers ────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ');
}

function isSoft404(text) {
  const lower = text.toLowerCase();
  return lower.includes('page not found') ||
    lower.includes('404 not found') ||
    lower.includes('this page does not exist') ||
    lower.includes('the page you requested');
}

function isAuthPage(text) {
  const lower = text.toLowerCase();
  return lower.includes('shibboleth') ||
    lower.includes('cas login') ||
    lower.includes('sign in with your') ||
    lower.includes('ucinet id') ||
    lower.includes('single sign-on');
}

// ─── URL liveness check ─────────────────────────────────────────────────────

async function checkUrl(entry) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let res = await fetch(entry.url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: buildHeaders(entry.url),
      redirect: 'follow',
    });

    // Some servers reject HEAD
    if (res.status === 405 || res.status === 403) {
      res = await fetch(entry.url, {
        method: 'GET',
        signal: controller.signal,
        headers: buildHeaders(entry.url),
        redirect: 'follow',
      });
    }

    // Handle 429 retry
    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('retry-after') || '5', 10);
      await sleep(retryAfter * 1000);
      res = await fetch(entry.url, {
        method: 'GET',
        signal: controller.signal,
        headers: buildHeaders(entry.url),
        redirect: 'follow',
      });
    }

    clearTimeout(timeout);

    // Check for soft 404 or auth redirect on GET responses
    let note = null;
    if (res.ok && res.headers.get('content-type')?.includes('text/html')) {
      try {
        const body = await res.clone().text();
        const text = stripHtml(body);
        if (isSoft404(text)) note = 'Soft 404 — page may have moved';
        if (isAuthPage(text)) note = 'Requires authentication — cannot verify';
      } catch (_) { /* ignore body read errors */ }
    }

    return {
      ...entry,
      status: res.status,
      ok: res.ok && !note?.includes('Soft 404'),
      finalUrl: res.url,
      redirected: res.redirected || res.url !== entry.url,
      note,
      error: null,
    };
  } catch (err) {
    clearTimeout(timeout);
    return {
      ...entry,
      status: null,
      ok: false,
      finalUrl: null,
      redirected: false,
      note: null,
      error: err.name === 'AbortError' ? 'Timeout' : err.message,
    };
  }
}

// ─── Content/fact check ─────────────────────────────────────────────────────

async function checkContent(check) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(check.url, {
      signal: controller.signal,
      headers: buildHeaders(check.url),
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { ...check, fetchOk: false, fetchStatus: res.status, result: 'error', patternResults: [], error: `HTTP ${res.status}` };
    }

    const html = await res.text();
    const text = stripHtml(html);

    if (isAuthPage(text)) {
      return { ...check, fetchOk: true, fetchStatus: res.status, result: 'auth', patternResults: [], error: 'Requires authentication' };
    }

    const patternResults = check.searchPatterns.map(pattern => ({
      pattern,
      found: text.toLowerCase().includes(pattern.toLowerCase()),
    }));

    const allFound = patternResults.every(p => p.found);
    const someFound = patternResults.some(p => p.found);

    return {
      ...check,
      fetchOk: true,
      fetchStatus: res.status,
      result: allFound ? 'verified' : someFound ? 'partial' : 'not_found',
      patternResults,
      error: null,
    };
  } catch (err) {
    clearTimeout(timeout);
    return { ...check, fetchOk: false, fetchStatus: null, result: 'error', patternResults: [], error: err.name === 'AbortError' ? 'Timeout' : err.message };
  }
}

// ─── Runner with rate limiting ──────────────────────────────────────────────

async function runChecks(items, checkFn, label) {
  const results = [];
  for (let i = 0; i < items.length; i++) {
    if (i > 0) await sleep(RATE_LIMIT_MS);
    process.stdout.write(`\r  ${label}: ${i + 1}/${items.length}...`);
    results.push(await checkFn(items[i]));
  }
  process.stdout.write(`\r  ${label}: ${items.length}/${items.length} done.\n`);
  return results;
}

// ─── Console report ─────────────────────────────────────────────────────────

function printConsoleReport(urlResults, contentResults) {
  const broken = urlResults.filter(r => !r.ok && !r.error && !r.note?.includes('authentication'));
  const redirected = urlResults.filter(r => r.ok && r.redirected);
  const urlErrors = urlResults.filter(r => r.error);
  const authBlocked = urlResults.filter(r => r.note?.includes('authentication'));
  const urlOk = urlResults.filter(r => r.ok && !r.redirected);

  const verified = contentResults.filter(r => r.result === 'verified');
  const needsReview = contentResults.filter(r => r.result === 'partial' || r.result === 'not_found');
  const contentErrors = contentResults.filter(r => r.result === 'error' || r.result === 'auth');

  console.log('\n══════════════════════════════════════');
  console.log('  AUDIT RESULTS');
  console.log('══════════════════════════════════════\n');

  if (broken.length > 0) {
    console.log(`BROKEN LINKS (${broken.length}):`);
    for (const r of broken) {
      console.log(`  [${r.status || 'ERR'}] ${r.url}`);
      if (r.note) console.log(`        ${r.note}`);
      for (const loc of r.locations) {
        console.log(`        ${loc.file}:${loc.line}${loc.label ? ` (${loc.label})` : ''}`);
      }
    }
    console.log('');
  }

  if (redirected.length > 0) {
    console.log(`REDIRECTED (${redirected.length}):`);
    for (const r of redirected) {
      console.log(`  ${r.url}`);
      console.log(`    -> ${r.finalUrl}`);
      for (const loc of r.locations) {
        console.log(`       ${loc.file}:${loc.line}`);
      }
    }
    console.log('');
  }

  if (needsReview.length > 0) {
    console.log(`CONTENT NEEDS REVIEW (${needsReview.length}):`);
    for (const r of needsReview) {
      console.log(`  [${r.result.toUpperCase()}] ${r.label}`);
      console.log(`    Manual says: ${r.manualValue}`);
      console.log(`    Source: ${r.url}`);
      for (const p of r.patternResults) {
        console.log(`    ${p.found ? 'FOUND' : 'NOT FOUND'}: "${p.pattern}"`);
      }
      console.log(`    File: ${r.file}`);
      if (r.notes) console.log(`    Note: ${r.notes}`);
    }
    console.log('');
  }

  if (urlErrors.length > 0 || contentErrors.length > 0) {
    console.log(`FETCH ERRORS (${urlErrors.length + contentErrors.length}):`);
    for (const r of urlErrors) {
      console.log(`  [${r.error}] ${r.url}`);
      for (const loc of r.locations) console.log(`    ${loc.file}:${loc.line}`);
    }
    for (const r of contentErrors) {
      console.log(`  [${r.error}] ${r.label} — ${r.url}`);
    }
    console.log('');
  }

  if (authBlocked.length > 0) {
    console.log(`BEHIND AUTH (${authBlocked.length} — cannot verify):`);
    for (const r of authBlocked) {
      console.log(`  ${r.url}`);
      for (const loc of r.locations) console.log(`    ${loc.file}:${loc.line}`);
    }
    console.log('');
  }

  if (verified.length > 0) {
    console.log(`VERIFIED CONTENT (${verified.length}):`);
    for (const r of verified) {
      console.log(`  OK  ${r.label} — ${r.manualValue}`);
    }
    console.log('');
  }

  console.log('── Summary ──');
  console.log(`URLs:    ${urlOk.length} ok | ${broken.length} broken | ${redirected.length} redirected | ${authBlocked.length} auth | ${urlErrors.length} errors`);
  console.log(`Content: ${verified.length} verified | ${needsReview.length} needs review | ${contentErrors.length} errors`);
}

// ─── Markdown report ────────────────────────────────────────────────────────

function writeMarkdownReport(urlResults, contentResults) {
  const date = new Date().toISOString().slice(0, 10);
  const broken = urlResults.filter(r => !r.ok && !r.error && !r.note?.includes('authentication'));
  const redirected = urlResults.filter(r => r.ok && r.redirected);
  const urlErrors = urlResults.filter(r => r.error);
  const authBlocked = urlResults.filter(r => r.note?.includes('authentication'));
  const urlOk = urlResults.filter(r => r.ok && !r.redirected);

  const verified = contentResults.filter(r => r.result === 'verified');
  const needsReview = contentResults.filter(r => r.result === 'partial' || r.result === 'not_found');
  const contentErrors = contentResults.filter(r => r.result === 'error' || r.result === 'auth');

  let md = `# Lab Manual Audit Report\n\nGenerated: ${date}\n\n`;

  // Summary
  md += '## Summary\n\n';
  md += '| Check Type | OK | Issues | Errors |\n';
  md += '|---|---|---|---|\n';
  md += `| URL Liveness | ${urlOk.length} | ${broken.length} broken, ${redirected.length} redirected | ${urlErrors.length + authBlocked.length} |\n`;
  md += `| Content/Fact | ${verified.length} | ${needsReview.length} needs review | ${contentErrors.length} |\n\n`;

  // Broken links
  if (broken.length > 0) {
    md += '## Broken Links\n\n';
    md += '| Status | URL | File | Line | Label |\n';
    md += '|---|---|---|---|---|\n';
    for (const r of broken) {
      for (const loc of r.locations) {
        md += `| ${r.status || 'ERR'} | ${r.url} | \`${loc.file}\` | ${loc.line} | ${loc.label || '—'} |\n`;
      }
    }
    md += '\n';
  }

  // Redirected
  if (redirected.length > 0) {
    md += '## Redirected URLs\n\n';
    md += 'These links work but redirect to a different URL. Consider updating to the final destination.\n\n';
    md += '| Original | Redirects To | File | Line |\n';
    md += '|---|---|---|---|\n';
    for (const r of redirected) {
      for (const loc of r.locations) {
        md += `| ${r.url} | ${r.finalUrl} | \`${loc.file}\` | ${loc.line} |\n`;
      }
    }
    md += '\n';
  }

  // Content needs review
  if (needsReview.length > 0) {
    md += '## Content Needing Review\n\n';
    for (const r of needsReview) {
      md += `### ${r.label}\n\n`;
      md += `- **Category:** ${r.category}\n`;
      md += `- **Manual says:** ${r.manualValue}\n`;
      md += `- **Source:** ${r.url}\n`;
      md += `- **Result:** ${r.result === 'partial' ? 'Some patterns found' : 'Patterns not found on page'}\n`;
      for (const p of r.patternResults) {
        md += `  - \`${p.pattern}\`: ${p.found ? 'found' : '**not found**'}\n`;
      }
      md += `- **File:** \`${r.file}\`\n`;
      if (r.notes) md += `- **Note:** ${r.notes}\n`;
      md += '\n';
    }
  }

  // Verified
  if (verified.length > 0) {
    md += '## Verified Content\n\n';
    md += '| Check | Manual Value | Category |\n';
    md += '|---|---|---|\n';
    for (const r of verified) {
      md += `| ${r.label} | ${r.manualValue} | ${r.category} |\n`;
    }
    md += '\n';
  }

  // Errors
  if (urlErrors.length > 0 || contentErrors.length > 0 || authBlocked.length > 0) {
    md += '## Fetch Errors & Auth-Blocked\n\n';
    md += 'These could not be checked automatically.\n\n';
    md += '| Type | Item | Error |\n';
    md += '|---|---|---|\n';
    for (const r of urlErrors) {
      md += `| URL | ${r.url} | ${r.error} |\n`;
    }
    for (const r of contentErrors) {
      md += `| Content | ${r.label} | ${r.error} |\n`;
    }
    for (const r of authBlocked) {
      md += `| URL (auth) | ${r.url} | Requires login |\n`;
    }
    md += '\n';
  }

  fs.writeFileSync(REPORT_FILE, md, 'utf8');
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Lab Manual Audit ===');
  console.log(`Date: ${new Date().toISOString().slice(0, 10)}\n`);

  // Load cookies for authenticated checks
  loadCookies();

  // Discover files
  const mdFiles = getMarkdownFiles();
  console.log(`Scanning ${mdFiles.length} markdown files...\n`);

  // Extract URLs
  let allUrls = [];
  for (const f of mdFiles) {
    allUrls.push(...extractUrls(f));
  }
  const uniqueUrls = deduplicateUrls(allUrls);
  console.log(`Found ${allUrls.length} URL references (${uniqueUrls.length} unique).`);
  console.log(`Found ${CONTENT_CHECKS.length} content checks to run.\n`);

  // Run URL checks
  const urlResults = await runChecks(uniqueUrls, checkUrl, 'URL checks');

  // Run content checks
  const contentResults = await runChecks(CONTENT_CHECKS, checkContent, 'Content checks');

  // Report
  printConsoleReport(urlResults, contentResults);
  writeMarkdownReport(urlResults, contentResults);
  console.log(`\nFull report: ${REPORT_FILE}`);
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
