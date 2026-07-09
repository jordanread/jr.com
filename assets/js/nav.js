/* ==========================================================================
   Site nav: mobile hamburger toggle + Projects dropdown
   ==========================================================================
   Desktop: the Projects dropdown is pure CSS (:hover / :focus-within in
   _header.scss) — clicking "Projects" navigates normally, exactly like
   any other nav link. Below MOBILE_BREAKPOINT there's no hover to rely
   on, so tapping the parent link opens/closes the dropdown in place
   instead of navigating. window.innerWidth is checked at click time
   rather than cached, so resizing across the breakpoint (or rotating a
   tablet) doesn't leave stale behavior.
   ========================================================================== */
(function () {
  'use strict';

  var MOBILE_BREAKPOINT = 768;

  function initMobileNav() {
    var navToggle = document.getElementById('nav-toggle');
    var siteNav = document.getElementById('site-nav');
    if (!navToggle || !siteNav) return;

    function close() {
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }

    navToggle.addEventListener('click', function (event) {
      event.stopPropagation();
      var isOpen = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Any actual navigation (a real link, not the dropdown-toggling
    // parent link) should close the mobile menu behind it.
    var links = siteNav.querySelectorAll('.nav-link:not(.nav-link--parent), .nav-dropdown-link');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', close);
    }

    document.addEventListener('click', function (event) {
      if (!navToggle.contains(event.target) && !siteNav.contains(event.target)) {
        close();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && siteNav.classList.contains('is-open')) {
        close();
        navToggle.focus();
      }
    });
  }

  function initDropdowns() {
    var items = document.querySelectorAll('.nav-item--has-dropdown');

    for (var i = 0; i < items.length; i++) {
      (function (item) {
        var parentLink = item.querySelector('.nav-link--parent');
        if (!parentLink) return;

        parentLink.addEventListener('click', function (event) {
          if (window.innerWidth <= MOBILE_BREAKPOINT) {
            event.preventDefault();
            item.classList.toggle('is-open');
          }
        });
      })(items[i]);
    }
  }

  function init() {
    initMobileNav();
    initDropdowns();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
