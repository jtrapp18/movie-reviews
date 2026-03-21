"""
Post-process review HTML extracted from Word: add semantic classes for
Main Cast, Line Notes, and Verdict lines so the client can style them.

Idempotent: skips elements that already have the target classes.
"""

from __future__ import annotations

import json
import re
from html import escape

from bs4 import BeautifulSoup, NavigableString
from bs4.element import Tag

HEADING_TAGS = ("h1", "h2", "h3", "h4", "h5", "h6")

CAST_PATTERN = re.compile(r"^(.+?)\s+as\s+(.+)$", re.IGNORECASE | re.DOTALL)
VERDICT_PATTERN = re.compile(r"^\s*Verdict\s*:\s*(.+?)\s*$", re.IGNORECASE | re.DOTALL)
# MM:SS or HH:MM:SS (film timestamps); chip includes full label
TIME_LABEL_PATTERN = re.compile(r"^\d{1,2}:\d{2}(?::\d{2})?$")
OPENS_PATTERN = re.compile(r"^Opens\s*(.*)$", re.IGNORECASE | re.DOTALL)
# Plain-text line: "4:05 …", "00:00:00 …", optional em dash before body
TIME_PLAIN_PATTERN = re.compile(
    r"^(\d{1,2}:\d{2}(?::\d{2})?)\s*[—–\-]?\s*(.*)$", re.DOTALL
)


def _norm_heading(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip()).lower()


def _has_class(tag: Tag, name: str) -> bool:
    classes = tag.get("class") or []
    if isinstance(classes, str):
        return name == classes
    return name in classes


def _add_class(tag: Tag, name: str) -> None:
    if _has_class(tag, name):
        return
    classes = tag.get("class") or []
    if isinstance(classes, str):
        classes = [classes]
    tag["class"] = classes + [name]


def _strip_leading_ws_children(node: Tag) -> None:
    for child in list(node.children):
        if isinstance(child, NavigableString) and not str(child).strip():
            child.extract()


def _line_note_parse(p: Tag) -> tuple[str, str] | None:
    """
    Return (label, body_html) if paragraph matches a line-note row, else None.
    """
    if _has_class(p, "line-note"):
        return None
    full_text = p.get_text()
    if VERDICT_PATTERN.match(full_text.strip()):
        return None

    # Prefer structured runs first so body HTML is preserved (Mammoth: strong/b + rest)
    _strip_leading_ws_children(p)
    children = [
        c
        for c in p.children
        if not (isinstance(c, NavigableString) and not str(c).strip())
    ]
    if children:
        first = children[0]
        if getattr(first, "name", None) in ("strong", "b"):
            label = first.get_text(strip=True)
            rest = "".join(str(c) for c in children[1:]).strip()
            if TIME_LABEL_PATTERN.match(label) or label.lower() == "opens":
                return label, rest or ""

    # Flattened line (nested spans, or all-bold runs Mammoth emitted oddly)
    plain = full_text.strip()
    m = OPENS_PATTERN.match(plain)
    if m:
        return "Opens", (m.group(1) or "").strip()

    m = TIME_PLAIN_PATTERN.match(plain)
    if m:
        body = (m.group(2) or "").strip()
        return m.group(1), body

    return None


def _cast_parse(p: Tag) -> tuple[str, str] | None:
    if _has_class(p, "cast-line"):
        return None
    text = re.sub(r"\s+", " ", p.get_text()).strip()
    m = CAST_PATTERN.match(text)
    if not m:
        return None
    return m.group(1).strip(), m.group(2).strip()


def _replace_with_cast_line(soup: BeautifulSoup, p: Tag, actor: str, role: str) -> None:
    new_p = soup.new_tag("p", attrs={"class": "cast-line"})
    aspan = soup.new_tag("span", attrs={"class": "cast-actor"})
    aspan.string = actor
    s_as = soup.new_tag("span", attrs={"class": "cast-as"})
    s_as.string = "as"
    rspan = soup.new_tag("span", attrs={"class": "cast-role"})
    rspan.string = role
    new_p.append(aspan)
    new_p.append(" ")
    new_p.append(s_as)
    new_p.append(" ")
    new_p.append(rspan)
    p.replace_with(new_p)


def _replace_with_line_note(
    soup: BeautifulSoup, p: Tag, label: str, body_html: str
) -> None:
    div = soup.new_tag("div", attrs={"class": "line-note"})
    tag_span = soup.new_tag("span", attrs={"class": "line-note-tag"})
    tag_span.string = label
    body_span = soup.new_tag("span", attrs={"class": "line-note-body"})
    body_frag = BeautifulSoup(body_html, "html.parser")
    for node in list(body_frag.contents):
        body_span.append(node)
    div.append(tag_span)
    div.append(body_span)
    p.replace_with(div)


def _iter_block_nodes_after_heading(heading: Tag) -> list[Tag]:
    """Siblings after heading until the next h1–h6."""
    out: list[Tag] = []
    sib = heading.next_sibling
    while sib is not None:
        if isinstance(sib, NavigableString):
            sib = sib.next_sibling
            continue
        if isinstance(sib, Tag) and sib.name in HEADING_TAGS:
            break
        if isinstance(sib, Tag):
            out.append(sib)
        sib = sib.next_sibling
    return out


def _wrap_cast_grid(soup: BeautifulSoup, heading: Tag) -> None:
    """Wrap consecutive p.cast-line after heading in div.cast-grid for two-column layout."""
    sib = heading.next_sibling
    if isinstance(sib, Tag) and sib.name == "div" and _has_class(sib, "cast-grid"):
        return
    paras: list[Tag] = []
    sib = heading.next_sibling
    while sib is not None:
        if isinstance(sib, NavigableString):
            sib = sib.next_sibling
            continue
        if isinstance(sib, Tag) and sib.name in HEADING_TAGS:
            break
        if isinstance(sib, Tag) and sib.name == "p" and _has_class(sib, "cast-line"):
            paras.append(sib)
        sib = sib.next_sibling
    if len(paras) < 1:
        return
    div = soup.new_tag("div", attrs={"class": "cast-grid"})
    paras[0].insert_before(div)
    for p in paras:
        div.append(p.extract())


def _enrich_cast_section(soup: BeautifulSoup, heading: Tag) -> None:
    for node in _iter_block_nodes_after_heading(heading):
        if node.name != "p":
            continue
        parsed = _cast_parse(node)
        if parsed:
            _replace_with_cast_line(soup, node, escape(parsed[0]), escape(parsed[1]))
    _wrap_cast_grid(soup, heading)


def _enrich_line_notes_section(soup: BeautifulSoup, heading: Tag) -> None:
    for node in _iter_block_nodes_after_heading(heading):
        if node.name != "p":
            continue
        if _has_class(node, "verdict"):
            continue
        parsed = _line_note_parse(node)
        if parsed:
            label, body_html = parsed
            _replace_with_line_note(soup, node, escape(label), body_html)


def _enrich_verdicts(soup: BeautifulSoup) -> None:
    for p in soup.find_all("p"):
        if _has_class(p, "verdict"):
            continue
        if not p.get_text(strip=True):
            continue
        if VERDICT_PATTERN.match(p.get_text().strip()):
            _add_class(p, "verdict")


def _collect_cast_rows_after_heading(heading: Tag) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for node in _iter_block_nodes_after_heading(heading):
        if node.name != "p":
            continue
        parsed = _cast_parse(node)
        if parsed:
            rows.append({"actor": parsed[0], "role": parsed[1]})
    return rows


def _collect_line_notes_after_heading(heading: Tag) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for node in _iter_block_nodes_after_heading(heading):
        if node.name != "p":
            continue
        if _has_class(node, "verdict"):
            continue
        if VERDICT_PATTERN.match(node.get_text().strip()):
            continue
        parsed = _line_note_parse(node)
        if parsed:
            label, body_html = parsed
            rows.append({"label": label, "body": body_html})
    return rows


def extract_main_cast_line_notes_from_review_html(
    html: str,
) -> tuple[str | None, str | None]:
    """
    Extract Main Cast and Line Notes using the same section detection and parsers as enrich_review_html.

    Returns JSON strings (or None when empty / no matching sections) suitable for Text columns.
    """
    if not html or not html.strip():
        return None, None

    soup = BeautifulSoup(html, "html.parser")

    cast_rows: list[dict[str, str]] = []
    line_note_rows: list[dict[str, str]] = []

    headings = soup.find_all(HEADING_TAGS)
    had_main_cast_heading = any(
        _norm_heading(h.get_text()) == "main cast" for h in headings
    )
    had_line_notes_heading = any(
        _norm_heading(h.get_text()) in ("line notes", "line note") for h in headings
    )

    for heading in headings:
        title = _norm_heading(heading.get_text())
        if title == "main cast":
            cast_rows.extend(_collect_cast_rows_after_heading(heading))
        elif title in ("line notes", "line note"):
            line_note_rows.extend(_collect_line_notes_after_heading(heading))

    if not had_main_cast_heading:
        for p in soup.find_all("p"):
            if _has_class(p, "cast-line"):
                continue
            if _norm_heading(p.get_text()) == "main cast":
                cast_rows.extend(_collect_cast_rows_after_heading(p))
                break

    if not had_line_notes_heading:
        for p in soup.find_all("p"):
            if _has_class(p, "line-note"):
                continue
            if _norm_heading(p.get_text()) in ("line notes", "line note"):
                line_note_rows.extend(_collect_line_notes_after_heading(p))
                break

    main_cast_json = json.dumps(cast_rows, ensure_ascii=False) if cast_rows else None
    line_notes_json = (
        json.dumps(line_note_rows, ensure_ascii=False) if line_note_rows else None
    )
    return main_cast_json, line_notes_json


def enrich_review_html(html: str) -> str:
    """
    Add semantic classes to review HTML. Safe to call on any fragment; no-op if empty.

    Recognizes section titles as real headings (h1–h6) *or* as a paragraph whose text
    is only "Main Cast" / "Line Notes" — Mammoth often emits the latter from Word.
    """
    if not html or not html.strip():
        return html

    soup = BeautifulSoup(html, "html.parser")

    headings = soup.find_all(HEADING_TAGS)
    had_main_cast_heading = any(
        _norm_heading(h.get_text()) == "main cast" for h in headings
    )
    had_line_notes_heading = any(
        _norm_heading(h.get_text()) in ("line notes", "line note") for h in headings
    )

    for heading in headings:
        title = _norm_heading(heading.get_text())
        if title == "main cast":
            _enrich_cast_section(soup, heading)
        elif title in ("line notes", "line note"):
            _enrich_line_notes_section(soup, heading)

    # Mammoth / Word: "Line Notes" is often a normal paragraph, not a Heading style
    if not had_main_cast_heading:
        for p in soup.find_all("p"):
            if _has_class(p, "cast-line"):
                continue
            if _norm_heading(p.get_text()) == "main cast":
                _enrich_cast_section(soup, p)
                break

    if not had_line_notes_heading:
        for p in soup.find_all("p"):
            if _has_class(p, "line-note"):
                continue
            if _norm_heading(p.get_text()) in ("line notes", "line note"):
                _enrich_line_notes_section(soup, p)
                break

    _enrich_verdicts(soup)

    return str(soup)
