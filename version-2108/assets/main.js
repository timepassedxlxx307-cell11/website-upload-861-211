(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var filterForm = document.querySelector('[data-filter-form]');

  if (filterForm) {
    var filterInput = filterForm.querySelector('input[name="keyword"]');
    var typeSelect = filterForm.querySelector('select[name="type"]');
    var resetButton = filterForm.querySelector('[data-reset-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    function applyFilter() {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value.trim().toLowerCase() : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();

        var typeValue = (card.getAttribute('data-type') || '').toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchType = !type || typeValue.indexOf(type) !== -1;
        card.classList.toggle('is-hidden', !(matchKeyword && matchType));
      });
    }

    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (filterInput) {
          filterInput.value = '';
        }

        if (typeSelect) {
          typeSelect.value = '';
        }

        applyFilter();
      });
    }
  }

  var results = document.querySelector('[data-search-results]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchForm = document.querySelector('[data-search-page-form]');

  function getQuery() {
    var params = new URLSearchParams(globalThis.location.search);
    return (params.get('q') || '').trim();
  }

  function movieCard(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card" data-movie-card>' +
      '<a class="movie-poster" href="' + escapeHtml(item.file) + '" aria-label="' + escapeHtml(item.title) + '">' +
      '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="movie-badge">' + escapeHtml(item.year) + '</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<div class="movie-card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
      '<h2><a href="' + escapeHtml(item.file) + '">' + escapeHtml(item.title) + '</a></h2>' +
      '<p>' + escapeHtml(item.oneLine) + '</p>' +
      '<div class="movie-card-tags">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSearch(query) {
    if (!results || !globalThis.SEARCH_INDEX) {
      return;
    }

    var normalized = query.trim().toLowerCase();
    var items = globalThis.SEARCH_INDEX;

    if (normalized) {
      items = items.filter(function (item) {
        return [
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.tags.join(' '),
          item.oneLine
        ].join(' ').toLowerCase().indexOf(normalized) !== -1;
      });
    }

    items = items.slice(0, 96);

    if (!items.length) {
      results.innerHTML = '<div class="empty-search">没有找到匹配内容，请尝试更换关键词。</div>';
      return;
    }

    results.innerHTML = items.map(movieCard).join('');
  }

  if (results && globalThis.SEARCH_INDEX) {
    var initialQuery = getQuery();

    if (searchInput) {
      searchInput.value = initialQuery;
    }

    renderSearch(initialQuery);

    if (searchForm) {
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = searchInput ? searchInput.value.trim() : '';
        var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
        history.replaceState(null, '', url);
        renderSearch(query);
      });
    }
  }

  var video = document.querySelector('[data-player]');
  var overlay = document.querySelector('[data-play-overlay]');
  var trigger = document.querySelector('[data-play-trigger]');
  var hlsInstance = null;

  function attachVideo() {
    if (!video) {
      return;
    }

    var url = video.getAttribute('data-play-url');

    if (!url || video.getAttribute('data-ready') === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (globalThis.Hls && globalThis.Hls.isSupported()) {
      hlsInstance = new globalThis.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
    } else {
      video.src = url;
    }

    video.setAttribute('data-ready', 'true');
  }

  function startVideo() {
    if (!video) {
      return;
    }

    attachVideo();

    if (trigger) {
      trigger.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (trigger) {
    trigger.addEventListener('click', startVideo);
  }

  if (overlay) {
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        startVideo();
      }
    });
  }

  if (video) {
    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });
  }

  globalThis.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
