// main.js
let player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: 'bb9bV-moCuk',
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'rel': 0,
            'showinfo': 0,
            'modestbranding': 1,
            'loop': 1,
            'playlist': 'bb9bV-moCuk',
            'mute': 1,
            'playsinline': 1,
            'iv_load_policy': 3
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}

// 영상이 끝나면 다시 재생 (무한 루프 보장)
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        player.playVideo();
    }
}
