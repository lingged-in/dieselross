/* ============================================================
   DIESELROSS.LI — Windows XP Interactive JS
   ============================================================ */

// ---- System Tray Clock ----
function updateClock() {
  const el = document.getElementById('xp-clock');
  if (!el) return;
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  el.textContent = h + ':' + m;
}
updateClock();
setInterval(updateClock, 10000);

// ---- Address bar: set current URL on load ----
(function () {
  const bar = document.getElementById('xp-address');
  if (bar && bar.dataset.url) {
    bar.value = bar.dataset.url;
  }
})();

// ---- Nav pane: collapse/expand sections ----
function toggleNavSection(header) {
  const links = header.nextElementSibling;
  if (!links) return;
  const isCollapsed = links.classList.contains('hidden');
  links.classList.toggle('hidden', !isCollapsed);
  header.classList.toggle('collapsed', !isCollapsed);
  header.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');
}

document.querySelectorAll('.xp-nav-section-header').forEach(function (header) {
  header.addEventListener('click', function () { toggleNavSection(header); });
  header.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleNavSection(header);
    }
  });
});

// ---- Timeline: expand/collapse phases ----
function toggleTimelinePhase(header) {
  const body = header.nextElementSibling;
  if (!body || !body.classList.contains('timeline-body')) return;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  header.classList.toggle('open', !isOpen);
  header.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
}

document.querySelectorAll('.timeline-header').forEach(function (header) {
  header.addEventListener('click', function () { toggleTimelinePhase(header); });
  header.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTimelinePhase(header);
    }
  });
});

// ---- Status bar: show "Fertig" after load ----
(function () {
  const status = document.getElementById('xp-status-text');
  if (!status) return;
  status.textContent = 'Seite wird geladen...';
  window.addEventListener('load', function () {
    status.textContent = 'Fertig';
  });
})();

// ---- Window control buttons (decorative) ----
document.querySelectorAll('.xp-btn-min, .xp-btn-max').forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
  });
});

document.querySelector('.xp-btn-close')?.addEventListener('click', function () {
  // Decorative only – do nothing
});

// ---- Taskbar app button highlight for current page ----
(function () {
  const apps = document.querySelectorAll('.xp-taskbar-app');
  apps.forEach(function (app) {
    if (app.dataset.page === document.body.dataset.page) {
      app.style.background = 'linear-gradient(to bottom, #2870A8 0%, #0A4888 2%, #0D4898 95%, #062868 100%)';
      app.style.boxShadow = 'inset 1px 1px 2px rgba(0,0,0,0.5)';
    }
  });
})();
