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

    // --- 상품 데이터 정의 ---
    const productData = {
        essential: [
            { title: "공항 왕복 픽업샌딩", img: "pickup.jpg", url: "pickup-sending.html" },
            { title: "블랙펄 요트호핑투어", img: "hopping.jpg", url: "hopping-tour.html" },
            { title: "시크릿가든 말룸파티", img: "malumpati.jpg", url: "#" },
            { title: "한눈에 요금표", img: "price.png", url: "price-list.html" }
        ],
        activity: [
            { title: "스쿠버 다이빙", img: "hop1.jpg", url: "#" },
            { title: "파라세일링", img: "hop2.jpg", url: "#" },
            { title: "헬멧 다이빙", img: "hop3.jpg", url: "#" },
            { title: "선셋 세일링", img: "hop4.jpg", url: "#" }
        ],
        massage: [
            { title: "프리미엄 힐링 스파", img: "hop5.jpg", url: "#" },
            { title: "럭셔리 전신 마사지", img: "pickup2.jpg", url: "#" },
            { title: "오가닉 아로마 테라피", img: "pickup3.jpg", url: "#" },
            { title: "태반 마사지 패키지", img: "pickup4.jpg", url: "#" }
        ]
    };

    // --- 탭 전환 및 상품 렌더링 ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const productsContainer = document.querySelector('.products');
    const bestTitle = document.querySelector('.best-title');

    function renderProducts(category) {
        if (!productsContainer) return;
        
        // 컨테이너 초기화
        productsContainer.innerHTML = '';
        
        // 데이터 가져오기
        const products = productData[category] || [];
        
        // 타이틀 업데이트
        if (bestTitle) {
            const categoryNames = {
                essential: "보라카이 필수투어",
                activity: "액티비티",
                massage: "마사지"
            };
            bestTitle.textContent = categoryNames[category] || "BEST TOUR";
        }

        // 상품 카드 생성
        products.forEach(p => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product';
            productDiv.onclick = () => {
                if (p.url && p.url !== '#') window.open(p.url, '_blank');
                else alert('상품 상세 페이지 준비 중입니다.');
            };
            
            productDiv.innerHTML = `
                <div class="img-container">
                    <img src="${p.img}" alt="${p.title}">
                </div>
                <h3>${p.title}</h3>
            `;
            productsContainer.appendChild(productDiv);
        });

        // 애니메이션 효과 (선택 사항)
        productsContainer.style.opacity = '0';
        setTimeout(() => {
            productsContainer.style.opacity = '1';
            productsContainer.style.transition = 'opacity 0.5s ease';
        }, 50);
    }

    if (tabLinks.length > 0) {
        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 활성 상태 변경
                tabLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // 상품 렌더링
                const category = link.getAttribute('data-category');
                renderProducts(category);
            });
        });

        // 초기 렌더링 (첫 번째 탭)
        renderProducts('essential');
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
    const sliderDotsContainer = document.getElementById('sliderDots');
    const slides = document.querySelectorAll('.banner-slide');
    const totalSlides = slides.length;

    if (bannerWrapper && totalSlides > 0) {
        // 동적으로 점(Dots) 생성
        if (sliderDotsContainer) {
            sliderDotsContainer.innerHTML = '';
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (i === 0) dot.classList.add('active');
                dot.onclick = () => goToSlide(i);
                sliderDotsContainer.appendChild(dot);
            }
        }

        const dots = document.querySelectorAll('.dot');

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

        // 사용자가 조작하면 자동 슬라이드 일시 정지 후 재시작
        const stopAutoSlide = () => clearInterval(autoSlide);
        const startAutoSlide = () => {
            clearInterval(autoSlide);
            autoSlide = setInterval(() => moveSlide(1), 5000);
        };

        const sliderElement = bannerWrapper.parentElement;
        sliderElement.addEventListener('mouseenter', stopAutoSlide);
        sliderElement.addEventListener('mouseleave', startAutoSlide);

        // 터치 슬라이드 지원 (모바일용 선택 사항)
        let touchStartX = 0;
        let touchEndX = 0;
        
        sliderElement.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoSlide();
        }, {passive: true});

        sliderElement.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) moveSlide(1); // 왼쪽으로 쓸기
            if (touchEndX - touchStartX > 50) moveSlide(-1); // 오른쪽으로 쓸기
            startAutoSlide();
        }, {passive: true});
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
