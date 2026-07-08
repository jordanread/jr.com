/* ==========================================================================
   Nav dropdown (Projects menu, and any future nav item with children)
   ==========================================================================
   Desktop hover/focus is handled entirely by CSS (:hover / :focus-within
   on .nav-dropdown in _header.scss) — this script only adds click-to-
   toggle for touch devices, where there's no hover to rely on, plus
   Escape and outside-click to close, and keeps aria-expanded in sync
   either way.
   ========================================================================== */
(function () {
  'use strict';

  function closeAll(except) {
    var open = document.querySelectorAll('.nav-dropdown.is-open');
    for (var i = 0; i < open.length; i++) {
      if (open[i] === except) continue;
      open[i].classList.remove('is-open');
      var btn = open[i].querySelector('.nav-dropdown-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  }

  function init() {
    var dropdowns = document.querySelectorAll('.nav-dropdown');
    if (!dropdowns.length) return;

    for (var i = 0; i < dropdowns.length; i++) {
      (function (dropdown) {
        var toggle = dropdown.querySelector('.nav-dropdown-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', function (event) {
          event.stopPropagation();
          var isOpen = dropdown.classList.contains('is-open');
          closeAll(isOpen ? null : dropdown);
          dropdown.classList.toggle('is-open', !isOpen);
          toggle.setAttribute('aria-expanded', String(!isOpen));
        });
      })(dropdowns[i]);
    }

    document.addEventListener('click', function () {
      closeAll();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeAll();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
