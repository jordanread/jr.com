/* ==========================================================================
   GLightbox init
   ==========================================================================
   Pairs with the vendored assets/js/vendor/glightbox.min.js and any
   `.glightbox` elements on the page (photo-album layout builds these from
   front matter — see _layouts/photo-album.html). Does nothing if a page
   has neither.

   GLightbox handles its own overlay markup, focus management, keyboard
   nav, and open/close transitions internally, so unlike the old hand-rolled
   lightbox there's no DOM to build here — just configuration.
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    if (typeof GLightbox !== 'function') return;
    if (!document.querySelector('.glightbox')) return;

    GLightbox({
      selector: '.glightbox',
      loop: true,
      touchNavigation: true,
      zoomable: false,
      closeOnOutsideClick: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
