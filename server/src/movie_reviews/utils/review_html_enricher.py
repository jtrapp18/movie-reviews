"""
Post-process review HTML extracted from Word: add semantic classes for
Main Cast, Line Notes, and Verdict lines so the client can style them.

Idempotent: skips elements that already have the target classes.
"""

from __future__ import annotations

import re
from html import escape

from bs4 import BeautifulSoup, NavigableString
from bs4.element import Tag

HEADING_TAGS = ("h1", "h2", "h3", "h4", "h5", "h6")

CAST_PATTERN = re.compile(r"^(.+?)\s+as\s+(.+)$", re.IGNORECASE | re.DOTALL)
VERDICT_PATTERN = re.compile(r"^\s*Verdict\s*:\s*(.+?)\s*$", re.IGNORECASE | re.DOTALL)
TIME_LABEL_PATTERN = re.compile(r"^\d{1,2}:\d{2}$")
OPENS_PATTERN = re.compile(r"^Opens\s*(.*)$", re.IGNORECASE | re.DOTALL)
# Plain-text line: "4:05" or "4:05 —" then body
TIME_PLAIN_PATTERN = re.compile(r"^(\d{1,2}:\d{2})\s*[—–\-]?\s*(.*)$", re.DOTALL)


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

    # <p><strong>4:05</strong> description…</p> or <strong>Opens</strong>
    _strip_leading_ws_children(p)
    children = [
        c
        for c in p.children
        if not (isinstance(c, NavigableString) and not str(c).strip())
    ]
    if not children:
        return None

    first = children[0]
    if getattr(first, "name", None) == "strong":
        label = first.get_text(strip=True)
        rest = "".join(str(c) for c in children[1:]).strip()
        if TIME_LABEL_PATTERN.match(label) or label.lower() == "opens":
            return label, rest or ""

    # Plain text: "4:05 — …" or "Opens …"
    plain = full_text.strip()
    m = OPENS_PATTERN.match(plain)
    if m:
        return "Opens", (m.group(1) or "").strip()

    m = TIME_PLAIN_PATTERN.match(plain)
    if m and m.group(2).strip():
        return m.group(1), m.group(2).strip()

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


def _enrich_cast_section(soup: BeautifulSoup, heading: Tag) -> None:
    for node in _iter_block_nodes_after_heading(heading):
        if node.name != "p":
            continue
        parsed = _cast_parse(node)
        if parsed:
            _replace_with_cast_line(soup, node, escape(parsed[0]), escape(parsed[1]))


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


def enrich_review_html(html: str) -> str:
    """
    Add semantic classes to review HTML. Safe to call on any fragment; no-op if empty.
    """
    if not html or not html.strip():
        return html

    soup = BeautifulSoup(html, "html.parser")

    for heading in soup.find_all(HEADING_TAGS):
        title = _norm_heading(heading.get_text())
        if title == "main cast":
            _enrich_cast_section(soup, heading)
        elif title in ("line notes", "line note"):
            _enrich_line_notes_section(soup, heading)

    _enrich_verdicts(soup)

    return str(soup)
