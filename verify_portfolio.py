from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

from PIL import Image


ROOT = Path(__file__).parent


class PortfolioParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.heading_levels: list[str] = []
        self.links: list[dict[str, str | None]] = []
        self.images: list[dict[str, str | None]] = []
        self.local_assets: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)

        if values.get("id"):
            self.ids.append(str(values["id"]))

        if tag in {"h1", "h2", "h3"}:
            self.heading_levels.append(tag)

        if tag == "a":
            self.links.append(values)

        if tag == "img":
            self.images.append(values)

        for key in ("src", "href"):
            value = values.get(key)
            if not value:
                continue

            parsed = urlparse(value)
            if not parsed.scheme and not value.startswith(("#", "/")):
                self.local_assets.append(parsed.path)


html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "styles.css").read_text(encoding="utf-8")
script = (ROOT / "script.js").read_text(encoding="utf-8")

parser = PortfolioParser()
parser.feed(html)

assert len(parser.ids) == len(set(parser.ids)), "Duplicate HTML id found"
assert parser.heading_levels.count("h1") == 1, "Portfolio must have exactly one h1"

for required_id in ("main-content", "work", "about", "contact"):
    assert required_id in parser.ids, f"Missing required anchor: {required_id}"

for link in parser.links:
    href = link.get("href") or ""
    if href.startswith("#"):
        assert href[1:] in parser.ids, f"Broken anchor link: {href}"

    if link.get("target") == "_blank":
        rel = set((link.get("rel") or "").split())
        assert {"noopener", "noreferrer"}.issubset(rel), f"Unsafe external link: {href}"

for image in parser.images:
    assert image.get("alt") is not None, f"Missing alt text: {image.get('src')}"
    assert image.get("width") and image.get("height"), f"Missing image dimensions: {image.get('src')}"

for asset in parser.local_assets:
    assert (ROOT / asset).exists(), f"Missing local asset: {asset}"

assert css.count("{") == css.count("}"), "Unbalanced CSS braces"
assert "loader" not in html.lower(), "Loader markup should not remain"
assert "<canvas" not in html.lower(), "Canvas markup should not remain"
assert "contact-creature" not in html, "Mascot markup should not remain"
assert "IntersectionObserver" in script, "Progressive reveal behavior is missing"
assert "ResizeObserver" in script, "Responsive project rail rebuilding is missing"
assert "--rail-shift" in script, "Measured project rail loop is missing"
assert ".reveal-ready [data-reveal]" in css, "No-JS-safe reveal selector missing"

for image_path in (ROOT / "assets" / "projects").glob("*.webp"):
    assert image_path.stat().st_size < 200_000, f"Image exceeds 200 KB: {image_path.name}"

with Image.open(ROOT / "assets" / "og-image-2026.jpg") as og_image:
    assert og_image.size == (1200, 630), "Open Graph image must be 1200x630"

print(
    "Verified:",
    f"{len(parser.links)} links,",
    f"{len(parser.images)} images,",
    f"{len(parser.ids)} unique ids,",
    "safe external links, local assets, metadata image, and no-JS fallbacks.",
)
