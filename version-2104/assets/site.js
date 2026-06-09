const menuButton = document.querySelector(".menu-toggle");

if (menuButton) {
    menuButton.addEventListener("click", () => {
        document.body.classList.toggle("menu-open");
    });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    let current = 0;

    const showSlide = (next) => {
        slides[current].classList.remove("active");
        dots[current].classList.remove("active");
        current = next;
        slides[current].classList.add("active");
        dots[current].classList.add("active");
    };

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => showSlide(index));
    });

    setInterval(() => {
        showSlide((current + 1) % slides.length);
    }, 5200);
}

const searchInputs = Array.from(document.querySelectorAll(".movie-search"));
const filterSelects = Array.from(document.querySelectorAll(".filter-select"));

const filterCards = () => {
    const query = searchInputs.map((input) => input.value.trim().toLowerCase()).find(Boolean) || "";
    const typeValue = filterSelects.map((select) => select.value.trim()).find(Boolean) || "";
    const cards = Array.from(document.querySelectorAll("[data-card-list] a"));

    cards.forEach((card) => {
        const values = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.genre,
            card.dataset.type,
            card.dataset.year,
            card.textContent
        ].join(" ").toLowerCase();
        const matchesQuery = !query || values.includes(query);
        const matchesType = !typeValue || values.includes(typeValue.toLowerCase());
        card.classList.toggle("is-hidden", !(matchesQuery && matchesType));
    });
};

searchInputs.forEach((input) => input.addEventListener("input", filterCards));
filterSelects.forEach((select) => select.addEventListener("change", filterCards));

const params = new URLSearchParams(window.location.search);
const keyword = params.get("q");

if (keyword && searchInputs.length) {
    searchInputs[0].value = keyword;
    filterCards();
}

export function setupPlayer(source) {
    const shell = document.querySelector(".player-shell");
    const video = document.querySelector("video[data-player]");
    const button = document.querySelector(".poster-play-layer");
    let ready = false;
    let loading = false;

    if (!shell || !video || !button || !source) {
        return;
    }

    const start = async () => {
        if (loading) {
            return;
        }

        loading = true;
        shell.classList.add("is-playing");
        video.controls = true;

        if (!ready) {
            ready = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                try {
                    const module = await import("./video-dru42stk.js");
                    const Hls = module.H;

                    if (Hls && Hls.isSupported()) {
                        const hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                    } else {
                        video.src = source;
                    }
                } catch (error) {
                    video.src = source;
                }
            }
        }

        try {
            await video.play();
        } catch (error) {
            video.load();
        } finally {
            loading = false;
        }
    };

    button.addEventListener("click", start);
    video.addEventListener("play", () => shell.classList.add("is-playing"));
}
