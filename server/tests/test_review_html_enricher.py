"""Tests for review HTML semantic enrichment."""

import sys
from pathlib import Path

# src layout
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from movie_reviews.utils.review_html_enricher import enrich_review_html


def test_cast_line_notes_verdict():
    html = (
        "<h1>Main Cast</h1>"
        "<p>August Diehl as Franz Jägerstätter</p>"
        "<h1>Line Notes</h1>"
        "<p><strong>4:05</strong> the first shot</p>"
        "<p>Verdict: Gold</p>"
    )
    out = enrich_review_html(html)
    assert 'class="cast-line"' in out
    assert 'class="cast-actor"' in out
    assert 'class="line-note"' in out
    assert 'class="line-note-tag"' in out
    assert 'class="verdict"' in out


def test_idempotent_cast():
    html = '<p class="cast-line"><span class="cast-actor">A</span></p>'
    out = enrich_review_html(html)
    assert out.count("cast-line") == 1
    assert "cast-as" not in out
