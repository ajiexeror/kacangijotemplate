"""Replace profile dropdown inner markup across *.html in repo root."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Inner content only: from profile-dropdown-header through profile-dropdown footer (inclusive)
OLD_INNER = re.compile(
    r'(\s*)<div class="profile-dropdown-header">.*?</div>\s*'
    r'<div class="profile-dropdown-body">.*?</div>\s*'
    r'<div class="profile-dropdown-footer">.*?</div>',
    re.DOTALL,
)

NEW_INNER = r'''\1<div class="profile-dropdown-header profile-dropdown-header--row">
\1  <img
\1    class="profile-dropdown-header__avatar rounded-circle"
\1    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jack"
\1    alt=""
\1    width="44"
\1    height="44"
\1  />
\1  <div class="profile-dropdown-header__meta">
\1    <div class="profile-dropdown-name">Toby Belhome</div>
\1    <div class="profile-dropdown-email">hello@tobybelhome.com</div>
\1  </div>
\1</div>
\1<div class="profile-dropdown-body">
\1  <a class="profile-dropdown-item" href="#">
\1    <span class="profile-dropdown-icon" aria-hidden="true"><i class="bi bi-person"></i></span>
\1    Profil
\1  </a>
\1  <a class="profile-dropdown-item" href="#" @click.prevent="closeProfile(); toggleNotif();">
\1    <span class="profile-dropdown-icon" aria-hidden="true"><i class="bi bi-bell"></i></span>
\1    Notifikasi
\1  </a>
\1  <div class="profile-dropdown-divider" role="separator" aria-hidden="true"></div>
\1  <button type="button" class="profile-dropdown-item profile-dropdown-item--button profile-dropdown-item--logout" id="logoutBtn">
\1    <span class="profile-dropdown-icon" aria-hidden="true"><i class="bi bi-box-arrow-right"></i></span>
\1    Logout
\1  </button>
\1</div>'''


def main() -> int:
    n_files = 0
    for path in sorted(ROOT.glob("*.html")):
        text = path.read_text(encoding="utf-8")
        if "profile-dropdown-header" not in text:
            continue
        new_text, count = OLD_INNER.subn(NEW_INNER, text, count=1)
        if count != 1:
            print(f"[skip] {path.name}: match count={count}", file=sys.stderr)
            continue
        path.write_text(new_text, encoding="utf-8")
        n_files += 1
        print(path.name)
    print(f"Patched {n_files} file(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
