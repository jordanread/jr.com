/* ==========================================================================
   Splash overlay logic
   ==========================================================================
   Timeline per phrase: enter -> hold -> exit -> next phrase, or overlay
   fade-out after the last one.

   Timing comes from #splash-config (emitted by the Liquid include),
   which in turn comes from page front matter if set, otherwise from
   the defaults below. These constants are the final fallback — they're
   used if the #splash-config element is absent or unparseable, which
   shouldn't happen in normal use but keeps things from breaking
   if the include is wired up incorrectly.

   To change site-wide default pacing, edit the defaults in
   _includes/splash.html rather than here.
   ========================================================================== */
(function () {
  'use strict';

  var DEFAULTS = {
    enter:       450,  // matches .splash__phrase.is-active transition-duration
    hold:        900,  // fully-visible pause before exiting
    exit:        350,  // matches .splash__phrase.is-exiting transition-duration
    overlayExit: 500   // matches .splash--leaving transition-duration
  };

  // Used only if neither the server-rendered #splash-data tag nor
  // window.SPLASH_TAGLINES is present (e.g. include wasn't wired up
  // correctly) — keeps the splash from breaking outright.
  var FALLBACK_PHRASES = ['Hello.'];

  function getConfig() {
    var el = document.getElementById('splash-config');
    if (el && el.textContent.trim()) {
      try {
        var parsed = JSON.parse(el.textContent);
        return {
          enter:       parsed.enter       || DEFAULTS.enter,
          hold:        parsed.hold        || DEFAULTS.hold,
          exit:        parsed.exit        || DEFAULTS.exit,
          overlayExit: parsed.overlayExit || DEFAULTS.overlayExit
        };
      } catch (err) { /* fall through */ }
    }
    return DEFAULTS;
  }

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
    var skipBtn  = document.getElementById('splashSkip');
    var phrases  = getPhrases();
    var cfg      = getConfig();
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
      }, cfg.overlayExit);
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
        }, cfg.exit);
      }, cfg.enter + cfg.hold);
    }

    showNext();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
