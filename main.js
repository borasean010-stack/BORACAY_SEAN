// main.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("BORACAY_SEAN JS Loaded");

    // --- 카카오 SDK 초기화 ---
    if (typeof Kakao !== 'undefined') {
        if (!Kakao.isInitialized()) {
            // 실제 발급받으신 자바스크립트 키를 사용합니다.
            Kakao.init('9e8b2d2be22f60f1cc512d61d6ba6991');
            console.log("Kakao SDK Initialized with JS Key");
        }
    }

    // --- 로그인 상태 확인 및 헤더 UI 업데이트 ---
    updateAuthUI();

    function updateAuthUI() {
        const userInfo = JSON.parse(localStorage.getItem('kakao_user'));
        const headerRight = document.querySelector('.header-right');
        if (!headerRight) return;

        // 기존 버튼들 초기화 (중복 방지)
        headerRight.innerHTML = '';

        if (userInfo) {
            // [로그인 상태] 닉네임 + 마이페이지 + 로그아웃
            headerRight.innerHTML = `
                <a href="mypage.html" class="mypage-btn" style="background:#f0f0f0; color:#333;">👤 ${userInfo.nickname}</a>
                <a href="#" class="logout-btn" onclick="logout(event)" style="margin-left:12px; font-size:13px; color:#999; text-decoration:none;">로그아웃</a>
                <a href="https://cafe.naver.com/f-e/cafes/17953658/menus/0?t=1772441375461" target="_blank" class="naver-btn">카페</a>
                <a href="https://business.kakao.com/_zBArM/chats" target="_blank" class="kakao-btn">카톡</a>
            `;
        } else {
            // [로그아웃 상태] 로그인 버튼 + 마이페이지 + 카페/카톡
            headerRight.innerHTML = `
                <a href="login.html" class="login-btn" style="background:#ff6a00; color:white; padding:8px 16px; border-radius:10px; font-weight:800; text-decoration:none; margin-right:8px;">로그인</a>
                <a href="mypage.html" class="mypage-btn">마이페이지</a>
                <a href="https://cafe.naver.com/f-e/cafes/17953658/menus/0?t=1772441375461" target="_blank" class="naver-btn">카페</a>
                <a href="https://business.kakao.com/_zBArM/chats" target="_blank" class="kakao-btn">카톡</a>
            `;
        }
    }

    window.logout = function(e) {
        if (e) e.preventDefault();
        if (confirm('로그아웃 하시겠습니까?')) {
            localStorage.removeItem('kakao_user');
            if (typeof Kakao !== 'undefined' && Kakao.Auth.getAccessToken()) {
                Kakao.Auth.logout(() => { location.href = 'index.html'; });
            } else {
                location.href = 'index.html';
            }
        }
    };

    // 1. 🎥 비디오 자동 재생 확인 및 강제 실행 (모바일 대응)
... (기존 비디오 로직 생략 없이 유지) ...
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
