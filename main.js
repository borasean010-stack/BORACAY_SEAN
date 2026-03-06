// main.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("BORACAY_SEAN JS Loaded");

    // 1. 🎥 비디오 자동 재생 확인 및 강제 실행 (모바일 대응)
    const video = document.getElementById('hero-video');
    if (video) {
        // 비디오 속성 재확인
        video.muted = true;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;

        video.oncanplay = () => video.classList.add('loaded');
        
        // 강제 재생 시도
        const promise = video.play();
        if (promise !== undefined) {
            promise.catch(error => {
                console.log("Autoplay was prevented. Retrying on user interaction.");
                // 사용자가 화면 아무 데나 터치하면 즉시 재생되도록 백업
                document.body.addEventListener('touchstart', () => {
                    video.play();
                }, { once: true });
            });
        }
        setTimeout(() => video.classList.add('loaded'), 2000);
    }

    // 2. 🔥 마우스 스크롤 지시계 애니메이션 (5초 후 페이드아웃)
    const indicator = document.querySelector('.scroll-indicator');
    if (indicator) {
        setTimeout(() => indicator.classList.add('visible'), 500);
        setTimeout(() => indicator.classList.add('fade-out'), 5500);
    }

    // 3. ☰ 🔥 모바일 사이드 메뉴 기능 (정밀 수리)
    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');

    if (menuToggle && sideMenu && overlay) {
        // 메뉴 열기/닫기 토글
        menuToggle.onclick = (e) => {
            e.stopPropagation();
            sideMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            console.log("Menu Toggled");
        };

        // 배경(오버레이) 클릭 시 메뉴 닫기
        overlay.onclick = () => {
            sideMenu.classList.remove('active');
            overlay.classList.remove('active');
        };

        // 사이드 메뉴 내부 링크 클릭 시 메뉴 자동으로 닫기
        const menuLinks = sideMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.onclick = () => {
                sideMenu.classList.remove('active');
                overlay.classList.remove('active');
            };
        });
    }

    // 4. 🖼️ 메인 배너 슬라이더 자동 재생 및 컨트롤
    let currentIdx = 0;
    const bannerWrapper = document.getElementById('bannerWrapper');
    const dots = document.querySelectorAll('.dot');
    const slides = document.querySelectorAll('.banner-slide');
    const totalSlides = slides.length;

    if (bannerWrapper && totalSlides > 0) {
        window.goToSlide = (idx) => {
            currentIdx = idx;
            bannerWrapper.style.transform = `translateX(-${currentIdx * 100}%)`;
            
            // 점 업데이트
            dots.forEach((dot, i) => {
                if (i === currentIdx) dot.classList.add('active');
                else dot.classList.remove('active');
            });
        };

        // ◀️▶️ 화살표 이동 함수
        window.moveSlide = (step) => {
            currentIdx = (currentIdx + step + totalSlides) % totalSlides;
            goToSlide(currentIdx);
        };

        // 자동 슬라이드 (5초마다)
        let autoSlide = setInterval(() => {
            moveSlide(1);
        }, 5000);

        // 사용자가 조작하면 자동 슬라이드 일시 정지 후 재시작 (선택 사항)
        const stopAutoSlide = () => clearInterval(autoSlide);
        bannerWrapper.parentElement.addEventListener('mouseenter', stopAutoSlide);
        bannerWrapper.parentElement.addEventListener('mouseleave', () => {
            autoSlide = setInterval(() => moveSlide(1), 5000);
        });
    }

    // 5. 🖼️ 소개 모달(Popup) 제어 함수
    const introModal = document.getElementById('introModal');
    window.openIntroModal = () => {
        if (introModal) {
            introModal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
        }
    };

    window.closeIntroModal = () => {
        if (introModal) {
            introModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // 배경 스크롤 복구
        }
    };
});
