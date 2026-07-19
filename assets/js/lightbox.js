/* ==========================================================================
   Lightbox
   ==========================================================================
   Pairs with _includes/lightbox.html (the overlay markup) and any
   `.photo-thumb` buttons on the page (photo-album layout builds these
   from front matter). Does nothing if a page has neither.

   Scoped to all `.photo-thumb` elements on the page in document order —
   fine as long as a page only has one photo grid, which is the only
   case that exists right now (single-album pages).

   Transitions follow the same pattern as splash.js: unhide first, force
   a reflow, then add the class that actually triggers the CSS transition
   (see _sass/_lightbox.scss), and on the way out wait out the transition
   duration before hiding again. prefers-reduced-motion skips straight to
   the end state instead of running a shortened version of the motion.
   ========================================================================== */
(function () {
  'use strict';

  var TIMING = {
    open:  220, // matches .lightbox transition-duration
    close: 180, // matches .lightbox.is-closing transition-duration
    swap:  150  // matches .lightbox-image transition-duration
  };

  function init() {
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('.photo-thumb'));
    var overlay = document.getElementById('lightbox');
    if (!thumbs.length || !overlay) return;

    var imageEl = document.getElementById('lightboxImage');
    var captionEl = document.getElementById('lightboxCaption');
    var closeBtn = document.getElementById('lightboxClose');
    var prevBtn = document.getElementById('lightboxPrev');
    var nextBtn = document.getElementById('lightboxNext');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var currentIndex = 0;
    var lastFocused = null;
    var closeTimer = null;

    function applyImage(thumb) {
      imageEl.src = thumb.getAttribute('data-full') || '';
      imageEl.alt = thumb.getAttribute('data-alt') || '';
      var caption = thumb.getAttribute('data-caption');
      captionEl.textContent = caption || '';
      captionEl.hidden = !caption;
    }

    // opts.instant skips the crossfade — used when the overlay itself is
    // already animating in/out, so the image doesn't need its own fade too.
    function show(index, opts) {
      currentIndex = (index + thumbs.length) % thumbs.length;
      var thumb = thumbs[currentIndex];

      if ((opts && opts.instant) || reduceMotion) {
        applyImage(thumb);
        return;
      }

      imageEl.classList.add('is-swapping');
      window.setTimeout(function () {
        applyImage(thumb);
        imageEl.classList.remove('is-swapping');
      }, TIMING.swap);
    }

    function open(index) {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }
      lastFocused = document.activeElement;
      show(index, { instant: true });
      overlay.classList.remove('is-closing');
      overlay.hidden = false;

      // Force a reflow so the browser commits the unhidden, pre-transition
      // state before is-open is added — otherwise it can coalesce the two
      // and skip the transition entirely.
      void overlay.offsetWidth;

      overlay.classList.add('is-open');
      document.body.classList.add('lightbox-lock');
      document.addEventListener('keydown', onKeydown);
      closeBtn.focus();
    }

    function close() {
      document.removeEventListener('keydown', onKeydown);
      document.body.classList.remove('lightbox-lock');

      function finish() {
        overlay.hidden = true;
        overlay.classList.remove('is-closing');
        imageEl.src = '';
        if (lastFocused && typeof lastFocused.focus === 'function') {
          lastFocused.focus();
        }
      }

      overlay.classList.remove('is-open');

      if (reduceMotion) {
        finish();
        return;
      }

      overlay.classList.add('is-closing');
      closeTimer = window.setTimeout(function () {
        closeTimer = null;
        finish();
      }, TIMING.close);
    }

    function onKeydown(event) {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') show(currentIndex - 1);
      if (event.key === 'ArrowRight') show(currentIndex + 1);
    }

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener('click', function () {
        open(index);
      });
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { show(currentIndex - 1); });
    nextBtn.addEventListener('click', function () { show(currentIndex + 1); });

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
