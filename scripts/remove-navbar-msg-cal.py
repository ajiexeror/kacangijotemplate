"""Remove Pesan + Kalender navbar buttons from all *.html in repo root."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent

PATTERN = re.compile(
    r"\n\s*<button[^>]*aria-label=\"Pesan\"[\s\S]*?</button>\s*"
    r"<button[^>]*aria-label=\"Kalender\"[\s\S]*?</button>\s*",
    re.MULTILINE,
)

for p in ROOT.glob("*.html"):
    text = p.read_text(encoding="utf-8")
    new, n = PATTERN.subn("\n", text, count=1)
    if n == 0:
        print("no match:", p.name)
        continue
    p.write_text(new, encoding="utf-8", newline="")
    print("patched:", p.name)
