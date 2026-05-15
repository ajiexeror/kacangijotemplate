"""Normalize profile dropdown markup (remove extra blank lines from bad patch)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

CLEAN = """                <div class="profile-dropdown-header profile-dropdown-header--row">
                  <img
                    class="profile-dropdown-header__avatar rounded-circle"
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jack"
                    alt=""
                    width="44"
                    height="44"
                  />
                  <div class="profile-dropdown-header__meta">
                    <div class="profile-dropdown-name">Toby Belhome</div>
                    <div class="profile-dropdown-email">hello@tobybelhome.com</div>
                  </div>
                </div>
                <div class="profile-dropdown-body">
                  <a class="profile-dropdown-item" href="#">
                    <span class="profile-dropdown-icon" aria-hidden="true"><i class="bi bi-person"></i></span>
                    Profil
                  </a>
                  <a class="profile-dropdown-item" href="#" @click.prevent="closeProfile(); toggleNotif();">
                    <span class="profile-dropdown-icon" aria-hidden="true"><i class="bi bi-bell"></i></span>
                    Notifikasi
                  </a>
                  <div class="profile-dropdown-divider" role="separator" aria-hidden="true"></div>
                  <button type="button" class="profile-dropdown-item profile-dropdown-item--button profile-dropdown-item--logout" id="logoutBtn">
                    <span class="profile-dropdown-icon" aria-hidden="true"><i class="bi bi-box-arrow-right"></i></span>
                    Logout
                  </button>
                </div>"""

# Blob: header row through body close (before dropdown-menu outer </div>)
PAT = re.compile(
    r"\n                <div class=\"profile-dropdown-header profile-dropdown-header--row\">[\s\S]*?\n                </div>\n              </div>\n            </div>",
    re.MULTILINE,
)

REPL = "\n" + CLEAN + "\n              </div>\n            </div>"


def main() -> int:
    n = 0
    for path in sorted(ROOT.glob("*.html")):
        text = path.read_text(encoding="utf-8")
        if "profile-dropdown-header--row" not in text:
            continue
        new_text, c = PAT.subn(REPL, text, count=1)
        if c != 1:
            print(f"[warn] {path.name}: replaced {c}", file=sys.stderr)
            continue
        path.write_text(new_text, encoding="utf-8")
        n += 1
        print(path.name)
    print(f"Fixed {n} file(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
