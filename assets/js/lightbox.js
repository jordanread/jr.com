/* ==========================================================================
   Lightbox
   ==========================================================================
   Pairs with _includes/lightbox.html (the overlay markup) and any
   `.photo-thumb` buttons on the page (photo-album layout builds these
   from front matter). Does nothing if a page has neither.

   Scoped to all `.photo-thumb` elements on the page in document order —
   fine as long as a page only has one photo grid, which is the only
   case that exists right now (single-album pages).
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('.photo-thumb'));
    var overlay = document.getElementById('lightbox');
    if (!thumbs.length || !overlay) return;

    var imageEl = document.getElementById('lightboxImage');
    var captionEl = document.getElementById('lightboxCaption');
    var closeBtn = document.getElementById('lightboxClose');
    var prevBtn = document.getElementById('lightboxPrev');
    var nextBtn = document.getElementById('lightboxNext');

    var currentIndex = 0;
    var lastFocused = null;

    function show(index) {
      currentIndex = (index + thumbs.length) % thumbs.length;
      var thumb = thumbs[currentIndex];
      imageEl.src = thumb.getAttribute('data-full') || '';
      imageEl.alt = thumb.getAttribute('data-alt') || '';
      var caption = thumb.getAttribute('data-caption');
      captionEl.textContent = caption || '';
      captionEl.hidden = !caption;
    }

    function open(index) {
      lastFocused = document.activeElement;
      show(index);
      overlay.hidden = false;
      document.body.classList.add('lightbox-lock');
      document.addEventListener('keydown', onKeydown);
      closeBtn.focus();
    }

    function close() {
      overlay.hidden = true;
      document.body.classList.remove('lightbox-lock');
      imageEl.src = '';
      document.removeEventListener('keydown', onKeydown);
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
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
