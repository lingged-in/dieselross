/* ============================================================
   DIESELROSS.LI — Windows XP Interactive JS
   ============================================================ */

// ---- Password Protection ----
(function () {
  var KEY  = 'drAuth';
  var PASS = 'dieselross';

  // Already authenticated – just make page visible and exit
  if (sessionStorage.getItem(KEY) === '1') {
    document.documentElement.style.visibility = '';
    return;
  }

  // Build the XP-style password dialog
  var overlay = document.createElement('div');
  overlay.id = 'xp-pw-overlay';
  overlay.innerHTML =
    '<div class="xp-pw-dialog" role="dialog" aria-modal="true" aria-labelledby="xp-pw-title">' +
      '<div class="xp-pw-title-bar">' +
        '<span class="xp-pw-title-icon" aria-hidden="true"><i class="fa-solid fa-lock"></i></span>' +
        '<span class="xp-pw-title-text" id="xp-pw-title">Dieselross.li – Anmelden</span>' +
      '</div>' +
      '<div class="xp-pw-body">' +
        '<div class="xp-pw-info">' +
          '<span class="xp-pw-lock-icon" aria-hidden="true"><i class="fa-solid fa-lock"></i></span>' +
          '<div class="xp-pw-info-text">' +
            '<strong>Passwort erforderlich</strong>' +
            'Diese Website befindet sich im Aufbau und ist vorübergehend passwortgeschützt.' +
          '</div>' +
        '</div>' +
        '<div class="xp-pw-field">' +
          '<label for="xp-pw-input">Passwort:</label>' +
          '<input type="password" id="xp-pw-input" autocomplete="current-password" />' +
        '</div>' +
        '<div class="xp-pw-error" id="xp-pw-error" aria-live="polite"></div>' +
      '</div>' +
      '<div class="xp-pw-buttons">' +
        '<button class="xp-dialog-btn" id="xp-pw-ok">OK</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);
  document.documentElement.style.visibility = ''; // show overlay, keep rest hidden behind it

  var input   = document.getElementById('xp-pw-input');
  var errorEl = document.getElementById('xp-pw-error');
  var okBtn   = document.getElementById('xp-pw-ok');
  var dialog  = overlay.querySelector('.xp-pw-dialog');

  input.focus();

  function tryUnlock() {
    if (input.value === PASS) {
      sessionStorage.setItem(KEY, '1');
      overlay.remove();
    } else {
      errorEl.textContent = 'Falsches Passwort. Bitte erneut versuchen.';
      input.value = '';
      input.focus();
      dialog.classList.remove('xp-pw-shake');
      void dialog.offsetWidth; // reflow to restart animation
      dialog.classList.add('xp-pw-shake');
      dialog.addEventListener('animationend', function () {
        dialog.classList.remove('xp-pw-shake');
      }, { once: true });
    }
  }

  okBtn.addEventListener('click', tryUnlock);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') tryUnlock();
  });
})();

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
        '<span class="xp-lightbox-title-icon" aria-hidden="true"><i class="fa-solid fa-images"></i></span>' +
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

// ---- Scroll-spy: highlight nav sub-link for the visible section ----
// Works on any page that has nav links pointing to local anchors (#id).
// The page-level "active" link (set in HTML per page) is never removed.
(function () {
  // Collect nav links that target a local anchor on the current page
  var anchors = {};
  document.querySelectorAll('.xp-nav-link[href^="#"]').forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    var target = document.getElementById(id);
    if (target) anchors[id] = link;
  });

  if (!Object.keys(anchors).length) return;
  if (!window.IntersectionObserver) return;

  var currentId = null;

  // If the URL already has a hash on load, pre-highlight that section
  var hashId = (location.hash || '').slice(1);
  if (hashId && anchors[hashId]) {
    anchors[hashId].classList.add('active');
    currentId = hashId;
  }

  var observer = new IntersectionObserver(function (entries) {
    // Pick the entry with the largest intersection ratio that is intersecting
    var best = null;
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      }
    });
    if (!best) return;

    var newId = best.target.id;
    if (newId === currentId) return;

    // Remove active from previous sub-link (but never touch the page-level link)
    if (currentId && anchors[currentId]) {
      anchors[currentId].classList.remove('active');
    }
    anchors[newId].classList.add('active');
    currentId = newId;
  }, {
    // Trigger when top ~30% of viewport is crossed — feels natural while scrolling
    rootMargin: '-10% 0px -60% 0px',
    threshold: 0
  });

  Object.keys(anchors).forEach(function (id) {
    observer.observe(document.getElementById(id));
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
