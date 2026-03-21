"""Tests for review HTML semantic enrichment."""

import json
import sys
from pathlib import Path

# src layout
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from movie_reviews.utils.review_html_enricher import (
    enrich_review_html,
    extract_main_cast_line_notes_from_review_html,
)


def test_cast_line_notes_verdict():
    html = (
        "<h1>Main Cast</h1>"
        "<p>August Diehl as Franz Jägerstätter</p>"
        "<h1>Line Notes</h1>"
        "<p><strong>4:05</strong> the first shot</p>"
        "<p>Verdict: Gold</p>"
    )
    out = enrich_review_html(html)
    assert 'class="cast-grid"' in out
    assert 'class="cast-line"' in out
    assert 'class="cast-actor"' in out
    assert 'class="line-note"' in out
    assert 'class="line-note-tag"' in out
    assert 'class="verdict"' in out


def test_line_notes_title_as_paragraph_like_mammoth():
    """Word/Mammoth often uses a normal paragraph for 'Line Notes', not a Heading style."""
    html = (
        "<p>Main Cast</p>"
        "<p>August Diehl as Franz Jägerstätter</p>"
        "<p>Line Notes</p>"
        "<p><strong>1:00</strong> opening</p>"
    )
    out = enrich_review_html(html)
    assert 'class="cast-grid"' in out
    assert 'class="line-note"' in out


def test_line_note_hhmmss_timestamp():
    html = (
        "<h1>Line Notes</h1>"
        "<p><strong>00:00:00</strong> opening</p>"
        "<p><strong>1:13:17</strong> scene</p>"
    )
    out = enrich_review_html(html)
    assert "00:00:00" in out
    assert "1:13:17" in out
    assert out.count("line-note-tag") == 2


def test_idempotent_cast():
    html = '<p class="cast-line"><span class="cast-actor">A</span></p>'
    out = enrich_review_html(html)
    assert out.count("cast-line") == 1
    assert "cast-as" not in out


def test_extract_main_cast_line_notes_json():
    html = (
        "<h1>Main Cast</h1>"
        "<p>August Diehl as Franz Jägerstätter</p>"
        "<h1>Line Notes</h1>"
        "<p><strong>4:05</strong> the first shot</p>"
        "<p>Verdict: Gold</p>"
    )
    main_cast, line_notes = extract_main_cast_line_notes_from_review_html(html)
    assert main_cast is not None
    assert line_notes is not None
    cast_data = json.loads(main_cast)
    assert cast_data == [{"actor": "August Diehl", "role": "Franz Jägerstätter"}]
    notes_data = json.loads(line_notes)
    assert len(notes_data) == 1
    assert notes_data[0]["label"] == "4:05"
    assert "first shot" in notes_data[0]["body"]
