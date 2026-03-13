// main.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("BORACAY SEAN JS Loaded");

    // --- 상품 데이터 정의 (최저가 포함, 마사지 성장마사지 제외) ---
    const productData = {
        essential: [
            { title: "공항 왕복 픽업샌딩", img: "pickup.jpg", url: "pickup-sending.html", desc: "공항부터 숙소 앞까지 가장 안전하고 편안하게!", price: 54900 },
            { title: "블랙펄 요트호핑투어", img: "hopping.jpg", url: "hopping-tour.html", desc: "보라카이 최고의 럭셔리 요트에서 즐기는 환상적인 파티.", price: 85000 },
            { title: "시크릿가든 말룸파티", img: "malum1.jpg", url: "malumpati.html", desc: "에메랄드빛 블루라군에서 즐기는 시원한 다이빙과 휴식.", price: 99000 },
            { title: "한눈에 요금표", img: "price.png", url: "price-list.html", desc: "보라카이션의 모든 투어 요금을 한눈에 확인하세요.", price: null }
        ],
        activity: [
            { title: "블랙펄 요트호핑투어", img: "hopping.jpg", url: "hopping-tour.html", badge: "BEST", desc: "럭셔리 요트 위에서 즐기는 최고의 선셋과 스노클링.", price: 85000 },
            { title: "시크릿가든 말룸파티", img: "malum1.jpg", url: "malumpati.html", badge: "BEST", desc: "신비로운 블루라군 탐험과 푸짐한 현지식 오찬.", price: 99000 },
            { title: "프리다이빙 체험", img: "free1.jpg", url: "freediving.html", badge: "NEW", desc: "바다 속 자유를 만끽하는 특별한 프리다이빙 체험.", price: 70000 },
            { title: "보라카이 랜드투어", img: "beach1.jpg", url: "land-tour.html", desc: "전용 차량으로 즐기는 보라카이 섬 구석구석 명소 탐방.", price: 45000 },
            { title: "JL 스냅사진 촬영", img: "jl1.jpg", url: "jl-snap.html", desc: "보라카이의 아름다운 풍경과 함께 인생샷을 남겨보세요.", price: 80000 },
            { title: "보라아재 호핑투어", img: "bora1.jpg", url: "bora-ajae-hopping.html", desc: "신나는 음악과 파티가 함께하는 보라카이 1위 선상 파티 호핑.", price: 55000 },
            { title: "파라세일링", img: "para1.jpg", url: "parasailing.html", desc: "하늘 높이 날아올라 보라카이 전경을 한눈에 담아보세요.", price: 55000 },
            { title: "체험 다이빙", img: "diving1.jpg", url: "scuba-diving.html", desc: "전문 강사와 함께하는 환상적인 수중 세계 탐험.", price: 55000 },
            { title: "헬멧 다이빙", img: "he1.jpg", url: "helmet-diving.html", desc: "머리 젖지 않고 바다 속을 걷는 신비로운 경험.", price: 44000 },
            { title: "제트스키", img: "ze1.jpg", url: "jetski.html", desc: "보라카이 바다 위를 시원하게 질주하는 짜릿한 속도감.", price: 55000 },
            { title: "페어웨이 골프클럽", img: "Golf1.jpg", url: "golf.html", badge: "NEW", desc: "보라카이 유일의 18홀 골프 코스에서 즐기는 환상적인 라운딩.", price: 192000 }
        ],
        massage: [
            { title: "아유르베다 스파", img: "aspa1.jpg", url: "aspa.html", desc: "고대 인도의 전통 치유 요법으로 즐기는 심신 안정 테라피.", price: 55000 },
            { title: "에스파 (S-SPA)", img: "spa1.jpg", url: "spa.html", desc: "보라카이의 정취를 느끼며 즐기는 최고의 힐링 마사지.", price: 55000 },
            { title: "포세이돈 스파", img: "poseidon1.jpg", url: "poseidon.html", badge: "BEST", desc: "최고급 시설에서 제공하는 프리미엄 테라피 서비스.", price: 105000 },
            { title: "마리스 스파", img: "maris1.jpg", url: "maris.html", desc: "한적한 분위기 속에서 즐기는 정성 어린 힐링 체험.", price: 91000 },
            { title: "카바얀 스파", img: "kabayan1.jpg", url: "kabayan.html", desc: "보라카이 전통과 전문성이 어우러진 고품격 스파.", price: 49000 },
            { title: "루나 스파", img: "luna1.jpg", url: "luna.html", desc: "차별화된 프로그램으로 일상의 스트레스를 해소하세요.", price: 55000 },
            { title: "보라스파", img: "boraspa1.jpg", url: "boraspa.html", desc: "전문 테라피스트의 손길로 여행의 피로를 풀어보세요.", price: 55000 },
            { title: "헬리오스 스파", img: "helios1.jpg", url: "helios.html", desc: "특별한 휴식을 원하는 분들을 위한 프리미엄 케어.", price: 91000 }
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

            // 가격 버튼 또는 상세보기 버튼 생성
            const priceHtml = p.price 
                ? `<div class="price-btn"><span class="price-from">From</span><span class="price-val">₩ ${p.price.toLocaleString()}</span></div>`
                : `<div class="price-btn" style="background:#555;"><span class="price-val" style="font-size:14px;">View Details</span></div>`;
            
            productDiv.innerHTML = `
                ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
                <div class="img-container card-img-wrap">
                    <img src="${p.img}" alt="${p.title}" loading="lazy">
                </div>
                <div class="card-body">
                    <h3>${p.title}</h3>
                    <p style="font-size:14px; color:#777; margin-top:10px; line-height:1.5; word-break:keep-all;">${p.desc || ''}</p>
                    ${priceHtml}
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

    // --- 페이지별 초기 렌더링 ---
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '' || window.location.pathname.split('/').pop() === '';
    
    if (isHomePage) {
        // 메인 페이지의 BEST TOUR 섹션도 동적으로 렌더링 (필수투어 카테고리 활용)
        renderProducts('essential');
    } else if (productsContainer) {
        const activeTab = document.querySelector('.tab-link.active');
        const initialCategory = activeTab ? activeTab.getAttribute('data-category') : 'essential';
        renderProducts(initialCategory);
    }

    // --- 헤더 UI 상시 고정 (로그인 체크 제거) ---
    const updateHeaderUI = () => {
        const headerRight = document.querySelector('.header-right');
        if (!headerRight) return;
        headerRight.innerHTML = `
            <a href="mypage.html" class="mypage-btn">마이페이지</a>
            <a href="https://business.kakao.com/_zBArM/chats" target="_blank" class="kakao-btn">
                <svg class="kakao-icon" viewBox="0 0 24 24" fill="currentColor" style="width:18px; height:18px;"><path d="M12 3c-4.97 0-9 3.185-9 7 0 3.26 2.854 6.01 6.741 6.775l-1.081 3.99c-.076.28.206.51.436.353l4.746-3.185c.387.04.781.067 1.158.067 4.97 0 9-3.185 9-7s-4.03-7-9-7z"/></svg>
                카카오톡 상담
            </a>
            <a href="https://cafe.naver.com/f-e/cafes/17953658/menus/0?t=1772441375461" target="_blank" class="naver-btn">카페 바로가기</a>
        `;
    };
    updateHeaderUI();

    // --- 비디오 및 애니메이션 ---
    const video = document.getElementById('hero-video');
    if (video) {
        video.muted = true; video.autoplay = true; video.loop = true; video.playsInline = true;
        video.play().catch(() => {
            document.body.addEventListener('touchstart', () => { video.play(); }, { once: true });
        });
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

    // --- 메인 팝업 로직 ---
    const popup = document.getElementById('mainPopup');
    const popupSlider = document.getElementById('popupSlider');
    const popupDotsContainer = document.getElementById('popupDots');
    const popupSlides = document.querySelectorAll('.popup-slide');
    let currentPopupIdx = 0;

    if (popup && popupSlides.length > 0) {
        // 오늘 하루 보지 않기 체크
        const popupClosedUntil = localStorage.getItem('mainPopupClosedUntil');
        if (!popupClosedUntil || new Date().getTime() > parseInt(popupClosedUntil)) {
            popup.style.display = 'flex';
        }

        // 팝업 도트 생성
        if (popupDotsContainer) {
            popupDotsContainer.innerHTML = '';
            popupSlides.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = 'popup-dot' + (i === 0 ? ' active' : '');
                dot.onclick = () => goToPopupSlide(i);
                popupDotsContainer.appendChild(dot);
            });
        }

        window.goToPopupSlide = (idx) => {
            currentPopupIdx = idx;
            popupSlider.style.transform = `translateX(-${currentPopupIdx * 100}%)`;
            const dots = document.querySelectorAll('.popup-dot');
            dots.forEach((dot, i) => {
                if (i === currentPopupIdx) dot.classList.add('active');
                else dot.classList.remove('active');
            });
        };

        window.movePopupSlide = (step) => {
            currentPopupIdx = (currentPopupIdx + step + popupSlides.length) % popupSlides.length;
            goToPopupSlide(currentPopupIdx);
        };

        window.closePopup = () => { popup.style.display = 'none'; };
        window.closePopupToday = () => {
            const tomorrow = new Date();
            tomorrow.setHours(24, 0, 0, 0);
            localStorage.setItem('mainPopupClosedUntil', tomorrow.getTime());
            closePopup();
        };

        // 자동 슬라이드 제거 (사용자 요청: 수동으로 편하게 넘길 수 있게)
    }
});
