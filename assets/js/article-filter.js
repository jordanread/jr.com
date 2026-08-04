/* ==========================================================================
   Article filter
   ==========================================================================
   Pairs with the `.article-filter` pills and `.article-card` elements on
   /articles/. Multi-select: clicking a tag pill toggles it on/off and
   shows the union of every active tag; "All" resets to showing
   everything. Unlike media's single `data-type`, a card can carry several
   space-separated tags in `data-tags`, so a card matches if ANY active
   tag is among its own. Does nothing if the page has neither.
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    var filters = Array.prototype.slice.call(document.querySelectorAll('.article-filter'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.article-card'));
    if (!filters.length || !cards.length) return;

    function findAllButton() {
      for (var i = 0; i < filters.length; i++) {
        if (filters[i].getAttribute('data-filter') === 'all') return filters[i];
      }
      return null;
    }

    function cardTags(card) {
      var raw = card.getAttribute('data-tags') || '';
      return raw.split(/\s+/).filter(Boolean);
    }

    function applyFilters() {
      var active = [];
      filters.forEach(function (b) {
        if (b.getAttribute('data-filter') !== 'all' && b.classList.contains('is-active')) {
          active.push(b.getAttribute('data-filter'));
        }
      });

      cards.forEach(function (card) {
        var tags = cardTags(card);
        var show = active.length === 0 || active.some(function (a) { return tags.indexOf(a) !== -1; });
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
