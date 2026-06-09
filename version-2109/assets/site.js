(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var siteNav = document.getElementById('siteNav');

    if (navToggle && siteNav) {
        navToggle.addEventListener('click', function () {
            var expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!expanded));
            siteNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero-carousel]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        var searchInput = filterPanel.querySelector('[data-search-input]');
        var typeFilter = filterPanel.querySelector('[data-type-filter]');
        var regionFilter = filterPanel.querySelector('[data-region-filter]');
        var yearFilter = filterPanel.querySelector('[data-year-filter]');
        var count = filterPanel.querySelector('[data-result-count]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

        if (filterPanel.hasAttribute('data-read-query') && searchInput) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                searchInput.value = q;
            }
        }

        function includesValue(source, value) {
            return !value || source.indexOf(value) !== -1;
        }

        function applyFilters() {
            var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var type = typeFilter ? typeFilter.value.trim().toLowerCase() : '';
            var region = regionFilter ? regionFilter.value.trim().toLowerCase() : '';
            var year = yearFilter ? yearFilter.value.trim().toLowerCase() : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags'),
                    card.textContent
                ].join(' ').toLowerCase();
                var pass = includesValue(text, q) && includesValue(text, type) && includesValue(text, region) && includesValue(text, year);
                card.classList.toggle('is-hidden', !pass);
                if (pass) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + ' 部';
            }
        }

        [searchInput, typeFilter, regionFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById('movieVideo');
        var button = document.getElementById('playButton');
        var loaded = false;
        var hlsInstance = null;

        if (!video || !button || !streamUrl) {
            return;
        }

        function attachStream() {
            if (loaded) {
                return Promise.resolve();
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
                video.src = streamUrl;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    window.setTimeout(resolve, 1200);
                });
            }

            video.src = streamUrl;
            return Promise.resolve();
        }

        function playVideo() {
            button.hidden = true;
            attachStream().then(function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        button.hidden = false;
                    });
                }
            });
        }

        button.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });
        video.addEventListener('play', function () {
            button.hidden = true;
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                button.hidden = false;
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
}());
