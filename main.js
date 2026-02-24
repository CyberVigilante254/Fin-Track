/* =========================================
   FinTrack Pro — Main JS
   Lead Developer: Collins Chele
   ========================================= */

"use strict";

// ── Init Lucide Icons ──────────────────────────────────────────────────────────
lucide.createIcons();

// ── DOM Refs ───────────────────────────────────────────────────────────────────
const notifBtn    = document.getElementById("notifBtn");
const notifPanel  = document.getElementById("notifPanel");
const pulseDot    = document.getElementById("pulseDot");
const clearNotif  = document.getElementById("clearNotif");
const notifWrapper= document.getElementById("notifWrapper");

const userBtn      = document.getElementById("userBtn");
const userDropdown = document.getElementById("userDropdown");
const chevronIcon  = document.getElementById("chevronIcon");
const userWrapper  = document.getElementById("userMenuWrapper");

const menuToggle = document.getElementById("menuToggle");
const sidebar    = document.querySelector(".sidebar");

// ── Notification System ────────────────────────────────────────────────────────
notifBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = notifPanel.classList.toggle("open");
  if (isOpen) {
    pulseDot.classList.add("hidden");
    userDropdown.classList.remove("open");
    chevronIcon.classList.remove("rotated");
  }
});

clearNotif.addEventListener("click", () => {
  document.querySelectorAll(".notif-item.unread").forEach(el => el.classList.remove("unread"));
  pulseDot.classList.add("hidden");
});

// ── User Dropdown ──────────────────────────────────────────────────────────────
userBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = userDropdown.classList.toggle("open");
  chevronIcon.classList.toggle("rotated", isOpen);
  if (isOpen) {
    notifPanel.classList.remove("open");
  }
});

// Close panels on outside click
document.addEventListener("click", () => {
  notifPanel.classList.remove("open");
  userDropdown.classList.remove("open");
  chevronIcon.classList.remove("rotated");
});

// ── Sidebar Mobile Toggle ──────────────────────────────────────────────────────
menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));

// ── Nav Active State ───────────────────────────────────────────────────────────
document.querySelectorAll(".nav-item[data-page]").forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    item.classList.add("active");
    if (window.innerWidth <= 900) sidebar.classList.remove("open");
  });
});

// ── Chart Helpers ──────────────────────────────────────────────────────────────
function makeGradient(ctx, color, alpha = 0.3) {
  const grad = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  grad.addColorStop(0, color.replace(")", `, ${alpha})`).replace("rgb(", "rgba("));
  grad.addColorStop(1, color.replace(")", ", 0)").replace("rgb(", "rgba("));
  return grad;
}

const COLORS = {
  cyan:   "#00f2ff",
  green:  "#00ff88",
  purple: "#a855f7",
  orange: "#ff8c00",
  red:    "#ff4466",
};

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: {
    backgroundColor: "rgba(8,13,26,0.95)",
    borderColor: "rgba(0,242,255,0.3)",
    borderWidth: 1,
    titleColor: "#00f2ff",
    bodyColor: "#e2e8f0",
    padding: 12,
    cornerRadius: 8,
  }},
};

// ── Revenue Chart ──────────────────────────────────────────────────────────────
const revenueCtx = document.getElementById("revenueChart").getContext("2d");
const revGrad = revenueCtx.createLinearGradient(0, 0, 0, 300);
revGrad.addColorStop(0, "rgba(0,242,255,0.25)");
revGrad.addColorStop(1, "rgba(0,242,255,0)");

const revenueDataSets = {
  "1Y": [180,210,195,240,220,275,260,310,290,340,320,385],
  "6M": [260,275,310,290,340,320],
  "3M": [290,340,320,385],
  "1M": [340,355,348,365],
};
const revenueLabels = {
  "1Y": ["Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb"],
  "6M": ["Sep","Oct","Nov","Dec","Jan","Feb"],
  "3M": ["Nov","Dec","Jan","Feb"],
  "1M": ["Week 1","Week 2","Week 3","Week 4"],
};

const revenueChart = new Chart(revenueCtx, {
  type: "line",
  data: {
    labels: revenueLabels["1Y"],
    datasets: [{
      data: revenueDataSets["1Y"],
      borderColor: COLORS.cyan,
      borderWidth: 2.5,
      backgroundColor: revGrad,
      fill: true,
      tension: 0.45,
      pointBackgroundColor: COLORS.cyan,
      pointBorderColor: "transparent",
      pointRadius: 4,
      pointHoverRadius: 7,
    },{
      data: revenueDataSets["1Y"].map(v => v * 0.62),
      borderColor: COLORS.purple,
      borderWidth: 2,
      backgroundColor: "rgba(168,85,247,0.08)",
      fill: true,
      tension: 0.45,
      pointBackgroundColor: COLORS.purple,
      pointBorderColor: "transparent",
      pointRadius: 3,
      pointHoverRadius: 6,
    }]
  },
  options: {
    ...chartDefaults,
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: { color: "#64748b", font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: { color: "#64748b", font: { size: 11 }, callback: v => "$" + v + "K" },
        border: { display: false },
      },
    },
  },
});

// Range toggle
document.querySelectorAll(".ctrl-btn[data-range]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".ctrl-btn[data-range]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const range = btn.dataset.range;
    const d = revenueDataSets[range];
    revenueChart.data.labels = revenueLabels[range];
    revenueChart.data.datasets[0].data = d;
    revenueChart.data.datasets[1].data = d.map(v => v * 0.62);
    revenueChart.update("active");
  });
});

// ── Allocation Donut ───────────────────────────────────────────────────────────
const allocCtx = document.getElementById("allocationChart").getContext("2d");
new Chart(allocCtx, {
  type: "doughnut",
  data: {
    datasets: [{
      data: [42, 28, 18, 12],
      backgroundColor: [COLORS.cyan, COLORS.green, COLORS.purple, COLORS.orange],
      borderColor: "transparent",
      borderWidth: 0,
      hoverOffset: 8,
    }]
  },
  options: {
    ...chartDefaults,
    cutout: "72%",
    plugins: {
      ...chartDefaults.plugins,
      tooltip: {
        ...chartDefaults.plugins.tooltip,
        callbacks: { label: ctx => ` ${ctx.parsed}%` },
      },
    },
  },
});

// ── P&L Bar Chart ──────────────────────────────────────────────────────────────
const plCtx = document.getElementById("plChart").getContext("2d");
const plGrad = plCtx.createLinearGradient(0, 0, 0, 200);
plGrad.addColorStop(0, "rgba(0,255,136,0.8)");
plGrad.addColorStop(1, "rgba(0,255,136,0.1)");

new Chart(plCtx, {
  type: "bar",
  data: {
    labels: ["Sep","Oct","Nov","Dec","Jan","Feb"],
    datasets: [{
      data: [42, -12, 68, 55, -8, 91],
      backgroundColor: ctx => ctx.raw >= 0 ? "rgba(0,255,136,0.6)" : "rgba(255,68,102,0.6)",
      borderColor:     ctx => ctx.raw >= 0 ? COLORS.green : COLORS.red,
      borderWidth: 1,
      borderRadius: 6,
      borderSkipped: false,
    }]
  },
  options: {
    ...chartDefaults,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: { color: "#64748b", font: { size: 11 }, callback: v => "$" + v + "K" },
        border: { display: false },
      },
    },
  },
});

// ── Sparkline helper ───────────────────────────────────────────────────────────
function sparkline(id, data, color) {
  const ctx = document.getElementById(id).getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, 40);
  grad.addColorStop(0, color + "55");
  grad.addColorStop(1, color + "00");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map((_, i) => i),
      datasets: [{ data, borderColor: color, borderWidth: 1.5, backgroundColor: grad, fill: true, tension: 0.4, pointRadius: 0 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
      animation: { duration: 1200, easing: "easeInOutQuart" },
    },
  });
}

sparkline("spark1", [12,18,14,22,20,28,25,32,30,38], COLORS.cyan);
sparkline("spark2", [8,12,10,15,13,18,16,20,19,24], COLORS.green);
sparkline("spark3", [80,85,90,88,95,100,102,98,105,110], COLORS.purple);
sparkline("spark4", [5,4.8,4.5,4.2,3.9,3.7,3.5,3.4,3.3,3.2], COLORS.orange);

// ── KPI Card entrance animation ────────────────────────────────────────────────
const cards = document.querySelectorAll(".kpi-card");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add("visible"), delay * 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

cards.forEach(c => observer.observe(c));

// Trigger immediately for cards in viewport on load
setTimeout(() => {
  cards.forEach(c => {
    const rect = c.getBoundingClientRect();
    if (rect.top < window.innerHeight) c.classList.add("visible");
  });
}, 100);

// ── Number counter animation ───────────────────────────────────────────────────
function animateCounter(el, target, prefix = "", suffix = "", decimals = 0) {
  let start = 0;
  const duration = 1800;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    const current = ease * target;
    el.textContent = prefix + current.toLocaleString("en-US", { maximumFractionDigits: decimals }) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const kpiValues = document.querySelectorAll(".kpi-value");
const kpiObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const text = el.textContent;
      if (text.startsWith("$")) {
        const num = parseFloat(text.replace(/[$,]/g, ""));
        animateCounter(el, num, "$", "", 0);
      } else if (text.includes("/")) {
        // risk score — leave as is
      } else {
        const num = parseFloat(text.replace(/,/g, ""));
        animateCounter(el, num, "", "", 0);
      }
      kpiObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

kpiValues.forEach(v => kpiObserver.observe(v));

console.log(
  "%c FinTrack Pro ",
  "background:#00f2ff;color:#050810;font-family:monospace;font-weight:900;padding:4px 12px;border-radius:4px;font-size:14px;"
);
console.log("%c Lead Developer: Collins Chele", "color:#a855f7;font-size:12px;");
