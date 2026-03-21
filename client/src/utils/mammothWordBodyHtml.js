/**
 * Mammoth HTML for the Word viewer: cast / line notes are shown from DB + prepended HTML.
 * This strips duplicate sections still present in the .docx so they are not shown twice.
 *
 * Rule: find the first h1 whose text includes the needle (normalized), remove that node and
 * every following sibling until the next h1 (exclusive). O(n) in fragment size.
 */

function normHeadingText(s) {
  return s.replace(/\s+/g, ' ').trim().toLowerCase();
}

function stripH1SectionUntilNextH1(body, needle) {
  const h1s = Array.from(body.querySelectorAll('h1'));
  for (const h1 of h1s) {
    const t = normHeadingText(h1.textContent);
    if (!t.includes(needle)) continue;

    let cur = h1;
    while (cur) {
      const next = cur.nextSibling;
      const nextIsH1 =
        next && next.nodeType === Node.ELEMENT_NODE && next.nodeName === 'H1';
      cur.remove();
      if (nextIsH1) break;
      cur = next;
    }
    return;
  }
}

/**
 * @param {string} html — raw Mammoth output
 * @returns {string}
 */
export function stripMammothDuplicateSections(html) {
  if (!html || typeof html !== 'string') return html;

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const body = doc.body;
  if (!body) return html;

  /* Typical order; "line note" matches "Line Notes" as well */
  stripH1SectionUntilNextH1(body, 'main cast');
  stripH1SectionUntilNextH1(body, 'line note');

  return body.innerHTML;
}
