// main.js
let player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: 'bb9bV-moCuk', // 유튜브 영상 ID
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'showinfo': 0,
            'rel': 0,
            'loop': 1,
            'playlist': 'bb9bV-moCuk', // 반복 재생을 위해 동일한 ID 지정
            'mute': 1, // 크롬 정책상 무음이어야 자동 재생됨
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}
