/* ==========================================================================
   Image loading skeletons
   ==========================================================================
   Pairs with the .img-skeleton / .img-fade classes in _image-loading.scss.
   An .img-fade image starts at opacity: 0, sitting on top of its
   .img-skeleton container's shimmer background. This script adds
   .is-loaded to both once the image has actually finished loading (or
   failed), so the fade-in happens in one step instead of the browser
   painting the image in line-by-line as bytes arrive on a slow connection.

   Handles images that are already complete by the time this runs (e.g.
   served from cache) as well as ones still in flight, including
   loading="lazy" images that only start fetching once scrolled into view.
   ========================================================================== */
(function () {
  'use strict';

  function reveal(img) {
    img.classList.add('is-loaded');
    var wrap = img.closest('.img-skeleton');
    if (wrap) wrap.classList.add('is-loaded');
  }

  function watch(img) {
    if (img.complete && img.naturalWidth > 0) {
      reveal(img);
      return;
    }
    img.addEventListener('load', function () { reveal(img); });
    img.addEventListener('error', function () { reveal(img); });
  }

  function init() {
    var images = document.querySelectorAll('.img-fade');
    for (var i = 0; i < images.length; i++) {
      watch(images[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
