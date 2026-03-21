import DOMPurify from 'dompurify';

const BODY_PURIFY = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'a'],
  ALLOWED_ATTR: ['href', 'class', 'style'],
  ALLOW_DATA_ATTR: false,
};

function escapeHtml(s) {
  if (s == null || s === '') return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseJsonArray(raw) {
  if (raw == null || raw === '') return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Build HTML for Main Cast + Line Notes using the same class names as review_html_enricher / RichTextDisplay.
 * Returns a fragment safe to prepend before Mammoth HTML inside one RichTextDisplay.
 */
export function buildStructuredReviewHtml(mainCastRaw, lineNotesRaw) {
  const castRows = parseJsonArray(mainCastRaw);
  const noteRows = parseJsonArray(lineNotesRaw);

  const parts = [];

  if (castRows.length > 0) {
    const lines = castRows
      .map((row) => {
        const actor = escapeHtml(row?.actor ?? '');
        const role = escapeHtml(row?.role ?? '');
        if (!actor && !role) return '';
        return (
          `<p class="cast-line">` +
          `<span class="cast-actor">${actor}</span> ` +
          `<span class="cast-as">as</span> ` +
          `<span class="cast-role">${role}</span>` +
          `</p>`
        );
      })
      .filter(Boolean);

    if (lines.length > 0) {
      parts.push(`<h1>Main Cast</h1><div class="cast-grid">${lines.join('')}</div>`);
    }
  }

  if (noteRows.length > 0) {
    const blocks = noteRows
      .map((row) => {
        const label = escapeHtml(row?.label ?? '');
        const bodyRaw = row?.body ?? '';
        const body =
          typeof bodyRaw === 'string' ? DOMPurify.sanitize(bodyRaw, BODY_PURIFY) : '';
        if (!label && !body) return '';
        return (
          `<div class="line-note">` +
          `<span class="line-note-tag">${label}</span>` +
          `<span class="line-note-body">${body}</span>` +
          `</div>`
        );
      })
      .filter(Boolean);

    if (blocks.length > 0) {
      parts.push(
        `<h1>Line Notes</h1><div class="line-notes-group">${blocks.join('')}</div>`
      );
    }
  }

  return parts.join('');
}
