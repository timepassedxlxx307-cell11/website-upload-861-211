(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            var opened = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var index = 0;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    function initPageFilter() {
        var input = document.querySelector(".js-filter-input");

        if (!input) {
            return;
        }

        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region")
                ].join(" ").toLowerCase();
                card.classList.toggle("is-hidden", query.length > 0 && haystack.indexOf(query) === -1);
            });
        });
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return [
            "<article class=\"movie-card\" data-card data-title=\"" + escapeHtml(movie.title) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-region=\"" + escapeHtml(movie.region) + "\">",
            "<a class=\"movie-poster\" href=\"" + movie.url + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
            "<img src=\"" + movie.image + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"movie-year\">" + escapeHtml(movie.year) + "</span>",
            "</a>",
            "<div class=\"movie-card-body\">",
            "<div class=\"movie-card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
            "<h3 class=\"movie-card-title\"><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>",
            "<p>" + escapeHtml(movie.oneLine || "高清国产影视资源，支持在线播放。") + "</p>",
            "<div class=\"movie-card-tags\">" + tags + "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>'"]/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                "\"": "&quot;"
            }[character];
        });
    }

    function initSearchPage() {
        var page = document.querySelector("[data-search-page]");

        if (!page) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        var input = page.querySelector(".js-search-page-input");
        var title = page.querySelector(".js-search-title");
        var results = page.querySelector(".js-search-results");
        var index = window.MOVIE_INDEX || [];

        if (input) {
            input.value = query;
        }

        if (!query) {
            return;
        }

        var lowered = query.toLowerCase();
        var matched = index.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                (movie.tags || []).join(" "),
                movie.oneLine
            ].join(" ").toLowerCase();
            return haystack.indexOf(lowered) !== -1;
        }).slice(0, 96);

        if (title) {
            title.textContent = "“" + query + "”相关影片";
        }

        if (results) {
            results.innerHTML = matched.length > 0 ? matched.map(movieCard).join("") : "<p class=\"empty-result\">未找到相关影片，可尝试更换关键词。</p>";
        }
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".js-play-button");

            if (!video || !button) {
                return;
            }

            var url = video.getAttribute("data-hls");
            var loaded = false;
            var hlsInstance = null;

            function loadVideo() {
                if (loaded || !url) {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = url;
                }

                loaded = true;
            }

            function startVideo() {
                loadVideo();
                player.classList.add("is-playing");
                video.setAttribute("controls", "controls");
                var promise = video.play();

                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        player.classList.remove("is-playing");
                    });
                }
            }

            button.addEventListener("click", startVideo);
            video.addEventListener("click", function () {
                if (!loaded || video.paused) {
                    startVideo();
                }
            });

            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initPageFilter();
        initSearchPage();
        initPlayers();
    });
})();
