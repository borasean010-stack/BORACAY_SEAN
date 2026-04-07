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

// --- 🏷️ 상품별 옵션 데이터 (홈페이지 기준) ---
const PRODUCT_CONFIG = {
    "호핑": {
        options: ["점심 포함 (12:30 점보크랩 미팅) - 1인 $30 현장지불", "선셋 호핑 (13:30 미팅 장소 집결)"],
        hasPickup: false,
        meetingPoint: "점보크랩 또는 비치 미팅포인트 (시즌별 상이)"
    },
    "말룸": {
        options: ["일반 투어 (09:40 사무실 미팅)", "샌딩팩 (09:00 리조트 로비 미팅)"],
        hasPickup: false, // 샌딩팩 제외 기본은 개별이동
        meetingPoint: "보라카이션 사무실"
    },
    "에스파": { options: ["10:00", "12:30 (AFM)", "13:00", "16:00", "17:00 (AFM)", "18:00 (AFH)", "20:00"], hasPickup: true },
    "보라스파": { options: ["10:00", "13:00", "16:00", "20:00"], hasPickup: true },
    "루나스파": { options: ["10:00", "13:00", "16:00", "20:00"], hasPickup: true },
    "마리스": { options: ["10:00", "13:30", "16:30", "19:30"], hasPickup: true },
    "포세이돈": { options: ["10:00", "13:00", "16:00", "19:00"], hasPickup: true },
    "헬리오스": { options: ["10:00", "13:30", "16:30", "19:30"], hasPickup: true },
    "카바얀": { options: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"], hasPickup: false, meetingPoint: "디몰 버젯마트 근처 매장" },
    "아유르베다": { options: ["10:00", "13:00", "16:00", "19:00"], hasPickup: false, meetingPoint: "매장 개별 이동" },
    "랜드투어": { options: ["10:30"], hasPickup: false, meetingPoint: "보라카이션 사무실" },
    "다이빙": { options: ["09:00", "11:00", "13:00", "15:00"], hasPickup: true },
    "파라세일링": { options: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"], hasPickup: true },
    "제트스키": { options: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"], hasPickup: true },
    "default": { options: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"], hasPickup: true }
};

function getProductConfig(name) {
    for (const key in PRODUCT_CONFIG) { if (name.includes(key)) return PRODUCT_CONFIG[key]; }
    return PRODUCT_CONFIG.default;
}

// --- 📅 날짜 제한 로직 (홀/짝) ---
function isDateAllowed(productName, dateStr) {
    if (!dateStr) return true;
    const day = new Date(dateStr).getDate();
    if (productName.includes('블랙펄') || productName.includes('호핑')) return day % 2 !== 0;
    if (productName.includes('말룸파티')) return day % 2 === 0;
    return true;
}

async function loadQuote() {
    const urlParams = new URLSearchParams(window.location.search);
    const quoteId = urlParams.get('id');
    
    if (!quoteId) { document.getElementById('loading').innerText = "견적서 ID 오류"; return; }

    try {
        const docRef = doc(db, "reservations", quoteId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) { document.getElementById('loading').innerText = "견적서를 찾을 수 없습니다."; return; }

        const data = docSnap.data();
        
        // 견적 상세 리스트
        const listContainer = document.getElementById('item-list-container');
        listContainer.innerHTML = (data.items || []).map(item => `
            <div style="margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid #f5f5f5;">
                <div class="detail-row"><div class="detail-label">${item.name}</div><div class="detail-value price-val">₩ ${((item.price || 0) * (item.count || 1)).toLocaleString()}</div></div>
                <div class="detail-row"><div class="detail-label">인원</div><div class="detail-value">${item.count}명</div></div>
            </div>
        `).join('');

        document.getElementById('q-total').innerText = `₩ ${(data.totalPrice || 0).toLocaleString()}`;

        document.getElementById('btn-show-form').onclick = () => {
            document.getElementById('info-form-section').style.display = 'block';
            document.getElementById('btn-show-form').style.display = 'none';
            window.scrollTo({ top: document.getElementById('info-form-section').offsetTop - 50, behavior: 'smooth' });
        };

        renderProductFields(data.items);

        document.getElementById('btn-final-submit').onclick = async () => {
            const korName = document.getElementById('cust-kor-name').value.trim();
            const engName = document.getElementById('cust-eng-name').value.trim();
            const contact = document.getElementById('cust-contact').value.trim();

            if (!korName || !engName || !contact) { alert('대표자 정보를 입력해 주세요.'); return; }

            const updatedItems = [...data.items];
            let allValid = true;
            let combinedReq = "";

            updatedItems.forEach((item, idx) => {
                const dateEl = document.getElementById(`date-${idx}`);
                const optEl = document.getElementById(`opt-${idx}`);
                
                if (!dateEl.value) { alert(`[${item.name}] 날짜를 선택해 주세요.`); allValid = false; return; }
                if (!isDateAllowed(item.name, dateEl.value)) { 
                    alert(`[${item.name}] 이용 가능 날짜를 확인해 주세요. (홀수/짝수일)`); 
                    allValid = false; return; 
                }

                item.date = dateEl.value;
                if (optEl) {
                    item.time = optEl.value.split('(')[0].trim();
                    item.option = optEl.value;
                }

                const config = getProductConfig(item.name);
                let specStr = `[${item.name}] `;
                const specInput = document.getElementById(`spec-${idx}`);
                if (specInput && specInput.value) specStr += `${specInput.placeholder}: ${specInput.value} / `;
                
                item.requests = specStr;
                combinedReq += specStr + "\n";
            });

            // 픽업 정보 공통 수집
            const pFlight = document.getElementById('p-flight')?.value;
            const sFlight = document.getElementById('s-flight')?.value;
            const resort = document.getElementById('p-resort')?.value;
            const exVal = document.getElementById('p-exchange')?.value;
            if (pFlight || resort) combinedReq += `[공통 항공/호텔] 픽업:${pFlight} / 샌딩:${sFlight} / 리조트:${resort} / 환전:${exVal}`;

            if (!allValid) return;

            try {
                await updateDoc(docRef, {
                    customerKorName: korName, engName: engName, contact: contact,
                    items: updatedItems, requests: combinedReq, status: '입금확인요청', updatedAt: new Date()
                });
                document.getElementById('success-overlay').style.display = 'flex';
            } catch (e) { alert('저장 실패'); }
        };

        document.getElementById('loading').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

    } catch (e) { console.error(e); }
}

function renderProductFields(items) {
    const container = document.getElementById('dynamic-product-fields');
    let html = "";
    
    const hasPickupItem = items.some(it => it.name.includes('픽업') || it.name.includes('샌딩'));
    if (hasPickupItem) {
        html += `
            <div class="product-spec-box">
                <div class="product-spec-title"><span class="material-icons">flight_takeoff</span> ✈️ 픽업/샌딩 상세 정보</div>
                <div class="input-group"><label>픽업 항공편명 (인천➔칼리보)</label><input type="text" id="p-flight" placeholder="예: TW123 (14:00 도착)"></div>
                <div class="input-group"><label>픽업 리조트/호텔 (첫날)</label><input type="text" id="p-resort" placeholder="체크인 숙소명"></div>
                <div class="input-group"><label>샌딩 항공편명 (칼리보➔인천)</label><input type="text" id="s-flight" placeholder="예: TW124 (23:00 출발)"></div>
                <div class="input-group"><label>샌딩 리조트/호텔 (마지막날)</label><input type="text" id="s-resort" placeholder="체크아웃 숙소명"></div>
                <div class="input-group"><label>환전 요청 금액 (달러 ➔ 페소)</label><input type="text" id="p-exchange" placeholder="예: 200달러"></div>
            </div>
        `;
    }

    items.forEach((item, idx) => {
        const config = getProductConfig(item.name);
        
        html += `
            <div class="product-spec-box">
                <div class="product-spec-title"><span class="material-icons">event_note</span> ${item.name} 상세 설정</div>
                
                <div class="input-group calendar-wrap">
                    <label>이용 날짜 선택<span>*</span></label>
                    <input type="date" id="date-${idx}" min="${new Date().toISOString().split('T')[0]}">
                    <span class="material-icons calendar-input-icon">calendar_today</span>
                    ${item.name.includes('블랙펄') ? '<p style="font-size:11px; color:#ff6a00; font-weight:700;">※ 홀수일에만 운영됩니다.</p>' : ''}
                    ${item.name.includes('말룸파티') ? '<p style="font-size:11px; color:#ff6a00; font-weight:700;">※ 짝수일에만 운영됩니다.</p>' : ''}
                </div>

                <div class="input-group">
                    <label>${item.name.includes('호핑') ? '점심 포함 여부 및 시간' : '미팅/예약 시간 선택'}</label>
                    <select id="opt-${idx}">
                        ${config.options.map(o => `<option value="${o}">${o}</option>`).join('')}
                    </select>
                </div>

                <div class="input-group">
                    <label>${config.hasPickup ? '미팅 장소 (리조트 로비)' : '<span style="color:#ff4b4b;">미팅 장소 (직접 이동 상품)</span>'}</label>
                    <input type="text" id="spec-${idx}" placeholder="${config.hasPickup ? '숙소 이름을 적어주세요' : config.meetingPoint}">
                    ${!config.hasPickup ? `<p style="font-size:11px; color:#888; margin-top:5px;">※ 이 상품은 픽업이 포함되지 않습니다. 안내된 장소로 직접 오셔야 합니다.</p>` : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

loadQuote();
