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
            { title: "공항 왕복 픽업샌딩", img: "pickup.jpg", url: "pickup-sending.html", desc: "칼리보 공항부터 숙소 앞까지 안전하고 편안하게!" },
            { title: "블랙펄 요트호핑투어", img: "hopping.jpg", url: "hopping-tour.html", desc: "럭셔리 요트에서 즐기는 환상적인 선셋과 스노클링." },
            { title: "시크릿가든 말룸파티", img: "malumpati.jpg", url: "malumpati.html", desc: "에메랄드빛 블루라군에서의 짜릿한 다이빙과 휴식." },
            { title: "한눈에 요금표", img: "price.png", url: "price-list.html", desc: "보라카이션의 모든 투어 요금을 한눈에 확인하세요." }
        ],
        activity: [
            { title: "블랙펄 요트호핑투어", img: "hopping.jpg", url: "hopping-tour.html", badge: "BEST", desc: "보라카이 1위 럭셔리 요트 호핑! 선셋과 파티를 동시에." },
            { title: "시크릿가든 말룸파티", img: "malumpati.jpg", url: "malumpati.html", badge: "BEST", desc: "신비로운 블루라군에서 즐기는 튜브 트레킹과 현지식 오찬." },
            { title: "보라카이 프리다이빙 체험", img: "free1.jpg", url: "freediving.html", desc: "전문 강사와 함께 바다 속 자유를 만끽하는 특별한 시간." },
            { title: "보라아재 호핑투어", img: "bora1.jpg", url: "bora-ajae-hopping.html", desc: "신나는 음악과 함께하는 보라카이 최고의 선상 파티 호핑." },
            { title: "Island Tour", img: "beach1.jpg", url: "island-tour.html", desc: "아름다운 프라이빗 비치를 탐험하는 한적한 힐링 투어." },
            { title: "스쿠버 다이빙", img: "hop2.jpg", url: "#", desc: "바다 속 환상적인 산호초와 열대어들을 직접 만나보세요." },
            { title: "파라세일링", img: "hop3.jpg", url: "#", desc: "하늘 높이 날아올라 보라카이 전경을 한눈에 담아보세요." },
            { title: "헬멧 다이빙", img: "hop4.jpg", url: "#", desc: "머리 젖지 않고 바다 속을 걷는 신비로운 경험." },
            { title: "선셋 세일링", img: "hop5.jpg", url: "#", desc: "무동력 돛단배를 타고 즐기는 낭만적인 보라카이의 일몰." }
        ],
        massage: [
            { title: "프리미엄 힐링 스파", img: "hop5.jpg", url: "massage.html", desc: "최고급 시설에서 즐기는 고품격 전신 아로마 테라피." },
            { title: "럭셔리 전신 마사지", img: "pickup2.jpg", url: "massage.html", desc: "숙련된 테라피스트의 손길로 여행의 피로를 풀어보세요." },
            { title: "오가닉 아로마 테라피", img: "pickup3.jpg", url: "massage.html", desc: "유기농 오일을 사용한 심신 안정과 피부 보습 케어." },
            { title: "태반 마사지 패키지", img: "pickup4.jpg", url: "massage.html", desc: "영양 가득한 태반 크림으로 피부 재생과 활력을 되찾으세요." }
        ]
    };

    const productsContainer = document.querySelector('.products');
    const bestActivitiesContainer = document.getElementById('best-activities');
    const moreActivitiesContainer = document.getElementById('more-activities');
    const bestTitle = document.querySelector('.best-title');

    function createProductCard(p, idx) {
        const productDiv = document.createElement(p.url === '#' ? 'div' : 'a');
        if (p.url !== '#') productDiv.href = p.url;
        productDiv.className = 'product tour-card';
        productDiv.style.animationDelay = `${idx * 0.1}s`;
        
        if (p.url === '#') {
            productDiv.onclick = () => alert('상품 상세 페이지 준비 중입니다.');
        }
        
        productDiv.innerHTML = `
            ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
            <div class="img-container card-img-wrap">
                <img src="${p.img}" alt="${p.title}" loading="lazy">
            </div>
            <div class="card-body">
                <h3>${p.title}</h3>
                <p>${p.desc || ''}</p>
                <div class="view-details-btn" style="margin-top:15px; background:#111; color:white; padding:10px 20px; border-radius:50px; font-size:13px; font-weight:800; display:inline-block;">View Details</div>
            </div>
        `;
        return productDiv;
    }

    function renderProducts(category) {
        const products = productData[category] || [];
        
        // 타이틀 업데이트 (존재하는 경우)
        if (bestTitle) {
            const categoryNames = {
                essential: "보라카이 필수투어",
                activity: "액티비티",
                massage: "마사지"
            };
            bestTitle.textContent = categoryNames[category] || "BEST TOUR";
        }

        // 활동(activity) 전용 렌더링 (베스트 분리)
        if (category === 'activity' && bestActivitiesContainer && moreActivitiesContainer) {
            bestActivitiesContainer.innerHTML = '';
            moreActivitiesContainer.innerHTML = '';
            
            products.forEach((p, idx) => {
                const card = createProductCard(p, idx);
                if (p.badge === 'BEST') {
                    bestActivitiesContainer.appendChild(card);
                } else {
                    moreActivitiesContainer.appendChild(card);
                }
            });
            
            // 애니메이션 효과
            [bestActivitiesContainer, moreActivitiesContainer].forEach(container => {
                container.style.opacity = '0';
                container.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    container.style.opacity = '1';
                    container.style.transform = 'translateY(0)';
                    container.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                }, 50);
            });
            return;
        }

        // 일반 렌더링 (메인 페이지 등)
        if (!productsContainer) return;
        productsContainer.innerHTML = '';
        products.forEach((p, idx) => {
            productsContainer.appendChild(createProductCard(p, idx));
        });

        // 부드러운 페이드인 효과
        productsContainer.style.opacity = '0';
        productsContainer.style.transform = 'translateY(20px)';
        setTimeout(() => {
            productsContainer.style.opacity = '1';
            productsContainer.style.transform = 'translateY(0)';
            productsContainer.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        }, 50);
    }

    // URL 파라미터 또는 활성 페이지 기반 초기 렌더링
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '' || window.location.pathname.split('/').pop() === '';
    
    if (!isHomePage) {
        // active 클래스가 있는 탭의 데이터 카테고리를 찾음 (또는 파일명 기반)
        let category = 'essential';
        if (window.location.pathname.includes('activities.html')) category = 'activity';
        else if (window.location.pathname.includes('massage.html')) category = 'massage';
        else if (window.location.pathname.includes('essential-tours.html')) category = 'essential';
        
        renderProducts(category);
    } else {
        // 메인 페이지는 이미 HTML에 정적으로 박혀있는 경우도 있지만, 
        // JS에서 렌더링하도록 요청받았으므로 renderProducts 실행 (단, 정적 리스트를 유지하고 싶으면 조건부 실행)
        // 현재 index.html은 정적으로 박혀있으므로 실행하지 않거나, productData의 필수투어로 덮어씌움.
        // 유저 요청: "메인은 그대로 둬야지" -> 메인 페이지 rendering 로직 호출 안 함
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
            } else {
                location.href = 'index.html';
            }
        }
    };

    // 1. 🎥 비디오 자동 재생 확인
    const video = document.getElementById('hero-video');
    if (video) {
        video.muted = true;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        const promise = video.play();
        if (promise !== undefined) {
            promise.catch(() => {
                document.body.addEventListener('touchstart', () => { video.play(); }, { once: true });
            });
        }
        setTimeout(() => video.classList.add('loaded'), 2000);
    }

    // 2. 🔥 스크롤 지시계
    const indicator = document.querySelector('.scroll-indicator');
    if (indicator) {
        setTimeout(() => indicator.classList.add('visible'), 500);
        setTimeout(() => indicator.classList.add('fade-out'), 5500);
    }

    // 3. ☰ 모바일 메뉴
    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');

    if (menuToggle && sideMenu && overlay) {
        menuToggle.onclick = (e) => {
            e.stopPropagation();
            sideMenu.classList.toggle('active');
            overlay.classList.toggle('active');
        };
        overlay.onclick = () => {
            sideMenu.classList.remove('active');
            overlay.classList.remove('active');
        };
    }

    // 4. 🖼️ 배너 슬라이더
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
            dots.forEach((dot, i) => {
                if (i === currentIdx) dot.classList.add('active');
                else dot.classList.remove('active');
            });
        };
        window.moveSlide = (step) => {
            currentIdx = (currentIdx + step + slides.length) % slides.length;
            goToSlide(currentIdx);
        };
        let autoSlide = setInterval(() => moveSlide(1), 5000);
        bannerWrapper.parentElement.onmouseenter = () => clearInterval(autoSlide);
        bannerWrapper.parentElement.onmouseleave = () => {
            clearInterval(autoSlide);
            autoSlide = setInterval(() => moveSlide(1), 5000);
        };
    }

    // 5. 🖼️ 소개 모달
    const introModal = document.getElementById('introModal');
    window.openIntroModal = () => { if (introModal) { introModal.style.display = 'flex'; document.body.style.overflow = 'hidden'; } };
    window.closeIntroModal = () => { if (introModal) { introModal.style.display = 'none'; document.body.style.overflow = 'auto'; } };
});
