(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var source = player.getAttribute('data-video-url');
    var hlsInstance = null;
    var initialized = false;

    var showMessage = function (text) {
      var message = player.querySelector('.player-message');

      if (!message) {
        message = document.createElement('div');
        message.className = 'player-message';
        player.appendChild(message);
      }

      message.textContent = text;
    };

    var startPlayback = function () {
      if (!video || !source) {
        showMessage('视频加载失败');
        return;
      }

      if (!initialized) {
        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              showMessage('视频加载失败');
            }
          });
        } else {
          showMessage('当前浏览器暂不支持播放');
          return;
        }
      }

      video.controls = true;

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    };

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        } else {
          video.pause();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
