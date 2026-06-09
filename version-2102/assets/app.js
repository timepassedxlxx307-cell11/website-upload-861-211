(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer;

        function show(next) {
            if (!slides.length) {
                return;
            }

            index = (next + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(dotIndex);
                start();
            });
        });

        show(0);
        start();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var sortSelect = document.querySelector('[data-sort-select]');
    var filterGrid = document.querySelector('[data-filter-grid]');

    function applyFilter() {
        if (!filterGrid) {
            return;
        }

        var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.video-card'));

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-type') || '',
                card.getAttribute('data-tags') || ''
            ].join(' ').toLowerCase();

            card.style.display = !query || text.indexOf(query) !== -1 ? '' : 'none';
        });
    }

    function applySort() {
        if (!filterGrid || !sortSelect) {
            return;
        }

        var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.video-card'));
        var mode = sortSelect.value;

        cards.sort(function (a, b) {
            if (mode === 'rating') {
                return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
            }

            if (mode === 'views') {
                return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
            }

            if (mode === 'year') {
                return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
            }

            return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        });

        cards.forEach(function (card) {
            filterGrid.appendChild(card);
        });
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyFilter);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            applySort();
            applyFilter();
        });
        applySort();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    var searchRoot = document.querySelector('[data-search-root]');

    if (searchRoot && window.SEARCH_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var q = (params.get('q') || '').trim();
        var input = document.querySelector('[data-search-page-input]');

        if (input) {
            input.value = q;
        }

        function renderSearch(value) {
            var query = value.trim().toLowerCase();
            var items = query
                ? window.SEARCH_INDEX.filter(function (item) {
                    return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.summary]
                        .join(' ')
                        .toLowerCase()
                        .indexOf(query) !== -1;
                }).slice(0, 120)
                : window.SEARCH_INDEX.slice(0, 40);

            if (!items.length) {
                searchRoot.innerHTML = '<div class="search-empty"><h2>未找到相关内容</h2><p>可以尝试更换关键词继续检索。</p></div>';
                return;
            }

            searchRoot.innerHTML = items.map(function (item) {
                return '<article class="video-card group">' +
                    '<a class="video-card-link" href="' + escapeHtml(item.url) + '">' +
                    '<div class="video-card-media">' +
                    '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" class="video-card-image" loading="lazy">' +
                    '<span class="play-hover">▶</span>' +
                    '<span class="badge-rating">★ ' + escapeHtml(item.rating) + '</span>' +
                    '</div>' +
                    '<div class="video-card-body">' +
                    '<h3>' + escapeHtml(item.title) + '</h3>' +
                    '<div class="meta-row"><span class="badge-region">' + escapeHtml(item.region) + '</span><span class="badge-year">' + escapeHtml(item.year) + '</span></div>' +
                    '<div class="card-bottom"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div>' +
                    '</div>' +
                    '</a>' +
                    '</article>';
            }).join('');
        }

        renderSearch(q);

        if (input) {
            input.addEventListener('input', function () {
                renderSearch(input.value);
            });
        }
    }

    window.initMoviePlayer = function (sourceUrl) {
        var frame = document.querySelector('[data-player-frame]');

        if (!frame) {
            return;
        }

        var video = frame.querySelector('video');
        var overlay = frame.querySelector('[data-player-overlay]');
        var button = frame.querySelector('[data-player-button]');
        var loaded = false;
        var hls;

        function load() {
            if (loaded || !video) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function play() {
            load();

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            video.controls = true;
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!loaded || video.paused) {
                    play();
                }
            });
        }
    };
})();
