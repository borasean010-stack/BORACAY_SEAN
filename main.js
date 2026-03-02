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

    // 🎥 유튜브 iframe 페이드인 (필요시)
    const iframe = document.getElementById('bg-video');
    if (iframe) {
        iframe.onload = () => iframe.classList.add('loaded');
        setTimeout(() => iframe.classList.add('loaded'), 5000);
    }

    // ☰ 🔥 모바일 사이드 메뉴 토글 기능
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

        // 메뉴 링크 클릭 시 메뉴 닫기
        const menuLinks = sideMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                sideMenu.classList.remove('active');
                overlay.classList.remove('active');
            });
        });
    }
});
