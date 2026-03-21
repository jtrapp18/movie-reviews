/**
 * Cache Mammoth + /api/enrich_review_html output keyed by SHA-256 of the raw .docx bytes.
 * Same document → skip conversion and enrich on repeat visits (localStorage + in-memory).
 */

/** Bump when enricher output shape changes (invalidates stale localStorage). */
const PREFIX = 'mr:enrichedDoc:v3:';

const LOG = '[word-pipeline]';

/** Dev builds, or set localStorage DEBUG_WORD_PIPELINE=1 and reload (prod troubleshooting). */
export function isWordPipelineDebugEnabled() {
  try {
    if (import.meta.env?.DEV) return true;
  } catch {
    /* ignore */
  }
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem('DEBUG_WORD_PIPELINE') === '1';
  } catch {
    return false;
  }
}

/** Uses `console.debug` so DevTools can hide it via the default level filter (show “Verbose” to see). */
export function logWordPipeline(...args) {
  if (isWordPipelineDebugEnabled()) {
    console.debug(LOG, ...args);
  }
}

/** Rough counts of semantic classes from enricher (for debugging). */
export function getEnrichHtmlMarkers(html) {
  if (!html || typeof html !== 'string') {
    return { len: 0, castGrid: 0, castLine: 0, lineNote: 0, verdict: 0 };
  }
  const n = (needle) => html.split(needle).length - 1;
  return {
    len: html.length,
    castGrid: n('cast-grid'),
    castLine: n('cast-line'),
    /* row wrapper, not line-note-tag substring */
    lineNote: n('class="line-note"') + n("class='line-note'"),
    verdict: n('class="verdict"') + n("class='verdict'"),
  };
}
/** Skip persisting huge HTML to avoid QuotaExceededError */
const MAX_STORE_CHARS = 2 * 1024 * 1024;

const memory = new Map();

export async function sha256Hex(arrayBuffer) {
  const digest = await crypto.subtle.digest('SHA-256', arrayBuffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getCachedEnrichedHtml(docHash) {
  if (!docHash) return null;
  if (memory.has(docHash)) {
    logWordPipeline('cache hit (memory)', docHash.slice(0, 12), getEnrichHtmlMarkers(memory.get(docHash)));
    return memory.get(docHash);
  }
  try {
    const raw = localStorage.getItem(PREFIX + docHash);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.html === 'string') {
      memory.set(docHash, parsed.html);
      logWordPipeline('cache hit (localStorage)', docHash.slice(0, 12), getEnrichHtmlMarkers(parsed.html));
      return parsed.html;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function setCachedEnrichedHtml(docHash, html) {
  if (!docHash || typeof html !== 'string') return;
  memory.set(docHash, html);
  if (html.length > MAX_STORE_CHARS) return;
  try {
    localStorage.setItem(
      PREFIX + docHash,
      JSON.stringify({ html, ts: Date.now() })
    );
  } catch (e) {
    console.warn('enrichedDocCache: localStorage set failed', e);
  }
}

/** Clear all cached enriched docs (e.g. after deploy that changes enrich rules). */
export function clearEnrichedDocCache() {
  memory.clear();
  try {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

export async function fetchEnrichedHtml(rawHtml) {
  logWordPipeline('enrich API request', {
    mammothLen: rawHtml?.length,
    markers: getEnrichHtmlMarkers(rawHtml),
  });
  try {
    const enrichRes = await fetch('/api/enrich_review_html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: rawHtml }),
    });
    if (enrichRes.ok) {
      const data = await enrichRes.json();
      if (data && typeof data.html === 'string') {
        logWordPipeline('enrich API ok', {
          outLen: data.html.length,
          markers: getEnrichHtmlMarkers(data.html),
          unchanged: data.html === rawHtml,
        });
        return data.html;
      }
      logWordPipeline('enrich API ok but no html string in JSON', data);
    } else {
      const errBody = await enrichRes.text().catch(() => '');
      console.warn(LOG, 'enrich API HTTP error', enrichRes.status, errBody.slice(0, 400));
    }
  } catch (e) {
    console.warn(LOG, 'enrich API fetch failed', e);
  }
  logWordPipeline('enrich fallback: returning raw Mammoth HTML (no classes added)');
  return rawHtml;
}
