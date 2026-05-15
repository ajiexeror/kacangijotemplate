# -*- coding: utf-8 -*-
"""Customize role.html, permission.html, user.html, setting.html (copied from kelas)."""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]

COMMON_NAV = (
    (
        '<a class="nav-link active" href="kelas.html" aria-current="page">',
        '<a class="nav-link" href="kelas.html">',
    ),
)


def strip_all_main_active(html: str) -> str:
    html = html.replace(
        '<a class="nav-link active" href="kelas.html" aria-current="page">',
        '<a class="nav-link" href="kelas.html">',
    )
    return html


def set_active(html: str, needle: str) -> str:
    # needle like 'href="role.html"'
    old = f'<a class="nav-link" {needle}'
    new = f'<a class="nav-link active" {needle} aria-current="page"'
    if old not in html:
        raise SystemExit(f"missing nav {needle}")
    return html.replace(old, new, 1)


def replace_block(html: str, start_marker: str, end_marker: str, new_inner: str) -> str:
    s = html.index(start_marker)
    e = html.index(end_marker, s)
    return html[:s] + new_inner + html[e:]


def main():
    specs = {
        "role.html": {
            "title": "Role",
            "active": 'href="role.html"',
            "h1": "Role",
            "crumb": "Role",
            "block": r'''            <div
              class="dash-latest-payments card h-full min-h-0 shadow-sm"
              x-data="dataTable({
                keyField: 'id',
                searchableColumns: ['nama', 'slug'],
                sortableColumns: [
                  { key: 'id', type: 'number' },
                  { key: 'nama', type: 'text' },
                  { key: 'slug', type: 'text' },
                  { key: 'pengguna', type: 'number' },
                  { key: 'status', type: 'text' }
                ],
                pageSizeOptions: [10, 20, 30],
                defaultPageSize: 10,
                formDefaults: { id: '', nama: '', slug: '', pengguna: 0, status: 'Aktif' },
                rows: [
                  { id: '1', nama: 'Administrator', slug: 'admin', pengguna: 3, status: 'Aktif' },
                  { id: '2', nama: 'Staff TU', slug: 'staff-tu', pengguna: 8, status: 'Aktif' },
                  { id: '3', nama: 'Guru', slug: 'guru', pengguna: 42, status: 'Aktif' },
                  { id: '4', nama: 'Orang tua', slug: 'ortu', pengguna: 120, status: 'Aktif' },
                  { id: '5', nama: 'Auditor', slug: 'auditor', pengguna: 2, status: 'Nonaktif' }
                ],
                onView: (row) => { alert('Role: ' + row.nama + '\\nSlug: ' + row.slug); },
                onSubmit: ({ form }) => {
                  if (!form.nama || !form.slug) { alert('Nama dan slug wajib.'); return { row: null }; }
                  const n = parseInt(form.pengguna, 10);
                  return { row: { ...form, pengguna: Number.isFinite(n) ? n : 0 } };
                }
              })"
              x-init="init()"
            >
              <div class="dash-latest-payments__toolbar d-flex flex-wrap align-items-start justify-content-between gap-3 px-5 pt-5 pb-4">
                <div class="min-w-0 flex-grow-1">
                  <h2 class="dash-latest-payments__title mb-1">Data role</h2>
                  <p class="dash-latest-payments__subtitle text-muted mb-0">Peran akses pengguna (demo).</p>
                </div>
                <div class="d-flex flex-wrap align-items-center justify-content-end gap-2 flex-shrink-0">
                  <div class="d-flex align-items-center gap-2">
                    <span class="text-muted" style="font-size: 14px; font-weight: 400">Tampilkan</span>
                    <select id="rolePageSize" class="form-select form-select-sm rounded-3 border-0 bg-body-secondary" style="width: auto; min-width: 4.5rem" aria-label="Jumlah baris per halaman" x-model.number="pageSize" @change="page = 1">
                      <template x-for="s in pageSizes" :key="s"><option :value="s" x-text="s"></option></template>
                    </select>
                    <span class="text-muted" style="font-size: 14px; font-weight: 400">baris</span>
                  </div>
                  <input type="search" id="searchRole" class="form-control form-control-sm dash-latest-payments__filter-input" placeholder="Nama atau slug…" autocomplete="off" aria-label="Cari" x-model.debounce.200ms="query" @input="page = 1" />
                  <button type="button" class="btn btn-sm btn-primary rounded-3 px-3 flex-shrink-0 text-nowrap" id="btnTambahRole" @click="openCreate()"><i class="bi bi-plus-lg me-1"></i> Tambah role</button>
                </div>
              </div>
              <div class="dash-latest-payments__table-shell">
                <div class="table-responsive dash-latest-payments__table-wrap">
                  <table class="dash-latest-payments__table w-full border-collapse text-start">
                    <thead><tr>
                      <th class="dash-latest-payments__th" style="width:3.5rem" scope="col" role="button" tabindex="0" @click="setSort('id')">#</th>
                      <th class="dash-latest-payments__th" scope="col" role="button" tabindex="0" @click="setSort('nama')">Nama</th>
                      <th class="dash-latest-payments__th" scope="col" role="button" tabindex="0" @click="setSort('slug')">Slug</th>
                      <th class="dash-latest-payments__th text-nowrap" scope="col" role="button" tabindex="0" @click="setSort('pengguna')">Pengguna</th>
                      <th class="dash-latest-payments__th text-nowrap" scope="col" role="button" tabindex="0" @click="setSort('status')">Status</th>
                      <th class="dash-latest-payments__th text-end" style="width:8rem" scope="col">Aksi</th>
                    </tr></thead>
                    <tbody id="roleTableBody">
                      <template x-for="row in pagedRows" :key="row.id">
                        <tr class="dash-latest-payments__tr">
                          <td class="dash-latest-payments__td dash-latest-payments__td--muted" x-text="row.id"></td>
                          <td class="dash-latest-payments__td"><span class="dash-latest-payments__name" x-text="row.nama"></span></td>
                          <td class="dash-latest-payments__td text-nowrap" x-text="row.slug"></td>
                          <td class="dash-latest-payments__td" x-text="row.pengguna"></td>
                          <td class="dash-latest-payments__td"><span class="dash-pay-status" :class="normalizeText(row.status) === 'aktif' ? 'dash-pay-status--success' : 'dash-pay-status--failed'" x-text="row.status"></span></td>
                          <td class="dash-latest-payments__td text-end text-nowrap"><div class="dash-page-table-actions">
                            <button type="button" class="dash-latest-payments__action-btn" title="Lihat" @click="viewRow(row)"><i class="bi bi-eye"></i></button>
                            <button type="button" class="dash-latest-payments__action-btn" title="Edit" @click="openEdit(row)"><i class="bi bi-pencil"></i></button>
                            <button type="button" class="dash-latest-payments__action-btn" title="Hapus" @click="confirm('Hapus role \\'' + row.nama + '\\'?') && removeRow(row)"><i class="bi bi-trash"></i></button>
                          </div></td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="dash-latest-payments__footer d-flex flex-wrap align-items-center justify-content-between gap-3 px-5 py-4">
                <p class="dash-latest-payments__selection mb-0 text-muted" id="rolePageInfo" x-text="pageInfo"></p>
                <div class="d-flex align-items-center gap-1" aria-label="Navigasi halaman">
                  <button type="button" class="dash-latest-payments__page-btn" :disabled="page <= 1" @click="setPage(page - 1)" aria-label="Sebelumnya"><i class="bi bi-chevron-left"></i></button>
                  <template x-for="p in pagination" :key="'pg-' + String(p)">
                    <button type="button" class="dash-latest-payments__page-btn" :disabled="p === '...'" :class="{ 'is-active': p === page && p !== '...', 'opacity-50': p === '...' }" :aria-current="p === page && p !== '...' ? 'page' : null" @click="p !== '...' && setPage(p)" x-text="p === '...' ? '…' : p"></button>
                  </template>
                  <button type="button" class="dash-latest-payments__page-btn" :disabled="page >= totalPages" @click="setPage(page + 1)" aria-label="Berikutnya"><i class="bi bi-chevron-right"></i></button>
                </div>
              </div>

                <template x-teleport="body">
                  <div class="modal fade" id="modalRole" tabindex="-1" aria-hidden="true" x-show="modalOpen" x-transition.opacity style="display: none" @keydown.escape.window="closeModal()">
                    <div class="modal-dialog modal-dialog-centered" @click.self="closeModal()">
                      <div class="modal-content border-0 shadow-lg rounded-4">
                        <form novalidate @submit.prevent="submitForm()">
                          <div class="modal-header border-0 pb-0">
                            <h3 class="modal-title fs-6 fw-medium" x-text="modalMode === 'edit' ? 'Edit role' : 'Tambah role'"></h3>
                            <button type="button" class="btn-close" aria-label="Tutup" @click="closeModal()"></button>
                          </div>
                          <div class="modal-body pt-2">
                            <input type="hidden" x-model="form.id" />
                            <div class="mb-3"><label class="form-label small">Nama role</label><input type="text" class="form-control form-control-sm rounded-3" required x-model="form.nama" /></div>
                            <div class="mb-3"><label class="form-label small">Slug</label><input type="text" class="form-control form-control-sm rounded-3" required x-model="form.slug" /></div>
                            <div class="mb-3"><label class="form-label small">Jumlah pengguna</label><input type="number" class="form-control form-control-sm rounded-3" min="0" x-model.number="form.pengguna" /></div>
                            <div class="mb-0"><label class="form-label small">Status</label>
                              <select class="form-select form-select-sm rounded-3" x-model="form.status"><option>Aktif</option><option>Nonaktif</option></select>
                            </div>
                          </div>
                          <div class="modal-footer border-0 pt-0">
                            <button type="button" class="btn btn-sm btn-light rounded-3" @click="closeModal()">Batal</button>
                            <button type="submit" class="btn btn-sm btn-primary rounded-3">Simpan</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </template>
            </div>
''',
        },
        "permission.html": {
            "title": "Permission",
            "active": 'href="permission.html"',
            "h1": "Permission",
            "crumb": "Permission",
            "block": r'''            <div
              class="dash-latest-payments card h-full min-h-0 shadow-sm"
              x-data="dataTable({
                keyField: 'id',
                searchableColumns: ['nama', 'key'],
                sortableColumns: [
                  { key: 'id', type: 'number' },
                  { key: 'nama', type: 'text' },
                  { key: 'key', type: 'text' },
                  { key: 'grup', type: 'text' }
                ],
                pageSizeOptions: [10, 20, 30],
                defaultPageSize: 10,
                formDefaults: { id: '', nama: '', key: '', grup: 'Umum' },
                rows: [
                  { id: '1', nama: 'Lihat dashboard', key: 'dashboard.view', grup: 'Umum' },
                  { id: '2', nama: 'Kelola murid', key: 'murid.manage', grup: 'Akademik' },
                  { id: '3', nama: 'Kelola tagihan', key: 'tagihan.manage', grup: 'Keuangan' },
                  { id: '4', nama: 'Atur role', key: 'role.manage', grup: 'Pengguna' },
                  { id: '5', nama: 'Export laporan', key: 'laporan.export', grup: 'Laporan' }
                ],
                onView: (row) => { alert(row.nama + ' (' + row.key + ')'); },
                onSubmit: ({ form }) => {
                  if (!form.nama || !form.key) { alert('Nama dan key wajib.'); return { row: null }; }
                  return { row: { ...form } };
                }
              })"
              x-init="init()"
            >
              <div class="dash-latest-payments__toolbar d-flex flex-wrap align-items-start justify-content-between gap-3 px-5 pt-5 pb-4">
                <div class="min-w-0 flex-grow-1">
                  <h2 class="dash-latest-payments__title mb-1">Data permission</h2>
                  <p class="dash-latest-payments__subtitle text-muted mb-0">Hak akses fitur (demo).</p>
                </div>
                <div class="d-flex flex-wrap align-items-center justify-content-end gap-2 flex-shrink-0">
                  <div class="d-flex align-items-center gap-2">
                    <span class="text-muted" style="font-size: 14px; font-weight: 400">Tampilkan</span>
                    <select id="permPageSize" class="form-select form-select-sm rounded-3 border-0 bg-body-secondary" style="width: auto; min-width: 4.5rem" x-model.number="pageSize" @change="page = 1">
                      <template x-for="s in pageSizes" :key="s"><option :value="s" x-text="s"></option></template>
                    </select>
                    <span class="text-muted" style="font-size: 14px; font-weight: 400">baris</span>
                  </div>
                  <input type="search" id="searchPerm" class="form-control form-control-sm dash-latest-payments__filter-input" placeholder="Nama atau key…" x-model.debounce.200ms="query" @input="page = 1" />
                  <button type="button" class="btn btn-sm btn-primary rounded-3" @click="openCreate()"><i class="bi bi-plus-lg me-1"></i> Tambah permission</button>
                </div>
              </div>
              <div class="dash-latest-payments__table-shell">
                <div class="table-responsive dash-latest-payments__table-wrap">
                  <table class="dash-latest-payments__table w-full border-collapse text-start">
                    <thead><tr>
                      <th class="dash-latest-payments__th" style="width:3.5rem" scope="col" role="button" tabindex="0" @click="setSort('id')">#</th>
                      <th class="dash-latest-payments__th" scope="col" role="button" tabindex="0" @click="setSort('nama')">Nama</th>
                      <th class="dash-latest-payments__th" scope="col" role="button" tabindex="0" @click="setSort('key')">Key</th>
                      <th class="dash-latest-payments__th" scope="col" role="button" tabindex="0" @click="setSort('grup')">Grup</th>
                      <th class="dash-latest-payments__th text-end" style="width:8rem" scope="col">Aksi</th>
                    </tr></thead>
                    <tbody>
                      <template x-for="row in pagedRows" :key="row.id">
                        <tr class="dash-latest-payments__tr">
                          <td class="dash-latest-payments__td dash-latest-payments__td--muted" x-text="row.id"></td>
                          <td class="dash-latest-payments__td"><span class="dash-latest-payments__name" x-text="row.nama"></span></td>
                          <td class="dash-latest-payments__td text-nowrap" x-text="row.key"></td>
                          <td class="dash-latest-payments__td" x-text="row.grup"></td>
                          <td class="dash-latest-payments__td text-end text-nowrap"><div class="dash-page-table-actions">
                            <button type="button" class="dash-latest-payments__action-btn" @click="viewRow(row)"><i class="bi bi-eye"></i></button>
                            <button type="button" class="dash-latest-payments__action-btn" @click="openEdit(row)"><i class="bi bi-pencil"></i></button>
                            <button type="button" class="dash-latest-payments__action-btn" @click="confirm('Hapus permission?') && removeRow(row)"><i class="bi bi-trash"></i></button>
                          </div></td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="dash-latest-payments__footer d-flex flex-wrap align-items-center justify-content-between gap-3 px-5 py-4">
                <p class="dash-latest-payments__selection mb-0 text-muted" x-text="pageInfo"></p>
                <div class="d-flex align-items-center gap-1">
                  <button type="button" class="dash-latest-payments__page-btn" :disabled="page <= 1" @click="setPage(page - 1)"><i class="bi bi-chevron-left"></i></button>
                  <template x-for="p in pagination" :key="'pg-' + String(p)">
                    <button type="button" class="dash-latest-payments__page-btn" :disabled="p === '...'" :class="{ 'is-active': p === page && p !== '...', 'opacity-50': p === '...' }" @click="p !== '...' && setPage(p)" x-text="p === '...' ? '…' : p"></button>
                  </template>
                  <button type="button" class="dash-latest-payments__page-btn" :disabled="page >= totalPages" @click="setPage(page + 1)"><i class="bi bi-chevron-right"></i></button>
                </div>
              </div>
                <template x-teleport="body">
                  <div class="modal fade" x-show="modalOpen" x-transition.opacity style="display: none" @keydown.escape.window="closeModal()">
                    <div class="modal-dialog modal-dialog-centered" @click.self="closeModal()">
                      <div class="modal-content border-0 shadow-lg rounded-4">
                        <form @submit.prevent="submitForm()">
                          <div class="modal-header border-0 pb-0"><h3 class="modal-title fs-6 fw-medium" x-text="modalMode === 'edit' ? 'Edit' : 'Tambah'"></h3><button type="button" class="btn-close" @click="closeModal()"></button></div>
                          <div class="modal-body pt-2">
                            <input type="hidden" x-model="form.id" />
                            <div class="mb-3"><label class="form-label small">Nama</label><input class="form-control form-control-sm rounded-3" x-model="form.nama" required /></div>
                            <div class="mb-3"><label class="form-label small">Key</label><input class="form-control form-control-sm rounded-3" x-model="form.key" required /></div>
                            <div class="mb-0"><label class="form-label small">Grup</label><input class="form-control form-control-sm rounded-3" x-model="form.grup" /></div>
                          </div>
                          <div class="modal-footer border-0 pt-0">
                            <button type="button" class="btn btn-sm btn-light rounded-3" @click="closeModal()">Batal</button>
                            <button type="submit" class="btn btn-sm btn-primary rounded-3">Simpan</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </template>
            </div>
''',
        },
        "user.html": {
            "title": "User",
            "active": 'href="user.html"',
            "h1": "User",
            "crumb": "User",
            "block": r'''            <div
              class="dash-latest-payments card h-full min-h-0 shadow-sm"
              x-data="dataTable({
                keyField: 'id',
                searchableColumns: ['nama', 'email', 'role'],
                sortableColumns: [
                  { key: 'id', type: 'number' },
                  { key: 'nama', type: 'text' },
                  { key: 'email', type: 'text' },
                  { key: 'role', type: 'text' },
                  { key: 'status', type: 'text' }
                ],
                pageSizeOptions: [10, 20, 30],
                defaultPageSize: 10,
                formDefaults: { id: '', nama: '', email: '', role: 'Staff TU', status: 'Aktif' },
                rows: [
                  { id: '1', nama: 'Admin Utama', email: 'admin@school.id', role: 'Administrator', status: 'Aktif' },
                  { id: '2', nama: 'Rina Wati', email: 'rina@school.id', role: 'Staff TU', status: 'Aktif' },
                  { id: '3', nama: 'Budi Santoso', email: 'budi@school.id', role: 'Guru', status: 'Aktif' },
                  { id: '4', nama: 'Maya Indira', email: 'maya@school.id', role: 'Guru', status: 'Nonaktif' }
                ],
                onView: (row) => { alert(row.nama + ' — ' + row.email); },
                onSubmit: ({ form }) => {
                  if (!form.nama || !form.email) { alert('Nama dan email wajib.'); return { row: null }; }
                  return { row: { ...form } };
                }
              })"
              x-init="init()"
            >
              <div class="dash-latest-payments__toolbar d-flex flex-wrap align-items-start justify-content-between gap-3 px-5 pt-5 pb-4">
                <div class="min-w-0 flex-grow-1">
                  <h2 class="dash-latest-payments__title mb-1">Data user</h2>
                  <p class="dash-latest-payments__subtitle text-muted mb-0">Akun pengguna aplikasi (demo).</p>
                </div>
                <div class="d-flex flex-wrap align-items-center justify-content-end gap-2 flex-shrink-0">
                  <div class="d-flex align-items-center gap-2">
                    <span class="text-muted" style="font-size: 14px; font-weight: 400">Tampilkan</span>
                    <select id="userPageSize" class="form-select form-select-sm rounded-3 border-0 bg-body-secondary" style="width: auto; min-width: 4.5rem" x-model.number="pageSize" @change="page = 1">
                      <template x-for="s in pageSizes" :key="s"><option :value="s" x-text="s"></option></template>
                    </select>
                    <span class="text-muted" style="font-size: 14px; font-weight: 400">baris</span>
                  </div>
                  <input type="search" id="searchUser" class="form-control form-control-sm dash-latest-payments__filter-input" placeholder="Nama, email, role…" x-model.debounce.200ms="query" @input="page = 1" />
                  <button type="button" class="btn btn-sm btn-primary rounded-3" @click="openCreate()"><i class="bi bi-plus-lg me-1"></i> Tambah user</button>
                </div>
              </div>
              <div class="dash-latest-payments__table-shell">
                <div class="table-responsive dash-latest-payments__table-wrap">
                  <table class="dash-latest-payments__table w-full border-collapse text-start">
                    <thead><tr>
                      <th class="dash-latest-payments__th" style="width:3.5rem" scope="col" @click="setSort('id')">#</th>
                      <th class="dash-latest-payments__th" scope="col" @click="setSort('nama')">Nama</th>
                      <th class="dash-latest-payments__th" scope="col" @click="setSort('email')">Email</th>
                      <th class="dash-latest-payments__th" scope="col" @click="setSort('role')">Role</th>
                      <th class="dash-latest-payments__th" scope="col" @click="setSort('status')">Status</th>
                      <th class="dash-latest-payments__th text-end" style="width:8rem" scope="col">Aksi</th>
                    </tr></thead>
                    <tbody>
                      <template x-for="row in pagedRows" :key="row.id">
                        <tr class="dash-latest-payments__tr">
                          <td class="dash-latest-payments__td dash-latest-payments__td--muted" x-text="row.id"></td>
                          <td class="dash-latest-payments__td"><span class="dash-latest-payments__name" x-text="row.nama"></span></td>
                          <td class="dash-latest-payments__td dash-latest-payments__td--clip" x-text="row.email"></td>
                          <td class="dash-latest-payments__td" x-text="row.role"></td>
                          <td class="dash-latest-payments__td"><span class="dash-pay-status" :class="normalizeText(row.status) === 'aktif' ? 'dash-pay-status--success' : 'dash-pay-status--failed'" x-text="row.status"></span></td>
                          <td class="dash-latest-payments__td text-end text-nowrap"><div class="dash-page-table-actions">
                            <button type="button" class="dash-latest-payments__action-btn" @click="viewRow(row)"><i class="bi bi-eye"></i></button>
                            <button type="button" class="dash-latest-payments__action-btn" @click="openEdit(row)"><i class="bi bi-pencil"></i></button>
                            <button type="button" class="dash-latest-payments__action-btn" @click="confirm('Hapus user?') && removeRow(row)"><i class="bi bi-trash"></i></button>
                          </div></td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="dash-latest-payments__footer d-flex flex-wrap align-items-center justify-content-between gap-3 px-5 py-4">
                <p class="dash-latest-payments__selection mb-0 text-muted" x-text="pageInfo"></p>
                <div class="d-flex align-items-center gap-1">
                  <button type="button" class="dash-latest-payments__page-btn" :disabled="page <= 1" @click="setPage(page - 1)"><i class="bi bi-chevron-left"></i></button>
                  <template x-for="p in pagination" :key="'pg-' + String(p)">
                    <button type="button" class="dash-latest-payments__page-btn" :disabled="p === '...'" :class="{ 'is-active': p === page && p !== '...', 'opacity-50': p === '...' }" @click="p !== '...' && setPage(p)" x-text="p === '...' ? '…' : p"></button>
                  </template>
                  <button type="button" class="dash-latest-payments__page-btn" :disabled="page >= totalPages" @click="setPage(page + 1)"><i class="bi bi-chevron-right"></i></button>
                </div>
              </div>
                <template x-teleport="body">
                  <div class="modal fade" x-show="modalOpen" x-transition.opacity style="display: none" @keydown.escape.window="closeModal()">
                    <div class="modal-dialog modal-dialog-centered" @click.self="closeModal()">
                      <div class="modal-content border-0 shadow-lg rounded-4">
                        <form @submit.prevent="submitForm()">
                          <div class="modal-header border-0 pb-0"><h3 class="modal-title fs-6 fw-medium" x-text="modalMode === 'edit' ? 'Edit user' : 'Tambah user'"></h3><button type="button" class="btn-close" @click="closeModal()"></button></div>
                          <div class="modal-body pt-2">
                            <input type="hidden" x-model="form.id" />
                            <div class="mb-3"><label class="form-label small">Nama</label><input class="form-control form-control-sm rounded-3" x-model="form.nama" required /></div>
                            <div class="mb-3"><label class="form-label small">Email</label><input type="email" class="form-control form-control-sm rounded-3" x-model="form.email" required /></div>
                            <div class="mb-3"><label class="form-label small">Role</label><input class="form-control form-control-sm rounded-3" x-model="form.role" /></div>
                            <div class="mb-0"><label class="form-label small">Status</label><select class="form-select form-select-sm rounded-3" x-model="form.status"><option>Aktif</option><option>Nonaktif</option></select></div>
                          </div>
                          <div class="modal-footer border-0 pt-0"><button type="button" class="btn btn-sm btn-light rounded-3" @click="closeModal()">Batal</button><button type="submit" class="btn btn-sm btn-primary rounded-3">Simpan</button></div>
                        </form>
                      </div>
                    </div>
                  </div>
                </template>
            </div>
''',
        },
        "setting.html": {
            "title": "Web Setting",
            "active": 'href="setting.html"',
            "h1": "Web Setting",
            "crumb": "Web Setting",
            "block": r'''            <div
              class="dash-latest-payments card h-full min-h-0 shadow-sm"
              x-data="dataTable({
                keyField: 'id',
                searchableColumns: ['key', 'nilai'],
                sortableColumns: [
                  { key: 'id', type: 'number' },
                  { key: 'key', type: 'text' },
                  { key: 'nilai', type: 'text' },
                  { key: 'kategori', type: 'text' }
                ],
                pageSizeOptions: [10, 20, 30],
                defaultPageSize: 10,
                formDefaults: { id: '', key: '', nilai: '', kategori: 'Umum' },
                rows: [
                  { id: '1', key: 'app.nama_sekolah', nilai: 'SMA Negeri 1 Demo', kategori: 'Branding' },
                  { id: '2', key: 'app.timezone', nilai: 'Asia/Jakarta', kategori: 'Sistem' },
                  { id: '3', key: 'email.driver', nilai: 'smtp', kategori: 'Email' },
                  { id: '4', key: 'tagihan.reminder_hari', nilai: '3', kategori: 'Tagihan' }
                ],
                onView: (row) => { alert(row.key + ' = ' + row.nilai); },
                onSubmit: ({ form }) => {
                  if (!form.key) { alert('Key wajib.'); return { row: null }; }
                  return { row: { ...form } };
                }
              })"
              x-init="init()"
            >
              <div class="dash-latest-payments__toolbar d-flex flex-wrap align-items-start justify-content-between gap-3 px-5 pt-5 pb-4">
                <div class="min-w-0 flex-grow-1">
                  <h2 class="dash-latest-payments__title mb-1">Pengaturan web</h2>
                  <p class="dash-latest-payments__subtitle text-muted mb-0">Key konfigurasi (demo).</p>
                </div>
                <div class="d-flex flex-wrap align-items-center justify-content-end gap-2 flex-shrink-0">
                  <div class="d-flex align-items-center gap-2">
                    <span class="text-muted" style="font-size: 14px; font-weight: 400">Tampilkan</span>
                    <select id="settingPageSize" class="form-select form-select-sm rounded-3 border-0 bg-body-secondary" style="width: auto; min-width: 4.5rem" x-model.number="pageSize" @change="page = 1">
                      <template x-for="s in pageSizes" :key="s"><option :value="s" x-text="s"></option></template>
                    </select>
                    <span class="text-muted" style="font-size: 14px; font-weight: 400">baris</span>
                  </div>
                  <input type="search" id="searchSetting" class="form-control form-control-sm dash-latest-payments__filter-input" placeholder="Key atau nilai…" x-model.debounce.200ms="query" @input="page = 1" />
                  <button type="button" class="btn btn-sm btn-primary rounded-3" @click="openCreate()"><i class="bi bi-plus-lg me-1"></i> Tambah setting</button>
                </div>
              </div>
              <div class="dash-latest-payments__table-shell">
                <div class="table-responsive dash-latest-payments__table-wrap">
                  <table class="dash-latest-payments__table w-full border-collapse text-start">
                    <thead><tr>
                      <th class="dash-latest-payments__th" style="width:3.5rem" scope="col" @click="setSort('id')">#</th>
                      <th class="dash-latest-payments__th" scope="col" @click="setSort('key')">Key</th>
                      <th class="dash-latest-payments__th" scope="col" @click="setSort('nilai')">Nilai</th>
                      <th class="dash-latest-payments__th" scope="col" @click="setSort('kategori')">Kategori</th>
                      <th class="dash-latest-payments__th text-end" style="width:8rem" scope="col">Aksi</th>
                    </tr></thead>
                    <tbody>
                      <template x-for="row in pagedRows" :key="row.id">
                        <tr class="dash-latest-payments__tr">
                          <td class="dash-latest-payments__td dash-latest-payments__td--muted" x-text="row.id"></td>
                          <td class="dash-latest-payments__td text-nowrap" x-text="row.key"></td>
                          <td class="dash-latest-payments__td dash-latest-payments__td--clip" x-text="row.nilai"></td>
                          <td class="dash-latest-payments__td" x-text="row.kategori"></td>
                          <td class="dash-latest-payments__td text-end text-nowrap"><div class="dash-page-table-actions">
                            <button type="button" class="dash-latest-payments__action-btn" @click="viewRow(row)"><i class="bi bi-eye"></i></button>
                            <button type="button" class="dash-latest-payments__action-btn" @click="openEdit(row)"><i class="bi bi-pencil"></i></button>
                            <button type="button" class="dash-latest-payments__action-btn" @click="confirm('Hapus setting?') && removeRow(row)"><i class="bi bi-trash"></i></button>
                          </div></td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="dash-latest-payments__footer d-flex flex-wrap align-items-center justify-content-between gap-3 px-5 py-4">
                <p class="dash-latest-payments__selection mb-0 text-muted" x-text="pageInfo"></p>
                <div class="d-flex align-items-center gap-1">
                  <button type="button" class="dash-latest-payments__page-btn" :disabled="page <= 1" @click="setPage(page - 1)"><i class="bi bi-chevron-left"></i></button>
                  <template x-for="p in pagination" :key="'pg-' + String(p)">
                    <button type="button" class="dash-latest-payments__page-btn" :disabled="p === '...'" :class="{ 'is-active': p === page && p !== '...', 'opacity-50': p === '...' }" @click="p !== '...' && setPage(p)" x-text="p === '...' ? '…' : p"></button>
                  </template>
                  <button type="button" class="dash-latest-payments__page-btn" :disabled="page >= totalPages" @click="setPage(page + 1)"><i class="bi bi-chevron-right"></i></button>
                </div>
              </div>
                <template x-teleport="body">
                  <div class="modal fade" x-show="modalOpen" x-transition.opacity style="display: none" @keydown.escape.window="closeModal()">
                    <div class="modal-dialog modal-dialog-centered" @click.self="closeModal()">
                      <div class="modal-content border-0 shadow-lg rounded-4">
                        <form @submit.prevent="submitForm()">
                          <div class="modal-header border-0 pb-0"><h3 class="modal-title fs-6 fw-medium" x-text="modalMode === 'edit' ? 'Edit setting' : 'Tambah setting'"></h3><button type="button" class="btn-close" @click="closeModal()"></button></div>
                          <div class="modal-body pt-2">
                            <input type="hidden" x-model="form.id" />
                            <div class="mb-3"><label class="form-label small">Key</label><input class="form-control form-control-sm rounded-3" x-model="form.key" required /></div>
                            <div class="mb-3"><label class="form-label small">Nilai</label><input class="form-control form-control-sm rounded-3" x-model="form.nilai" /></div>
                            <div class="mb-0"><label class="form-label small">Kategori</label><input class="form-control form-control-sm rounded-3" x-model="form.kategori" /></div>
                          </div>
                          <div class="modal-footer border-0 pt-0"><button type="button" class="btn btn-sm btn-light rounded-3" @click="closeModal()">Batal</button><button type="submit" class="btn btn-sm btn-primary rounded-3">Simpan</button></div>
                        </form>
                      </div>
                    </div>
                  </div>
                </template>
            </div>
''',
        },
    }

    for fname, spec in specs.items():
        path = ROOT / fname
        html = path.read_text(encoding="utf-8")
        html = re.sub(
            r"<title>.*?</title>",
            f"<title>School ERP — {spec['title']}</title>",
            html,
            count=1,
        )
        html = strip_all_main_active(html)
        html = set_active(html, spec["active"])
        html = html.replace("<h1 class=\"page-title\">Kelas</h1>", f"<h1 class=\"page-title\">{spec['h1']}</h1>")
        html = html.replace(
            '<li class="breadcrumb-item active" aria-current="page">Kelas</li>',
            f'<li class="breadcrumb-item active" aria-current="page">{spec["crumb"]}</li>',
        )
        # replace main data card: from first dash-latest-payments card through closing before </main> inner py-4 — match from `<div\n              class="dash-latest-payments` to `</template>\n            </div>` before `</div>\n          </div>\n        </main>`
        m = re.search(
            r'(\s*)<div\s+class="dash-latest-payments card h-full min-h-0 shadow-sm"',
            html,
        )
        if not m:
            raise SystemExit(f"no dash card in {fname}")
        start = m.start(1)
        end = html.find("</main>", start)
        # find last `</template>` then `</div>` before `</div>\n          </div>\n        </main>`
        inner_end = html.rfind("</template>", start, end)
        inner_end = html.find("\n            </div>", inner_end) + len("\n            </div>")
        html = html[:start] + spec["block"] + html[inner_end:]
        path.write_text(html, encoding="utf-8")
        print("finalized", fname)


if __name__ == "__main__":
    main()
