/* ==========================================================================
   Theme toggle
   ==========================================================================
   Pairs with the inline snippet in _includes/head.html, which applies any
   stored preference to <html data-theme="..."> before the stylesheet loads
   (avoids a flash of the wrong theme). This script just wires up the
   button: read the effective theme, flip it on click, persist to
   localStorage.

   No stored preference = no data-theme attribute at all, and the site
   falls back to the OS-level prefers-color-scheme setting (see
   _sass/_theme.scss). Clicking the toggle always sets an explicit
   preference from that point on.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'theme';
  var root = document.documentElement;

  function systemPrefersDark() {
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function currentTheme() {
    var explicit = root.getAttribute('data-theme');
    if (explicit === 'dark' || explicit === 'light') return explicit;
    return systemPrefersDark() ? 'dark' : 'light';
  }

  function applyTheme(theme, btn) {
    root.setAttribute('data-theme', theme);
    if (btn) {
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }
  }

  function init() {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;

    // Sync button state to whatever theme actually ended up applied
    // (stored preference, or the OS default if none was ever set).
    applyTheme(currentTheme(), btn);

    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (err) { /* localStorage unavailable — theme still applies for this load */ }
      applyTheme(next, btn);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
