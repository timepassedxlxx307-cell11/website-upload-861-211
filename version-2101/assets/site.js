(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var query = input.value.trim();
        if (!query) {
          event.preventDefault();
          input.focus();
          return;
        }
        var target = form.getAttribute("action") || "./search.html";
        event.preventDefault();
        window.location.href = target + "?q=" + encodeURIComponent(query);
      });
    });

    var hero = document.querySelector("[data-hero-carousel]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var timer;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      function startTimer() {
        clearInterval(timer);
        timer = setInterval(function () {
          showSlide(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
          startTimer();
        });
      });

      showSlide(0);
      startTimer();
    }

    var liveInput = document.querySelector("[data-live-search]");
    var filterForm = document.querySelector("[data-filter-form]");
    if (liveInput) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var empty = document.querySelector("[data-empty-result]");

      function cardText(card) {
        return [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-year") || "",
          card.textContent || ""
        ].join(" ").toLowerCase();
      }

      function applyFilter() {
        var query = liveInput.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var matched = !query || cardText(card).indexOf(query) !== -1;
          card.classList.toggle("is-hidden-card", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      if (initialQuery) {
        liveInput.value = initialQuery;
      }
      liveInput.addEventListener("input", applyFilter);
      if (filterForm) {
        filterForm.addEventListener("submit", function (event) {
          event.preventDefault();
          applyFilter();
        });
      }
      applyFilter();
    }
  });

  window.initMoviePlayer = function (videoUrl, containerId) {
    var container = document.getElementById(containerId);
    if (!container) {
      return;
    }
    var video = container.querySelector("video");
    var overlay = container.querySelector(".player-overlay");
    var message = container.querySelector("[data-player-message]");
    var loaded = false;
    var loading = false;
    var hlsInstance = null;

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add("show");
      window.setTimeout(function () {
        message.classList.remove("show");
      }, 2600);
    }

    function loadVideo(callback) {
      if (loaded) {
        callback();
        return;
      }
      if (loading) {
        video.addEventListener("canplay", callback, { once: true });
        return;
      }
      loading = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        loaded = true;
        video.addEventListener("loadedmetadata", callback, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          loaded = true;
          callback();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            showMessage("暂时无法播放，请稍后再试");
          }
        });
        return;
      }

      video.src = videoUrl;
      loaded = true;
      callback();
    }

    function startPlayback() {
      loadVideo(function () {
        video.controls = true;
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            showMessage("点击视频即可继续播放");
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      });
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
