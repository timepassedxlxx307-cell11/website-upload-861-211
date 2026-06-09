(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var searchInput = document.querySelector('[data-filter-search]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var resetButton = document.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid] .video-card'));
    var resultNote = document.querySelector('[data-result-note]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var query = normalize(searchInput && searchInput.value);
      var region = regionSelect ? regionSelect.value : 'all';
      var type = typeSelect ? typeSelect.value : 'all';
      var year = yearSelect ? yearSelect.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var matchesQuery = !query || normalize(card.getAttribute('data-search')).indexOf(query) !== -1;
        var matchesRegion = region === 'all' || card.getAttribute('data-region') === region;
        var matchesType = type === 'all' || card.getAttribute('data-type') === type;
        var matchesYear = year === 'all' || card.getAttribute('data-year') === year;
        var show = matchesQuery && matchesRegion && matchesType && matchesYear;
        card.classList.toggle('is-hidden-card', !show);
        if (show) {
          visible += 1;
        }
      });

      if (resultNote) {
        resultNote.textContent = visible > 0 ? '已找到 ' + visible + ' 部相关影片' : '没有找到符合条件的影片';
      }
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (regionSelect) {
          regionSelect.value = 'all';
        }
        if (typeSelect) {
          typeSelect.value = 'all';
        }
        if (yearSelect) {
          yearSelect.value = 'all';
        }
        applyFilters();
      });
    }
  }

  var searchForm = document.querySelector('[data-search-form]');
  var searchInputPage = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');

  function cardTemplate(movie) {
    return '' +
      '<article class="video-card">' +
      '<a class="video-card-link" href="movie/' + movie.file + '" title="' + escapeHtml(movie.title) + ' 在线观看">' +
      '<div class="video-poster">' +
      '<img src="./' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-region">' + escapeHtml(movie.region) + '</span>' +
      '<span class="poster-type">' + escapeHtml(movie.type) + '</span>' +
      '<span class="poster-year">' + escapeHtml(movie.year) + '</span>' +
      '<span class="poster-play">▶</span>' +
      '</div>' +
      '<div class="video-card-body">' +
      '<h3>' + escapeHtml(movie.title) + '</h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="video-meta"><span>' + escapeHtml(movie.genre) + '</span></div>' +
      '</div>' +
      '</a>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function runSearch(query) {
    if (!searchResults || !window.SITE_MOVIES) {
      return;
    }

    var keyword = String(query || '').trim().toLowerCase();
    if (!keyword) {
      searchResults.innerHTML = '<p class="empty-state">输入关键词即可查找相关影片。</p>';
      return;
    }

    var matches = window.SITE_MOVIES.filter(function (movie) {
      return movie.search.indexOf(keyword) !== -1;
    }).slice(0, 120);

    if (matches.length === 0) {
      searchResults.innerHTML = '<p class="empty-state">未找到相关影片，换个关键词试试。</p>';
      return;
    }

    searchResults.innerHTML = '<div class="section-head"><div><span class="section-eyebrow">Results</span><h2>搜索结果</h2></div></div><div class="card-grid grid-4">' + matches.map(cardTemplate).join('') + '</div>';
  }

  if (searchForm && searchInputPage) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInputPage.value = initialQuery;
    runSearch(initialQuery);

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = searchInputPage.value.trim();
      var nextUrl = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
      window.history.replaceState(null, '', nextUrl);
      runSearch(value);
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-hot-search]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-hot-search') || '';
      if (searchInputPage) {
        searchInputPage.value = value;
      }
      window.history.replaceState(null, '', 'search.html?q=' + encodeURIComponent(value));
      runSearch(value);
    });
  });
})();
