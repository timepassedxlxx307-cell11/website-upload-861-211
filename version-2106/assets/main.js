(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', mobileMenu.classList.contains('is-open'));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var showSlide = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  var filterRoots = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));

  filterRoots.forEach(function (root) {
    var input = root.querySelector('[data-search-input]');
    var list = document.querySelector('[data-card-list]');
    var chips = Array.prototype.slice.call(root.querySelectorAll('[data-filter-value]'));
    var activeType = 'all';

    var filterCards = function () {
      if (!list) {
        return;
      }

      var keyword = input ? input.value.trim().toLowerCase() : '';
      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-type') || ''
        ].join(' ').toLowerCase();
        var type = card.getAttribute('data-type') || '';
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchType = activeType === 'all' || type === activeType;
        card.classList.toggle('is-hidden', !(matchKeyword && matchType));
      });
    };

    if (input) {
      input.addEventListener('input', filterCards);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        activeType = chip.getAttribute('data-filter-value') || 'all';
        filterCards();
      });
    });
  });

  var advancedSearch = document.querySelector('[data-advanced-search]');

  if (advancedSearch) {
    var searchInput = advancedSearch.querySelector('[data-search-input]');
    var typeSelect = advancedSearch.querySelector('[data-type-select]');
    var regionSelect = advancedSearch.querySelector('[data-region-select]');
    var status = document.querySelector('[data-search-status]');
    var searchList = document.querySelector('[data-card-list]');

    var runAdvancedSearch = function () {
      if (!searchList) {
        return;
      }

      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var typeValue = typeSelect ? typeSelect.value : 'all';
      var regionValue = regionSelect ? regionSelect.value : 'all';
      var visible = 0;
      var cards = Array.prototype.slice.call(searchList.querySelectorAll('.movie-card'));

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-type') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        var type = card.getAttribute('data-type') || '';
        var region = card.querySelector('.card-meta') ? card.querySelector('.card-meta').textContent : '';
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchType = typeValue === 'all' || type === typeValue;
        var matchRegion = regionValue === 'all' || region.indexOf(regionValue) !== -1;
        var show = matchKeyword && matchType && matchRegion;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = visible > 0 ? '已找到相关影片：' + visible + ' 部' : '没有找到匹配影片';
      }
    };

    [searchInput, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', runAdvancedSearch);
        control.addEventListener('change', runAdvancedSearch);
      }
    });
  }
})();
