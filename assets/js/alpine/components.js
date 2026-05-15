/* Alpine components (no bundler) */

// eslint-disable-next-line no-unused-vars
function appShell(options) {
  const THEME_KEY = (options && options.themeKey) || "school-erp-theme";

  return {
    sidebarOpen: false, // mobile
    sidebarCollapsed: false, // desktop
    mobileSearchOpen: false,
    theme: "light",
    notifOpen: false,
    /** >0 menampilkan titik merah "unread" di tombol notifikasi navbar */
    notifUnreadCount: 12,
    profileOpen: false,
    sortByOpen: false,
    isFullscreen: false,

    init() {
      this.initTheme();
      this.syncFromViewport();
      this.syncFullscreenState();

      window.addEventListener("resize", () => {
        this.syncFromViewport();
      });

      // Close on ESC (mobile)
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.sidebarOpen = false;
          this.mobileSearchOpen = false;
          this.notifOpen = false;
          this.profileOpen = false;
          this.sortByOpen = false;
        }
      });

      document.addEventListener("fullscreenchange", () => {
        this.syncFullscreenState();
      });
    },

    isDesktop() {
      return window.matchMedia("(min-width: 1024px)").matches;
    },

    syncFromViewport() {
      if (this.isDesktop()) {
        this.sidebarOpen = false;
      }
    },

    toggleSidebar() {
      if (this.isDesktop()) {
        this.sidebarCollapsed = !this.sidebarCollapsed;
      } else {
        this.sidebarOpen = !this.sidebarOpen;
      }
    },

    openSidebar() {
      this.sidebarOpen = true;
    },

    closeSidebar() {
      this.sidebarOpen = false;
    },

    toggleMobileSearch() {
      this.mobileSearchOpen = !this.mobileSearchOpen;
    },

    toggleNotif() {
      this.notifOpen = !this.notifOpen;
      if (this.notifOpen) this.profileOpen = false;
    },

    closeNotif() {
      this.notifOpen = false;
    },

    toggleProfile() {
      this.profileOpen = !this.profileOpen;
      if (this.profileOpen) {
        this.notifOpen = false;
        this.sortByOpen = false;
      }
    },

    closeProfile() {
      this.profileOpen = false;
    },

    toggleSortBy() {
      this.sortByOpen = !this.sortByOpen;
      if (this.sortByOpen) {
        this.profileOpen = false;
        this.notifOpen = false;
      }
    },

    closeSortBy() {
      this.sortByOpen = false;
    },

    syncFullscreenState() {
      this.isFullscreen = !!document.fullscreenElement;
    },

    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    },

    initTheme() {
      const stored = localStorage.getItem(THEME_KEY);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      this.theme = stored || (prefersDark ? "dark" : "light");
      this.applyTheme();
    },

    setTheme(next) {
      this.theme = next === "dark" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, this.theme);
      this.applyTheme();
    },

    toggleTheme() {
      this.setTheme(this.theme === "dark" ? "light" : "dark");
    },

    applyTheme() {
      const root = document.documentElement;
      root.classList.toggle("dark", this.theme === "dark");
      root.setAttribute("data-theme", this.theme);
      window.dispatchEvent(new CustomEvent("school-erp-theme-changed", { detail: { theme: this.theme } }));
    },
  };
}

function normalizeText(s) {
  return (s || "")
    .toString()
    .trim()
    .toLowerCase();
}

// eslint-disable-next-line no-unused-vars
window.normalizeText = normalizeText;

function parseNumberLike(s) {
  const n = parseFloat(String(s || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Instance Chart di luar objek Alpine (Proxy) — cegah error Chart.js seperti `fullSize` / stack overflow. */
const _dashboardCharts = { bar: null, pie: null, ring: null, line: null };

function destroyDashboardChart(key) {
  const c = _dashboardCharts[key];
  if (c && typeof c.destroy === "function") {
    c.destroy();
  }
  _dashboardCharts[key] = null;
}

/** Padding bawah: ruang label sumbu X; minimal 15 — lebih kecil = legenda bulan lebih dekat bottom canvas */
function calcTrendChartLayoutPaddingBottom(heightPx) {
  const h = Math.max(100, Number(heightPx) || 200);
  const raw = Math.round(h * 0.055 + 5);
  return Math.max(15, Math.min(48, raw));
}

/** Padding atas: mendorong batang + label ke bawah dalam area chart */
function calcTrendChartLayoutPaddingTop(heightPx) {
  const h = Math.max(100, Number(heightPx) || 200);
  return Math.max(12, Math.min(40, Math.round(h * 0.06)));
}

const trendBarLayoutPaddingPlugin = {
  id: "trendBarLayoutPadding",
  beforeLayout(chart) {
    if (!chart?.canvas || chart.canvas.id !== "trendChart") return;
    const pad = chart.options.layout && chart.options.layout.padding;
    if (typeof pad !== "object" || pad == null || Array.isArray(pad)) return;
    const fromChart = typeof chart.height === "number" && chart.height > 0 ? chart.height : 0;
    const fromDom = chart.canvas.parentElement ? chart.canvas.parentElement.clientHeight : 0;
    const h = fromChart || fromDom || 200;
    const nextB = calcTrendChartLayoutPaddingBottom(h);
    const nextT = calcTrendChartLayoutPaddingTop(h);
    if (pad.bottom !== nextB) pad.bottom = nextB;
    if (pad.top !== nextT) pad.top = nextT;
  },
};

/**
 * Tooltip HTML kustom donut — baris: kotak warna | label abu | nilai gelap (kanan),
 * bentuk pill putih; posisi mengikuti titik hover segmen (caret).
 */
function pieChartExternalTooltip(context) {
  const { chart, tooltip } = context;
  const parent = chart?.canvas?.parentNode;
  if (!parent) return;

  let el = parent.querySelector(".pie-external-tooltip");
  if (!el) {
    el = document.createElement("div");
    el.className = "pie-external-tooltip";
    el.setAttribute("role", "tooltip");
    parent.appendChild(el);
  }

  if (tooltip.opacity === 0) {
    el.style.opacity = "0";
    el.style.visibility = "hidden";
    return;
  }

  const dp = tooltip.dataPoints?.[0];
  if (!dp) {
    el.style.opacity = "0";
    el.style.visibility = "hidden";
    return;
  }

  const ds = chart.data.datasets[dp.datasetIndex];
  const idx = dp.dataIndex;
  const bc = ds?.backgroundColor;
  let segmentColor = "#94a3b8";
  if (Array.isArray(bc)) segmentColor = bc[idx] ?? segmentColor;
  else if (typeof bc === "string") segmentColor = bc;

  const label = dp.label != null ? String(dp.label) : "";
  const valueText =
    dp.formattedValue != null && String(dp.formattedValue).trim() !== ""
      ? String(dp.formattedValue)
      : `${dp.raw != null ? dp.raw : dp.parsed}%`;

  el.replaceChildren();
  const row = document.createElement("div");
  row.className = "pie-external-tooltip__row";
  const sw = document.createElement("span");
  sw.className = "pie-external-tooltip__swatch";
  sw.style.backgroundColor = segmentColor;
  const labEl = document.createElement("span");
  labEl.className = "pie-external-tooltip__label";
  labEl.textContent = label;
  const valEl = document.createElement("span");
  valEl.className = "pie-external-tooltip__value";
  valEl.textContent = valueText;
  row.append(sw, labEl, valEl);
  el.appendChild(row);

  /* Posisi di dekat segmen yang di-hover (seperti referensi), koordinat relatif ke canvas = ke wrapper */
  if (typeof tooltip.caretX === "number" && typeof tooltip.caretY === "number") {
    el.style.left = `${tooltip.caretX}px`;
    el.style.top = `${tooltip.caretY}px`;
    el.style.transform = "translate(-50%, calc(-100% - 12px))";
  } else {
    el.style.left = "62%";
    el.style.top = "38%";
    el.style.transform = "translate(-50%, -50%)";
  }

  el.style.opacity = "1";
  el.style.visibility = "visible";
}

/** Opsi plugin tooltip untuk donut — external HTML, bukan canvas/default. */
function getPieDonutTooltipPluginOptions() {
  return {
    enabled: false,
    external: pieChartExternalTooltip,
    callbacks: {
      title: () => "",
      label(ctx) {
        if (ctx.raw == null) return "";
        return `${ctx.raw}%`;
      },
    },
  };
}

function calcNiceMax(values) {
  const max = Math.max(0, ...values.map((v) => (Number.isFinite(v) ? v : 0)));
  /* Sedikit headroom saja → batang terlihat lebih panjang / area chart terpakai */
  const padded = max <= 0 ? 10 : max * 1.02;
  // bulatkan ke kelipatan 5
  return Math.max(10, Math.ceil(padded / 5) * 5);
}

/** Dark mode chart palette (referensi: batang putih + abu di latar gelap) */
function chartThemeIsDark() {
  return document.documentElement.getAttribute("data-theme") === "dark";
}

/** Warna batang statistik kehadiran — oranye + teal (referensi diagram) */
function getAttendanceMixedTheme() {
  if (chartThemeIsDark()) {
    return {
      barLaki: "#ff7a3d",
      barPerempuan: "#2dd4bf",
      tickColor: "rgba(203, 213, 225, 0.88)",
    };
  }
  return {
    barLaki: "#ff5700",
    barPerempuan: "#00a389",
    tickColor: "rgba(100, 116, 139, 0.9)",
  };
}

/** Tema garis aktivitas: primer gelap / sekunder abu; mode gelap dibalik */
function getActivityLineTheme() {
  if (chartThemeIsDark()) {
    return {
      primary: "#f1f5f9",
      secondary: "rgba(148, 163, 184, 0.55)",
      pointFill: "rgba(15, 23, 42, 0.96)",
    };
  }
  return {
    primary: "#0f172a",
    secondary: "#d1d5db",
    pointFill: "#ffffff",
  };
}

function getActivityLineChartDemoData() {
  return {
    labels: ["", "", "", "", "", ""],
    thisPeriod: [16, 11, 19, 34, 40, 37],
    baseline: [36, 30, 25, 27, 24, 29],
  };
}

function buildActivityLineChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    layout: { padding: { top: 14, right: 10, bottom: 10, left: 10 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...getBrightGlassTooltipOptions(),
        callbacks: {
          title: () => "",
          label(ctx) {
            const v = ctx.parsed?.y;
            if (v == null) return "";
            const name = ctx.dataset.label || "";
            return name ? `${name}: ${v}` : String(v);
          },
        },
      },
    },
    scales: {
      x: {
        display: false,
        grid: { display: false, drawTicks: false },
        border: { display: false },
      },
      y: {
        display: false,
        grid: { display: false, drawTicks: false },
        border: { display: false },
        suggestedMin: 0,
        suggestedMax: 46,
      },
    },
  };
}

/**
 * Tooltip Chart.js seperti bawaan donut (judul + baris ber-kotak warna), dengan latar cerah semi-transparan.
 */
function getBrightGlassTooltipOptions() {
  const dark = chartThemeIsDark();
  if (dark) {
    return {
      enabled: true,
      backgroundColor: "rgba(30, 41, 59, 0.88)",
      titleColor: "rgba(248, 250, 252, 0.96)",
      bodyColor: "rgba(226, 232, 240, 0.92)",
      borderColor: "rgba(255, 255, 255, 0.14)",
      borderWidth: 1,
      padding: 12,
      cornerRadius: 10,
      displayColors: true,
      boxWidth: 10,
      boxHeight: 10,
      boxPadding: 6,
      titleMarginBottom: 8,
      bodySpacing: 6,
      caretSize: 6,
      caretPadding: 10,
      titleFont: { family: "'Outfit', system-ui, sans-serif", size: 12, weight: "600" },
      bodyFont: { family: "'Outfit', system-ui, sans-serif", size: 12, weight: "400" },
    };
  }
  return {
    enabled: true,
    backgroundColor: "rgba(255, 255, 255, 0.93)",
    titleColor: "rgba(15, 23, 42, 0.94)",
    bodyColor: "rgba(71, 85, 105, 0.95)",
    borderColor: "rgba(15, 23, 42, 0.1)",
    borderWidth: 1,
    padding: 12,
    cornerRadius: 10,
    displayColors: true,
    boxWidth: 10,
    boxHeight: 10,
    boxPadding: 6,
    titleMarginBottom: 8,
    bodySpacing: 6,
    caretSize: 6,
    caretPadding: 10,
    titleFont: { family: "'Outfit', system-ui, sans-serif", size: 12, weight: "600" },
    bodyFont: { family: "'Outfit', system-ui, sans-serif", size: 12, weight: "400" },
  };
}

/**
 * Donut distribusi pembayaran — urutan segmen = urutan label data (Chart.js).
 * Palet mirip referensi “store visits”: oranye → amber → kuning → navy gelap → teal.
 */
function getPaymentDonutColors() {
  if (chartThemeIsDark()) {
    return [
      "#ff7a3d",
      "#fdba74",
      "#facc15",
      "#64748b",
      "#2dd4bf",
    ];
  }
  return [
    "#ff5700",
    "#fdba74",
    "#eab308",
    "#0f172a",
    "#00a389",
  ];
}

// eslint-disable-next-line no-unused-vars
function dashboard(config) {
  const cfg = config || {};
  const pieLabels = ["Langsung", "Medsos", "Email", "Referral", "Lainnya"];

  return {
    /** @type {'month'|'week'|'day'} */
    range: cfg.defaultRange || "month",
    attendanceSummary: {
      pct: 0,
      siswaLabel: "—",
      guruLabel: "—",
    },

    initDashboard() {
      this.initCounters();
      this.syncAttendanceSummary();
      this.initCharts();
      window.addEventListener("school-erp-theme-changed", () => this.refreshChartTheme());
    },

    refreshChartTheme() {
      const pieCols = getPaymentDonutColors();

      const bar = _dashboardCharts.bar;
      if (bar) {
        const th = getAttendanceMixedTheme();
        bar.data.datasets[0].backgroundColor = () => getAttendanceMixedTheme().barLaki;
        bar.data.datasets[1].backgroundColor = () => getAttendanceMixedTheme().barPerempuan;
        if (bar.options?.scales?.x?.ticks) {
          bar.options.scales.x.ticks.color = th.tickColor;
        }
        if (bar.options?.plugins?.tooltip) {
          Object.assign(bar.options.plugins.tooltip, getBrightGlassTooltipOptions());
        }
        bar.update();
      }

      const pie = _dashboardCharts.pie;
      if (pie) {
        pie.data.datasets[0].backgroundColor = pieCols;
        if (pie.options?.plugins?.tooltip) {
          Object.assign(
            pie.options.plugins.tooltip,
            getBrightGlassTooltipOptions(),
            getPieDonutTooltipPluginOptions(),
          );
        }
        pie.update("none");
        this.renderLegend(pieLabels, this.getPieData(), pieCols);
      }

      const ring = _dashboardCharts.ring;
      if (ring) {
        const pct = this.attendanceSummary.pct;
        ring.data.datasets[0].backgroundColor = chartThemeIsDark()
          ? ["#ffffff", "rgba(148, 163, 184, 0.35)"]
          : ["#0b0f19", "rgba(148, 163, 184, 0.35)"];
        ring.data.datasets[0].data = [pct, Math.max(0, 100 - pct)];
        ring.update("none");
      }

      const line = _dashboardCharts.line;
      if (line) {
        const th = getActivityLineTheme();
        line.data.datasets[0].borderColor = th.primary;
        line.data.datasets[0].pointBorderColor = th.primary;
        line.data.datasets[0].pointBackgroundColor = th.pointFill;
        line.data.datasets[1].borderColor = th.secondary;
        line.data.datasets[1].pointBorderColor = th.secondary;
        line.data.datasets[1].pointBackgroundColor = th.pointFill;
        if (line.options?.plugins?.tooltip) {
          Object.assign(line.options.plugins.tooltip, getBrightGlassTooltipOptions());
        }
        line.update("none");
      }
    },

    initCounters() {
      const els = Array.from(document.querySelectorAll(".stat-number[data-count]"));
      const durationMs = 700;
      const start = performance.now();
      const targets = els.map((el) => ({
        el,
        target: parseNumberLike(el.getAttribute("data-count")),
      }));

      const tick = (now) => {
        const t = Math.min(1, (now - start) / durationMs);
        for (const it of targets) {
          const v = Math.round(it.target * t);
          it.el.textContent = v.toLocaleString("id-ID");
        }
        if (t < 1) requestAnimationFrame(tick);
      };

      if (targets.length) requestAnimationFrame(tick);
    },

    async ensureChartJs() {
      if (window.Chart) return true;
      return false;
    },

    syncAttendanceSummary() {
      const d = this.getBarData();
      const n = d.laki.length || 1;
      const avgLaki = Math.round(d.laki.reduce((s, x) => s + x, 0) / n);
      const avgPerempuan = Math.round(d.perempuan.reduce((s, x) => s + x, 0) / n);
      this.attendanceSummary = {
        pct: avgLaki,
        siswaLabel: `${avgLaki}%`,
        guruLabel: `${avgPerempuan}%`,
      };
    },

    getBarData() {
      /*
       * Semua rentang memakai 6 kategori — sama seperti "Bulan" — supaya lebar grup/batang
       * dan jarak antar grup identik di Chart.js (7 titik membuat slot lebih sempit).
       */
      if (this.range === "week") {
        return {
          labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"],
          laki: [70, 68, 74, 78, 72, 58],
          perempuan: [62, 60, 66, 70, 65, 52],
        };
      }
      if (this.range === "day") {
        return {
          labels: ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00"],
          laki: [55, 72, 85, 88, 82, 70],
          perempuan: [48, 65, 78, 82, 75, 62],
        };
      }
      return {
        labels: ["Januari", "Februari", "Maret", "April", "Mei", "Juni"],
        laki: [72, 75, 78, 80, 82, 84],
        perempuan: [64, 67, 70, 73, 75, 77],
      };
    },

    getPieData() {
      const map = {
        week: [28, 24, 22, 16, 10],
        day: [30, 22, 20, 18, 10],
        month: [32, 26, 18, 14, 10],
      };
      return map[this.range] || map.month;
    },

    /** Volume demo untuk teks tengah donut (bukan jumlah persen) */
    getPaymentVolumeTotal() {
      const map = {
        week: 10200,
        day: 8900,
        month: 12400,
      };
      return map[this.range] ?? map.month;
    },

    formatPaymentCenter() {
      const n = this.getPaymentVolumeTotal();
      if (n >= 1000) {
        const k = n / 1000;
        const s = Number.isInteger(k) ? String(Math.round(k)) : k.toFixed(1);
        return `${s}K`;
      }
      return String(n);
    },

    async initCharts() {
      const ok = await this.ensureChartJs();
      if (!ok) return;

      if (window.Chart && window.Chart.defaults && window.Chart.defaults.font) {
        window.Chart.defaults.font.family = "'Outfit', system-ui, sans-serif";
      }

      const barEl = document.getElementById("trendChart");
      const pieEl = document.getElementById("pieChart");
      const ringEl = document.getElementById("attendanceRingChart");
      const lineEl = document.getElementById("dashActivityLineChart");
      if (!barEl || !pieEl) return;

      destroyDashboardChart("bar");
      destroyDashboardChart("pie");
      destroyDashboardChart("ring");
      destroyDashboardChart("line");

      barEl.parentElement?.querySelector(".dash-attendance-tooltip-host")?.remove();

      const d = this.getBarData();
      this.syncAttendanceSummary();
      const pct = this.attendanceSummary.pct;
      const yMax = calcNiceMax([...d.laki, ...d.perempuan]);
      const mixTh = getAttendanceMixedTheme();
      const pieColsInit = getPaymentDonutColors();

      const ctxBar = barEl.getContext("2d");
      const ctxPie = pieEl.getContext("2d");

      /*
       * Jarak antar dua batang dalam satu grup: utamanya datasets.bar.barPercentage
       * (0–1, makin kecil = celah antar batang makin lebar; 1 = penuh tanpa celah).
       * maxBarThickness membatasi lebar tiap batang (px); jika slot lebih lebar, tampak ada celah.
       */
      /* Sudut membulat (empat sisi); sedikit lebih besar agar terbaca di dashboard */
      const barR = 8;
      const barRadiusAll = { topLeft: barR, topRight: barR, bottomLeft: barR, bottomRight: barR };
      const barThicknessCap = 35;
      const trendWrap = barEl.parentElement;
      const trendH = trendWrap ? trendWrap.clientHeight : 220;
      const initialBottomPad = calcTrendChartLayoutPaddingBottom(trendH);
      const initialTopPad = calcTrendChartLayoutPaddingTop(trendH);

      try {
        _dashboardCharts.bar = new window.Chart(ctxBar, {
          type: "bar",
          plugins: [trendBarLayoutPaddingPlugin],
          data: {
            labels: d.labels,
            datasets: [
              {
                type: "bar",
                label: "Siswa Laki-laki",
                data: d.laki,
                order: 1,
                borderWidth: 0,
                borderRadius: barRadiusAll,
                borderSkipped: false,
                maxBarThickness: barThicknessCap,
                backgroundColor: () => getAttendanceMixedTheme().barLaki,
              },
              {
                type: "bar",
                label: "Siswa Perempuan",
                data: d.perempuan,
                order: 1,
                borderWidth: 0,
                borderRadius: barRadiusAll,
                borderSkipped: false,
                maxBarThickness: barThicknessCap,
                backgroundColor: () => getAttendanceMixedTheme().barPerempuan,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            layout: { padding: { top: initialTopPad, right: 10, bottom: initialBottomPad, left: 10 } },
            datasets: {
              bar: {
                /* makin besar = grup memakai lebih banyak lebar slot → jarak antar grup terlihat lebih rapat */
                categoryPercentage: 0.88,
                /* sedikit celah antar batang laki vs perempuan dalam satu label */
                barPercentage: 0.86,
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                ...getBrightGlassTooltipOptions(),
              },
            },
            scales: {
              x: {
                display: true,
                offset: true,
                grid: { display: false, drawTicks: false },
                border: { display: false },
                ticks: {
                  display: true,
                  autoSkip: false,
                  maxRotation: 0,
                  minRotation: 0,
                  color: mixTh.tickColor,
                  padding: 4,
                  font: {
                    family: "'Outfit', system-ui, sans-serif",
                    size: 12,
                    lineHeight: 16 / 12,
                    weight: "400",
                  },
                },
              },
              y: {
                display: false,
                min: 0,
                max: yMax,
                ticks: { display: false },
                grid: { display: false, drawTicks: false },
                border: { display: false },
              },
            },
          },
        });

        const pieVals = this.getPieData();
        _dashboardCharts.pie = new window.Chart(ctxPie, {
          type: "doughnut",
          data: {
            labels: pieLabels,
            datasets: [
              {
                data: pieVals,
                backgroundColor: pieColsInit,
                borderWidth: 0,
                borderRadius: 0,
                spacing: 0,
                hoverOffset: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            rotation: -90,
            circumference: 360,
            interaction: {
              mode: "nearest",
              intersect: false,
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                ...getBrightGlassTooltipOptions(),
                ...getPieDonutTooltipPluginOptions(),
              },
            },
            /* Cutout lebih kecil → cincin donut lebih tebal (semakin kecil % = semakin tebal) */
            cutout: "48%",
          },
        });
        this.renderLegend(pieLabels, pieVals, pieColsInit);

        if (ringEl) {
          const ctxRing = ringEl.getContext("2d");
          _dashboardCharts.ring = new window.Chart(ctxRing, {
            type: "doughnut",
            data: {
              datasets: [
                {
                  data: [pct, Math.max(0, 100 - pct)],
                  backgroundColor: chartThemeIsDark()
                    ? ["#ffffff", "rgba(148, 163, 184, 0.35)"]
                    : ["#0b0f19", "rgba(148, 163, 184, 0.35)"],
                  borderWidth: 0,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              circumference: 360,
              rotation: -90,
              plugins: { legend: { display: false }, tooltip: { enabled: false } },
              cutout: "72%",
            },
          });
        }

        if (lineEl) {
          const demo = getActivityLineChartDemoData();
          const lineTh = getActivityLineTheme();
          const ctxLine = lineEl.getContext("2d");
          _dashboardCharts.line = new window.Chart(ctxLine, {
            type: "line",
            data: {
              labels: demo.labels,
              datasets: [
                {
                  label: "Minggu ini",
                  data: demo.thisPeriod,
                  tension: 0.4,
                  borderWidth: 2,
                  borderColor: lineTh.primary,
                  backgroundColor: "transparent",
                  pointRadius: 4,
                  pointHoverRadius: 5,
                  pointBackgroundColor: lineTh.pointFill,
                  pointBorderColor: lineTh.primary,
                  pointBorderWidth: 2,
                },
                {
                  label: "Rata-rata",
                  data: demo.baseline,
                  tension: 0.4,
                  borderWidth: 2,
                  borderColor: lineTh.secondary,
                  backgroundColor: "transparent",
                  pointRadius: 4,
                  pointHoverRadius: 5,
                  pointBackgroundColor: lineTh.pointFill,
                  pointBorderColor: lineTh.secondary,
                  pointBorderWidth: 2,
                },
              ],
            },
            options: buildActivityLineChartOptions(),
          });
        }
      } catch (e) {
        // file:// or Chart blocked
      }
    },

    renderLegend(labels, _values, colors) {
      const el = document.getElementById("pieLegend");
      if (!el) return;
      el.innerHTML = "";
      el.className = "pie-legend pie-legend--inline";

      const row = document.createElement("div");
      row.className = "pie-legend__row pie-legend__row--all";

      labels.forEach((label, idx) => {
        const item = document.createElement("div");
        item.className = "pie-legend__item";
        const sw = document.createElement("span");
        sw.className = "pie-legend__swatch";
        sw.style.background = colors[idx];
        const txt = document.createElement("span");
        txt.className = "pie-legend__label";
        txt.textContent = label;
        item.appendChild(sw);
        item.appendChild(txt);
        row.appendChild(item);
      });

      el.appendChild(row);
    },

    updateCharts() {
      const d = this.getBarData();
      this.syncAttendanceSummary();
      const pct = this.attendanceSummary.pct;
      const yMax = calcNiceMax([...d.laki, ...d.perempuan]);

      const bar = _dashboardCharts.bar;
      if (bar) {
        const th = getAttendanceMixedTheme();
        bar.data.labels = d.labels;
        bar.data.datasets[0].data = d.laki;
        bar.data.datasets[1].data = d.perempuan;
        bar.data.datasets[0].backgroundColor = () => getAttendanceMixedTheme().barLaki;
        bar.data.datasets[1].backgroundColor = () => getAttendanceMixedTheme().barPerempuan;
        if (bar.options?.scales?.y) bar.options.scales.y.max = yMax;
        if (bar.options?.scales?.x?.ticks) {
          bar.options.scales.x.ticks.color = th.tickColor;
        }
        bar.update("none");
      }
      const pieVals = this.getPieData();
      const pieCols = getPaymentDonutColors();
      const pie = _dashboardCharts.pie;
      if (pie) {
        pie.data.datasets[0].data = pieVals;
        pie.data.datasets[0].backgroundColor = pieCols;
        pie.update("none");
        this.renderLegend(pieLabels, pieVals, pieCols);
      }
      const ring = _dashboardCharts.ring;
      if (ring) {
        ring.data.datasets[0].data = [pct, Math.max(0, 100 - pct)];
        ring.update("none");
      }
    },

    setRange(next) {
      this.range = next;
      queueMicrotask(() => this.updateCharts());
    },

  };
}

// eslint-disable-next-line no-unused-vars
window.dashboard = dashboard;

/**
 * Tabel pembayaran terbaru (demo) — filter, checkbox, badge status, pagination.
 */
// eslint-disable-next-line no-unused-vars
function latestPaymentsTable() {
  return {
    filter: "",
    page: 1,
    pageSize: 5,
    rowMenuId: null,
    rows: [
      { id: "1", name: "Aya Lestari", email: "aya.lestari@gmail.com", amount: 850000, status: "success" },
      { id: "2", name: "Budi Santoso", email: "budi.santoso@school.id", amount: 450000, status: "processing" },
      { id: "3", name: "Citra Dewi", email: "citra.dewi@yahoo.com", amount: 1200000, status: "failed" },
      { id: "4", name: "Dedi Kurniawan", email: "dedi.k@mail.com", amount: 315000, status: "success" },
      { id: "5", name: "Eka Putri", email: "eka.putri@school.id", amount: 600000, status: "processing" },
      { id: "6", name: "Firman Wijaya", email: "firman.w@gmail.com", amount: 920000, status: "success" },
      { id: "7", name: "Gita Sari", email: "gita.sari@gmail.com", amount: 275000, status: "failed" },
      { id: "8", name: "Hadi Pratama", email: "hadi.p@school.id", amount: 500000, status: "success" },
    ],
    selected: {},

    init() {
      const next = { ...this.selected };
      this.rows.forEach((r) => {
        next[r.id] = false;
      });
      this.selected = next;
    },

    formatIdr(n) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(n);
    },

    statusLabel(st) {
      const m = { success: "Lunas", processing: "Diproses", failed: "Gagal" };
      return m[st] || st;
    },

    get filteredRows() {
      const q = this.filter.trim().toLowerCase();
      if (!q) return this.rows;
      return this.rows.filter(
        (r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q),
      );
    },

    get totalFiltered() {
      return this.filteredRows.length;
    },

    get totalPages() {
      return Math.max(1, Math.ceil(this.totalFiltered / this.pageSize));
    },

    get pagedRows() {
      const start = (this.page - 1) * this.pageSize;
      return this.filteredRows.slice(start, start + this.pageSize);
    },

    get selectedCount() {
      return this.rows.filter((r) => this.selected[r.id]).length;
    },

    setFilter(v) {
      this.filter = v;
      this.page = 1;
    },

    toggleRow(id, checked) {
      this.selected = { ...this.selected, [id]: checked };
    },

    allPageSelected() {
      const pr = this.pagedRows;
      if (!pr.length) return false;
      return pr.every((r) => this.selected[r.id]);
    },

    toggleSelectAllPage(event) {
      const on = event.target.checked;
      const next = { ...this.selected };
      this.pagedRows.forEach((r) => {
        next[r.id] = on;
      });
      this.selected = next;
    },

    prevPage() {
      this.page = Math.max(1, this.page - 1);
    },

    nextPage() {
      this.page = Math.min(this.totalPages, this.page + 1);
    },

    setPage(p) {
      const n = parseInt(p, 10);
      if (!Number.isFinite(n)) return;
      this.page = Math.min(this.totalPages, Math.max(1, n));
    },

    get pageInfo() {
      if (this.totalFiltered === 0) return "Tidak ada data";
      return `Halaman ${this.page} dari ${this.totalPages}`;
    },

    get pageSummary() {
      const sel = this.selectedCount;
      const base = this.totalFiltered === 0 ? "Tidak ada data" : `Halaman ${this.page} dari ${this.totalPages}`;
      if (!sel) return base;
      return `${base} · ${sel} dari ${this.rows.length} dipilih`;
    },

    toggleRowMenu(row) {
      const id = row && row.id;
      this.rowMenuId = this.rowMenuId === id ? null : id;
    },

    closeRowMenu() {
      this.rowMenuId = null;
    },

    openRowDetail(row) {
      this.closeRowMenu();
      const st = this.statusLabel(row.status);
      window.alert(`${row.name}\n${row.email}\n${this.formatIdr(row.amount)}\n${st}`);
    },
  };
}

// eslint-disable-next-line no-unused-vars
window.latestPaymentsTable = latestPaymentsTable;

// eslint-disable-next-line no-unused-vars
function dataTable(config) {
  const cfg = config || {};
  const keyField = cfg.keyField || "id";
  const searchable = Array.isArray(cfg.searchableColumns) ? cfg.searchableColumns : [];
  const sortable = Array.isArray(cfg.sortableColumns) ? cfg.sortableColumns : [];
  const pageSizeOptions = cfg.pageSizeOptions || [10, 20, 30];
  const defaultPageSize = cfg.defaultPageSize || pageSizeOptions[0] || 10;

  return {
    rows: Array.isArray(cfg.rows) ? cfg.rows : [],
    query: "",
    pageSize: defaultPageSize,
    page: 1,
    sort: { col: null, dir: "asc" }, // col: key in row

    // modal state for CRUD
    modalOpen: false,
    modalMode: "create", // create|edit
    form: {},
    formDefaults: cfg.formDefaults || {},
    rowMenuId: null,

    init() {
      this.resetForm();
    },

    toggleRowMenu(row) {
      const id = row && row[keyField];
      this.rowMenuId = this.rowMenuId === id ? null : id;
    },

    closeRowMenu() {
      this.rowMenuId = null;
    },

    get pageSizes() {
      return pageSizeOptions;
    },

    resetForm() {
      this.form = { ...this.formDefaults };
    },

    openCreate() {
      this.modalMode = "create";
      this.resetForm();
      this.modalOpen = true;
    },

    openEdit(row) {
      this.modalMode = "edit";
      this.form = JSON.parse(JSON.stringify(row || {}));
      this.modalOpen = true;
    },

    closeModal() {
      this.modalOpen = false;
    },

    removeRow(row) {
      const id = row && row[keyField];
      if (id == null) return;
      if (id === this.rowMenuId) this.rowMenuId = null;
      this.rows = this.rows.filter((r) => r[keyField] !== id);
      this.ensurePageInRange();
    },

    upsertRow(next) {
      const id = next && next[keyField];
      if (id == null || id === "") {
        // create
        const newRow = { ...next };
        // naive id: max+1
        const maxId = this.rows.reduce((m, r) => Math.max(m, parseNumberLike(r[keyField])), 0);
        newRow[keyField] = String(maxId + 1);
        this.rows = [...this.rows, newRow];
      } else {
        // edit
        this.rows = this.rows.map((r) => (r[keyField] === id ? { ...r, ...next } : r));
      }
      this.ensurePageInRange();
    },

    submitForm() {
      if (typeof cfg.onSubmit === "function") {
        const result = cfg.onSubmit({ mode: this.modalMode, form: this.form, rows: this.rows });
        if (result && typeof result === "object" && Array.isArray(result.rows)) {
          this.rows = result.rows;
        } else if (result && typeof result === "object" && result.row) {
          this.upsertRow(result.row);
        } else {
          this.upsertRow(this.form);
        }
      } else {
        this.upsertRow(this.form);
      }

      this.closeModal();
      this.resetForm();
    },

    setSort(colKey) {
      if (!colKey) return;
      if (this.sort.col === colKey) {
        this.sort.dir = this.sort.dir === "asc" ? "desc" : "asc";
      } else {
        this.sort.col = colKey;
        this.sort.dir = "asc";
      }
      this.page = 1;
    },

    get filteredRows() {
      const q = normalizeText(this.query);
      if (!q) return this.sortedRows;
      return this.sortedRows.filter((row) => {
        return searchable.some((k) => normalizeText(row[k]).includes(q));
      });
    },

    get sortedRows() {
      const col = this.sort.col;
      if (!col) return this.rows.slice();

      const sortMeta = sortable.find((s) => (typeof s === "string" ? s === col : s.key === col));
      const type = typeof sortMeta === "object" && sortMeta && sortMeta.type ? sortMeta.type : "text";
      const dirMul = this.sort.dir === "asc" ? 1 : -1;

      return this.rows
        .slice()
        .sort((a, b) => {
          const av = a[col];
          const bv = b[col];
          if (type === "number") {
            return (parseNumberLike(av) - parseNumberLike(bv)) * dirMul;
          }
          const as = (av == null ? "" : String(av)).toLocaleLowerCase("id");
          const bs = (bv == null ? "" : String(bv)).toLocaleLowerCase("id");
          return as.localeCompare(bs, "id", { numeric: true, sensitivity: "base" }) * dirMul;
        });
    },

    get total() {
      return this.filteredRows.length;
    },

    get totalPages() {
      return Math.max(1, Math.ceil(this.total / this.pageSize));
    },

    ensurePageInRange() {
      const tp = this.totalPages;
      if (this.page > tp) this.page = tp;
      if (this.page < 1) this.page = 1;
    },

    setPage(p) {
      const next = parseInt(p, 10);
      if (!Number.isFinite(next)) return;
      this.page = Math.min(this.totalPages, Math.max(1, next));
    },

    get pagedRows() {
      this.ensurePageInRange();
      const start = (this.page - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredRows.slice(start, end);
    },

    get pageInfo() {
      if (this.total === 0) return "Tidak ada data";
      return `Halaman ${this.page} dari ${this.totalPages}`;
    },

    // Pagination helpers for UI
    get pagination() {
      const tp = this.totalPages;
      const cur = this.page;
      if (tp <= 1) return [1];

      const maxBtns = 7;
      let start = 1;
      let end = tp;
      if (tp > maxBtns) {
        const half = Math.floor(maxBtns / 2);
        start = Math.max(1, cur - half);
        end = Math.min(tp, start + maxBtns - 1);
        if (end - start < maxBtns - 1) {
          start = Math.max(1, end - maxBtns + 1);
        }
      }

      const pages = [];
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }
      for (let p = start; p <= end; p++) pages.push(p);
      if (end < tp) {
        if (end < tp - 1) pages.push("...");
        pages.push(tp);
      }
      return pages;
    },

    // Action callback (optional)
    viewRow(row) {
      if (typeof cfg.onView === "function") cfg.onView(row);
    },
  };
}

// eslint-disable-next-line no-unused-vars
window.dataTable = dataTable;

