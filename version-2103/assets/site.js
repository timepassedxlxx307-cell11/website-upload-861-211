const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

ready(() => {
  initMobileNavigation();
  initHeroCarousel();
  initFilters();
});

function initMobileNavigation() {
  const button = document.querySelector(".mobile-menu-button");
  const menu = document.querySelector(".mobile-nav");
  if (!button || !menu) {
    return;
  }
  button.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(open));
  });
}

function initHeroCarousel() {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) {
    return;
  }
  const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
  const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
  if (slides.length < 2) {
    return;
  }
  let index = 0;
  const show = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, current) => slide.classList.toggle("is-active", current === index));
    dots.forEach((dot, current) => dot.classList.toggle("is-active", current === index));
  };
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      show(Number(dot.dataset.slide || 0));
    });
  });
  window.setInterval(() => show(index + 1), 5200);
}

function initFilters() {
  const input = document.querySelector(".filter-input");
  const select = document.querySelector(".filter-select");
  const cards = Array.from(document.querySelectorAll(".movie-card"));
  if (!cards.length || (!input && !select)) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");
  if (query && input) {
    input.value = query;
  }
  const update = () => {
    const term = (input?.value || "").trim().toLowerCase();
    const kind = select?.value || "";
    cards.forEach((card) => {
      const text = (card.dataset.text || "").toLowerCase();
      const cardKind = card.dataset.kind || "";
      const matchedText = !term || text.includes(term);
      const matchedKind = !kind || kind === cardKind;
      card.classList.toggle("is-filtered-out", !(matchedText && matchedKind));
    });
  };
  input?.addEventListener("input", update);
  select?.addEventListener("change", update);
  update();
}

export function initMoviePlayer(streamUrl, videoId, overlayId) {
  const video = document.getElementById(videoId);
  const overlay = document.getElementById(overlayId);
  if (!video || !streamUrl) {
    return;
  }
  let attached = false;
  const attach = () => {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }
    video.src = streamUrl;
  };
  const play = () => {
    attach();
    overlay?.classList.add("is-hidden");
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {
        video.controls = true;
      });
    }
  };
  overlay?.addEventListener("click", play);
  video.addEventListener("click", () => {
    if (video.paused) {
      play();
    }
  });
}
