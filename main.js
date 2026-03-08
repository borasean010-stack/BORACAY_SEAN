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
            { title: "공항 왕복 픽업샌딩", img: "pickup.jpg", url: "pickup-sending.html", desc: "공항부터 숙소 앞까지 가장 안전하고 편안하게!" },
            { title: "블랙펄 요트호핑투어", img: "hopping.jpg", url: "hopping-tour.html", desc: "보라카이 최고의 럭셔리 요트에서 즐기는 환상적인 파티." },
            { title: "시크릿가든 말룸파티", img: "malumpati.jpg", url: "malumpati.html", desc: "에메랄드빛 블루라군에서 즐기는 시원한 다이빙과 휴식." },
            { title: "한눈에 요금표", img: "price.png", url: "price-list.html", desc: "보라카이션의 모든 투어 요금을 한눈에 확인하세요." }
        ],
        activity: [
            { title: "프리다이빙 체험", img: "free1.jpg", url: "freediving.html", badge: "NEW", desc: "보라카이의 투명한 바다 속을 한 번의 호흡으로 탐험하세요." },
            { title: "보라카이 랜드투어", img: "beach1.jpg", url: "land-tour.html", desc: "전용 차량으로 즐기는 보라카이 섬 구석구석 명소 탐방." },
            { title: "JL 스냅사진 촬영", img: "jl1.jpg", url: "jl-snap.html", desc: "보라카이의 아름다운 풍경과 함께 인생샷을 남겨보세요." },
            { title: "보라아재 호핑투어", img: "bora1.jpg", url: "bora-ajae-hopping.html", desc: "신나는 음악과 파티가 함께하는 보라카이 1위 선상 파티 호핑." },
            { title: "블랙펄 요트호핑투어", img: "hopping.jpg", url: "hopping-tour.html", badge: "BEST", desc: "럭셔리 요트 위에서 즐기는 최고의 선셋과 스노클링." },
            { title: "시크릿가든 말룸파티", img: "malumpati.jpg", url: "malumpati.html", badge: "BEST", desc: "신비로운 블루라군 탐험과 푸짐한 현지식 오찬." },
            { title: "파라세일링", img: "para1.jpg", url: "parasailing.html", desc: "하늘 높이 날아올라 보라카이 전경을 한눈에 담아보세요." },
            { title: "체험 다이빙", img: "diving1.jpg", url: "scuba-diving.html", desc: "전문 강사와 함께하는 환상적인 수중 세계 탐험." },
            { title: "헬멧 다이빙", img: "he1.jpg", url: "helmet-diving.html", desc: "머리 젖지 않고 바다 속을 걷는 신비로운 경험." },
            { title: "제트스키", img: "ze1.jpg", url: "jetski.html", desc: "보라카이 바다 위를 시원하게 질주하는 짜릿한 속도감." },
            { title: "비치 아일랜드 투어", img: "beach1.jpg", url: "island-tour.html", desc: "아름다운 프라이빗 비치를 탐험하는 한적한 힐링 투어." },
            { title: "선셋 세일링", img: "hop5.jpg", url: "#", desc: "낭만적인 돛단배 위에서 감상하는 보라카이의 일몰." }
        ],
        massage: [
            { title: "프리미엄 힐링 스파", img: "hop5.jpg", url: "massage.html", desc: "최고급 시설에서 즐기는 고품격 전신 아로마 테라피." },
            { title: "럭셔리 전신 마사지", img: "pickup2.jpg", url: "massage.html", desc: "테라피스트의 손길로 여행의 피로를 완벽하게 해소하세요." },
            { title: "오가닉 아로마 테라피", img: "pickup3.jpg", url: "massage.html", desc: "유기농 오일을 사용한 심신 안정과 피부 보습 케어." },
            { title: "태반 마사지 패키지", img: "pickup4.jpg", url: "massage.html", desc: "피부 재생과 탄력에 도움을 주는 프리미엄 케어." }
        ]
    };

    // --- 탭 전환 및 상품 렌더링 ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const catTabs = document.querySelectorAll('.cat-tab');
    const productsContainer = document.querySelector('.products');
    const bestTitle = document.querySelector('.best-title');

    function renderProducts(category) {
        if (!productsContainer) return;
        
        productsContainer.innerHTML = '';
        const products = productData[category] || [];
        
        if (bestTitle) {
            const categoryNames = {
                essential: "보라카이 필수투어",
                activity: "액티비티",
                massage: "마사지"
            };
            bestTitle.textContent = categoryNames[category] || "BEST TOUR";
        }

        products.forEach((p, idx) => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product tour-card';
            productDiv.style.animationDelay = `${idx * 0.1}s`;
            
            productDiv.onclick = () => {
                if (p.url && p.url !== '#') window.location.href = p.url;
                else alert('상품 상세 페이지 준비 중입니다.');
            };
            
            productDiv.innerHTML = `
                ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
                <div class="img-container card-img-wrap">
                    <img src="${p.img}" alt="${p.title}" loading="lazy">
                </div>
                <div class="card-body">
                    <h3>${p.title}</h3>
                    <p style="font-size:14px; color:#777; margin-top:10px; line-height:1.5; word-break:keep-all;">${p.desc || ''}</p>
                    <div style="margin-top:15px; display:inline-block; padding:8px 20px; background:#111; color:white; border-radius:50px; font-size:12px; font-weight:800;">View Details</div>
                </div>
            `;
            productsContainer.appendChild(productDiv);
        });

        productsContainer.style.opacity = '0';
        productsContainer.style.transform = 'translateY(20px)';
        setTimeout(() => {
            productsContainer.style.opacity = '1';
            productsContainer.style.transform = 'translateY(0)';
            productsContainer.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        }, 50);
    }

    if (catTabs.length > 0) {
        catTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                catTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderProducts(tab.getAttribute('data-category'));
            });
        });
    }

    if (tabLinks.length > 0) {
        const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '' || window.location.pathname.split('/').pop() === '';
        
        if (!isHomePage) {
            const activeTab = document.querySelector('.tab-link.active');
            const initialCategory = activeTab ? activeTab.getAttribute('data-category') : 'essential';
            renderProducts(initialCategory);
        }
    }

    // --- 로그인 상태 확인 및 헤더 UI 업데이트 ---
    updateAuthUI();

    function updateAuthUI() {
        const userInfo = JSON.parse(localStorage.getItem('kakao_user'));
        const headerRight = document.querySelector('.header-right');
        if (!headerRight) return;
        headerRight.innerHTML = '';
        if (userInfo) {
            headerRight.innerHTML = `
                <a href="mypage.html" class="mypage-btn" style="background:#f0f0f0; color:#333;">👤 ${userInfo.nickname}</a>
                <a href="#" class="logout-btn" onclick="logout(event)" style="margin-left:12px; font-size:13px; color:#999; text-decoration:none;">로그아웃</a>
                <a href="https://cafe.naver.com/f-e/cafes/17953658/menus/0?t=1772441375461" target="_blank" class="naver-btn">카페 바로가기</a>
                <a href="https://business.kakao.com/_zBArM/chats" target="_blank" class="kakao-btn">카톡 바로가기</a>
            `;
        } else {
            headerRight.innerHTML = `
                <a href="login.html" class="login-btn" style="background:#ff6a00; color:white; padding:8px 16px; border-radius:10px; font-weight:800; text-decoration:none; margin-right:8px;">로그인</a>
                <a href="mypage.html" class="mypage-btn">마이페이지</a>
                <a href="https://cafe.naver.com/f-e/cafes/17953658/menus/0?t=1772441375461" target="_blank" class="naver-btn">카페 바로가기</a>
                <a href="https://business.kakao.com/_zBArM/chats" target="_blank" class="kakao-btn">카톡 바로가기</a>
            `;
        }
    }

    window.logout = function(e) {
        if (e) e.preventDefault();
        if (confirm('로그아웃 하시겠습니까?')) {
            localStorage.removeItem('kakao_user');
            if (typeof Kakao !== 'undefined' && Kakao.Auth.getAccessToken()) {
                Kakao.Auth.logout(() => { location.href = 'index.html'; });
            } else { location.href = 'index.html'; }
        }
    };

    // --- 비디오 및 애니메이션 ---
    const video = document.getElementById('hero-video');
    if (video) {
        video.muted = true; video.autoplay = true; video.loop = true; video.playsInline = true;
        video.play().catch(() => { document.body.addEventListener('touchstart', () => { video.play(); }, { once: true }); });
        setTimeout(() => video.classList.add('loaded'), 2000);
    }
    const indicator = document.querySelector('.scroll-indicator');
    if (indicator) {
        setTimeout(() => indicator.classList.add('visible'), 500);
        setTimeout(() => indicator.classList.add('fade-out'), 5500);
    }

    // --- 모바일 메뉴 ---
    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');
    if (menuToggle && sideMenu && overlay) {
        menuToggle.onclick = (e) => { e.stopPropagation(); sideMenu.classList.toggle('active'); overlay.classList.toggle('active'); };
        overlay.onclick = () => { sideMenu.classList.remove('active'); overlay.classList.remove('active'); };
    }

    // --- 배너 슬라이더 ---
    let currentIdx = 0;
    const bannerWrapper = document.getElementById('bannerWrapper');
    const sliderDotsContainer = document.getElementById('sliderDots');
    const slides = document.querySelectorAll('.banner-slide');
    if (bannerWrapper && slides.length > 0) {
        if (sliderDotsContainer) {
            sliderDotsContainer.innerHTML = '';
            for (let i = 0; i < slides.length; i++) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (i === 0) dot.classList.add('active');
                dot.onclick = () => goToSlide(i);
                sliderDotsContainer.appendChild(dot);
            }
        }
        window.goToSlide = (idx) => {
            currentIdx = idx;
            bannerWrapper.style.transform = `translateX(-${currentIdx * 100}%)`;
            const dots = document.querySelectorAll('.dot');
            dots.forEach((dot, i) => { if (i === currentIdx) dot.classList.add('active'); else dot.classList.remove('active'); });
        };
        window.moveSlide = (step) => { currentIdx = (currentIdx + step + slides.length) % slides.length; goToSlide(currentIdx); };
        let autoSlide = setInterval(() => moveSlide(1), 5000);
        bannerWrapper.parentElement.onmouseenter = () => clearInterval(autoSlide);
        bannerWrapper.parentElement.onmouseleave = () => { clearInterval(autoSlide); autoSlide = setInterval(() => moveSlide(1), 5000); };
    }

    const introModal = document.getElementById('introModal');
    window.openIntroModal = () => { if (introModal) { introModal.style.display = 'flex'; document.body.style.overflow = 'hidden'; } };
    window.closeIntroModal = () => { if (introModal) { introModal.style.display = 'none'; document.body.style.overflow = 'auto'; } };
});
