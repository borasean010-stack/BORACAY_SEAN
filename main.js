// main.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("BORACAY SEAN JS Loaded");

    // --- Naver Cafe Link Optimization ---
    function optimizeCafeLinks() {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
        const links = document.querySelectorAll('a[href*="cafe.naver.com"]');
        links.forEach(link => {
            let href = link.href;
            if (isMobile) {
                if (href.includes('cafe.naver.com') && !href.includes('m.cafe.naver.com')) link.href = href.replace('cafe.naver.com', 'm.cafe.naver.com');
            } else {
                if (href.includes('m.cafe.naver.com')) link.href = href.replace('m.cafe.naver.com', 'cafe.naver.com');
            }
        });
    }
    optimizeCafeLinks();
    window.addEventListener('resize', optimizeCafeLinks);

    // --- 중앙 상품 데이터 정의 (설명글 통합 관리) ---
    const productData = {
        essential: [
            { title: "보라카이 왕복 픽업샌딩", img: "pickup.jpg", url: "pickup-sending.html", badge: "HOT", mdBadge: true, desc: "공항부터 숙소 앞까지 가장 안전하고 편안하게!", price: 54900 },
            { title: "블랙펄 요트호핑투어", img: "hopping.jpg", url: "hopping-tour.html", badge: "HOT", mdBadge: true, desc: "럭셔리 요트위에서 즐기는 보라카이 선셋과 신나는 음악과 파티가 함께하는 1등 선상 파티 호핑", price: 85000 },
            { title: "시크릿가든 말룸파티", img: "malum1.jpg", url: "malumpati.html", badge: "HOT", mdBadge: true, desc: "우리끼리 프라이빗하게 즐기고 신비로운 블루라군과 튜빙", price: 99000 },
            { title: "한눈에 요금표", img: "price.png", url: "price-list.html", desc: "보라카이션의 모든 투어 요금을 한눈에 확인하세요.", price: null }
        ],
        activity: [
            { title: "카티클란 공항<br>왕복 픽업샌딩", img: "catipickipsending.jpg", url: "catipickipsending.html", desc: "카티클란 공항에서 보라카이까지 더 빠르고 편리하게!", price: 54900 },
            { title: "블랙펄 요트호핑투어", img: "hopping.jpg", url: "hopping-tour.html", badge: "HOT", mdBadge: true, desc: "럭셔리 요트위에서 즐기는 보라카이 선셋과 신나는 음악과 파티가 함께하는 1등 선상 파티 호핑", price: 85000 },
            { title: "시크릿가든 말룸파티", img: "malum1.jpg", url: "malumpati.html", badge: "HOT", mdBadge: true, desc: "우리끼리 프라이빗하게 즐기고 신비로운 블루라군과 튜빙", price: 99000 },
            { title: "프리다이빙 체험", img: "free1.jpg", url: "freediving.html", badge: "NEW", desc: "바다 속 자유를 만끽하는 특별한 프리다이빙 체험.", price: 70000 },
            { title: "보라카이 랜드투어", img: "beach1.jpg", url: "land-tour.html", desc: "전용 차량으로 즐기는 보라카이 섬 구석구석 명소 탐방.", price: 45000 },
            { title: "JL 스냅사진 촬영", img: "jl1.jpg", url: "jl-snap.html", desc: "보라카이의 아름다운 풍경과 함께 인생샷을 남겨보세요.", price: 300000 },
            { title: "보라아재 호핑투어", img: "bora1.jpg", url: "bora-ajae-hopping.html", desc: "카라바오 섬에서 즐기는 호핑투어", price: 180000 },
            { title: "파라세일링", img: "para1.jpg", url: "parasailing.html", desc: "하늘 높이 날아올라 보라카이 전경을 한눈에 담아보세요.", price: 55000 },
            { title: "체험 다이빙", img: "diving1.jpg", url: "scuba-diving.html", badge: "HOT", mdBadge: true, desc: "전문 강사와 함께하는 환상적인 수중 세계 탐험.", price: 55000 },
            { title: "헬멧 다이빙", img: "he1.jpg", url: "helmet-diving.html", desc: "머리 젖지 않고 바다 속을 걷는 신비로운 경험.", price: 44000 },
            { title: "제트스키", img: "ze1.jpg", url: "jetski.html", desc: "보라카이 바다 위를 시원하게 질주하는 짜릿한 속도감.", price: 55000 },
            { title: "페어웨이 골프클럽", img: "Golf1.jpg", url: "golf.html", badge: "NEW", desc: "보라카이 유일의 18홀 골프 코스에서 즐기는 환상적인 라운딩.", price: 192000 }
        ],
        massage: [
            { title: "아유르베다 스파", img: "aspa1.jpg", url: "aspa.html", desc: "분위기에 취하고 마사지에 반하는 마사지샵", price: 55000 },
            { title: "에스파 (S-SPA)", img: "spa1.jpg", url: "spa.html", badge: "HOT", mdBadge: true, desc: "보라카이 최초 포핸드 마사지 런칭", price: 55000 },
            { title: "포세이돈 스파", img: "poseidon1.jpg", url: "poseidon.html", desc: "연예인이 운영하는 스파 모든 룸 안 개별 수영장 + 자쿠지", price: 105000 },
            { title: "마리스 스파", img: "maris1.jpg", url: "maris.html", desc: "로멘틱 마리스 스파,허니문이나 커플 연인들에게 인기만점", price: 91000 },
            { title: "카바얀 스파", img: "kabayan1.jpg", url: "kabayan.html", desc: "디몰 버젯마트 근처 마사지샵", price: 49000 },
            { title: "루나 스파", img: "luna1.jpg", url: "luna.html", desc: "보라카이 최초 노니씨드 마사지 런칭", price: 55000 },
            { title: "보라스파", img: "boraspa1.jpg", url: "boraspa.html", desc: "보라카이 꿀 마사지 원조", price: 55000 },
            { title: "헬리오스 스파", img: "helios1.jpg", url: "helios.html", desc: "유럽풍 고급 분위기 스파", price: 91000 }
        ]
    };

    // MD 추천 상품 목록 (타이틀 기준 매칭하여 데이터 자동 동기화)
    const mdRecommendedTitles = ["블랙펄 요트호핑투어", "체험 다이빙", "시크릿가든 말룸파티", "에스파 (S-SPA)"];

    const productsContainer = document.querySelector('.products');
    const mdContainer = document.querySelector('.md-products');
    const bestTitle = document.querySelector('.best-title');

    function getBadgesHtml(p) {
        let badges = [];
        if (p.badge) {
            let cls = 'product-badge';
            if (p.badge === 'HOT') cls += ' badge-hot';
            if (p.badge === 'NEW') cls += ' badge-new';
            badges.push(`<div class="${cls}">${p.badge}</div>`);
        }
        if (p.mdBadge) badges.push(`<div class="product-badge badge-md">MD추천</div>`);
        return badges.length > 0 ? `<div class="badge-container">${badges.join('')}</div>` : '';
    }

    function renderMDProducts() {
        if (!mdContainer) return;
        mdContainer.innerHTML = '';
        const allProducts = [...productData.essential, ...productData.activity, ...productData.massage];
        mdRecommendedTitles.forEach(title => {
            const p = allProducts.find(item => item.title.replace('<br>', ' ') === title || item.title === title);
            if (!p) return;
            const div = document.createElement('div');
            div.className = 'product tour-card';
            div.onclick = () => { window.location.href = p.url; };
            div.innerHTML = `
                ${getBadgesHtml(p)}
                <div class="img-container card-img-wrap"><img src="${p.img}" alt="${p.title}" loading="lazy"></div>
                <div class="card-body">
                    <h3>${p.title}</h3>
                    <p style="font-size:14px; color:#777; margin-top:10px; line-height:1.5; word-break:keep-all;">${p.desc}</p>
                    <div class="price-btn"><span class="price-from">From</span><span class="price-val">₩ ${p.price.toLocaleString()}</span></div>
                </div>
            `;
            mdContainer.appendChild(div);
        });
    }

    function renderProducts(category) {
        if (!productsContainer) return;
        productsContainer.innerHTML = '';
        let products = [...(productData[category] || [])];
        products.sort((a, b) => {
            const getPriority = p => (p.badge === 'HOT' ? 1 : p.mdBadge ? 2 : p.badge === 'NEW' ? 3 : 4);
            return getPriority(a) - getPriority(b);
        });
        if (bestTitle) {
            const names = { essential: "보라카이 필수투어", activity: "액티비티", massage: "마사지" };
            bestTitle.textContent = names[category] || "BEST TOUR";
        }
        products.forEach(p => {
            const div = document.createElement('div');
            div.className = 'product tour-card';
            div.onclick = () => { if (p.url && p.url !== '#') window.location.href = p.url; else alert('상세 페이지 준비 중'); };
            div.innerHTML = `
                ${getBadgesHtml(p)}
                <div class="img-container card-img-wrap"><img src="${p.img}" alt="${p.title}" loading="lazy"></div>
                <div class="card-body">
                    <h3>${p.title}</h3>
                    <p style="font-size:14px; color:#777; margin-top:10px; line-height:1.5; word-break:keep-all;">${p.desc || ''}</p>
                    ${p.price ? `<div class="price-btn"><span class="price-from">From</span><span class="price-val">₩ ${p.price.toLocaleString()}</span></div>` : `<div class="price-btn" style="background:#555;"><span class="price-val" style="font-size:14px;">View Details</span></div>`}
                </div>
            `;
            productsContainer.appendChild(div);
        });
    }

    const catTabs = document.querySelectorAll('.cat-tab');
    if (catTabs.length > 0) {
        catTabs.forEach(tab => {
            tab.addEventListener('click', e => {
                e.preventDefault();
                catTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderProducts(tab.getAttribute('data-category'));
            });
        });
    }

    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';
    if (isHomePage) { renderProducts('essential'); renderMDProducts(); } 
    else if (productsContainer) {
        const activeTab = document.querySelector('.tab-link.active');
        renderProducts(activeTab ? activeTab.getAttribute('data-category') : 'essential');
    }

    const updateHeaderUI = () => {
        const headerRight = document.querySelector('.header-right');
        if (!headerRight) return;
        headerRight.innerHTML = `
            <a href="mypage.html" class="mypage-btn">마이페이지</a>
            <a href="http://pf.kakao.com/_zBArM/chat" target="_blank" class="kakao-btn">
                <svg class="kakao-icon" viewBox="0 0 24 24" fill="currentColor" style="width:18px; height:18px;"><path d="M12 3c-4.97 0-9 3.185-9 7 0 3.26 2.854 6.01 6.741 6.775l-1.081 3.99c-.076.28.206.51.436.353l4.746-3.185c.387.04.781.067 1.158.067 4.97 0 9-3.185 9-7s-4.03-7-9-7z"/></svg>
                카카오톡 상담
            </a>
            <a href="https://m.cafe.naver.com/jesupblue.cafe?" target="_blank" class="naver-btn">카페 바로가기</a>
        `;
    };
    updateHeaderUI();

    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');
    if (menuToggle && sideMenu && overlay) {
        menuToggle.onclick = e => { e.stopPropagation(); sideMenu.classList.toggle('active'); overlay.classList.toggle('active'); };
        overlay.onclick = () => { sideMenu.classList.remove('active'); overlay.classList.remove('active'); };
    }

    window.BSUtils = {
        formatPrice: amount => '₩ ' + (amount || 0).toLocaleString(),
        saveToCart: item => {
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            cart.push(item);
            localStorage.setItem('cart', JSON.stringify(cart));
            if (confirm('장바구니에 담겼습니다. 이동하시겠습니까?')) window.location.assign('cart.html');
        },
        buyNow: item => {
            sessionStorage.setItem('directBuyItem', JSON.stringify(item));
            window.location.assign('booking-form.html');
        }
    };

    // --- Main Banner Slider Logic ---
    let currentSlide = 0;
    const bannerWrapper = document.getElementById('bannerWrapper');
    const slides = document.querySelectorAll('.banner-slide');
    const dotsContainer = document.getElementById('sliderDots');
    let autoSlideInterval;

    if (bannerWrapper && slides.length > 0) {
        // Create Dots
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.onclick = () => moveSlide(i - currentSlide);
            dotsContainer.appendChild(dot);
        });

        window.moveSlide = (direction) => {
            currentSlide = (currentSlide + direction + slides.length) % slides.length;
            updateSlider();
            resetAutoSlide();
        };

        function updateSlider() {
            bannerWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
            const dots = document.querySelectorAll('.dot');
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
        }

        function startAutoSlide() {
            autoSlideInterval = setInterval(() => moveSlide(1), 4000);
        }

        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }

        startAutoSlide();
    }
});
