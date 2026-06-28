import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDkDjmGKQDF-0Vu2S_qtI6W5Hf2-j4tKcM",
    authDomain: "boracaysean-69b4a.firebaseapp.com",
    projectId: "boracaysean-69b4a",
    storageBucket: "boracaysean-69b4a.firebasestorage.app",
    messagingSenderId: "806585874771",
    appId: "1:806585874771:web:64a094d241730ca38109a6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===================== 상품 데이터 =====================
const PRODUCT_DATA = {
    "보라카이션 패키지": [
        { name: "시그니처 (성인)", price: 320000 },
        { name: "시그니처 (소인)", price: 310000 },
        { name: "패키지 A (성인)", price: 270000 },
        { name: "패키지 A (소인)", price: 260000 },
        { name: "패키지 B (성인/소인)", price: 230000 },
        { name: "패키지 C (성인)", price: 195000 },
        { name: "패키지 C (소인)", price: 185000 },
        { name: "픽샌팩 A (성인/소인)", price: 100000 },
        { name: "픽샌팩 B (성인/소인)", price: 175000 },
        { name: "픽샌팩 C (성인)", price: 150000 },
        { name: "픽샌팩 C (소인)", price: 141000 }
    ],
    "보라카이션 투어 콤보팩": [
        { name: "콤보팩 A (호핑+고래상어+말룸) (성인)", price: 270000 },
        { name: "콤보팩 A (호핑+고래상어+말룸) (소인)", price: 260000 },
        { name: "콤보팩 B (호핑+고래상어) (성인/소인)", price: 175000 },
        { name: "콤보팩 C (호핑+말룸) (성인)", price: 150000 },
        { name: "콤보팩 C (호핑+말룸) (소인)", price: 141000 },
        { name: "콤보팩 D (말룸+고래상어) (성인)", price: 220000 },
        { name: "콤보팩 D (말룸+고래상어) (소인)", price: 210000 }
    ],
    "보라카이 왕복 픽업샌딩": [
        { name: "조인 픽업샌딩", price: 54900 }
    ],
    "블랙펄 요트호핑투어": [
        { name: "성인 투어", price: 55000 }
    ],
    "시크릿 가든 말룸파티": [
        { name: "일반 투어", price: 99000 }
    ],
    "리버타드 고래상어 투어": [
        { name: "성인 투어", price: 128000 }
    ],
    "해양스포츠": [
        { name: "제트스키 1대 (2인 가능)", price: 55000 },
        { name: "파라세일링 (1인)", price: 55000 },
        { name: "체험 다이빙 (1인)", price: 55000 }
    ],
    "마사지(샵별)": [
        { name: "에스파", price: 55000 },
        { name: "루나스파", price: 55000 },
        { name: "보라스파", price: 55000 },
        { name: "포세이돈 스파", price: 105000 },
        { name: "마리스 스파", price: 91000 },
        { name: "헬리오스 스파", price: 91000 },
        { name: "카바얀 스파", price: 49000 },
        { name: "아유르베다 스파", price: 55000 }
    ]
};

// 패키지 상품에 포함되는 투어 매핑
const PKG_TOUR_MAP = {
    "시그니처": { hopping: true, malum: true, whale: true },
    "패키지 A": { oneday: true, hopping: true },   // 원데이(말룸+고래)
    "패키지 B": { oneday: true, hopping: true },
    "패키지 C": { hopping: true },
    "픽샌팩 A": {},
    "픽샌팩 B": { hopping: true },
    "픽샌팩 C": { hopping: true },
    "콤보팩 A": { hopping: true, malum: true, whale: true },
    "콤보팩 B": { hopping: true, whale: true },
    "콤보팩 C": { hopping: true, malum: true },
    "콤보팩 D": { malum: true, whale: true }
};

// ===================== 달력 로직 =====================
let currentCalInput = null;
let calViewDate = new Date();

window.openCalendar = function(input) {
    document.querySelectorAll('.calendar-picker').forEach(p => p.classList.remove('active'));
    currentCalInput = input;
    const picker = input.nextElementSibling;
    if (!picker || !picker.classList.contains('calendar-picker')) return;
    picker.classList.add('active');
    renderCal(picker);
};

function renderCal(picker) {
    const year = calViewDate.getFullYear();
    const month = calViewDate.getMonth();
    const todayStr = new Date().toISOString().split('T')[0];

    let html = `
        <div class="cp-header">
            <button type="button" class="cp-nav-btn" onclick="event.stopPropagation(); changeCalMonth(-1)">&#8249;</button>
            <strong>${year}년 ${month + 1}월</strong>
            <button type="button" class="cp-nav-btn" onclick="event.stopPropagation(); changeCalMonth(1)">&#8250;</button>
        </div>
        <div class="cp-grid">
            <div class="cp-day-header">일</div><div class="cp-day-header">월</div>
            <div class="cp-day-header">화</div><div class="cp-day-header">수</div>
            <div class="cp-day-header">목</div><div class="cp-day-header">금</div>
            <div class="cp-day-header">토</div>
    `;
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) html += `<div class="cp-day empty"></div>`;
    for (let i = 1; i <= lastDate; i++) {
        const dateStr = `${year}-${(month+1).toString().padStart(2,'0')}-${i.toString().padStart(2,'0')}`;
        let cls = "cp-day";
        if (dateStr < todayStr) cls += " disabled";
        else {
            if (dateStr === todayStr) cls += " today";
            if (currentCalInput && dateStr === currentCalInput.value) cls += " selected";
        }
        html += `<div class="${cls}" data-date="${dateStr}">${i}</div>`;
    }
    html += `</div>`;
    picker.innerHTML = html;

    picker.querySelectorAll('.cp-day:not(.disabled):not(.empty)').forEach(day => {
        day.onclick = (e) => {
            e.stopPropagation();
            if (currentCalInput) currentCalInput.value = day.getAttribute('data-date');
            picker.classList.remove('active');
        };
    });
}

window.changeCalMonth = function(delta) {
    calViewDate.setMonth(calViewDate.getMonth() + delta);
    if (currentCalInput) {
        const picker = currentCalInput.nextElementSibling;
        if (picker && picker.classList.contains('calendar-picker')) renderCal(picker);
    }
};

document.addEventListener('click', function(e) {
    if (!e.target.closest('.sched-field') && !e.target.closest('.cal-wrap') && !e.target.closest('.input-group')) {
        document.querySelectorAll('.calendar-picker').forEach(p => p.classList.remove('active'));
    }
});

// ===================== 상품 행 추가 =====================
window.addItemRow = () => {
    const tbody = document.getElementById('item-tbody');
    const row = document.createElement('tr');
    row.className = 'item-row';
    const productOptions = Object.keys(PRODUCT_DATA).map(name => `<option value="${name}">${name}</option>`).join('');
    
    row.innerHTML = `
        <td><select class="item-select" onchange="onProductChange(this)" style="font-weight:700;">
            <option value="">상품 선택</option>
            ${productOptions}
        </select></td>
        <td><input type="number" class="item-count" value="1" min="1" oninput="calculateRow(this)" style="text-align:center;"></td>
        <td><select class="item-type" onchange="onTypeChange(this)" style="color:#007aff; font-weight:600;">
            <option value="">종류/옵션 선택</option>
        </select></td>
        <td><input type="text" class="item-subtotal" value="₩ 0" readonly style="background:#f9fafb; border:none; text-align:right; font-weight:800; color:#ff6a00;"></td>
        <td><button class="btn-remove" onclick="removeRow(this)">✕</button></td>
        <input type="hidden" class="item-price" value="0">
    `;
    tbody.appendChild(row);
};

window.onProductChange = (select) => {
    const row = select.closest('tr');
    const typeSelect = row.querySelector('.item-type');
    const productName = select.value;
    
    if (!productName) {
        typeSelect.innerHTML = '<option value="">종류 선택</option>';
        updatePackageSection();
        return;
    }

    const types = PRODUCT_DATA[productName];
    typeSelect.innerHTML = types.map(t => `<option value="${t.name}" data-price="${t.price}">${t.name} (₩${t.price.toLocaleString()})</option>`).join('');
    onTypeChange(typeSelect);
    updatePackageSection();
};

window.onTypeChange = (select) => {
    const row = select.closest('tr');
    const priceInput = row.querySelector('.item-price');
    const selectedOption = select.options[select.selectedIndex];
    priceInput.value = selectedOption.dataset.price || 0;
    calculateRow(select);
    updatePackageSection();
};

window.calculateRow = (el) => {
    const row = el.closest('tr');
    const count = parseInt(row.querySelector('.item-count').value) || 0;
    const price = parseInt(row.querySelector('.item-price').value) || 0;
    const subtotal = count * price;
    row.querySelector('.item-subtotal').value = '₩ ' + subtotal.toLocaleString();
    updateTotal();
};

window.removeRow = (btn) => {
    btn.closest('tr').remove();
    updateTotal();
    updatePackageSection();
};

function updateTotal() {
    let total = 0;
    document.querySelectorAll('.item-row').forEach(row => {
        const count = parseInt(row.querySelector('.item-count').value) || 0;
        const price = parseInt(row.querySelector('.item-price').value) || 0;
        total += (count * price);
    });
    document.getElementById('total-amount').innerText = '₩ ' + total.toLocaleString();
}

// ===================== 패키지 섹션 관리 =====================
function updatePackageSection() {
    // 선택된 상품 목록 수집
    let hasPackage = false;
    let needHopping = false, needMalum = false, needWhale = false, needOneday = false;

    document.querySelectorAll('.item-row').forEach(row => {
        const productName = row.querySelector('.item-select').value;
        const typeName = row.querySelector('.item-type').value;

        const isPackage = productName === '보라카이션 패키지' || productName === '보라카이션 투어 콤보팩';
        if (!isPackage) return;
        hasPackage = true;

        // 타입명에서 어떤 투어 포함인지 추출
        for (const [key, tours] of Object.entries(PKG_TOUR_MAP)) {
            if (typeName.includes(key)) {
                if (tours.oneday) needOneday = true;
                if (tours.hopping) needHopping = true;
                if (tours.malum) needMalum = true;
                if (tours.whale) needWhale = true;
                break;
            }
        }
        // 픽업샌딩 포함된 경우 (픽샌팩 등)
        if (typeName.includes('픽샌') || typeName.includes('시그니처') || typeName.includes('패키지 A') || typeName.includes('패키지 B') || typeName.includes('패키지 C')) {
            hasPackage = true;
        }
    });

    const section = document.getElementById('pkg-schedule-section');
    section.style.display = hasPackage ? 'block' : 'none';

    // 투어별 날짜 카드 표시/숨김
    const show = (id, visible) => {
        const el = document.getElementById(id);
        if (el) el.style.display = visible ? 'flex' : 'none';
    };
    show('pkg-oneday-card', needOneday);
    show('pkg-hopping-card', needHopping && !needOneday);
    show('pkg-malum-card', needMalum && !needOneday);
    show('pkg-whale-card', needWhale && !needOneday);

    // 호핑투어 안 들어가면 점보크랩 체크 해제
    const hoppingCardVisible = (needHopping && !needOneday);
    if (!hoppingCardVisible) {
        const jumboCheck = document.getElementById('pkg-jumbo-check');
        if (jumboCheck) jumboCheck.checked = false;
        const jumboFields = document.getElementById('pkg-jumbo-fields');
        if (jumboFields) jumboFields.style.display = 'none';
    }
}

window.toggleJumboOption = function(cb) {
    const fields = document.getElementById('pkg-jumbo-fields');
    if (cb.checked) {
        fields.style.display = 'flex';
    } else {
        fields.style.display = 'none';
    }
};

// ===================== 견적서 제출 =====================
window.submitQuote = async () => {
    const btn = document.querySelector('.btn-submit');
    if (btn.disabled) return;

    const rows = document.querySelectorAll('.item-row');
    if (rows.length === 0) { alert('상품을 추가해 주세요.'); return; }

    const isJumboChecked = document.getElementById('pkg-jumbo-check') ? document.getElementById('pkg-jumbo-check').checked : false;
    const jumboQtyVal = isJumboChecked ? parseInt(document.getElementById('pkg-jumbo-qty').value) : 0;

    const items = [];
    let totalPrice = 0;

    rows.forEach(row => {
        const productName = row.querySelector('.item-select').value;
        const typeName = row.querySelector('.item-type').value;
        const count = parseInt(row.querySelector('.item-count').value) || 0;
        const price = parseInt(row.querySelector('.item-price').value) || 0;
        
        if (productName && typeName) {
            const isPackage = productName === '보라카이션 패키지' || productName === '보라카이션 투어 콤보팩';
            const itemObj = { 
                name: `${productName} - ${typeName}`, 
                date: "-", 
                count: count, 
                price: price 
            };
            if (isPackage && isJumboChecked) {
                itemObj.hoppingJumbo = true;
                itemObj.jumboQty = jumboQtyVal;
            }
            items.push(itemObj);
            totalPrice += (count * price);
        }
    });

    if (items.length === 0) { alert('상품 구성을 완료해 주세요.'); return; }

    // 패키지 일정 데이터 수집 (booking-form과 동일한 필드명)
    const pkgSection = document.getElementById('pkg-schedule-section');
    const schedData = {};
    if (pkgSection.style.display !== 'none') {
        const g = id => document.getElementById(id)?.value?.trim() || '';
        schedData.pickupDate    = g('pkg-pickup-date');
        schedData.pickupFlight  = g('pkg-pickup-flight');
        schedData.pickupResort  = g('pkg-pickup-resort');
        schedData.sendingDate   = g('pkg-sending-date');
        schedData.sendingFlight = g('pkg-sending-flight');
        schedData.sendingResort = g('pkg-sending-resort');
        schedData.oneDayDate    = g('pkg-oneday-date');
        schedData.hoppingDate   = g('pkg-hopping-date');
        schedData.malumDate     = g('pkg-malum-date');
        schedData.whaleDate     = g('pkg-whale-date');
        schedData.exchangeAmount= g('pkg-exchange-amount');
        schedData.hoppingJumbo  = isJumboChecked;
        schedData.jumboQty      = jumboQtyVal;
    }

    try {
        btn.disabled = true;
        btn.innerText = "생성 중...";

        const docRef = await addDoc(collection(db, "reservations"), {
            customerKorName: "(고객 입력 대기)",
            contact: "-",
            items: items,
            totalPrice: totalPrice,
            status: '견적발송',
            ...schedData,
            createdAt: new Date()
        });

        const url = `${window.location.origin}/quote.html?id=${docRef.id}`;
        await navigator.clipboard.writeText(url);
        alert('견적 링크가 생성되어 복사되었습니다!\n[신규예약] 탭에서 확인 가능합니다.');
        window.close();
    } catch (e) { 
        console.error(e); 
        btn.disabled = false;
        btn.innerText = "견적서 생성 및 링크 복사";
        alert('생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
};

addItemRow();
