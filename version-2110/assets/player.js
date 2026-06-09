(function () {
  function initPlayer(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.player-start');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-hls');
    if (source) {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      }
    }

    function playVideo() {
      if (button) {
        button.classList.add('is-hidden');
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-box')).forEach(initPlayer);
})();
