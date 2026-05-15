"""Replace legacy notif dropdown block (multiline) in all *.html."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent

NEW = '''              <div
                class="dropdown-menu dropdown-menu-end notif-dropdown"
                aria-labelledby="notifDropdown"
                x-show="notifOpen"
                x-transition.opacity
                @click.outside="closeNotif()"
                style="display: none"
              >
                <div class="notif-dropdown__header">
                  <span class="notif-dropdown__title">Notifikasi</span>
                  <a href="#" class="notif-dropdown__link-all">Lihat semua</a>
                </div>
                <div class="notif-dropdown__list">
                  <a href="#" class="notif-dropdown__item notif-item notif-dropdown__item--unread">
                    <span class="notif-dropdown__avatar">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Andi" alt="" width="40" height="40" class="rounded-circle" />
                    </span>
                    <div class="notif-dropdown__body">
                      <p class="notif-dropdown__subject">Pembayaran diterima</p>
                      <p class="notif-dropdown__message">SPP Januari telah dibayar untuk Andi Pratama.</p>
                      <div class="notif-dropdown__time">
                        <i class="bi bi-clock" aria-hidden="true"></i>
                        <span>2 menit lalu</span>
                      </div>
                    </div>
                    <span class="notif-dropdown__unread-dot" aria-hidden="true"></span>
                  </a>
                  <a href="#" class="notif-dropdown__item notif-item">
                    <span class="notif-dropdown__avatar">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Budi" alt="" width="40" height="40" class="rounded-circle" />
                    </span>
                    <div class="notif-dropdown__body">
                      <p class="notif-dropdown__subject">Tagihan baru</p>
                      <p class="notif-dropdown__message">Kelas 10A — uang gedung menunggu konfirmasi.</p>
                      <div class="notif-dropdown__time">
                        <i class="bi bi-clock" aria-hidden="true"></i>
                        <span>1 jam lalu</span>
                      </div>
                    </div>
                  </a>
                  <div class="notif-dropdown__item notif-item notif-dropdown__item--unread notif-dropdown__item--actions">
                    <span class="notif-dropdown__avatar">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Citra" alt="" width="40" height="40" class="rounded-circle" />
                    </span>
                    <div class="notif-dropdown__body">
                      <p class="notif-dropdown__subject">Undangan rapat orang tua</p>
                      <p class="notif-dropdown__message">Anda diundang ke rapat koordinasi kelas XI IPA 1.</p>
                      <div class="notif-dropdown__time">
                        <i class="bi bi-clock" aria-hidden="true"></i>
                        <span>1 hari lalu</span>
                      </div>
                      <div class="notif-dropdown__actions">
                        <button type="button" class="notif-dropdown__btn notif-dropdown__btn--outline">Terima</button>
                        <button type="button" class="notif-dropdown__btn notif-dropdown__btn--danger">Tolak</button>
                      </div>
                    </div>
                    <span class="notif-dropdown__unread-dot" aria-hidden="true"></span>
                  </div>
                  <a href="#" class="notif-dropdown__item notif-item">
                    <span class="notif-dropdown__avatar">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi" alt="" width="40" height="40" class="rounded-circle" />
                    </span>
                    <div class="notif-dropdown__body">
                      <p class="notif-dropdown__subject">Absensi</p>
                      <p class="notif-dropdown__message">5 murid belum hadir hari ini.</p>
                      <div class="notif-dropdown__time">
                        <i class="bi bi-clock" aria-hidden="true"></i>
                        <span>Hari ini</span>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            '''

for p in ROOT.glob("*.html"):
    text = p.read_text(encoding="utf-8")
    m = re.search(
        r'<div\s*\n\s*class="dropdown-menu dropdown-menu-end shadow-lg border-0 p-0 notif-dropdown"',
        text,
    )
    if not m:
        print("skip (no marker):", p.name)
        continue
    start = m.start()
    end = text.find('<div class="dropdown ms-1">', m.end())
    if end == -1:
        print("skip (no profile dropdown):", p.name)
        continue
    # include leading whitespace line break before <div menu — keep same indent as original opening
    text = text[:start] + NEW + text[end:]
    p.write_text(text, encoding="utf-8", newline="")
    print("patched:", p.name)
