// main.js
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('hero-video');
    
    if (video) {
        // 비디오가 재생 가능한 상태가 되면 'loaded' 클래스 추가
        video.oncanplay = function() {
            video.classList.add('loaded');
            console.log("Local video is ready to play.");
        };

        // 자동 재생 시도 (일부 브라우저 정책 대응)
        video.play().catch(error => {
            console.log("Autoplay prevented:", error);
        });
        
        // 브라우저 정책으로 인해 oncanplay가 안 불릴 경우를 대비해 2초 후 강제 표시
        setTimeout(() => {
            video.classList.add('loaded');
        }, 2000);
    }
});
