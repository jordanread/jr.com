/* ==========================================================================
   Splash overlay logic
   ==========================================================================
   Timeline per phrase: enter (ENTER_MS) -> hold (HOLD_MS) -> exit (EXIT_MS)
   -> next phrase, or overlay fade-out (OVERLAY_EXIT_MS) after the last one.

   Tune the four constants below to change pacing. Nothing else in this
   file should need touching for day-to-day use — phrase content lives
   in _data/taglines.yml, not here.
   ========================================================================== */
(function () {
  'use strict';

  var ENTER_MS = 400;   // matches the CSS transition-duration on .is-active
  var HOLD_MS = 800;    // fully-visible pause before exiting
  var EXIT_MS = 300;    // matches the CSS transition-duration on .is-exiting
  var OVERLAY_EXIT_MS = 500; // matches the CSS transition on .splash--leaving

  // Used only if neither the server-rendered #splash-data tag nor
  // window.SPLASH_TAGLINES is present (e.g. include wasn't wired up
  // correctly) — keeps the splash from breaking outright.
  var FALLBACK_PHRASES = ['Placeholder 😉'];

  function getPhrases() {
    var dataEl = document.getElementById('splash-data');
    if (dataEl && dataEl.textContent.trim()) {
      try {
        var parsed = JSON.parse(dataEl.textContent);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch (err) {
        // fall through to other sources
      }
    }
    if (window.SPLASH_TAGLINES && window.SPLASH_TAGLINES.length) {
      return window.SPLASH_TAGLINES;
    }
    return FALLBACK_PHRASES;
  }

  function init() {
    var overlay = document.getElementById('splash');
    if (!overlay) return;

    var phraseEl = document.getElementById('splashPhrase');
    var skipBtn = document.getElementById('splashSkip');
    var phrases = getPhrases();
    var reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    document.body.classList.add('splash-lock');

    var finished = false;
    var i = 0;

    function cleanup() {
      if (finished) return;
      finished = true;
      document.removeEventListener('keydown', onKeydown);
      overlay.classList.add('splash--leaving');
      window.setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        document.body.classList.remove('splash-lock');
      }, OVERLAY_EXIT_MS);
    }

    function onKeydown(event) {
      if (event.key === 'Escape') cleanup();
    }

    overlay.addEventListener('click', cleanup);
    skipBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      cleanup();
    });
    document.addEventListener('keydown', onKeydown);

    // Reduced motion: skip the cycling animation entirely and reveal
    // the page right away rather than running a shortened version of
    // the same motion.
    if (reduceMotion) {
      cleanup();
      return;
    }

    skipBtn.focus();

    function showNext() {
      if (finished) return;

      phraseEl.classList.remove('is-active', 'is-exiting');
      phraseEl.textContent = phrases[i];

      // Force a reflow so the removed classes above are committed
      // before is-active is re-added — otherwise the browser can
      // coalesce the change and skip the transition.
      void phraseEl.offsetWidth;

      phraseEl.classList.add('is-active');

      window.setTimeout(function () {
        if (finished) return;
        phraseEl.classList.remove('is-active');
        phraseEl.classList.add('is-exiting');

        window.setTimeout(function () {
          if (finished) return;
          i += 1;
          if (i < phrases.length) {
            showNext();
          } else {
            cleanup();
          }
        }, EXIT_MS);
      }, ENTER_MS + HOLD_MS);
    }

    showNext();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
