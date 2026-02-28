const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const ROOT = __dirname;
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'config.json'), 'utf8'));
const template = fs.readFileSync(path.join(ROOT, 'template.html'), 'utf8');

// --- SVG icons for contact cards ---
const ICONS = {
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>',
  email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>',
  location: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/></svg>'
};

// --- Date formatting ---
const now = new Date();
const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
const isoDate = now.toISOString().slice(0, 10);

// --- Build section cross-reference map ---
// Maps lowercase phrase → section ID for auto-linking "see the X section" text
function buildCrossRefMap() {
  const map = [];
  for (const group of config.navGroups) {
    for (const sec of group.sections) {
      // Add the config title
      map.push({ phrase: sec.title.toLowerCase(), id: sec.id });
    }
  }
  for (const sec of config.appendix) {
    map.push({ phrase: sec.title.toLowerCase(), id: sec.id });
  }
  // Add common alternate names that appear in the prose
  const aliases = {
    'data management and reproducible science': 'data',
    'data management': 'data',
    'required trainings': 'trainings',
    'mental health resources': 'mental-health',
    'mental health': 'mental-health',
    'chemical health and safety plan': 'trainings',
    'stier lab digital tools': 'digital-tools',
    'digital tools': 'digital-tools',
    'valuable contacts': 'contacts',
    'purchasing and shipping': 'purchasing',
    'purchasing & shipping': 'purchasing',
    'gender equity and lab climate': 'equity',
    'gender equity & climate': 'equity',
    'conflict resolution': 'conflict',
    'communication norms': 'communication',
    'lab values and culture': 'values',
    'lab values & culture': 'values',
    'mentoring and advising': 'mentoring',
    'mentoring and advising structure': 'mentoring',
    'mentoring & advising': 'mentoring',
    'departure and offboarding': 'departure',
    'departure & offboarding': 'departure',
    'library and suggestions': 'library',
    'library & suggestions': 'library',
    'lab meetings': 'lab-meetings',
    'science communication': 'scicomm',
    "mo'orea fieldwork": 'moorea',
    'moorea fieldwork': 'moorea',
    'authorship policy': 'authorship',
    'graduate funding': 'funding',
    'graduate student funding': 'funding',
    'program guidance': 'program',
    'graduate program guidance': 'program',
    'publishing and peer review': 'publishing',
    'ai use policy': 'ai',
    'animal care training': 'trainings',
    'travel': 'travel-sec',
    'vehicles': 'vehicles',
    'safety': 'safety',
    'fellowships': 'funding',
    'collaboration': 'collaboration',
    'postdocs': 'postdocs',
    'undergraduates': 'undergrads',
    'facilities': 'facilities',
    'technology': 'technology',
    'onboarding checklist': 'onboarding',
    'lab working agreement': 'working-agreement',
  };
  for (const [phrase, id] of Object.entries(aliases)) {
    if (!map.some(m => m.phrase === phrase)) {
      map.push({ phrase, id });
    }
  }
  // Sort longest first so longer matches take priority
  map.sort((a, b) => b.phrase.length - a.phrase.length);
  return map;
}
const crossRefMap = buildCrossRefMap();

// Auto-link "see the X section" and "See the X section" references
function autoLinkCrossRefs(html) {
  // Match patterns like: see the X section, See the X section, see the X subsection
  // Avoid double-linking (skip if already inside an <a> tag)
  return html.replace(/([Ss]ee the )([\w\s''&]+?)(section|subsection)/g, (match, prefix, name, suffix) => {
    const nameLower = name.trim().toLowerCase().replace(/\u2019/g, "'");
    const entry = crossRefMap.find(m => nameLower === m.phrase || nameLower.replace(/ $/, '') === m.phrase);
    if (entry) {
      return `${prefix}<a href="#${entry.id}">${name.trim()}</a> ${suffix}`;
    }
    return match;
  });
}

// --- Markdown conversion ---
function convertMarkdown(md, sectionId) {
  // Convert markdown to HTML
  let html = marked.parse(md);

  // Remove the first H1 — we re-add it from config
  html = html.replace(/^<h1[^>]*>.*?<\/h1>\n?/, '');

  // --- Callout boxes: convert blockquotes starting with **Warning:** or **Info:** ---
  html = html.replace(/<blockquote>\s*<p>\s*<strong>(Warning|Info):?<\/strong>\s*([\s\S]*?)<\/p>\s*<\/blockquote>/gi,
    (match, type, content) => {
      const cls = type.toLowerCase() === 'warning' ? 'callout-warn' : 'callout-info';
      return `<div class="callout ${cls}">\n<strong>${type}:</strong> ${content.trim()}\n</div>`;
    }
  );

  // --- Contact cards (only for the contacts section) ---
  if (sectionId === 'contacts') {
    html = processContactCards(html);
  }

  // --- Auto-link cross-references ("see the X section") ---
  html = autoLinkCrossRefs(html);

  return html;
}

// --- Contact card processing ---
function processContactCards(html) {
  // Strategy: parse the HTML to find H3 + optional P + optional UL with contact info items
  // We work on the HTML string, finding patterns of <h3>...</h3> followed by content

  const lines = html.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check if this line starts an H3 (contact name)
    const h3Match = line.match(/^<h3>(.*?)<\/h3>$/);
    if (h3Match) {
      const name = h3Match[1];

      // Gather content after the H3
      i++;
      let descParagraphs = [];
      let contactItems = [];
      let extraContent = [];

      // Collect paragraphs and lists that follow
      while (i < lines.length) {
        const cur = lines[i].trim();

        // Stop at next H2 or H3 or section boundary
        if (cur.match(/^<h[23]>/) || cur === '') {
          if (cur === '') { i++; continue; }
          break;
        }

        // Check if this is a UL containing contact info
        if (cur.startsWith('<ul>')) {
          // Gather the full UL block
          let ulBlock = cur;
          while (i < lines.length && !ulBlock.includes('</ul>')) {
            i++;
            ulBlock += '\n' + lines[i];
          }
          i++;

          // Check if list items contain Phone:/Email:/Office: patterns
          const phoneMatch = ulBlock.match(/Phone:\s*(.*?)(?:<\/li>|$)/i);
          const emailMatch = ulBlock.match(/Email:\s*(.*?)(?:<\/li>|$)/i);
          const officeMatch = ulBlock.match(/Office:\s*(.*?)(?:<\/li>|$)/i);

          if (phoneMatch || emailMatch || officeMatch) {
            if (phoneMatch) contactItems.push({ type: 'phone', value: stripTags(phoneMatch[1]).trim() });
            if (emailMatch) contactItems.push({ type: 'email', value: stripTags(emailMatch[1]).trim() });
            if (officeMatch) contactItems.push({ type: 'location', value: stripTags(officeMatch[1]).trim() });
          } else {
            extraContent.push(ulBlock);
          }
          continue;
        }

        // Paragraph
        if (cur.startsWith('<p>')) {
          // Check for special non-description paragraphs like "EEMB Fax:"
          if (cur.match(/Fax:/i)) {
            extraContent.push(cur);
          } else {
            descParagraphs.push(stripTags(cur).trim());
          }
          i++;
          continue;
        }

        // Anything else, just keep as extra content
        extraContent.push(cur);
        i++;
      }

      // Build contact card HTML
      let card = '<div class="contact">';
      card += `<h3>${name}</h3>`;
      if (descParagraphs.length > 0) {
        card += `<p>${descParagraphs.join(' ')}</p>`;
      }
      if (contactItems.length > 0) {
        card += '<div class="contact-info">';
        for (const item of contactItems) {
          card += `<span>${ICONS[item.type]}${item.value}</span>`;
        }
        card += '</div>';
      }
      card += '</div>';
      result.push(card);

      // Add any extra content after the card
      if (extraContent.length > 0) {
        result.push(...extraContent);
      }
      continue;
    }

    result.push(line);
    i++;
  }

  return result.join('\n');
}

function stripTags(str) {
  return str.replace(/<[^>]*>/g, '');
}

// --- Build sidebar nav HTML ---
function buildNav() {
  let nav = '';

  for (const group of config.navGroups) {
    nav += `    <div class="nav-group-label">${group.label}</div>\n`;
    for (const sec of group.sections) {
      nav += `    <a class="nav-item" href="#${sec.id}"><span class="nav-num">${sec.num}</span>${sec.title}</a>\n`;
    }
    nav += '\n';
  }

  // Appendix
  if (config.appendix && config.appendix.length > 0) {
    nav += '    <div class="nav-group-label">Appendix</div>\n';
    for (const sec of config.appendix) {
      const badge = sec.badge || '';
      const badgeSpan = badge ? `<span class="nav-num">${badge}</span>` : '';
      nav += `    <a class="nav-item nav-item-appendix" href="#${sec.id}">${badgeSpan}${sec.title}</a>\n`;
    }
  }

  return nav;
}

// --- Build section HTML ---
function buildSections() {
  let sections = '';
  let allMarkdown = '';
  let sectionNum = 0;

  // All nav group sections
  for (const group of config.navGroups) {
    for (const sec of group.sections) {
      sectionNum++;
      const mdPath = path.join(ROOT, 'sections', sec.file);
      const md = fs.readFileSync(mdPath, 'utf8');
      const bodyHtml = convertMarkdown(md, sec.id);

      sections += `<!-- ═══ ${sectionNum}. ${sec.title.toUpperCase()} ═══ -->\n`;
      sections += `<div class="section" id="${sec.id}">\n`;
      sections += `<h1>${sec.title}</h1>\n`;
      sections += bodyHtml;
      sections += `</div>\n\n`;

      allMarkdown += md + '\n\n---\n\n';
    }
  }

  // Appendix sections
  for (const sec of config.appendix) {
    const mdPath = path.join(ROOT, sec.file);
    const md = fs.readFileSync(mdPath, 'utf8');
    const bodyHtml = convertMarkdown(md, sec.id);

    sections += `<!-- ═══ APPENDIX: ${sec.title.toUpperCase()} ═══ -->\n`;
    sections += `<div class="section" id="${sec.id}">\n`;
    sections += `<h1>${sec.title}</h1>\n`;
    sections += bodyHtml;
    sections += `</div>\n\n`;

    allMarkdown += md + '\n';
  }

  return { sections, allMarkdown };
}

// --- Main build ---
console.log('Building lab manual...');

const navHtml = buildNav();
const { sections: sectionsHtml, allMarkdown } = buildSections();

let output = template;
output = output.replace('{{NAV_ITEMS}}', navHtml);
output = output.replace('{{SECTIONS}}', sectionsHtml);
output = output.replace('{{DATE}}', dateStr);

// Write HTML
const htmlPath = path.join(ROOT, 'Stier_Lab_Manual.html');
fs.writeFileSync(htmlPath, output, 'utf8');
console.log(`  ✓ ${htmlPath}`);

// Write index.html for GitHub Pages
const indexPath = path.join(ROOT, 'index.html');
fs.writeFileSync(indexPath, output, 'utf8');
console.log(`  ✓ ${indexPath}`);

// Write combined markdown
const mdPath = path.join(ROOT, `Stier_Lab_Manual_${isoDate}.md`);
fs.writeFileSync(mdPath, allMarkdown, 'utf8');
console.log(`  ✓ ${mdPath}`);

console.log('Done!');
