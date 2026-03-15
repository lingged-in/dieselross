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

// ---- Gallery Lightbox ----
(function () {
  var sections = document.querySelectorAll('.galerie-section');
  if (!sections.length) return;

  // Build overlay once
  var overlay = document.createElement('div');
  overlay.id = 'xp-lightbox';
  overlay.className = 'xp-lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'xp-lb-title');
  overlay.setAttribute('hidden', '');
  overlay.innerHTML =
    '<div class="xp-lightbox-window">' +
      '<div class="xp-lightbox-title-bar">' +
        '<span class="xp-lightbox-title-icon" aria-hidden="true">🖼️</span>' +
        '<span class="xp-lightbox-title-text" id="xp-lb-title">Bild</span>' +
        '<button class="xp-btn xp-btn-close xp-lightbox-close" title="Schließen (ESC)" aria-label="Lightbox schließen">&#10005;</button>' +
      '</div>' +
      '<div class="xp-lightbox-body">' +
        '<button class="xp-lightbox-prev" title="Vorheriges Bild (←)" aria-label="Vorheriges Bild">&#9664;</button>' +
        '<div class="xp-lightbox-content" id="xp-lb-content" aria-live="polite"></div>' +
        '<button class="xp-lightbox-next" title="Nächstes Bild (→)" aria-label="Nächstes Bild">&#9654;</button>' +
      '</div>' +
      '<div class="xp-lightbox-caption" id="xp-lb-caption"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  var currentGroup = [];
  var currentIndex = 0;
  var openerEl = null;
  var titleEl  = overlay.querySelector('#xp-lb-title');
  var contentEl = overlay.querySelector('#xp-lb-content');
  var captionEl = overlay.querySelector('#xp-lb-caption');
  var prevBtn  = overlay.querySelector('.xp-lightbox-prev');
  var nextBtn  = overlay.querySelector('.xp-lightbox-next');
  var closeBtn = overlay.querySelector('.xp-lightbox-close');

  function getCaption(el) {
    if (el.dataset.caption) return el.dataset.caption;
    var label = el.querySelector('.galerie-img-placeholder-label');
    if (label) return label.textContent.trim();
    return el.getAttribute('alt') || '';
  }

  function getSectionTitle(el) {
    var section = el.closest('.galerie-section');
    if (!section) return '';
    var t = section.querySelector('.galerie-section-title');
    return t ? t.textContent.trim() : '';
  }

  function showItem(index) {
    currentIndex = index;
    var el = currentGroup[index];
    var sectionTitle = getSectionTitle(el);
    titleEl.textContent = sectionTitle
      ? sectionTitle + ' – ' + (index + 1) + ' von ' + currentGroup.length
      : 'Bild ' + (index + 1) + ' von ' + currentGroup.length;

    contentEl.innerHTML = '';
    if (el.tagName === 'IMG' || el.classList.contains('gallery-img')) {
      var img = document.createElement('img');
      img.src = el.src || el.dataset.src || '';
      img.alt = el.alt || getCaption(el);
      img.className = 'xp-lightbox-img';
      contentEl.appendChild(img);
    } else {
      var iconEl = el.querySelector('.galerie-img-placeholder-icon');
      var ph = document.createElement('div');
      ph.className = 'xp-lightbox-placeholder';
      ph.innerHTML =
        '<div class="xp-lightbox-ph-icon">' + (iconEl ? iconEl.textContent : '📷') + '</div>' +
        '<div class="xp-lightbox-ph-text">' + getCaption(el) + '</div>' +
        '<div class="xp-lightbox-ph-note">Foto folgt</div>';
      contentEl.appendChild(ph);
    }

    captionEl.textContent = getCaption(el);
    prevBtn.disabled = (index === 0);
    nextBtn.disabled = (index === currentGroup.length - 1);
  }

  function openLightbox(group, index, opener) {
    openerEl = opener;
    currentGroup = group;
    showItem(index);
    overlay.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    overlay.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (openerEl) openerEl.focus();
  }

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', function () {
    if (currentIndex > 0) showItem(currentIndex - 1);
  });
  nextBtn.addEventListener('click', function () {
    if (currentIndex < currentGroup.length - 1) showItem(currentIndex + 1);
  });
  overlay.addEventListener('keydown', function (e) {
    if (e.key === 'Escape')       { closeLightbox(); return; }
    if (e.key === 'ArrowLeft'  && currentIndex > 0)                          showItem(currentIndex - 1);
    if (e.key === 'ArrowRight' && currentIndex < currentGroup.length - 1)    showItem(currentIndex + 1);
  });
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeLightbox();
  });

  // Wire up items per section
  sections.forEach(function (section) {
    var items = Array.from(section.querySelectorAll('.galerie-img-placeholder, .gallery-img'));
    items.forEach(function (item, idx) {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      var cap = getCaption(item);
      if (cap) item.setAttribute('aria-label', 'Bild vergrößern: ' + cap);
      item.addEventListener('click', function () { openLightbox(items, idx, item); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(items, idx, item);
        }
      });
    });
  });
})();

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
