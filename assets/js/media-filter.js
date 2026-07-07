/* ==========================================================================
   Media filter
   ==========================================================================
   Pairs with the `.media-filter` pills and `.media-card` elements on
   /media/. Multi-select: clicking a type pill toggles it on/off and
   shows the union of every active type; "All" resets to showing
   everything. Does nothing if the page has neither.
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    var filters = Array.prototype.slice.call(document.querySelectorAll('.media-filter'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.media-card'));
    if (!filters.length || !cards.length) return;

    function findAllButton() {
      for (var i = 0; i < filters.length; i++) {
        if (filters[i].getAttribute('data-filter') === 'all') return filters[i];
      }
      return null;
    }

    function applyFilters() {
      var active = [];
      filters.forEach(function (b) {
        if (b.getAttribute('data-filter') !== 'all' && b.classList.contains('is-active')) {
          active.push(b.getAttribute('data-filter'));
        }
      });

      cards.forEach(function (card) {
        var show = active.length === 0 || active.indexOf(card.getAttribute('data-type')) !== -1;
        card.style.display = show ? '' : 'none';
      });
    }

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var isAll = btn.getAttribute('data-filter') === 'all';

        if (isAll) {
          filters.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
        } else {
          btn.classList.toggle('is-active');
          var anyActive = filters.some(function (b) {
            return b.getAttribute('data-filter') !== 'all' && b.classList.contains('is-active');
          });
          var allBtn = findAllButton();
          if (allBtn) allBtn.classList.toggle('is-active', !anyActive);
        }

        applyFilters();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
