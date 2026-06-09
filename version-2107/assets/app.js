(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var section = scope.parentElement || document;
      var input = scope.querySelector('[data-search-input]');
      var category = scope.querySelector('[data-category-filter]');
      var year = scope.querySelector('[data-year-filter]');
      var empty = scope.querySelector('[data-empty-message]');
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var categoryValue = category ? category.value : 'all';
        var yearValue = year ? year.value : 'all';
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var cardCategory = card.getAttribute('data-category') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var ok = true;
          if (query && text.indexOf(query) === -1) {
            ok = false;
          }
          if (categoryValue !== 'all' && cardCategory !== categoryValue) {
            ok = false;
          }
          if (yearValue !== 'all' && cardYear !== yearValue) {
            ok = false;
          }
          card.classList.toggle('is-hidden', !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, category, year].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.play-trigger');
      var hlsInstance = null;
      if (!video || !button) {
        return;
      }
      var streamUrl = video.getAttribute('data-src');

      function setActive() {
        player.classList.add('is-playing');
      }

      function playNative() {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', streamUrl);
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      function playWithHls() {
        if (hlsInstance) {
          var existing = video.play();
          if (existing && existing.catch) {
            existing.catch(function () {});
          }
          return;
        }
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {});
          }
        });
      }

      function startPlayback() {
        if (!streamUrl) {
          return;
        }
        setActive();
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          playNative();
        } else if (window.Hls && Hls.isSupported()) {
          playWithHls();
        } else {
          playNative();
        }
      }

      button.addEventListener('click', startPlayback);
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener('play', setActive);
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
  });
})();
