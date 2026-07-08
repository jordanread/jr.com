/* ==========================================================================
   Splash overlay logic
   ==========================================================================
   Plays once per page, per browser — seen-state is tracked per page
   path (localStorage holds a small { "/path/": 1, ... } map), set on
   completion however that page's splash completes (full run, Skip
   button, Escape, or a click on the overlay). Skipping or finishing
   the splash on one page has no effect on any other page; each page
   plays its own splash the first time it's visited and skips straight
   past it on repeat visits from then on. The inline script in
   splash-head.html already adds a `splash-seen` class to <html>
   before anything paints for pages already marked seen (see the CSS
   override in splash.css), and this script's own check below is the
   belt-and-suspenders version for anything that runs before that CSS
   would otherwise apply.

   The footer's "Replay intro" button (rendered only on splash-layout
   pages) calls play() again regardless of the stored flag, without a
   page reload — the overlay markup and its data script tags stay in
   the DOM the whole time, just hidden after the first run.

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

  var STORAGE_KEY = 'splashSeenPages';

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

  function hasSeenSplash() {
    try {
      var seen = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return !!seen[window.location.pathname];
    } catch (err) {
      return false;
    }
  }

  function markSplashSeen() {
    try {
      var seen = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      seen[window.location.pathname] = 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
    } catch (err) { /* localStorage unavailable — splash just plays every time */ }
  }

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

    var phraseEl   = document.getElementById('splashPhrase');
    var skipBtn    = document.getElementById('splashSkip');
    var replayBtn  = document.getElementById('splashReplay');
    var phrases    = getPhrases();
    var cfg        = getConfig();
    var reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    var active = false;
    var i = 0;

    function onKeydown(event) {
      if (event.key === 'Escape') cleanup();
    }

    function cleanup() {
      if (!active) return;
      active = false;
      document.removeEventListener('keydown', onKeydown);
      overlay.classList.add('splash--leaving');
      window.setTimeout(function () {
        overlay.hidden = true;
        overlay.classList.remove('splash--leaving');
        document.body.classList.remove('splash-lock');
      }, cfg.overlayExit);
      markSplashSeen();
    }

    function showNext() {
      if (!active) return;

      phraseEl.classList.remove('is-active', 'is-exiting');
      phraseEl.textContent = phrases[i];

      // Force a reflow so the removed classes above are committed
      // before is-active is re-added — otherwise the browser can
      // coalesce the change and skip the transition.
      void phraseEl.offsetWidth;

      phraseEl.classList.add('is-active');

      window.setTimeout(function () {
        if (!active) return;
        phraseEl.classList.remove('is-active');
        phraseEl.classList.add('is-exiting');

        window.setTimeout(function () {
          if (!active) return;
          i += 1;
          if (i < phrases.length) {
            showNext();
          } else {
            cleanup();
          }
        }, cfg.exit);
      }, cfg.enter + cfg.hold);
    }

    function play() {
      // Explicit replay (button click) always plays, even if the
      // seen-flag is set — remove the pre-paint CSS override so the
      // overlay can actually show.
      document.documentElement.classList.remove('splash-seen');

      active = true;
      i = 0;
      overlay.hidden = false;
      overlay.classList.remove('splash--leaving');
      document.body.classList.add('splash-lock');
      document.addEventListener('keydown', onKeydown);
      skipBtn.focus();

      // Reduced motion: skip the cycling animation entirely and
      // reveal the page right away rather than running a shortened
      // version of the same motion.
      if (reduceMotion) {
        cleanup();
        return;
      }

      showNext();
    }

    overlay.addEventListener('click', cleanup);
    skipBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      cleanup();
    });
    if (replayBtn) {
      replayBtn.addEventListener('click', play);
    }

    if (hasSeenSplash()) {
      overlay.hidden = true;
      return;
    }

    play();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

