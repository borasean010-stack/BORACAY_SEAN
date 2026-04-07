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

// --- 🏷️ 상품별 설정 (셔틀 유무 정밀화) ---
const PRODUCT_CONFIG = {
    "호핑": { noOptions: true, hasPickup: false, meetingInfo: "" },
    "말룸": { noOptions: true, hasPickup: false, meetingInfo: "" },
    "에스파": { options: ["12:30", "14:30", "16:30", "18:30", "19:30"], hasPickup: false, meetingInfo: "" },
    "루나": { options: ["10:00", "13:00", "16:00", "20:00"], hasPickup: false, meetingInfo: "" },
    "보라스파": { options: ["10:00", "13:00", "16:00", "20:00"], hasPickup: false, meetingInfo: "" },
    "카바얀": { options: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"], hasPickup: false, meetingInfo: "" },
    "태반": { options: ["10:00", "13:00", "16:00", "20:00"], hasPickup: false, meetingInfo: "" },
    "마리스": { options: ["10:00", "13:30", "16:30", "19:30"], hasPickup: true },
    "포세이돈": { options: ["10:00", "13:00", "16:00", "19:00"], hasPickup: true },
    "힐롯": { options: ["10:00", "13:00", "16:00", "19:00"], hasPickup: true },
    "헬리오스": { options: ["10:00", "13:30", "16:30", "19:30"], hasPickup: true },
    "아브라": { options: ["10:00", "13:00", "16:00", "19:30"], hasPickup: true },
    "아리스": { options: ["10:00", "13:00", "16:00", "19:30"], hasPickup: true },
    "가야": { options: ["10:00", "13:00", "16:00", "19:30"], hasPickup: true },
    "궁스파": { options: ["10:00", "13:30", "16:30", "19:30"], hasPickup: true },
    "다이빙": { options: ["09:00", "11:00", "13:00", "15:00"], hasPickup: true },
    "파라세일링": { options: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"], hasPickup: true },
    "제트스키": { options: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"], hasPickup: true },
    "헬멧": { options: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"], hasPickup: true },
    "랜드투어": { options: ["10:30"], hasPickup: true },
    "default": { options: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"], hasPickup: true }
};

function getProductConfig(name) {
    for (const key in PRODUCT_CONFIG) {
        if (name.includes(key)) return PRODUCT_CONFIG[key];
    }
    return PRODUCT_CONFIG.default;
}

let currentQuoteData = null;
let selectedDates = {}; 

async function loadQuote() {
    const urlParams = new URLSearchParams(window.location.search);
    const quoteId = urlParams.get('id');
    if (!quoteId) { document.getElementById('loading').innerText = "견적서 ID를 찾을 수 없습니다."; return; }

    try {
        const docRef = doc(db, "reservations", quoteId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) { document.getElementById('loading').innerText = "만료되었거나 없는 견적서입니다."; return; }
        
        currentQuoteData = docSnap.data();
        renderItemList();
        
        document.getElementById('btn-show-form').onclick = () => {
            document.getElementById('info-form-section').style.display = 'block';
            document.getElementById('btn-show-form').style.display = 'none';
            renderDynamicProductFields();
            window.scrollTo({ top: document.getElementById('info-form-section').offsetTop - 50, behavior: 'smooth' });
        };

        document.getElementById('btn-final-submit').onclick = handleFinalSubmit;
        document.getElementById('loading').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    } catch (e) {
        console.error(e);
        document.getElementById('loading').innerText = "오류가 발생했습니다.";
    }
}

function renderItemList() {
    const container = document.getElementById('item-list-container');
    container.innerHTML = (currentQuoteData.items || []).map((item, idx) => `
        <div style="margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid #f5f5f5;">
            <div class="detail-row">
                <div class="detail-label">${item.name}</div>
                <div class="detail-value price-val">₩ ${(item.price * item.count).toLocaleString()}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">인원</div>
                <div class="detail-value">${item.count}명</div>
            </div>
        </div>
    `).join('');
    document.getElementById('q-total').innerText = `₩ ${(currentQuoteData.totalPrice || 0).toLocaleString()}`;
}

function renderDynamicProductFields() {
    const container = document.getElementById('dynamic-product-fields');
    let html = "";

    const hasPickupSending = currentQuoteData.items.some(it => it.name.includes('픽업') || it.name.includes('샌딩'));
    if (hasPickupSending) {
        html += `
            <div class="product-spec-box">
                <div class="product-spec-title"><span class="material-icons" style="color:var(--primary);">flight_takeoff</span> ✈️ 픽업/샌딩 정보 입력</div>
                <div class="input-group"><label>픽업 항공편명 (예: TW125)</label><input type="text" id="p-flight" placeholder="예: TW125"></div>
                <div class="input-group"><label>픽업 리조트 (첫날)</label><input type="text" id="p-resort" placeholder="숙소명"></div>
                <div class="input-group"><label>샌딩 항공편명 (예: TW126)</label><input type="text" id="s-flight" placeholder="예: TW126"></div>
                <div class="input-group"><label>샌딩 리조트 (마지막날)</label><input type="text" id="s-resort" placeholder="숙소명"></div>
                <div class="input-group"><label>환전 요청 (달러➔페소)</label><input type="text" id="p-exchange" placeholder="예: 100달러"></div>
            </div>
        `;
    }

    currentQuoteData.items.forEach((item, idx) => {
        if (item.name.includes('픽업') || item.name.includes('샌딩')) return;

        const config = getProductConfig(item.name);
        html += `<div class="product-spec-box">
            <div class="product-spec-title"><span class="material-icons" style="color:var(--primary);">event_available</span> ${item.name}</div>
            
            <div class="input-group">
                <label>이용 날짜 선택<span>*</span></label>
                <div id="cal-container-${idx}"></div>
                <input type="hidden" id="date-${idx}">
            </div>`;

        if (!config.noOptions) {
            html += `<div class="input-group">
                <label>예약 시간 선택<span>*</span></label>
                <select id="opt-${idx}">
                    <option value="">시간을 선택해 주세요</option>
                    ${config.options.map(o => `<option value="${o}">${o}</option>`).join('')}
                </select>
            </div>`;
        }

        if (config.hasPickup) {
            html += `<div class="input-group">
                <label>픽업 받으실 리조트명<span>*</span></label>
                <input type="text" id="resort-${idx}" placeholder="숙소 이름을 적어주세요">
            </div>`;
        }
        
        html += `</div>`;
    });

    container.innerHTML = html;
    
    currentQuoteData.items.forEach((item, idx) => {
        if (!item.name.includes('픽업') && !item.name.includes('샌딩')) {
            createCalendar(idx, item.name);
        }
    });
}

function createCalendar(idx, productName) {
    const container = document.getElementById(`cal-container-${idx}`);
    if (!container) return;
    
    let displayDate = new Date();
    displayDate.setDate(1);

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
            const isPast = new Date(year, month, i) < new Date().setHours(0,0,0,0);
            
            let statusClass = "";
            const isOdd = i % 2 !== 0;
            
            if ((productName.includes('블랙펄') || productName.includes('호핑')) && !isOdd) statusClass = "disabled";
            if (productName.includes('말룸파티') && isOdd) statusClass = "disabled";
            
            if (isPast) statusClass = "disabled";
            if (selectedDates[idx] === dateStr) statusClass = "selected";

            html += `<div class="cal-date ${statusClass}" data-date="${dateStr}">${i}</div>`;
        }
        html += `</div>`;
        
        if (productName.includes('블랙펄') || productName.includes('호핑')) 
            html += `<p class="cal-notice">※ 홀수일만 운영되는 상품입니다.</p>`;
        if (productName.includes('말룸파티')) 
            html += `<p class="cal-notice">※ 짝수일만 운영되는 상품입니다.</p>`;
            
        html += `</div>`;
        container.innerHTML = html;

        container.querySelector('.cal-btn-prev').onclick = (e) => { e.preventDefault(); displayDate.setMonth(displayDate.getMonth() - 1); render(); };
        container.querySelector('.cal-btn-next').onclick = (e) => { e.preventDefault(); displayDate.setMonth(displayDate.getMonth() + 1); render(); };
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
    const engName = document.getElementById('cust-eng-name').value.trim();
    const contact = document.getElementById('cust-contact').value.trim();
    if (!korName || !engName || !contact) { alert('대표자 필수 정보를 모두 입력해 주세요.'); return; }

    const updatedItems = [...currentQuoteData.items];
    let allValid = true;
    let combinedReq = "";

    updatedItems.forEach((item, idx) => {
        if (item.name.includes('픽업') || item.name.includes('샌딩')) { item.date = "항공정보참조"; return; }
        
        const dateVal = selectedDates[idx];
        if (!dateVal) { alert(`[${item.name}] 날짜를 선택해 주세요.`); allValid = false; return; }
        item.date = dateVal;
        
        const config = getProductConfig(item.name);
        if (!config.noOptions) {
            const optEl = document.getElementById(`opt-${idx}`);
            if(!optEl.value) { alert(`[${item.name}] 시간을 선택해 주세요.`); allValid = false; return; }
            item.time = optEl.value;
        }
        
        if (config.hasPickup) {
            const resortEl = document.getElementById(`resort-${idx}`);
            if (!resortEl.value.trim()) { alert(`[${item.name}] 픽업 리조트를 입력해 주세요.`); allValid = false; return; }
            combinedReq += `[${item.name}] 픽업:${resortEl.value}\n`;
        }
    });

    if (!allValid) return;

    const pF = document.getElementById('p-flight')?.value;
    const pR = document.getElementById('p-resort')?.value;
    const sF = document.getElementById('s-flight')?.value;
    const sR = document.getElementById('s-resort')?.value;
    const ex = document.getElementById('p-exchange')?.value;
    if (pF || pR) combinedReq += `[항공/환전] 픽업:${pF}(${pR}) / 샌딩:${sF}(${sR}) / 환전:${ex}\n`;

    try {
        const btn = document.getElementById('btn-final-submit');
        btn.disabled = true; btn.innerText = "처리 중...";
        
        const quoteId = new URLSearchParams(window.location.search).get('id');
        await updateDoc(doc(db, "reservations", quoteId), {
            customerKorName: korName, 
            engName: engName,
            contact: contact,
            items: updatedItems, 
            requests: combinedReq, 
            status: '입금확인요청', 
            updatedAt: new Date()
        });
        
        window.open('http://pf.kakao.com/_zBArM/chat', '_blank');
        document.getElementById('success-overlay').style.display = 'flex';
    } catch (e) { 
        alert('저장에 실패했습니다. 다시 시도해 주세요.'); 
        btn.disabled = false; 
        btn.innerText = "입금 완료 및 예약 신청";
    }
}

loadQuote();
