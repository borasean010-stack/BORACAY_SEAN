import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// --- 💰 마사지 종류 및 가격 데이터 ---
const MASSAGE_PRICES = {
    "에스파": [
        { name: "퓨어오일 마사지", price: 55000 },
        { name: "태반 마사지", price: 55000 },
        { name: "스톤 마사지", price: 55000 },
        { name: "힐롯 마사지", price: 70000 },
        { name: "포핸드 마사지", price: 84000 },
        { name: "성장 마사지 (1시간)", price: 42000 },
        { name: "성장 마사지 (2시간)", price: 55000 }
    ],
    "보라스파": [
        { name: "꿀마사지", price: 55000 },
        { name: "진주마사지", price: 55000 },
        { name: "태반마사지", price: 55000 }
    ],
    "루나스파": [
        { name: "스톤마사지", price: 55000 },
        { name: "노니마사지", price: 55000 },
        { name: "태반마사지", price: 55000 }
    ],
    "카바얀": [{ name: "전신 마사지", price: 49000 }],
    "default": [{ name: "기본 마사지", price: 55000 }]
};

// --- 🏷️ 상품 설정 ---
const PRODUCT_CONFIG = {
    "호핑": { label: "옵션 선택", options: ["점심 포함 (12:30 미팅) - $30 현장지불", "선셋 호핑 (13:30 미팅)"], hasPickup: false },
    "말룸": { hasPickup: false, noOptions: true },
    "에스파": { options: ["12:30", "14:30", "16:30", "18:30", "19:30"], hasPickup: false }, // 에스파 직접이동
    "루나": { options: ["10:00", "13:00", "16:00", "20:00"], hasPickup: false },
    "보라스파": { options: ["10:00", "13:00", "16:00", "20:00"], hasPickup: false },
    "카바얀": { options: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"], hasPickup: false },
    "default": { options: ["10:00", "13:00", "16:00", "19:00"], hasPickup: true }
};

let currentQuoteData = null;
let selectedDates = {}; // idx: YYYY-MM-DD

async function loadQuote() {
    const urlParams = new URLSearchParams(window.location.search);
    const quoteId = urlParams.get('id');
    if (!quoteId) return;

    try {
        const docRef = doc(db, "reservations", quoteId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return;
        currentQuoteData = docSnap.data();
        
        renderItemList();
        updateTotalDisplay();

        document.getElementById('btn-show-form').onclick = () => {
            document.getElementById('info-form-section').style.display = 'block';
            document.getElementById('btn-show-form').style.display = 'none';
            renderDynamicProductFields();
        };

        document.getElementById('btn-final-submit').onclick = handleFinalSubmit;
        document.getElementById('loading').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    } catch (e) { console.error(e); }
}

function renderItemList() {
    const container = document.getElementById('item-list-container');
    container.innerHTML = currentQuoteData.items.map((item, idx) => `
        <div style="margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid #f5f5f5;">
            <div class="detail-row">
                <div class="detail-label">${item.name}</div>
                <div class="detail-value price-val" id="price-display-${idx}">₩ ${(item.price * item.count).toLocaleString()}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">인원</div>
                <div class="detail-value">${item.count}명</div>
            </div>
        </div>
    `).join('');
}

function updateTotalDisplay() {
    let total = 0;
    currentQuoteData.items.forEach(item => { total += (item.price * item.count); });
    document.getElementById('q-total').innerText = `₩ ${total.toLocaleString()}`;
}

function renderDynamicProductFields() {
    const container = document.getElementById('dynamic-product-fields');
    let html = "";

    const hasPickup = currentQuoteData.items.some(it => it.name.includes('픽업') || it.name.includes('샌딩'));
    if (hasPickup) {
        html += `
            <div class="product-spec-box">
                <div class="product-spec-title"><span class="material-icons" style="color:var(--primary);">flight_takeoff</span> ✈️ 픽업/샌딩 정보 입력</div>
                <div class="input-group"><label>픽업 항공편명 (인천➔칼리보)</label><input type="text" id="p-flight" placeholder="예: TW123"></div>
                <div class="input-group"><label>픽업 리조트 (첫날)</label><input type="text" id="p-resort" placeholder="숙소명"></div>
                <div class="input-group"><label>샌딩 항공편명 (칼리보➔인천)</label><input type="text" id="s-flight" placeholder="예: TW124"></div>
                <div class="input-group"><label>샌딩 리조트 (마지막날)</label><input type="text" id="s-resort" placeholder="숙소명"></div>
                <div class="input-group"><label>환전 요청 (달러➔페소)</label><input type="text" id="p-exchange" placeholder="예: 100달러"></div>
            </div>
        `;
    }

    currentQuoteData.items.forEach((item, idx) => {
        if (item.name.includes('픽업') || item.name.includes('샌딩')) return;

        const isMassage = item.name.includes('마사지') || item.name.includes('스파') || item.name.includes('에스파');
        const config = getProductConfig(item.name);
        
        html += `<div class="product-spec-box">
            <div class="product-spec-title"><span class="material-icons" style="color:var(--primary);">event_available</span> ${item.name} 상세 정보</div>
            
            <div class="input-group">
                <label>날짜 선택 (클릭하여 선택)<span>*</span></label>
                <div id="cal-container-${idx}"></div>
                <input type="hidden" id="date-${idx}">
            </div>`;

        if (isMassage) {
            const mList = MASSAGE_PRICES[Object.keys(MASSAGE_PRICES).find(k => item.name.includes(key)) || "default"];
            const mData = MASSAGE_PRICES[Object.keys(MASSAGE_PRICES).find(k => item.name.includes(k))] || MASSAGE_PRICES.default;
            html += `<div class="input-group">
                <label>마사지 종류 선택<span>*</span></label>
                <select id="m-type-${idx}" onchange="changeMassageType(${idx}, this.value)">
                    ${mData.map(m => `<option value="${m.name}" data-price="${m.price}">${m.name} (₩${m.price.toLocaleString()})</option>`).join('')}
                </select>
            </div>`;
        }

        if (!config.noOptions) {
            html += `<div class="input-group">
                <label>${config.label || '시간 선택'}</label>
                <select id="opt-${idx}">
                    ${config.options.map(o => `<option value="${o}">${o}</option>`).join('')}
                </select>
            </div>`;
        }

        const isDirect = !config.hasPickup;
        html += `<div class="input-group">
            <label>${isDirect ? '<span style="color:#ff4b4b;">미팅지 (마사지샵/사무실 직접이동)</span>' : '픽업 받으실 리조트명'}</label>
            ${isDirect ? `<input type="text" value="현장 직접이동 상품입니다" readonly style="background:#eee; color:#888;">` : `<input type="text" id="resort-${idx}" placeholder="숙소 이름을 적어주세요">`}
        </div></div>`;
    });

    container.innerHTML = html;
    currentQuoteData.items.forEach((item, idx) => {
        if (!item.name.includes('픽업')) createCalendar(idx, item.name);
    });
}

window.changeMassageType = (idx, typeName) => {
    const mData = MASSAGE_PRICES[Object.keys(MASSAGE_PRICES).find(k => currentQuoteData.items[idx].name.includes(k))] || MASSAGE_PRICES.default;
    const selected = mData.find(m => m.name === typeName);
    currentQuoteData.items[idx].price = selected.price;
    currentQuoteData.items[idx].subName = typeName;
    
    document.getElementById(`price-display-${idx}`).innerText = `₩ ${(selected.price * currentQuoteData.items[idx].count).toLocaleString()}`;
    updateTotalDisplay();
};

function createCalendar(idx, productName) {
    const container = document.getElementById(`cal-container-${idx}`);
    let now = new Date();
    let displayDate = new Date(now.getFullYear(), now.getMonth(), 1);

    function render() {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        let html = `<div class="custom-calendar">
            <div class="cal-header">
                <button type="button" class="cal-btn-prev">◀</button>
                <strong>${year}년 ${month + 1}월</strong>
                <button type="button" class="cal-btn-next">▶</button>
            </div>
            <div class="cal-grid">
                ${['일','월','화','수','목','금','토'].map(d => `<div class="cal-day-label">${d}</div>`).join('')}`;
        
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        for (let i = 0; i < firstDay; i++) html += `<div></div>`;
        
        for (let i = 1; i <= lastDate; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isToday = new Date().toDateString() === new Date(year, month, i).toDateString();
            const isPast = new Date(year, month, i) < new Date().setHours(0,0,0,0);
            
            let statusClass = "";
            const isOdd = i % 2 !== 0;
            if (productName.includes('블랙펄') && !isOdd) statusClass = "disabled";
            if (productName.includes('말룸파티') && isOdd) statusClass = "disabled";
            if (isPast) statusClass = "disabled";
            if (selectedDates[idx] === dateStr) statusClass = "selected";

            html += `<div class="cal-date ${statusClass} ${isToday ? 'today' : ''}" data-date="${dateStr}">${i}</div>`;
        }
        html += `</div>`;
        if (productName.includes('블랙펄')) html += `<p style="font-size:11px; color:var(--primary); margin-top:10px;">※ 홀수일만 예약 가능</p>`;
        if (productName.includes('말룸파티')) html += `<p style="font-size:11px; color:var(--primary); margin-top:10px;">※ 짝수일만 예약 가능</p>`;
        html += `</div>`;
        container.innerHTML = html;

        container.querySelector('.cal-btn-prev').onclick = () => { displayDate.setMonth(displayDate.getMonth() - 1); render(); };
        container.querySelector('.cal-btn-next').onclick = () => { displayDate.setMonth(displayDate.getMonth() + 1); render(); };
        container.querySelectorAll('.cal-date:not(.disabled)').forEach(el => {
            el.onclick = () => {
                selectedDates[idx] = el.dataset.date;
                document.getElementById(`date-${idx}`).value = el.dataset.date;
                render();
            };
        });
    }
    render();
}

async function handleFinalSubmit() {
    const korName = document.getElementById('cust-kor-name').value.trim();
    const contact = document.getElementById('cust-contact').value.trim();
    if (!korName || !contact) { alert('필수 기본 정보를 입력해 주세요.'); return; }

    const updatedItems = [...currentQuoteData.items];
    let allDatesFilled = true;
    let combinedReq = "";

    updatedItems.forEach((item, idx) => {
        if (item.name.includes('픽업')) { item.date = "항공정보참조"; return; }
        const dateVal = selectedDates[idx];
        if (!dateVal) { alert(`[${item.name}] 날짜를 선택해 주세요.`); allDatesFilled = false; return; }
        item.date = dateVal;
        
        const optEl = document.getElementById(`opt-${idx}`);
        if (optEl) item.time = optEl.value.split(' ')[0];
        
        const resortEl = document.getElementById(`resort-${idx}`);
        if (resortEl && resortEl.value) combinedReq += `[${item.name}] 숙소:${resortEl.value}\n`;
        if (item.subName) combinedReq += `[${item.name}] 종류:${item.subName}\n`;
    });

    if (!allDatesFilled) return;

    // 픽업샌딩 수집
    const pF = document.getElementById('p-flight')?.value;
    const pR = document.getElementById('p-resort')?.value;
    const sF = document.getElementById('s-flight')?.value;
    const sR = document.getElementById('s-resort')?.value;
    if (pF || pR) combinedReq += `[공통픽업] 항공:${pF} / 숙소:${pR}\n[공통샌딩] 항공:${sF} / 숙소:${sR}\n`;

    try {
        await updateDoc(doc(db, "reservations", window.location.search.split('id=')[1]), {
            customerKorName: korName, contact: contact, engName: document.getElementById('cust-eng-name').value,
            items: updatedItems, requests: combinedReq, status: '입금확인요청', totalPrice: currentQuoteData.items.reduce((a,b)=>a+(b.price*b.count),0), updatedAt: new Date()
        });
        window.open('http://pf.kakao.com/_zBArM/chat', '_blank');
        document.getElementById('success-overlay').style.display = 'flex';
    } catch (e) { alert('저장 실패'); }
}

loadQuote();
