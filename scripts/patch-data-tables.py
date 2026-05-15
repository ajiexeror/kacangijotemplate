# -*- coding: utf-8 -*-
"""Align murid/guru/tagihan/payment/absensi tables with dash-latest-payments (index) pattern."""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]

SIDEBAR_OLD = """            <li class="nav-item">
              <a class="nav-link" href="#"><i class="bi bi-shield-lock"></i><span>Role</span></a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#"><i class="bi bi-key"></i><span>Permission</span></a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#"><i class="bi bi-person-lines-fill"></i><span>User</span></a>
            </li>
          </ul>

          <div class="nav-section-label mt-4">Settings</div>
          <ul class="nav flex-column gap-1">
            <li class="nav-item">
              <a class="nav-link" href="#"><i class="bi bi-gear"></i><span>Web Setting</span></a>
            </li>"""

SIDEBAR_NEW = """            <li class="nav-item">
              <a class="nav-link" href="role.html"><i class="bi bi-shield-lock"></i><span>Role</span></a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="permission.html"><i class="bi bi-key"></i><span>Permission</span></a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="user.html"><i class="bi bi-person-lines-fill"></i><span>User</span></a>
            </li>
          </ul>

          <div class="nav-section-label mt-4">Settings</div>
          <ul class="nav flex-column gap-1">
            <li class="nav-item">
              <a class="nav-link" href="setting.html"><i class="bi bi-gear"></i><span>Web Setting</span></a>
            </li>"""


def footer_block(page_id: str, aria: str) -> str:
    return f"""              <div class="dash-latest-payments__footer d-flex flex-wrap align-items-center justify-content-between gap-3 px-5 py-4">
                <p class="dash-latest-payments__selection mb-0 text-muted" id="{page_id}PageInfo" x-text="pageInfo"></p>
                <div class="d-flex align-items-center gap-1" aria-label="{aria}">
                  <button
                    type="button"
                    class="dash-latest-payments__page-btn"
                    :disabled="page <= 1"
                    @click="setPage(page - 1)"
                    aria-label="Halaman sebelumnya"
                  >
                    <i class="bi bi-chevron-left" aria-hidden="true"></i>
                  </button>
                  <template x-for="p in pagination" :key="'pg-' + String(p)">
                    <button
                      type="button"
                      class="dash-latest-payments__page-btn"
                      :disabled="p === '...'"
                      :class="{{ 'is-active': p === page && p !== '...', 'opacity-50': p === '...' }}"
                      :aria-current="p === page && p !== '...' ? 'page' : null"
                      :aria-label="p === '...' ? 'Lainnya' : ('Halaman ' + p)"
                      @click="p !== '...' && setPage(p)"
                      x-text="p === '...' ? '…' : p"
                    ></button>
                  </template>
                  <button
                    type="button"
                    class="dash-latest-payments__page-btn"
                    :disabled="page >= totalPages"
                    @click="setPage(page + 1)"
                    aria-label="Halaman berikutnya"
                  >
                    <i class="bi bi-chevron-right" aria-hidden="true"></i>
                  </button>
                </div>
              </div>"""


def toolbar(title: str, subtitle: str, page_id: str, search_id: str, placeholder: str, btn_id: str, btn_label: str) -> str:
    return f"""              <div class="dash-latest-payments__toolbar d-flex flex-wrap align-items-start justify-content-between gap-3 px-5 pt-5 pb-4">
                <div class="min-w-0 flex-grow-1">
                  <h2 class="dash-latest-payments__title mb-1">{title}</h2>
                  <p class="dash-latest-payments__subtitle text-muted mb-0">{subtitle}</p>
                </div>
                <div class="d-flex flex-wrap align-items-center justify-content-end gap-2 flex-shrink-0">
                  <div class="d-flex align-items-center gap-2">
                    <span class="text-muted" style="font-size: 14px; font-weight: 400">Tampilkan</span>
                    <select
                      id="{page_id}PageSize"
                      class="form-select form-select-sm rounded-3 border-0 bg-body-secondary"
                      style="width: auto; min-width: 4.5rem"
                      aria-label="Jumlah baris per halaman"
                      x-model.number="pageSize"
                      @change="page = 1"
                    >
                      <template x-for="s in pageSizes" :key="s">
                        <option :value="s" x-text="s"></option>
                      </template>
                    </select>
                    <span class="text-muted" style="font-size: 14px; font-weight: 400">baris</span>
                  </div>
                  <input
                    type="search"
                    id="{search_id}"
                    class="form-control form-control-sm dash-latest-payments__filter-input"
                    placeholder="{placeholder}"
                    autocomplete="off"
                    aria-label="Cari"
                    x-model.debounce.200ms="query"
                    @input="page = 1"
                  />
                  <button type="button" class="btn btn-sm btn-primary rounded-3 px-3 flex-shrink-0 text-nowrap" id="{btn_id}" @click="openCreate()">
                    <i class="bi bi-plus-lg me-1"></i> {btn_label}
                  </button>
                </div>
              </div>"""


PAGES = {
    "murid.html": {
        "page_id": "murid",
        "title": "Data murid",
        "subtitle": "Daftar murid, kelas, dan status akademik.",
        "search_id": "searchMurid",
        "placeholder": "NIS, nama, kelas, atau orang tua…",
        "btn_id": "btnTambahMurid",
        "btn_label": "Tambah murid",
        "aria": "Navigasi halaman tabel murid",
        "thead": """                    <thead>
                      <tr>
                        <th class="dash-latest-payments__th" style="width: 3rem" scope="col" role="button" tabindex="0" @click="setSort('id')">#</th>
                        <th class="dash-latest-payments__th text-nowrap" scope="col" role="button" tabindex="0" @click="setSort('nis')">NIS</th>
                        <th class="dash-latest-payments__th" scope="col" role="button" tabindex="0" @click="setSort('nama')">Nama</th>
                        <th class="dash-latest-payments__th" scope="col" role="button" tabindex="0" @click="setSort('kelas')">Kelas</th>
                        <th class="dash-latest-payments__th" scope="col" role="button" tabindex="0" @click="setSort('ortu')">Orang tua</th>
                        <th class="dash-latest-payments__th text-nowrap" scope="col" role="button" tabindex="0" @click="setSort('status')">Status</th>
                        <th class="dash-latest-payments__th text-end" style="width: 8rem" scope="col">Aksi</th>
                      </tr>
                    </thead>""",
        "rows": """                    <tbody id="muridTableBody">
                      <template x-for="row in pagedRows" :key="row.id">
                        <tr class="dash-latest-payments__tr" :data-id="row.id" :data-nis="row.nis">
                          <td class="dash-latest-payments__td dash-latest-payments__td--muted" x-text="row.id"></td>
                          <td class="dash-latest-payments__td text-nowrap" x-text="row.nis"></td>
                          <td class="dash-latest-payments__td"><span class="dash-latest-payments__name" x-text="row.nama"></span></td>
                          <td class="dash-latest-payments__td" x-text="row.kelas"></td>
                          <td class="dash-latest-payments__td dash-latest-payments__td--clip" x-text="row.ortu"></td>
                          <td class="dash-latest-payments__td">
                            <span
                              class="dash-pay-status"
                              :class="normalizeText(row.status) === 'passed' ? 'dash-pay-status--success' : 'dash-pay-status--failed'"
                              x-text="row.status"
                            ></span>
                          </td>
                          <td class="dash-latest-payments__td text-end text-nowrap">
                            <div class="dash-page-table-actions">
                              <button type="button" class="dash-latest-payments__action-btn" title="Detail" @click="viewRow(row)"><i class="bi bi-eye"></i></button>
                              <button type="button" class="dash-latest-payments__action-btn" title="Edit" @click="openEdit(row)"><i class="bi bi-pencil"></i></button>
                              <button type="button" class="dash-latest-payments__action-btn" title="Hapus" @click="confirm('Hapus murid \\'' + row.nama + '\\'?') && removeRow(row)"><i class="bi bi-trash"></i></button>
                            </div>
                          </td>
                        </tr>
                      </template>
                    </tbody>""",
    },
    "guru.html": {
        "page_id": "guru",
        "title": "Data guru",
        "subtitle": "Mata pelajaran, kontak, dan status keaktifan.",
        "search_id": "searchGuru",
        "placeholder": "Nama, mapel, atau kontak…",
        "btn_id": "btnTambahGuru",
        "btn_label": "Tambah guru",
        "aria": "Navigasi halaman tabel guru",
        "thead": """                    <thead>
                      <tr>
                        <th class="dash-latest-payments__th" style="width: 3.5rem" scope="col" role="button" tabindex="0" @click="setSort('id')">#</th>
                        <th class="dash-latest-payments__th" scope="col" role="button" tabindex="0" @click="setSort('nama')">Nama guru</th>
                        <th class="dash-latest-payments__th" scope="col" role="button" tabindex="0" @click="setSort('mapel')">Mapel</th>
                        <th class="dash-latest-payments__th text-nowrap" scope="col" role="button" tabindex="0" @click="setSort('kontak')">Kontak</th>
                        <th class="dash-latest-payments__th text-nowrap" scope="col" role="button" tabindex="0" @click="setSort('status')">Status</th>
                        <th class="dash-latest-payments__th text-end" style="width: 8rem" scope="col">Aksi</th>
                      </tr>
                    </thead>""",
        "rows": """                    <tbody id="guruTableBody">
                      <template x-for="row in pagedRows" :key="row.id">
                        <tr class="dash-latest-payments__tr" :data-id="row.id">
                          <td class="dash-latest-payments__td dash-latest-payments__td--muted" x-text="row.id"></td>
                          <td class="dash-latest-payments__td"><span class="dash-latest-payments__name" x-text="row.nama"></span></td>
                          <td class="dash-latest-payments__td" x-text="row.mapel"></td>
                          <td class="dash-latest-payments__td text-nowrap" x-text="row.kontak"></td>
                          <td class="dash-latest-payments__td">
                            <span
                              class="dash-pay-status"
                              :class="normalizeText(row.status) === 'aktif' ? 'dash-pay-status--success' : 'dash-pay-status--failed'"
                              x-text="row.status"
                            ></span>
                          </td>
                          <td class="dash-latest-payments__td text-end text-nowrap">
                            <div class="dash-page-table-actions">
                              <button type="button" class="dash-latest-payments__action-btn" title="Lihat" @click="viewRow(row)"><i class="bi bi-eye"></i></button>
                              <button type="button" class="dash-latest-payments__action-btn" title="Edit" @click="openEdit(row)"><i class="bi bi-pencil"></i></button>
                              <button type="button" class="dash-latest-payments__action-btn" title="Hapus" @click="confirm('Hapus guru \\'' + row.nama + '\\'?') && removeRow(row)"><i class="bi bi-trash"></i></button>
                            </div>
                          </td>
                        </tr>
                      </template>
                    </tbody>""",
    },
    "tagihan.html": {
        "page_id": "tagihan",
        "title": "Data tagihan",
        "subtitle": "Jenis tagihan, nominal, jatuh tempo, dan status.",
        "search_id": "searchTagihan",
        "placeholder": "Murid, jenis, atau status…",
        "btn_id": "btnTambahTagihan",
        "btn_label": "Tambah tagihan",
        "aria": "Navigasi halaman tabel tagihan",
        "thead": """                    <thead>
                      <tr>
                        <th class="dash-latest-payments__th" style="width: 3.5rem" scope="col" role="button" tabindex="0" @click="setSort('id')">#</th>
                        <th class="dash-latest-payments__th" scope="col" role="button" tabindex="0" @click="setSort('murid')">Murid</th>
                        <th class="dash-latest-payments__th" scope="col" role="button" tabindex="0" @click="setSort('jenis')">Jenis</th>
                        <th class="dash-latest-payments__th text-nowrap" scope="col" role="button" tabindex="0" @click="setSort('nominal')">Nominal</th>
                        <th class="dash-latest-payments__th text-nowrap" scope="col" role="button" tabindex="0" @click="setSort('jatuhTempoLabel')">Jatuh tempo</th>
                        <th class="dash-latest-payments__th text-nowrap" scope="col" role="button" tabindex="0" @click="setSort('status')">Status</th>
                        <th class="dash-latest-payments__th text-end" style="width: 8rem" scope="col">Aksi</th>
                      </tr>
                    </thead>""",
        "rows": """                    <tbody id="tagihanTableBody">
                      <template x-for="row in pagedRows" :key="row.id">
                        <tr class="dash-latest-payments__tr" :data-id="row.id" :data-jatuh-tempo="row.jatuhTempoIso">
                          <td class="dash-latest-payments__td dash-latest-payments__td--muted" x-text="row.id"></td>
                          <td class="dash-latest-payments__td"><span class="dash-latest-payments__name" x-text="row.murid"></span></td>
                          <td class="dash-latest-payments__td" x-text="row.jenis"></td>
                          <td class="dash-latest-payments__td text-nowrap" x-text="'Rp' + Number(row.nominal || 0).toLocaleString('id-ID')"></td>
                          <td class="dash-latest-payments__td text-nowrap" x-text="row.jatuhTempoLabel"></td>
                          <td class="dash-latest-payments__td">
                            <span
                              class="dash-pay-status"
                              :class="normalizeText(row.status) === 'lunas' ? 'dash-pay-status--success' : (normalizeText(row.status) === 'terlambat' ? 'dash-pay-status--failed' : 'dash-pay-status--processing')"
                              x-text="row.status"
                            ></span>
                          </td>
                          <td class="dash-latest-payments__td text-end text-nowrap">
                            <div class="dash-page-table-actions">
                              <button type="button" class="dash-latest-payments__action-btn" title="Lihat" @click="viewRow(row)"><i class="bi bi-eye"></i></button>
                              <button type="button" class="dash-latest-payments__action-btn" title="Edit" @click="openEdit(row)"><i class="bi bi-pencil"></i></button>
                              <button type="button" class="dash-latest-payments__action-btn" title="Hapus" @click="confirm('Hapus tagihan untuk \\'' + row.murid + '\\'?') && removeRow(row)"><i class="bi bi-trash"></i></button>
                            </div>
                          </td>
                        </tr>
                      </template>
                    </tbody>""",
    },
    "payment.html": {
        "page_id": "payment",
        "title": "Data payment",
        "subtitle": "Kode transaksi, metode, jumlah, dan status.",
        "search_id": "searchPayment",
        "placeholder": "Kode, murid, atau metode…",
        "btn_id": "btnTambahPayment",
        "btn_label": "Tambah payment",
        "aria": "Navigasi halaman tabel payment",
        "thead": """                    <thead>
                      <tr>
                        <th class="dash-latest-payments__th" style="width: 3.5rem" scope="col" role="button" tabindex="0" @click="setSort('id')">#</th>
                        <th class="dash-latest-payments__th" scope="col" role="button" tabindex="0" @click="setSort('kode')">Kode</th>
                        <th class="dash-latest-payments__th" scope="col" role="button" tabindex="0" @click="setSort('murid')">Murid</th>
                        <th class="dash-latest-payments__th" scope="col" role="button" tabindex="0" @click="setSort('metode')">Metode</th>
                        <th class="dash-latest-payments__th text-nowrap" scope="col" role="button" tabindex="0" @click="setSort('jumlah')">Jumlah</th>
                        <th class="dash-latest-payments__th text-nowrap" scope="col" role="button" tabindex="0" @click="setSort('tanggalLabel')">Tanggal</th>
                        <th class="dash-latest-payments__th text-nowrap" scope="col" role="button" tabindex="0" @click="setSort('status')">Status</th>
                        <th class="dash-latest-payments__th text-end" style="width: 8rem" scope="col">Aksi</th>
                      </tr>
                    </thead>""",
        "rows": """                    <tbody id="paymentTableBody">
                      <template x-for="row in pagedRows" :key="row.id">
                        <tr class="dash-latest-payments__tr" :data-id="row.id" :data-tanggal-bayar="row.tanggalIso">
                          <td class="dash-latest-payments__td dash-latest-payments__td--muted" x-text="row.id"></td>
                          <td class="dash-latest-payments__td text-nowrap" x-text="row.kode"></td>
                          <td class="dash-latest-payments__td"><span class="dash-latest-payments__name" x-text="row.murid"></span></td>
                          <td class="dash-latest-payments__td" x-text="row.metode"></td>
                          <td class="dash-latest-payments__td text-nowrap" x-text="'Rp' + Number(row.jumlah || 0).toLocaleString('id-ID')"></td>
                          <td class="dash-latest-payments__td text-nowrap" x-text="row.tanggalLabel"></td>
                          <td class="dash-latest-payments__td">
                            <span
                              class="dash-pay-status"
                              :class="normalizeText(row.status) === 'berhasil' ? 'dash-pay-status--success' : (normalizeText(row.status) === 'gagal' ? 'dash-pay-status--failed' : 'dash-pay-status--processing')"
                              x-text="row.status"
                            ></span>
                          </td>
                          <td class="dash-latest-payments__td text-end text-nowrap">
                            <div class="dash-page-table-actions">
                              <button type="button" class="dash-latest-payments__action-btn" title="Lihat" @click="viewRow(row)"><i class="bi bi-eye"></i></button>
                              <button type="button" class="dash-latest-payments__action-btn" title="Edit" @click="openEdit(row)"><i class="bi bi-pencil"></i></button>
                              <button type="button" class="dash-latest-payments__action-btn" title="Hapus" @click="confirm('Hapus payment \\'' + row.kode + '\\'?') && removeRow(row)"><i class="bi bi-trash"></i></button>
                            </div>
                          </td>
                        </tr>
                      </template>
                    </tbody>""",
    },
    "absensi.html": {
        "page_id": "absensi",
        "title": "Data absensi",
        "subtitle": "Kehadiran murid per tanggal dan kelas.",
        "search_id": "searchAbsensi",
        "placeholder": "Murid, kelas, atau kehadiran…",
        "btn_id": "btnTambahAbsensi",
        "btn_label": "Tambah absensi",
        "aria": "Navigasi halaman tabel absensi",
        "thead": """                    <thead>
                      <tr>
                        <th class="dash-latest-payments__th" style="width: 3.5rem" scope="col" role="button" tabindex="0" @click="setSort('id')">#</th>
                        <th class="dash-latest-payments__th" scope="col" role="button" tabindex="0" @click="setSort('murid')">Murid</th>
                        <th class="dash-latest-payments__th" scope="col" role="button" tabindex="0" @click="setSort('kelas')">Kelas</th>
                        <th class="dash-latest-payments__th text-nowrap" scope="col" role="button" tabindex="0" @click="setSort('tanggalLabel')">Tanggal</th>
                        <th class="dash-latest-payments__th text-nowrap" scope="col" role="button" tabindex="0" @click="setSort('kehadiran')">Kehadiran</th>
                        <th class="dash-latest-payments__th" scope="col" role="button" tabindex="0" @click="setSort('keterangan')">Keterangan</th>
                        <th class="dash-latest-payments__th text-end" style="width: 8rem" scope="col">Aksi</th>
                      </tr>
                    </thead>""",
        "rows": """                    <tbody id="absensiTableBody">
                      <template x-for="row in pagedRows" :key="row.id">
                        <tr class="dash-latest-payments__tr" :data-id="row.id" :data-tanggal-absen="row.tanggalIso">
                          <td class="dash-latest-payments__td dash-latest-payments__td--muted" x-text="row.id"></td>
                          <td class="dash-latest-payments__td"><span class="dash-latest-payments__name" x-text="row.murid"></span></td>
                          <td class="dash-latest-payments__td" x-text="row.kelas"></td>
                          <td class="dash-latest-payments__td text-nowrap" x-text="row.tanggalLabel"></td>
                          <td class="dash-latest-payments__td">
                            <span
                              class="dash-pay-status"
                              :class="normalizeText(row.kehadiran) === 'hadir' ? 'dash-pay-status--success' : (normalizeText(row.kehadiran) === 'alpha' ? 'dash-pay-status--failed' : 'dash-pay-status--processing')"
                              x-text="row.kehadiran"
                            ></span>
                          </td>
                          <td class="dash-latest-payments__td dash-latest-payments__td--muted" x-text="row.keterangan"></td>
                          <td class="dash-latest-payments__td text-end text-nowrap">
                            <div class="dash-page-table-actions">
                              <button type="button" class="dash-latest-payments__action-btn" title="Lihat" @click="viewRow(row)"><i class="bi bi-eye"></i></button>
                              <button type="button" class="dash-latest-payments__action-btn" title="Edit" @click="openEdit(row)"><i class="bi bi-pencil"></i></button>
                              <button type="button" class="dash-latest-payments__action-btn" title="Hapus" @click="confirm('Hapus absensi ' + row.murid + ' (' + row.tanggalLabel + ')?') && removeRow(row)"><i class="bi bi-trash"></i></button>
                            </div>
                          </td>
                        </tr>
                      </template>
                    </tbody>""",
    },
}


def build_card_inner(cfg: dict) -> str:
    pid = cfg["page_id"]
    return (
        toolbar(cfg["title"], cfg["subtitle"], pid, cfg["search_id"], cfg["placeholder"], cfg["btn_id"], cfg["btn_label"])
        + "\n              <div class=\"dash-latest-payments__table-shell\">\n"
        + "                <div class=\"table-responsive dash-latest-payments__table-wrap\">\n"
        + "                  <table class=\"dash-latest-payments__table w-full border-collapse text-start\">\n"
        + cfg["thead"]
        + "\n"
        + cfg["rows"]
        + "\n                  </table>\n                </div>\n              </div>\n\n"
        + footer_block(pid, cfg["aria"])
    )


def patch_file(name: str, cfg: dict):
    path = ROOT / name
    text = path.read_text(encoding="utf-8")
    text = text.replace(
        '<body class="dashboard-page" x-data="Object.assign(appShell(), dashboard())" x-init="init(); initDashboard()">',
        '<body class="dashboard-page" x-data="appShell()" x-init="init()">',
    )
    text = text.replace(SIDEBAR_OLD, SIDEBAR_NEW)
    text = text.replace(
        '\n    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>', ""
    )

    marker = 'class="card border-0 shadow-sm"'
    pos = text.find(marker)
    if pos == -1:
        print("skip", name)
        return
    start = text.rfind("<div", 0, pos)
    end = text.find('<template x-teleport="body">', pos)
    if start == -1 or end == -1:
        print("bad bounds", name)
        return

    init_pos = text.find('x-init="init()"', start, end)
    if init_pos == -1:
        print("no x-init", name)
        return
    open_end = text.find(">", init_pos) + 1
    open_tag = text[start:open_end]
    if "dataTable" not in open_tag:
        print("no dataTable in open", name)
        return

    new_open = open_tag.replace(
        'class="card border-0 shadow-sm"', 'class="dash-latest-payments card h-full min-h-0 shadow-sm"'
    )
    new_block = new_open + "\n" + build_card_inner(cfg) + "\n\n                "
    text = text[:start] + new_block + text[end:]

    text = re.sub(
        r"(</template>)\s*</div>\s*</div>\s*</div>\s*</main>",
        r"\1\n            </div>\n          </div>\n        </main>",
        text,
        count=1,
    )
    path.write_text(text, encoding="utf-8")
    print("patched", name)


def patch_murid_sortable():
    path = ROOT / "murid.html"
    t = path.read_text(encoding="utf-8")
    old = "{ key: 'id', type: 'number' },\n                  { key: 'nama', type: 'text' },"
    new = "{ key: 'id', type: 'number' },\n                  { key: 'nis', type: 'text' },\n                  { key: 'nama', type: 'text' },"
    if old in t and "{ key: 'nis'" not in t:
        t = t.replace(old, new, 1)
        path.write_text(t, encoding="utf-8")
        print("murid sortable +nis")


def main():
    for fname, cfg in PAGES.items():
        patch_file(fname, cfg)
    patch_murid_sortable()


if __name__ == "__main__":
    main()
