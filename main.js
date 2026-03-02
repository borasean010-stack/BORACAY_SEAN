// main.js
document.addEventListener('DOMContentLoaded', () => {
    // 🎥 비디오 자동 재생 및 로딩 페이드인
    const video = document.getElementById('hero-video');
    if (video) {
        video.oncanplay = () => video.classList.add('loaded');
        video.play().catch(() => {
            document.body.addEventListener('click', () => video.play(), { once: true });
        });
        setTimeout(() => video.classList.add('loaded'), 3000);
    }

    // 🔥 마우스 스크롤 지시계 제어 (페이드인 후 5초 뒤 페이드아웃)
    const indicator = document.querySelector('.scroll-indicator');
    if (indicator) {
        // 처음엔 페이드 인
        setTimeout(() => {
            indicator.classList.add('visible');
        }, 500);

        // 5초 뒤에 페이드 아웃
        setTimeout(() => {
            indicator.classList.add('fade-out');
        }, 5500); // 페이드인 대기시간 포함 약 5초
    }

    // ☰ 모바일 사이드 메뉴 토글 기능
    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');

    if (menuToggle && sideMenu && overlay) {
        menuToggle.addEventListener('click', () => {
            sideMenu.classList.toggle('active');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', () => {
            sideMenu.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
});
