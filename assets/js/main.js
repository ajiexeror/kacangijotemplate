(function () {
  "use strict";

  const doc = document.documentElement;
  const layout = document.getElementById("appLayout");
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebarBackdrop = document.getElementById("sidebarBackdrop");
  const THEME_KEY = "school-erp-theme";

  /* ---------- Sidebar ---------- */
  function isDesktop() {
    return window.matchMedia("(min-width: 992px)").matches;
  }

  function openSidebarMobile() {
    sidebar.classList.add("mobile-open");
    sidebarBackdrop.classList.add("show");
    sidebarBackdrop.setAttribute("aria-hidden", "false");
  }

  function closeSidebarMobile() {
    sidebar.classList.remove("mobile-open");
    sidebarBackdrop.classList.remove("show");
    sidebarBackdrop.setAttribute("aria-hidden", "true");
  }

  function toggleSidebarDesktop() {
    layout.classList.toggle("sidebar-collapsed-layout");
  }

  if (sidebarToggle && layout && sidebar) {
    sidebarToggle.addEventListener("click", function () {
      if (isDesktop()) {
        toggleSidebarDesktop();
      } else {
        if (sidebar.classList.contains("mobile-open")) {
          closeSidebarMobile();
        } else {
          openSidebarMobile();
        }
      }
    });
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener("click", closeSidebarMobile);
  }

  window.addEventListener("resize", function () {
    if (isDesktop()) {
      closeSidebarMobile();
    }
  });

  /* ---------- Mobile search ---------- */
  const searchMobileToggle = document.getElementById("searchMobileToggle");
  const mobileSearchBar = document.getElementById("mobileSearchBar");
  if (searchMobileToggle && mobileSearchBar) {
    searchMobileToggle.addEventListener("click", function () {
      mobileSearchBar.classList.toggle("d-none");
    });
  }

  /* ---------- Theme ---------- */
  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY);
  }

  function setTheme(theme) {
    doc.setAttribute("data-theme", theme);
    doc.setAttribute("data-bs-theme", theme);
    doc.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
    const iconDark = document.getElementById("themeIconDark");
    const iconLight = document.getElementById("themeIconLight");
    /* Light → tampilkan bulan (aksi: ke dark); Dark → tampilkan matahari (aksi: ke light) */
    if (iconDark && iconLight) {
      if (theme === "dark") {
        iconDark.classList.add("d-none");
        iconLight.classList.remove("d-none");
      } else {
        iconDark.classList.remove("d-none");
        iconLight.classList.add("d-none");
      }
    }
  }

  function initTheme() {
    const stored = getStoredTheme();
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored || (prefersDark ? "dark" : "light");
    setTheme(theme);
  }

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const next = doc.getAttribute("data-theme") === "dark" ? "light" : "dark";
      setTheme(next);
    });
  }

  initTheme();

  /* ---------- Fullscreen ---------- */
  const fullscreenToggle = document.getElementById("fullscreenToggle");
  const fullscreenIconEnter = document.getElementById("fullscreenIconEnter");
  const fullscreenIconExit = document.getElementById("fullscreenIconExit");

  function updateFullscreenIcons() {
    const fs = !!document.fullscreenElement;
    if (fullscreenIconEnter && fullscreenIconExit) {
      fullscreenIconEnter.classList.toggle("d-none", fs);
      fullscreenIconExit.classList.toggle("d-none", !fs);
    }
  }

  if (fullscreenToggle) {
    fullscreenToggle.addEventListener("click", function () {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(function () {});
      } else {
        document.exitFullscreen?.();
      }
    });
    document.addEventListener("fullscreenchange", updateFullscreenIcons);
  }

  /* ---------- Stat counters ---------- */
  function animateCount(el, target, duration) {
    const start = 0;
    const startTime = performance.now();
    function tick(now) {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(start + (target - start) * eased);
      el.textContent = val.toLocaleString("id-ID");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  document.querySelectorAll(".stat-number[data-count]").forEach(function (el) {
    const target = parseInt(el.getAttribute("data-count"), 10);
    if (!isNaN(target)) animateCount(el, target, 900);
  });

  /* ---------- Charts (Chart.js) ---------- */
  if (typeof Chart !== "undefined") {
    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.font.weight = 500;
    Chart.defaults.font.size = 12;
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  const primaryColor = "rgb(115, 93, 255)";
  const boyBarColor = "rgb(115, 93, 255)";
  const girlBarColor = "#ddd6fe";
  const guruLineColor = "#fb923c";

  function demoSeries(len, seed, min, max) {
    const out = [];
    let s = seed;
    for (let i = 0; i < len; i++) {
      s = (s * 9301 + 49297) % 233280;
      const r = s / 233280;
      out.push(Math.round(min + r * (max - min)));
    }
    return out;
  }

  /** Sample kehadiran: ketiga seri magnitudonya mirip (±beberapa poin). */
  function getAttendanceData(sort) {
    if (sort === "month") {
      return {
        labels: months,
        boys: [23, 24, 23, 24, 23, 25, 24, 25, 24, 23, 24, 23],
        girls: [24, 25, 24, 25, 24, 26, 25, 26, 25, 24, 25, 24],
        guru: [25, 26, 25, 26, 25, 27, 26, 27, 26, 25, 26, 25],
      };
    }
    if (sort === "week") {
      return {
        labels: weekDays,
        boys: demoSeries(7, 101, 22, 28),
        girls: demoSeries(7, 202, 23, 29),
        guru: demoSeries(7, 303, 24, 30),
      };
    }
    if (sort === "lastweek") {
      return {
        labels: weekDays,
        boys: demoSeries(7, 404, 21, 27),
        girls: demoSeries(7, 505, 22, 28),
        guru: demoSeries(7, 606, 23, 29),
      };
    }
    if (sort === "lastmonth") {
      return {
        labels: months,
        boys: [22, 23, 22, 23, 22, 24, 23, 24, 23, 22, 23, 22],
        girls: [23, 24, 23, 24, 23, 25, 24, 25, 24, 23, 24, 23],
        guru: [24, 25, 24, 25, 24, 26, 25, 26, 25, 24, 25, 24],
      };
    }
    return getAttendanceData("month");
  }

  function buildAttendanceChartOptions() {
    const isDark = doc.getAttribute("data-theme") === "dark";
    const tickColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(100, 116, 139, 0.85)";

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      datasets: {
        bar: {
          /* Ref. Zynix: batang tipis, cluster bulan renggang; sedikit celah antar laki/perempuan */
          categoryPercentage: 0.48,
          barPercentage: 0.88,
        },
      },
      elements: {
        line: {
          borderCapStyle: "round",
          borderJoinStyle: "round",
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          /* Gelap semi-transparan + teks putih (konsisten di light/dark) */
          backgroundColor: "rgba(22, 22, 26, 0.88)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          boxPadding: 6,
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          titleFont: { family: "'Poppins', sans-serif", size: 13, weight: "600" },
          titleMarginBottom: 8,
          bodyFont: { family: "'Poppins', sans-serif", size: 12, weight: "400" },
          bodySpacing: 6,
          itemSort: function (a, b) {
            var order = { Guru: 0, "Siswa Laki-laki": 1, "siswa perempuan": 2 };
            return (order[a.dataset.label] ?? 99) - (order[b.dataset.label] ?? 99);
          },
          callbacks: {
            title: function (items) {
              if (!items.length) return "";
              return items[0].label;
            },
            label: function (ctx) {
              const raw = ctx.parsed && typeof ctx.parsed.y === "number" ? ctx.parsed.y : null;
              const v = raw !== null ? Math.round(raw) : "";
              const name = ctx.dataset.label || "";
              return name + ": " + v;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: false,
          grid: { display: false, drawOnChartArea: false },
          border: { display: false },
          ticks: {
            color: tickColor,
            font: { family: "'Poppins', sans-serif", size: 12, weight: 500 },
          },
        },
        y: {
          min: 0,
          max: 35,
          grid: { display: false, drawOnChartArea: false },
          border: { display: false },
          ticks: {
            stepSize: 5,
            color: tickColor,
            font: { family: "'Poppins', sans-serif", size: 12, weight: 500 },
            callback: function (value) {
              return value;
            },
          },
        },
      },
    };
  }

  const trendCtx = document.getElementById("trendChart");
  let attendanceTrendChart = null;

  if (trendCtx && typeof Chart !== "undefined") {
    const initial = getAttendanceData("lastmonth");

    attendanceTrendChart = new Chart(trendCtx, {
      type: "bar",
      data: {
        labels: initial.labels,
        datasets: [
          {
            label: "Siswa Laki-laki",
            data: initial.boys,
            backgroundColor: boyBarColor,
            borderRadius: 5,
            borderSkipped: "bottom",
            order: 0,
          },
          {
            label: "siswa perempuan",
            data: initial.girls,
            backgroundColor: girlBarColor,
            borderRadius: 5,
            borderSkipped: "bottom",
            order: 0,
          },
          {
            type: "line",
            label: "Guru",
            data: initial.guru,
            borderColor: guruLineColor,
            backgroundColor: "transparent",
            borderWidth: 2,
            borderDash: [1, 5],
            cubicInterpolationMode: "monotone",
            tension: 0.45,
            pointRadius: 2,
            pointHoverRadius: 4,
            pointBackgroundColor: guruLineColor,
            pointBorderColor: "#ffffff",
            pointBorderWidth: 1,
            fill: false,
            yAxisID: "y",
            order: 1,
          },
        ],
      },
      options: buildAttendanceChartOptions(),
    });

    const sortMenu = document.getElementById("sortByMenu");
    if (sortMenu) {
      sortMenu.querySelectorAll("[data-sort]").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          const sort = btn.getAttribute("data-sort");
          sortMenu.querySelectorAll("[data-sort]").forEach(function (b) {
            b.classList.toggle("active", b === btn);
          });
          const d = getAttendanceData(sort);
          attendanceTrendChart.data.labels = d.labels;
          attendanceTrendChart.data.datasets[0].data = d.boys;
          attendanceTrendChart.data.datasets[1].data = d.girls;
          attendanceTrendChart.data.datasets[2].data = d.guru;
          attendanceTrendChart.update();
        });
      });
    }

    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        if (!attendanceTrendChart) return;
        const opts = buildAttendanceChartOptions();
        attendanceTrendChart.options.plugins.tooltip = opts.plugins.tooltip;
        const leg = attendanceTrendChart.options.plugins.legend;
        if (leg && leg.labels && opts.plugins.legend && opts.plugins.legend.labels) {
          leg.labels.color = opts.plugins.legend.labels.color;
        }
        attendanceTrendChart.options.scales.x.ticks.color = opts.scales.x.ticks.color;
        attendanceTrendChart.options.scales.y.ticks.color = opts.scales.y.ticks.color;
        attendanceTrendChart.update();
      });
    }
  }

  const pieCtx = document.getElementById("pieChart");
  const pieLegendEl = document.getElementById("pieLegend");
  if (pieCtx && typeof Chart !== "undefined") {
    const pieLabels = ["Lunas", "Pending", "Terlambat"];
    const pieData = [62, 24, 14];
    const pieColors = [primaryColor, "#fdba74", "#5eead4"];

    new Chart(pieCtx, {
      type: "doughnut",
      data: {
        labels: pieLabels,
        datasets: [
          {
            data: pieData,
            backgroundColor: pieColors,
            borderWidth: 0,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(15,23,42,0.92)",
            padding: 12,
            cornerRadius: 10,
          },
        },
      },
    });

    if (pieLegendEl) {
      pieLegendEl.innerHTML = pieLabels
        .map(function (label, i) {
          return (
            '<span class="d-inline-flex align-items-center gap-1"><span class="rounded-circle d-inline-block" style="width:8px;height:8px;background:' +
            pieColors[i] +
            '"></span>' +
            label +
            " " +
            pieData[i] +
            "%</span>"
          );
        })
        .join("");
    }
  }

  /* ---------- Util + tabel data (Kelas / Murid) — satu bundle ---------- */
  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function filterTableRowsByQuery(tableBody, query, columnIndexes) {
    const q = query.trim().toLowerCase();
    const rows = [];
    tableBody.querySelectorAll("tr").forEach(function (tr) {
      const cells = tr.cells;
      if (!cells || !cells.length) return;
      if (!q) {
        rows.push(tr);
        return;
      }
      for (let i = 0; i < columnIndexes.length; i++) {
        const idx = columnIndexes[i];
        if (cells[idx] && cells[idx].textContent.trim().toLowerCase().indexOf(q) !== -1) {
          rows.push(tr);
          return;
        }
      }
    });
    return rows;
  }

  function applyPagedRowVisibility(tableBody, matchingRows, page, pageSize) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    tableBody.querySelectorAll("tr").forEach(function (tr) {
      const idx = matchingRows.indexOf(tr);
      if (idx === -1) {
        tr.classList.add("d-none");
        return;
      }
      tr.classList.toggle("d-none", idx < start || idx >= end);
    });
  }

  function renderPaginationList(paginationUl, params) {
    const totalPages = params.totalPages;
    const total = params.total;
    const currentPage = params.currentPage;
    const setPage = params.setPage;
    const refresh = params.refresh;

    if (!paginationUl) return;
    paginationUl.innerHTML = "";

    function addItem(config) {
      const li = document.createElement("li");
      li.className = "page-item" + (config.disabled ? " disabled" : "") + (config.active ? " active" : "");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "page-link py-1 px-2 small";
      btn.textContent = config.text;
      btn.setAttribute("aria-label", config.aria || config.text);
      if (config.disabled) {
        btn.disabled = true;
      } else {
        btn.addEventListener("click", function () {
          setPage(config.page);
          refresh();
        });
      }
      li.appendChild(btn);
      paginationUl.appendChild(li);
    }

    if (total === 0) return;

    if (totalPages <= 1) {
      addItem({ text: "‹", page: 1, disabled: true, aria: "Sebelumnya" });
      addItem({ text: "1", page: 1, disabled: false, active: true });
      addItem({ text: "›", page: 1, disabled: true, aria: "Berikutnya" });
      return;
    }

    addItem({
      text: "‹",
      page: currentPage - 1,
      disabled: currentPage <= 1,
      aria: "Sebelumnya",
    });

    const maxBtns = 7;
    let start = 1;
    let end = totalPages;
    if (totalPages > maxBtns) {
      const half = Math.floor(maxBtns / 2);
      start = Math.max(1, currentPage - half);
      end = Math.min(totalPages, start + maxBtns - 1);
      if (end - start < maxBtns - 1) {
        start = Math.max(1, end - maxBtns + 1);
      }
    }

    function addPageNum(p) {
      addItem({
        text: String(p),
        page: p,
        disabled: false,
        active: p === currentPage,
        aria: "Halaman " + p,
      });
    }

    if (start > 1) {
      addPageNum(1);
      if (start > 2) {
        const li = document.createElement("li");
        li.className = "page-item disabled";
        const span = document.createElement("span");
        span.className = "page-link py-1 px-2 small";
        span.textContent = "…";
        li.appendChild(span);
        paginationUl.appendChild(li);
      }
    }

    for (let p = start; p <= end; p++) {
      addPageNum(p);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        const li2 = document.createElement("li");
        li2.className = "page-item disabled";
        const span2 = document.createElement("span");
        span2.className = "page-link py-1 px-2 small";
        span2.textContent = "…";
        li2.appendChild(span2);
        paginationUl.appendChild(li2);
      }
      addPageNum(totalPages);
    }

    addItem({
      text: "›",
      page: currentPage + 1,
      disabled: currentPage >= totalPages,
      aria: "Berikutnya",
    });
  }

  function updatePageInfoText(pageInfo, start, end, total) {
    if (!pageInfo) return;
    if (total === 0) {
      pageInfo.textContent = "Tidak ada data";
    } else {
      const from = start + 1;
      const to = Math.min(end, total);
      pageInfo.textContent = "Menampilkan " + from + "–" + to + " dari " + total;
    }
  }

  /** Sort baris tbody saat header th memiliki data-erp-sort (indeks kolom) */
  function initSortableThead(table, tbody, onSorted) {
    if (!table || !tbody) return;
    const thead = table.querySelector("thead");
    if (!thead) return;
    const sortHeaders = thead.querySelectorAll("th[data-erp-sort]");
    if (!sortHeaders.length) return;

    let sortCol = null;
    let sortDir = 1;

    function clearAriaSort() {
      sortHeaders.forEach(function (h) {
        h.setAttribute("aria-sort", "none");
      });
    }

    sortHeaders.forEach(function (th) {
      th.classList.add("erp-th-sortable");
      th.setAttribute("role", "button");
      th.setAttribute("tabindex", "0");
      th.setAttribute("aria-sort", "none");

      function activate() {
        const col = parseInt(th.getAttribute("data-erp-sort"), 10);
        const type = th.getAttribute("data-erp-sort-type") || "text";
        if (isNaN(col)) return;
        if (sortCol === col) {
          sortDir *= -1;
        } else {
          sortCol = col;
          sortDir = 1;
        }
        clearAriaSort();
        th.setAttribute("aria-sort", sortDir === 1 ? "ascending" : "descending");

        const rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
        rows.sort(function (a, b) {
          const ca = a.cells[col];
          const cb = b.cells[col];
          const ta = ca ? ca.textContent.trim() : "";
          const tb = cb ? cb.textContent.trim() : "";
          let cmp = 0;
          if (type === "number") {
            const na = parseFloat(String(ta).replace(/[^\d.-]/g, "")) || 0;
            const nb = parseFloat(String(tb).replace(/[^\d.-]/g, "")) || 0;
            cmp = na - nb;
          } else {
            cmp = ta.localeCompare(tb, "id", { numeric: true, sensitivity: "base" });
          }
          return cmp * sortDir;
        });
        rows.forEach(function (r) {
          tbody.appendChild(r);
        });
        if (typeof onSorted === "function") onSorted();
      }

      th.addEventListener("click", function (e) {
        e.preventDefault();
        activate();
      });
      th.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  function formatRupiahDisplay(n) {
    const num = typeof n === "number" ? n : parseInt(String(n).replace(/\D/g, ""), 10) || 0;
    return "Rp" + num.toLocaleString("id-ID");
  }

  function formatTanggalIdShort(iso) {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  function initGuruTable() {
    const tableBody = document.getElementById("guruTableBody");
    const formGuru = document.getElementById("formGuru");
    if (!tableBody || !formGuru) return;

    const searchGuru = document.getElementById("searchGuru");
    const pageSizeSelect = document.getElementById("guruPageSize");
    const paginationUl = document.getElementById("guruPagination");
    const pageInfo = document.getElementById("guruPageInfo");
    const modalEl = document.getElementById("modalGuru");
    const modalTitle = document.getElementById("modalGuruTitle");
    const inputId = document.getElementById("guruEditId");
    const inputNama = document.getElementById("guruNama");
    const inputMapel = document.getElementById("guruMapel");
    const inputKontak = document.getElementById("guruKontak");
    const inputStatus = document.getElementById("guruStatus");
    const btnTambah = document.getElementById("btnTambahGuru");

    let nextId = 13;
    let currentPage = 1;
    let pageSize = pageSizeSelect ? parseInt(pageSizeSelect.value, 10) || 10 : 10;

    function statusBadgeHtml(isAktif) {
      if (isAktif) {
        return '<span class="badge rounded-pill erp-badge-status erp-badge-pass">Aktif</span>';
      }
      return '<span class="badge rounded-pill erp-badge-status erp-badge-failed">Nonaktif</span>';
    }

    function isRowAktif(tr) {
      const badge = tr.cells[4] && tr.cells[4].querySelector(".erp-badge-status");
      if (!badge) return true;
      return badge.textContent.trim().toLowerCase() === "aktif";
    }

    function getMatchingRows() {
      const q = searchGuru && searchGuru.value ? searchGuru.value.trim() : "";
      return filterTableRowsByQuery(tableBody, q, [1, 2, 3]);
    }

    function updateTableView() {
      const matching = getMatchingRows();
      const total = matching.length;
      const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      applyPagedRowVisibility(tableBody, matching, currentPage, pageSize);
      updatePageInfoText(pageInfo, start, end, total);
      renderPaginationList(paginationUl, {
        totalPages: totalPages,
        total: total,
        currentPage: currentPage,
        setPage: function (p) {
          currentPage = p;
        },
        refresh: function () {
          updateTableView();
        },
      });
    }

    if (searchGuru) {
      searchGuru.addEventListener("input", function () {
        currentPage = 1;
        updateTableView();
      });
    }

    if (pageSizeSelect) {
      pageSizeSelect.addEventListener("change", function () {
        pageSize = parseInt(pageSizeSelect.value, 10) || 10;
        currentPage = 1;
        updateTableView();
      });
    }

    function openModalTambah() {
      if (modalTitle) modalTitle.textContent = "Tambah guru";
      if (inputId) inputId.value = "";
      formGuru.reset();
      if (inputStatus) inputStatus.value = "aktif";
    }

    function openModalEdit(tr) {
      if (modalTitle) modalTitle.textContent = "Edit guru";
      if (inputId) inputId.value = tr.getAttribute("data-id") || "";
      if (inputNama) inputNama.value = tr.cells[1].textContent.trim();
      if (inputMapel) inputMapel.value = tr.cells[2].textContent.trim();
      if (inputKontak) inputKontak.value = tr.cells[3].textContent.trim();
      if (inputStatus) inputStatus.value = isRowAktif(tr) ? "aktif" : "nonaktif";
    }

    if (btnTambah && modalEl) {
      btnTambah.addEventListener("click", function () {
        openModalTambah();
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
      });
    }

    tableBody.addEventListener("click", function (e) {
      const viewBtn = e.target.closest(".btn-view-guru");
      const editBtn = e.target.closest(".btn-edit-guru");
      const delBtn = e.target.closest(".btn-delete-guru");
      const tr = viewBtn ? viewBtn.closest("tr") : editBtn ? editBtn.closest("tr") : delBtn ? delBtn.closest("tr") : null;
      if (viewBtn && tr) {
        const a = tr.cells[1] ? tr.cells[1].textContent.trim() : "";
        const b = tr.cells[2] ? tr.cells[2].textContent.trim() : "";
        const c = tr.cells[3] ? tr.cells[3].textContent.trim() : "";
        const d = tr.cells[4] ? tr.cells[4].textContent.trim() : "";
        alert("Detail guru\n\nNama: " + a + "\nMapel: " + b + "\nKontak: " + c + "\nStatus: " + d);
        return;
      }
      if (editBtn && tr && modalEl) {
        openModalEdit(tr);
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
        return;
      }
      if (delBtn && tr) {
        const nama = tr.cells[1] ? tr.cells[1].textContent.trim() : "";
        if (confirm('Hapus guru "' + nama + '"?')) {
          tr.remove();
          updateTableView();
        }
      }
    });

    const guruTableEl = tableBody.closest("table");
    if (guruTableEl) {
      initSortableThead(guruTableEl, tableBody, function () {
        currentPage = 1;
        updateTableView();
      });
    }

    formGuru.addEventListener("submit", function (e) {
      e.preventDefault();
      const id = inputId && inputId.value ? inputId.value : "";
      const nama = inputNama ? inputNama.value.trim() : "";
      const mapel = inputMapel ? inputMapel.value.trim() : "";
      const kontak = inputKontak ? inputKontak.value.trim() : "";
      const st = inputStatus && inputStatus.value === "nonaktif" ? false : true;

      if (!nama || !mapel || !kontak) {
        alert("Nama guru, mata pelajaran, dan kontak wajib diisi.");
        return;
      }

      if (id) {
        const row = tableBody.querySelector('tr[data-id="' + id.replace(/"/g, "") + '"]');
        if (row) {
          row.cells[1].textContent = nama;
          row.cells[2].textContent = mapel;
          row.cells[3].textContent = kontak;
          row.cells[4].innerHTML = statusBadgeHtml(st);
        }
      } else {
        const newId = String(nextId);
        nextId += 1;
        const tr = document.createElement("tr");
        tr.setAttribute("data-id", newId);
        tr.innerHTML =
          '<td class="ps-4 text-muted">' +
          newId +
          "</td>" +
          "<td>" +
          escapeHtml(nama) +
          "</td>" +
          "<td>" +
          escapeHtml(mapel) +
          "</td>" +
          "<td>" +
          escapeHtml(kontak) +
          "</td>" +
          "<td>" +
          statusBadgeHtml(st) +
          "</td>" +
          '<td class="text-end pe-4 text-nowrap">' +
          '<div class="d-inline-flex align-items-center justify-content-end erp-table-actions">' +
          '<button type="button" class="btn btn-action btn-action-view btn-view-guru" title="Lihat"><i class="bi bi-eye"></i></button>' +
          '<button type="button" class="btn btn-action btn-action-edit btn-edit-guru" title="Edit"><i class="bi bi-pencil"></i></button>' +
          '<button type="button" class="btn btn-action btn-action-delete btn-delete-guru" title="Hapus"><i class="bi bi-trash"></i></button>' +
          "</div></td>";
        tableBody.appendChild(tr);
        currentPage = Math.ceil(getMatchingRows().length / pageSize);
      }

      const modal = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
      updateTableView();
    });

    updateTableView();
  }

  function initTagihanTable() {
    const tableBody = document.getElementById("tagihanTableBody");
    const formTagihan = document.getElementById("formTagihan");
    if (!tableBody || !formTagihan) return;

    const searchTagihan = document.getElementById("searchTagihan");
    const pageSizeSelect = document.getElementById("tagihanPageSize");
    const paginationUl = document.getElementById("tagihanPagination");
    const pageInfo = document.getElementById("tagihanPageInfo");
    const modalEl = document.getElementById("modalTagihan");
    const modalTitle = document.getElementById("modalTagihanTitle");
    const inputId = document.getElementById("tagihanEditId");
    const inputMurid = document.getElementById("tagihanMurid");
    const inputJenis = document.getElementById("tagihanJenis");
    const inputNominal = document.getElementById("tagihanNominal");
    const inputTempo = document.getElementById("tagihanJatuhTempo");
    const inputStatus = document.getElementById("tagihanStatus");
    const btnTambah = document.getElementById("btnTambahTagihan");

    let nextId = 13;
    let currentPage = 1;
    let pageSize = pageSizeSelect ? parseInt(pageSizeSelect.value, 10) || 10 : 10;

    function tagihanStatusBadgeHtml(val) {
      if (val === "lunas") {
        return '<span class="badge rounded-pill erp-badge-status erp-badge-pass">Lunas</span>';
      }
      if (val === "terlambat") {
        return '<span class="badge rounded-pill erp-badge-status erp-badge-failed">Terlambat</span>';
      }
      return '<span class="badge rounded-pill text-bg-warning">Pending</span>';
    }

    function tagihanStatusFromRow(tr) {
      const badge = tr.cells[5] && tr.cells[5].querySelector(".badge");
      if (!badge) return "pending";
      const t = badge.textContent.trim().toLowerCase();
      if (t === "lunas") return "lunas";
      if (t === "terlambat") return "terlambat";
      return "pending";
    }

    function getMatchingRows() {
      const q = searchTagihan && searchTagihan.value ? searchTagihan.value.trim() : "";
      return filterTableRowsByQuery(tableBody, q, [1, 2, 3, 5]);
    }

    function updateTableView() {
      const matching = getMatchingRows();
      const total = matching.length;
      const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      applyPagedRowVisibility(tableBody, matching, currentPage, pageSize);
      updatePageInfoText(pageInfo, start, end, total);
      renderPaginationList(paginationUl, {
        totalPages: totalPages,
        total: total,
        currentPage: currentPage,
        setPage: function (p) {
          currentPage = p;
        },
        refresh: function () {
          updateTableView();
        },
      });
    }

    if (searchTagihan) {
      searchTagihan.addEventListener("input", function () {
        currentPage = 1;
        updateTableView();
      });
    }

    if (pageSizeSelect) {
      pageSizeSelect.addEventListener("change", function () {
        pageSize = parseInt(pageSizeSelect.value, 10) || 10;
        currentPage = 1;
        updateTableView();
      });
    }

    function openModalTambah() {
      if (modalTitle) modalTitle.textContent = "Tambah tagihan";
      if (inputId) inputId.value = "";
      formTagihan.reset();
      if (inputNominal) inputNominal.value = "0";
      if (inputStatus) inputStatus.value = "pending";
    }

    function openModalEdit(tr) {
      if (modalTitle) modalTitle.textContent = "Edit tagihan";
      if (inputId) inputId.value = tr.getAttribute("data-id") || "";
      if (inputMurid) inputMurid.value = tr.cells[1].textContent.trim();
      if (inputJenis) inputJenis.value = tr.cells[2].textContent.trim();
      const rawNom = tr.cells[3] ? tr.cells[3].textContent.trim() : "0";
      if (inputNominal) inputNominal.value = String(parseInt(rawNom.replace(/\D/g, ""), 10) || 0);
      const iso = tr.getAttribute("data-jatuh-tempo") || "";
      if (inputTempo) inputTempo.value = iso;
      if (inputStatus) inputStatus.value = tagihanStatusFromRow(tr);
    }

    if (btnTambah && modalEl) {
      btnTambah.addEventListener("click", function () {
        openModalTambah();
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
      });
    }

    tableBody.addEventListener("click", function (e) {
      const viewBtn = e.target.closest(".btn-view-tagihan");
      const editBtn = e.target.closest(".btn-edit-tagihan");
      const delBtn = e.target.closest(".btn-delete-tagihan");
      const tr = viewBtn ? viewBtn.closest("tr") : editBtn ? editBtn.closest("tr") : delBtn ? delBtn.closest("tr") : null;
      if (viewBtn && tr) {
        const m = tr.cells[1] ? tr.cells[1].textContent.trim() : "";
        const j = tr.cells[2] ? tr.cells[2].textContent.trim() : "";
        const n = tr.cells[3] ? tr.cells[3].textContent.trim() : "";
        const t = tr.cells[4] ? tr.cells[4].textContent.trim() : "";
        const s = tr.cells[5] ? tr.cells[5].textContent.trim() : "";
        alert("Detail tagihan\n\nMurid: " + m + "\nJenis: " + j + "\nNominal: " + n + "\nJatuh tempo: " + t + "\nStatus: " + s);
        return;
      }
      if (editBtn && tr && modalEl) {
        openModalEdit(tr);
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
        return;
      }
      if (delBtn && tr) {
        const nama = tr.cells[1] ? tr.cells[1].textContent.trim() : "";
        if (confirm('Hapus tagihan untuk "' + nama + '"?')) {
          tr.remove();
          updateTableView();
        }
      }
    });

    const tbl = tableBody.closest("table");
    if (tbl) {
      initSortableThead(tbl, tableBody, function () {
        currentPage = 1;
        updateTableView();
      });
    }

    formTagihan.addEventListener("submit", function (e) {
      e.preventDefault();
      const id = inputId && inputId.value ? inputId.value : "";
      const murid = inputMurid ? inputMurid.value.trim() : "";
      const jenis = inputJenis ? inputJenis.value.trim() : "";
      let nominal = inputNominal ? parseInt(inputNominal.value, 10) : 0;
      if (isNaN(nominal) || nominal < 0) nominal = 0;
      const tempoIso = inputTempo && inputTempo.value ? inputTempo.value : "";
      const st = inputStatus && inputStatus.value ? inputStatus.value : "pending";

      if (!murid || !jenis || !tempoIso) {
        alert("Nama murid, jenis tagihan, dan jatuh tempo wajib diisi.");
        return;
      }

      const nomStr = formatRupiahDisplay(nominal);
      const tglStr = formatTanggalIdShort(tempoIso);

      if (id) {
        const row = tableBody.querySelector('tr[data-id="' + id.replace(/"/g, "") + '"]');
        if (row) {
          row.setAttribute("data-jatuh-tempo", tempoIso);
          row.cells[1].textContent = murid;
          row.cells[2].textContent = jenis;
          row.cells[3].textContent = nomStr;
          row.cells[4].textContent = tglStr;
          row.cells[5].innerHTML = tagihanStatusBadgeHtml(st);
        }
      } else {
        const newId = String(nextId);
        nextId += 1;
        const tr = document.createElement("tr");
        tr.setAttribute("data-id", newId);
        tr.setAttribute("data-jatuh-tempo", tempoIso);
        tr.innerHTML =
          '<td class="ps-4 text-muted">' +
          newId +
          "</td>" +
          "<td>" +
          escapeHtml(murid) +
          "</td>" +
          "<td>" +
          escapeHtml(jenis) +
          "</td>" +
          "<td>" +
          nomStr +
          "</td>" +
          "<td>" +
          tglStr +
          "</td>" +
          "<td>" +
          tagihanStatusBadgeHtml(st) +
          "</td>" +
          '<td class="text-end pe-4 text-nowrap">' +
          '<div class="d-inline-flex align-items-center justify-content-end erp-table-actions">' +
          '<button type="button" class="btn btn-action btn-action-view btn-view-tagihan" title="Lihat"><i class="bi bi-eye"></i></button>' +
          '<button type="button" class="btn btn-action btn-action-edit btn-edit-tagihan" title="Edit"><i class="bi bi-pencil"></i></button>' +
          '<button type="button" class="btn btn-action btn-action-delete btn-delete-tagihan" title="Hapus"><i class="bi bi-trash"></i></button>' +
          "</div></td>";
        tableBody.appendChild(tr);
        currentPage = Math.ceil(getMatchingRows().length / pageSize);
      }

      const modal = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
      updateTableView();
    });

    updateTableView();
  }

  function initPaymentTable() {
    const tableBody = document.getElementById("paymentTableBody");
    const formPayment = document.getElementById("formPayment");
    if (!tableBody || !formPayment) return;

    const searchPayment = document.getElementById("searchPayment");
    const pageSizeSelect = document.getElementById("paymentPageSize");
    const paginationUl = document.getElementById("paymentPagination");
    const pageInfo = document.getElementById("paymentPageInfo");
    const modalEl = document.getElementById("modalPayment");
    const modalTitle = document.getElementById("modalPaymentTitle");
    const inputId = document.getElementById("paymentEditId");
    const inputKode = document.getElementById("paymentKode");
    const inputMurid = document.getElementById("paymentMurid");
    const inputMetode = document.getElementById("paymentMetode");
    const inputJumlah = document.getElementById("paymentJumlah");
    const inputTanggal = document.getElementById("paymentTanggal");
    const inputStatus = document.getElementById("paymentStatus");
    const btnTambah = document.getElementById("btnTambahPayment");

    let nextId = 13;
    let currentPage = 1;
    let pageSize = pageSizeSelect ? parseInt(pageSizeSelect.value, 10) || 10 : 10;

    function paymentStatusBadgeHtml(val) {
      if (val === "berhasil") {
        return '<span class="badge rounded-pill erp-badge-status erp-badge-pass">Berhasil</span>';
      }
      if (val === "gagal") {
        return '<span class="badge rounded-pill erp-badge-status erp-badge-failed">Gagal</span>';
      }
      return '<span class="badge rounded-pill text-bg-warning">Pending</span>';
    }

    function paymentStatusFromRow(tr) {
      const badge = tr.cells[6] && tr.cells[6].querySelector(".badge");
      if (!badge) return "pending";
      const t = badge.textContent.trim().toLowerCase();
      if (t === "berhasil") return "berhasil";
      if (t === "gagal") return "gagal";
      return "pending";
    }

    function getMatchingRows() {
      const q = searchPayment && searchPayment.value ? searchPayment.value.trim() : "";
      return filterTableRowsByQuery(tableBody, q, [1, 2, 3, 4, 5, 6]);
    }

    function updateTableView() {
      const matching = getMatchingRows();
      const total = matching.length;
      const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      applyPagedRowVisibility(tableBody, matching, currentPage, pageSize);
      updatePageInfoText(pageInfo, start, end, total);
      renderPaginationList(paginationUl, {
        totalPages: totalPages,
        total: total,
        currentPage: currentPage,
        setPage: function (p) {
          currentPage = p;
        },
        refresh: function () {
          updateTableView();
        },
      });
    }

    if (searchPayment) {
      searchPayment.addEventListener("input", function () {
        currentPage = 1;
        updateTableView();
      });
    }

    if (pageSizeSelect) {
      pageSizeSelect.addEventListener("change", function () {
        pageSize = parseInt(pageSizeSelect.value, 10) || 10;
        currentPage = 1;
        updateTableView();
      });
    }

    function openModalTambah() {
      if (modalTitle) modalTitle.textContent = "Tambah payment";
      if (inputId) inputId.value = "";
      formPayment.reset();
      if (inputJumlah) inputJumlah.value = "0";
      if (inputStatus) inputStatus.value = "berhasil";
    }

    function openModalEdit(tr) {
      if (modalTitle) modalTitle.textContent = "Edit payment";
      if (inputId) inputId.value = tr.getAttribute("data-id") || "";
      if (inputKode) inputKode.value = tr.cells[1].textContent.trim();
      if (inputMurid) inputMurid.value = tr.cells[2].textContent.trim();
      if (inputMetode) inputMetode.value = tr.cells[3].textContent.trim();
      const rawJ = tr.cells[4] ? tr.cells[4].textContent.trim() : "0";
      if (inputJumlah) inputJumlah.value = String(parseInt(rawJ.replace(/\D/g, ""), 10) || 0);
      const iso = tr.getAttribute("data-tanggal-bayar") || "";
      if (inputTanggal) inputTanggal.value = iso;
      if (inputStatus) inputStatus.value = paymentStatusFromRow(tr);
    }

    if (btnTambah && modalEl) {
      btnTambah.addEventListener("click", function () {
        openModalTambah();
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
      });
    }

    tableBody.addEventListener("click", function (e) {
      const viewBtn = e.target.closest(".btn-view-payment");
      const editBtn = e.target.closest(".btn-edit-payment");
      const delBtn = e.target.closest(".btn-delete-payment");
      const tr = viewBtn ? viewBtn.closest("tr") : editBtn ? editBtn.closest("tr") : delBtn ? delBtn.closest("tr") : null;
      if (viewBtn && tr) {
        const parts = [];
        const labels = ["Kode", "Murid", "Metode", "Jumlah", "Tanggal", "Status"];
        for (let c = 1; c <= 6; c++) {
          parts.push(labels[c - 1] + ": " + (tr.cells[c] ? tr.cells[c].textContent.trim() : "—"));
        }
        alert("Detail payment\n\n" + parts.join("\n"));
        return;
      }
      if (editBtn && tr && modalEl) {
        openModalEdit(tr);
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
        return;
      }
      if (delBtn && tr) {
        const kode = tr.cells[1] ? tr.cells[1].textContent.trim() : "";
        if (confirm('Hapus payment "' + kode + '"?')) {
          tr.remove();
          updateTableView();
        }
      }
    });

    const tbl = tableBody.closest("table");
    if (tbl) {
      initSortableThead(tbl, tableBody, function () {
        currentPage = 1;
        updateTableView();
      });
    }

    formPayment.addEventListener("submit", function (e) {
      e.preventDefault();
      const id = inputId && inputId.value ? inputId.value : "";
      const kode = inputKode ? inputKode.value.trim() : "";
      const murid = inputMurid ? inputMurid.value.trim() : "";
      const metode = inputMetode ? inputMetode.value.trim() : "";
      let jumlah = inputJumlah ? parseInt(inputJumlah.value, 10) : 0;
      if (isNaN(jumlah) || jumlah < 0) jumlah = 0;
      const tanggalIso = inputTanggal && inputTanggal.value ? inputTanggal.value : "";
      const st = inputStatus && inputStatus.value ? inputStatus.value : "berhasil";

      if (!kode || !murid || !metode || !tanggalIso) {
        alert("Kode, murid, metode, dan tanggal wajib diisi.");
        return;
      }

      const jumStr = formatRupiahDisplay(jumlah);
      const tglStr = formatTanggalIdShort(tanggalIso);

      if (id) {
        const row = tableBody.querySelector('tr[data-id="' + id.replace(/"/g, "") + '"]');
        if (row) {
          row.setAttribute("data-tanggal-bayar", tanggalIso);
          row.cells[1].textContent = kode;
          row.cells[2].textContent = murid;
          row.cells[3].textContent = metode;
          row.cells[4].textContent = jumStr;
          row.cells[5].textContent = tglStr;
          row.cells[6].innerHTML = paymentStatusBadgeHtml(st);
        }
      } else {
        const newId = String(nextId);
        nextId += 1;
        const tr = document.createElement("tr");
        tr.setAttribute("data-id", newId);
        tr.setAttribute("data-tanggal-bayar", tanggalIso);
        tr.innerHTML =
          '<td class="ps-4 text-muted">' +
          newId +
          "</td>" +
          "<td>" +
          escapeHtml(kode) +
          "</td>" +
          "<td>" +
          escapeHtml(murid) +
          "</td>" +
          "<td>" +
          escapeHtml(metode) +
          "</td>" +
          "<td>" +
          jumStr +
          "</td>" +
          "<td>" +
          tglStr +
          "</td>" +
          "<td>" +
          paymentStatusBadgeHtml(st) +
          "</td>" +
          '<td class="text-end pe-4 text-nowrap">' +
          '<div class="d-inline-flex align-items-center justify-content-end erp-table-actions">' +
          '<button type="button" class="btn btn-action btn-action-view btn-view-payment" title="Lihat"><i class="bi bi-eye"></i></button>' +
          '<button type="button" class="btn btn-action btn-action-edit btn-edit-payment" title="Edit"><i class="bi bi-pencil"></i></button>' +
          '<button type="button" class="btn btn-action btn-action-delete btn-delete-payment" title="Hapus"><i class="bi bi-trash"></i></button>' +
          "</div></td>";
        tableBody.appendChild(tr);
        currentPage = Math.ceil(getMatchingRows().length / pageSize);
      }

      const modal = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
      updateTableView();
    });

    updateTableView();
  }

  function initAbsensiTable() {
    const tableBody = document.getElementById("absensiTableBody");
    const formAbsensi = document.getElementById("formAbsensi");
    if (!tableBody || !formAbsensi) return;

    const searchAbsensi = document.getElementById("searchAbsensi");
    const pageSizeSelect = document.getElementById("absensiPageSize");
    const paginationUl = document.getElementById("absensiPagination");
    const pageInfo = document.getElementById("absensiPageInfo");
    const modalEl = document.getElementById("modalAbsensi");
    const modalTitle = document.getElementById("modalAbsensiTitle");
    const inputId = document.getElementById("absensiEditId");
    const inputMurid = document.getElementById("absensiMurid");
    const inputKelas = document.getElementById("absensiKelas");
    const inputTanggal = document.getElementById("absensiTanggal");
    const inputKehadiran = document.getElementById("absensiKehadiran");
    const inputKeterangan = document.getElementById("absensiKeterangan");
    const btnTambah = document.getElementById("btnTambahAbsensi");

    let nextId = 13;
    let currentPage = 1;
    let pageSize = pageSizeSelect ? parseInt(pageSizeSelect.value, 10) || 10 : 10;

    function absensiBadgeHtml(val) {
      if (val === "hadir") {
        return '<span class="badge rounded-pill erp-badge-status erp-badge-pass">Hadir</span>';
      }
      if (val === "izin") {
        return '<span class="badge rounded-pill text-bg-warning">Izin</span>';
      }
      if (val === "sakit") {
        return '<span class="badge rounded-pill text-bg-secondary">Sakit</span>';
      }
      return '<span class="badge rounded-pill erp-badge-status erp-badge-failed">Alpha</span>';
    }

    function absensiFromRow(tr) {
      const badge = tr.cells[4] && tr.cells[4].querySelector(".badge");
      if (!badge) return "hadir";
      const t = badge.textContent.trim().toLowerCase();
      if (t === "hadir") return "hadir";
      if (t === "izin") return "izin";
      if (t === "sakit") return "sakit";
      if (t === "alpha") return "alpha";
      return "hadir";
    }

    function getMatchingRows() {
      const q = searchAbsensi && searchAbsensi.value ? searchAbsensi.value.trim() : "";
      return filterTableRowsByQuery(tableBody, q, [1, 2, 3, 4, 5]);
    }

    function updateTableView() {
      const matching = getMatchingRows();
      const total = matching.length;
      const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      applyPagedRowVisibility(tableBody, matching, currentPage, pageSize);
      updatePageInfoText(pageInfo, start, end, total);
      renderPaginationList(paginationUl, {
        totalPages: totalPages,
        total: total,
        currentPage: currentPage,
        setPage: function (p) {
          currentPage = p;
        },
        refresh: function () {
          updateTableView();
        },
      });
    }

    if (searchAbsensi) {
      searchAbsensi.addEventListener("input", function () {
        currentPage = 1;
        updateTableView();
      });
    }

    if (pageSizeSelect) {
      pageSizeSelect.addEventListener("change", function () {
        pageSize = parseInt(pageSizeSelect.value, 10) || 10;
        currentPage = 1;
        updateTableView();
      });
    }

    function openModalTambah() {
      if (modalTitle) modalTitle.textContent = "Tambah absensi";
      if (inputId) inputId.value = "";
      formAbsensi.reset();
      if (inputKehadiran) inputKehadiran.value = "hadir";
    }

    function openModalEdit(tr) {
      if (modalTitle) modalTitle.textContent = "Edit absensi";
      if (inputId) inputId.value = tr.getAttribute("data-id") || "";
      if (inputMurid) inputMurid.value = tr.cells[1].textContent.trim();
      if (inputKelas) inputKelas.value = tr.cells[2].textContent.trim();
      const iso = tr.getAttribute("data-tanggal-absen") || "";
      if (inputTanggal) inputTanggal.value = iso;
      if (inputKehadiran) inputKehadiran.value = absensiFromRow(tr);
      if (inputKeterangan) inputKeterangan.value = tr.cells[5] ? tr.cells[5].textContent.trim() : "";
      if (inputKeterangan && inputKeterangan.value === "—") inputKeterangan.value = "";
    }

    if (btnTambah && modalEl) {
      btnTambah.addEventListener("click", function () {
        openModalTambah();
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
      });
    }

    tableBody.addEventListener("click", function (e) {
      const viewBtn = e.target.closest(".btn-view-absensi");
      const editBtn = e.target.closest(".btn-edit-absensi");
      const delBtn = e.target.closest(".btn-delete-absensi");
      const tr = viewBtn ? viewBtn.closest("tr") : editBtn ? editBtn.closest("tr") : delBtn ? delBtn.closest("tr") : null;
      if (viewBtn && tr) {
        const m = tr.cells[1] ? tr.cells[1].textContent.trim() : "";
        const k = tr.cells[2] ? tr.cells[2].textContent.trim() : "";
        const t = tr.cells[3] ? tr.cells[3].textContent.trim() : "";
        const h = tr.cells[4] ? tr.cells[4].textContent.trim() : "";
        const ket = tr.cells[5] ? tr.cells[5].textContent.trim() : "";
        alert("Detail absensi\n\nMurid: " + m + "\nKelas: " + k + "\nTanggal: " + t + "\nKehadiran: " + h + "\nKeterangan: " + ket);
        return;
      }
      if (editBtn && tr && modalEl) {
        openModalEdit(tr);
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
        return;
      }
      if (delBtn && tr) {
        const nama = tr.cells[1] ? tr.cells[1].textContent.trim() : "";
        if (confirm('Hapus absensi "' + nama + '"?')) {
          tr.remove();
          updateTableView();
        }
      }
    });

    const tbl = tableBody.closest("table");
    if (tbl) {
      initSortableThead(tbl, tableBody, function () {
        currentPage = 1;
        updateTableView();
      });
    }

    formAbsensi.addEventListener("submit", function (e) {
      e.preventDefault();
      const id = inputId && inputId.value ? inputId.value : "";
      const murid = inputMurid ? inputMurid.value.trim() : "";
      const kelas = inputKelas ? inputKelas.value.trim() : "";
      const tanggalIso = inputTanggal && inputTanggal.value ? inputTanggal.value : "";
      const keh = inputKehadiran && inputKehadiran.value ? inputKehadiran.value : "hadir";
      let ket = inputKeterangan ? inputKeterangan.value.trim() : "";
      if (ket === "") ket = "—";

      if (!murid || !kelas || !tanggalIso) {
        alert("Nama murid, kelas, dan tanggal wajib diisi.");
        return;
      }

      const tglStr = formatTanggalIdShort(tanggalIso);

      if (id) {
        const row = tableBody.querySelector('tr[data-id="' + id.replace(/"/g, "") + '"]');
        if (row) {
          row.setAttribute("data-tanggal-absen", tanggalIso);
          row.cells[1].textContent = murid;
          row.cells[2].textContent = kelas;
          row.cells[3].textContent = tglStr;
          row.cells[4].innerHTML = absensiBadgeHtml(keh);
          row.cells[5].textContent = ket;
        }
      } else {
        const newId = String(nextId);
        nextId += 1;
        const tr = document.createElement("tr");
        tr.setAttribute("data-id", newId);
        tr.setAttribute("data-tanggal-absen", tanggalIso);
        tr.innerHTML =
          '<td class="ps-4 text-muted">' +
          newId +
          "</td>" +
          "<td>" +
          escapeHtml(murid) +
          "</td>" +
          "<td>" +
          escapeHtml(kelas) +
          "</td>" +
          "<td>" +
          tglStr +
          "</td>" +
          "<td>" +
          absensiBadgeHtml(keh) +
          "</td>" +
          "<td>" +
          escapeHtml(ket) +
          "</td>" +
          '<td class="text-end pe-4 text-nowrap">' +
          '<div class="d-inline-flex align-items-center justify-content-end erp-table-actions">' +
          '<button type="button" class="btn btn-action btn-action-view btn-view-absensi" title="Lihat"><i class="bi bi-eye"></i></button>' +
          '<button type="button" class="btn btn-action btn-action-edit btn-edit-absensi" title="Edit"><i class="bi bi-pencil"></i></button>' +
          '<button type="button" class="btn btn-action btn-action-delete btn-delete-absensi" title="Hapus"><i class="bi bi-trash"></i></button>' +
          "</div></td>";
        tableBody.appendChild(tr);
        currentPage = Math.ceil(getMatchingRows().length / pageSize);
      }

      const modal = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
      updateTableView();
    });

    updateTableView();
  }

  function initKelasTable() {
    const tableBody = document.getElementById("kelasTableBody");
    const formKelas = document.getElementById("formKelas");
    if (!tableBody || !formKelas) return;

    const searchKelas = document.getElementById("searchKelas");
    const pageSizeSelect = document.getElementById("kelasPageSize");
    const paginationUl = document.getElementById("kelasPagination");
    const pageInfo = document.getElementById("kelasPageInfo");
    const modalEl = document.getElementById("modalKelas");
    const modalTitle = document.getElementById("modalKelasTitle");
    const inputId = document.getElementById("kelasEditId");
    const inputNama = document.getElementById("kelasNama");
    const inputWali = document.getElementById("kelasWali");
    const inputJumlah = document.getElementById("kelasJumlah");
    const btnTambah = document.getElementById("btnTambahKelas");

    let nextId = 13;
    let currentPage = 1;
    let pageSize = pageSizeSelect ? parseInt(pageSizeSelect.value, 10) || 10 : 10;

    function getMatchingRows() {
      const q = searchKelas && searchKelas.value ? searchKelas.value.trim() : "";
      return filterTableRowsByQuery(tableBody, q, [1, 2]);
    }

    function updateTableView() {
      const matching = getMatchingRows();
      const total = matching.length;
      const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      applyPagedRowVisibility(tableBody, matching, currentPage, pageSize);
      updatePageInfoText(pageInfo, start, end, total);
      renderPaginationList(paginationUl, {
        totalPages: totalPages,
        total: total,
        currentPage: currentPage,
        setPage: function (p) {
          currentPage = p;
        },
        refresh: function () {
          updateTableView();
        },
      });
    }

    if (searchKelas) {
      searchKelas.addEventListener("input", function () {
        currentPage = 1;
        updateTableView();
      });
    }

    if (pageSizeSelect) {
      pageSizeSelect.addEventListener("change", function () {
        pageSize = parseInt(pageSizeSelect.value, 10) || 10;
        currentPage = 1;
        updateTableView();
      });
    }

    function openModalTambah() {
      if (modalTitle) modalTitle.textContent = "Tambah Kelas";
      if (inputId) inputId.value = "";
      formKelas.reset();
      if (inputJumlah) inputJumlah.value = "0";
    }

    function openModalEdit(tr) {
      if (modalTitle) modalTitle.textContent = "Edit Kelas";
      if (inputId) inputId.value = tr.getAttribute("data-id") || "";
      if (inputNama) inputNama.value = tr.cells[1].textContent.trim();
      if (inputWali) inputWali.value = tr.cells[2].textContent.trim();
      if (inputJumlah) inputJumlah.value = tr.cells[3].textContent.trim();
    }

    if (btnTambah && modalEl) {
      btnTambah.addEventListener("click", function () {
        openModalTambah();
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
      });
    }

    tableBody.addEventListener("click", function (e) {
      const viewBtn = e.target.closest(".btn-view-kelas");
      const editBtn = e.target.closest(".btn-edit-kelas");
      const delBtn = e.target.closest(".btn-delete-kelas");
      const tr = viewBtn ? viewBtn.closest("tr") : editBtn ? editBtn.closest("tr") : delBtn ? delBtn.closest("tr") : null;
      if (viewBtn && tr) {
        const namaV = tr.cells[1] ? tr.cells[1].textContent.trim() : "";
        const waliV = tr.cells[2] ? tr.cells[2].textContent.trim() : "";
        const jumV = tr.cells[3] ? tr.cells[3].textContent.trim() : "";
        const statV = tr.cells[4] ? tr.cells[4].textContent.trim() : "";
        alert("Detail kelas\n\nNama: " + namaV + "\nWali: " + waliV + "\nJumlah siswa: " + jumV + "\nStatus: " + statV);
        return;
      }
      if (editBtn && tr && modalEl) {
        openModalEdit(tr);
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
        return;
      }
      if (delBtn && tr) {
        const nama = tr.cells[1] ? tr.cells[1].textContent.trim() : "";
        if (confirm('Hapus kelas "' + nama + '"?')) {
          tr.remove();
          updateTableView();
        }
      }
    });

    const kelasTableEl = tableBody.closest("table");
    if (kelasTableEl) {
      initSortableThead(kelasTableEl, tableBody, function () {
        currentPage = 1;
        updateTableView();
      });
    }

    formKelas.addEventListener("submit", function (e) {
      e.preventDefault();
      const id = inputId && inputId.value ? inputId.value : "";
      const nama = inputNama ? inputNama.value.trim() : "";
      const wali = inputWali ? inputWali.value.trim() : "";
      let jumlah = inputJumlah ? parseInt(inputJumlah.value, 10) : 0;
      if (isNaN(jumlah) || jumlah < 0) jumlah = 0;

      if (!nama || !wali) {
        alert("Nama kelas dan wali kelas wajib diisi.");
        return;
      }

      if (id) {
        const row = tableBody.querySelector('tr[data-id="' + id.replace(/"/g, "") + '"]');
        if (row) {
          row.cells[1].textContent = nama;
          row.cells[2].textContent = wali;
          row.cells[3].textContent = String(jumlah);
        }
      } else {
        const newId = String(nextId);
        nextId += 1;
        const tr = document.createElement("tr");
        tr.setAttribute("data-id", newId);
        tr.innerHTML =
          '<td class="ps-4 text-muted">' +
          newId +
          "</td>" +
          "<td>" +
          escapeHtml(nama) +
          "</td>" +
          "<td>" +
          escapeHtml(wali) +
          "</td>" +
          "<td>" +
          jumlah +
          "</td>" +
          '<td><span class="badge rounded-pill erp-badge-status erp-badge-pass">Pass</span></td>' +
          '<td class="text-end pe-4 text-nowrap">' +
          '<div class="d-inline-flex align-items-center justify-content-end erp-table-actions">' +
          '<button type="button" class="btn btn-action btn-action-view btn-view-kelas" title="Lihat"><i class="bi bi-eye"></i></button>' +
          '<button type="button" class="btn btn-action btn-action-edit btn-edit-kelas" title="Edit"><i class="bi bi-pencil"></i></button>' +
          '<button type="button" class="btn btn-action btn-action-delete btn-delete-kelas" title="Hapus"><i class="bi bi-trash"></i></button>' +
          "</div></td>";
        tableBody.appendChild(tr);
        currentPage = Math.ceil(getMatchingRows().length / pageSize);
      }

      const modal = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
      updateTableView();
    });

    updateTableView();
  }

  function initMuridTable() {
    const tableBody = document.getElementById("muridTableBody");
    const formMurid = document.getElementById("formMurid");
    if (!tableBody || !formMurid) return;

    const searchMurid = document.getElementById("searchMurid");
    const pageSizeSelect = document.getElementById("muridPageSize");
    const paginationUl = document.getElementById("muridPagination");
    const pageInfo = document.getElementById("muridPageInfo");
    const modalEl = document.getElementById("modalMurid");
    const modalDetailEl = document.getElementById("modalMuridDetail");
    const modalTitle = document.getElementById("modalMuridTitle");
    const inputId = document.getElementById("muridEditId");
    const inputNama = document.getElementById("muridNama");
    const inputKelas = document.getElementById("muridKelas");
    const inputOrtu = document.getElementById("muridOrtu");
    const inputStatus = document.getElementById("muridStatus");
    const btnTambah = document.getElementById("btnTambahMurid");

    let nextId = 13;
    let currentPage = 1;
    let pageSize = pageSizeSelect ? parseInt(pageSizeSelect.value, 10) || 10 : 10;

    function statusBadgeHtml(isAktif) {
      if (isAktif) {
        return '<span class="badge rounded-pill erp-badge-status erp-badge-pass">Aktif</span>';
      }
      return '<span class="badge rounded-pill erp-badge-status erp-badge-failed">Nonaktif</span>';
    }

    function isRowAktif(tr) {
      const badge = tr.cells[4] && tr.cells[4].querySelector(".erp-badge-status");
      if (!badge) return true;
      return badge.textContent.trim().toLowerCase() === "aktif";
    }

    function getMatchingRows() {
      const q = searchMurid && searchMurid.value ? searchMurid.value.trim() : "";
      return filterTableRowsByQuery(tableBody, q, [1, 2, 3]);
    }

    function updateTableView() {
      const matching = getMatchingRows();
      const total = matching.length;
      const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      applyPagedRowVisibility(tableBody, matching, currentPage, pageSize);
      updatePageInfoText(pageInfo, start, end, total);
      renderPaginationList(paginationUl, {
        totalPages: totalPages,
        total: total,
        currentPage: currentPage,
        setPage: function (p) {
          currentPage = p;
        },
        refresh: function () {
          updateTableView();
        },
      });
    }

    if (searchMurid) {
      searchMurid.addEventListener("input", function () {
        currentPage = 1;
        updateTableView();
      });
    }

    if (pageSizeSelect) {
      pageSizeSelect.addEventListener("change", function () {
        pageSize = parseInt(pageSizeSelect.value, 10) || 10;
        currentPage = 1;
        updateTableView();
      });
    }

    function openModalTambah() {
      if (modalTitle) modalTitle.textContent = "Tambah murid";
      if (inputId) inputId.value = "";
      formMurid.reset();
      if (inputStatus) inputStatus.value = "aktif";
    }

    function openModalEdit(tr) {
      if (modalTitle) modalTitle.textContent = "Edit murid";
      if (inputId) inputId.value = tr.getAttribute("data-id") || "";
      if (inputNama) inputNama.value = tr.cells[1].textContent.trim();
      if (inputKelas) inputKelas.value = tr.cells[2].textContent.trim();
      if (inputOrtu) inputOrtu.value = tr.cells[3].textContent.trim();
      if (inputStatus) inputStatus.value = isRowAktif(tr) ? "aktif" : "nonaktif";
    }

    function fillDetailModal(tr) {
      const nisEl = document.getElementById("detailMuridNis");
      const namaEl = document.getElementById("detailMuridNama");
      const kelasEl = document.getElementById("detailMuridKelas");
      const ortuEl = document.getElementById("detailMuridOrtu");
      const statusEl = document.getElementById("detailMuridStatus");
      const nis = tr.getAttribute("data-nis") || "—";
      if (nisEl) nisEl.textContent = nis;
      if (namaEl) namaEl.textContent = tr.cells[1] ? tr.cells[1].textContent.trim() : "—";
      if (kelasEl) kelasEl.textContent = tr.cells[2] ? tr.cells[2].textContent.trim() : "—";
      if (ortuEl) ortuEl.textContent = tr.cells[3] ? tr.cells[3].textContent.trim() : "—";
      if (statusEl) statusEl.textContent = tr.cells[4] ? tr.cells[4].textContent.trim() : "—";
    }

    if (btnTambah && modalEl) {
      btnTambah.addEventListener("click", function () {
        openModalTambah();
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
      });
    }

    tableBody.addEventListener("click", function (e) {
      const viewBtn = e.target.closest(".btn-view-murid");
      const editBtn = e.target.closest(".btn-edit-murid");
      const delBtn = e.target.closest(".btn-delete-murid");
      const tr = viewBtn ? viewBtn.closest("tr") : editBtn ? editBtn.closest("tr") : delBtn ? delBtn.closest("tr") : null;

      if (viewBtn && tr && modalDetailEl) {
        fillDetailModal(tr);
        bootstrap.Modal.getOrCreateInstance(modalDetailEl).show();
        return;
      }
      if (editBtn && tr && modalEl) {
        openModalEdit(tr);
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
        return;
      }
      if (delBtn && tr) {
        const nama = tr.cells[1] ? tr.cells[1].textContent.trim() : "";
        if (confirm('Hapus murid "' + nama + '"?')) {
          tr.remove();
          updateTableView();
        }
      }
    });

    const muridTableEl = tableBody.closest("table");
    if (muridTableEl) {
      initSortableThead(muridTableEl, tableBody, function () {
        currentPage = 1;
        updateTableView();
      });
    }

    formMurid.addEventListener("submit", function (e) {
      e.preventDefault();
      const id = inputId && inputId.value ? inputId.value : "";
      const nama = inputNama ? inputNama.value.trim() : "";
      const kelas = inputKelas ? inputKelas.value.trim() : "";
      const ortu = inputOrtu ? inputOrtu.value.trim() : "";
      const st = inputStatus && inputStatus.value === "nonaktif" ? false : true;

      if (!nama || !kelas || !ortu) {
        alert("Nama murid, kelas, dan nama orang tua wajib diisi.");
        return;
      }

      if (id) {
        const row = tableBody.querySelector('tr[data-id="' + id.replace(/"/g, "") + '"]');
        if (row) {
          row.cells[1].textContent = nama;
          row.cells[2].textContent = kelas;
          row.cells[3].textContent = ortu;
          row.cells[4].innerHTML = statusBadgeHtml(st);
        }
      } else {
        const newId = String(nextId);
        nextId += 1;
        const nis = "2024-" + String(newId).padStart(3, "0");
        const tr = document.createElement("tr");
        tr.setAttribute("data-id", newId);
        tr.setAttribute("data-nis", nis);
        tr.innerHTML =
          '<td class="ps-4 text-muted">' +
          newId +
          "</td>" +
          "<td>" +
          escapeHtml(nama) +
          "</td>" +
          "<td>" +
          escapeHtml(kelas) +
          "</td>" +
          "<td>" +
          escapeHtml(ortu) +
          "</td>" +
          "<td>" +
          statusBadgeHtml(st) +
          "</td>" +
          '<td class="text-end pe-4 text-nowrap">' +
          '<div class="d-inline-flex align-items-center justify-content-end erp-table-actions">' +
          '<button type="button" class="btn btn-action btn-action-view btn-view-murid" title="Detail"><i class="bi bi-eye"></i></button>' +
          '<button type="button" class="btn btn-action btn-action-edit btn-edit-murid" title="Edit"><i class="bi bi-pencil"></i></button>' +
          '<button type="button" class="btn btn-action btn-action-delete btn-delete-murid" title="Hapus"><i class="bi bi-trash"></i></button>' +
          "</div></td>";
        tableBody.appendChild(tr);
        currentPage = Math.ceil(getMatchingRows().length / pageSize);
      }

      const modal = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
      updateTableView();
    });

    updateTableView();
  }

  initKelasTable();
  initMuridTable();
  initGuruTable();
  initTagihanTable();
  initPaymentTable();
  initAbsensiTable();

  const dashboardTagihanBody = document.getElementById("dashboardTagihanTableBody");
  const dashboardTagihanTable = dashboardTagihanBody && dashboardTagihanBody.closest("table");
  if (dashboardTagihanTable && dashboardTagihanBody) {
    initSortableThead(dashboardTagihanTable, dashboardTagihanBody, function () {});
  }

  /* ---------- Logout demo ---------- */
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      if (confirm("Keluar dari sesi?")) {
        window.location.href = "#";
      }
    });
  }
})();
