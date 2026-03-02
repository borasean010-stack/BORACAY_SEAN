// main.js
document.addEventListener('DOMContentLoaded', () => {
    const iframe = document.getElementById('bg-video');
    
    // 유튜브 영상 로드 체크
    if (iframe) {
        iframe.onload = function() {
            // 로드가 완료되면 opacity를 1로 변경 (CSS 클래스 추가)
            iframe.classList.add('loaded');
            console.log("Video loaded successfully.");
        };

        // 혹시 모르니 3초 후에도 안 나타나면 강제 표시 (또는 에러 대응)
        setTimeout(() => {
            iframe.classList.add('loaded');
        }, 5000);
    }
});
