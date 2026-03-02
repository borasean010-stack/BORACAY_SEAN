// main.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("BORACAY_SEAN site with local video background loaded.");
    
    // 비디오 자동 재생 확인 (일부 브라우저 대응)
    const video = document.getElementById('hero-video');
    if (video) {
        video.play().catch(error => {
            console.log("Autoplay was prevented. User interaction might be required.", error);
        });
    }
});
