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

// --- 🏷️ 상품별 공식 미팅 시간대 ---
const PRODUCT_TIMES = {
    "에스파": ["10:00", "12:30 (AFM)", "13:00", "16:00", "17:00 (AFM)", "18:00 (AFH)", "20:00"],
    "보라스파": ["10:00", "13:00", "16:00", "20:00"],
    "루나스파": ["10:00", "13:00", "16:00", "20:00"],
    "마리스": ["10:00", "13:30", "16:30", "19:30"],
    "포세이돈": ["10:00", "13:00", "16:00", "19:00"],
    "힐롯": ["10:00", "13:00", "16:00", "19:00"],
    "카바얀": ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"],
    "아유르베다": ["10:00", "13:00", "16:00", "19:00"],
    "헬리오스": ["10:00", "13:30", "16:30", "19:30"],
    "호핑": ["12:30 (점심포함)", "13:30 (선셋)"],
    "말룸": ["09:00 (샌딩팩)", "09:40 (일반)"],
    "랜드투어": ["10:30"],
    "다이빙": ["09:00", "11:00", "13:00", "15:00"],
    "파라세일링": ["10:00", "11:00", "13:00", "14:00", "15:00"],
    "default": ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]
};

// --- 📅 날짜 제한 로직 (홀/짝) ---
function isDateAllowed(productName, dateStr) {
    if (!dateStr) return true;
    const day = new Date(dateStr).getDate();
    if (productName.includes('블랙펄') || productName.includes('호핑')) {
        return day % 2 !== 0; // 홀수일만
    }
    if (productName.includes('말룸파티')) {
        return day % 2 === 0; // 짝수일만
    }
    return true;
}

async function loadQuote() {
    const urlParams = new URLSearchParams(window.location.search);
    const quoteId = urlParams.get('id');
    
    if (!quoteId) {
        document.getElementById('loading').innerText = "견적서 ID를 확인할 수 없습니다.";
        return;
    }

    try {
        const docRef = doc(db, "reservations", quoteId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            document.getElementById('loading').innerText = "존재하지 않는 견적서입니다.";
            return;
        }

        const data = docSnap.data();
        
        // 1. 견적 상세 리스트 출력 (요청하신 형식)
        const listContainer = document.getElementById('item-list-container');
        listContainer.innerHTML = (data.items || []).map(item => `
            <div style="margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid #f5f5f5;">
                <div class="detail-row">
                    <div class="detail-label">${item.name}</div>
                    <div class="detail-value price-val">₩ ${((item.price || 0) * (item.count || 1)).toLocaleString()}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">인원</div>
                    <div class="detail-value">${item.count}명</div>
                </div>
            </div>
        `).join('');

        document.getElementById('q-total').innerText = `₩ ${(data.totalPrice || 0).toLocaleString()}`;

        // 2. 정보 입력 섹션 토글
        document.getElementById('btn-show-form').onclick = () => {
            document.getElementById('info-form-section').style.display = 'block';
            document.getElementById('btn-show-form').style.display = 'none';
            window.scrollTo({ top: document.getElementById('info-form-section').offsetTop - 50, behavior: 'smooth' });
        };

        // 3. 상품별 상세 필드 렌더링
        renderProductFields(data.items);

        // 4. 최종 예약 신청 처리
        document.getElementById('btn-final-submit').onclick = async () => {
            const korName = document.getElementById('cust-kor-name').value.trim();
            const engName = document.getElementById('cust-eng-name').value.trim();
            const contact = document.getElementById('cust-contact').value.trim();

            if (!korName || !engName || !contact) { alert('필수 기본 정보를 모두 입력해 주세요.'); return; }

            const updatedItems = [...data.items];
            let allValid = true;
            let combinedReq = "";

            // 상세 데이터 수집
            updatedItems.forEach((item, idx) => {
                const dateEl = document.getElementById(`date-${idx}`);
                const timeEl = document.getElementById(`time-${idx}`);
                
                if (!dateEl.value) { alert(`[${item.name}] 날짜를 선택해 주세요.`); allValid = false; return; }
                if (!isDateAllowed(item.name, dateEl.value)) { 
                    const msg = item.name.includes('호핑') ? '홀수일' : '짝수일';
                    alert(`[${item.name}] 상품은 ${msg}에만 이용 가능합니다.`); 
                    allValid = false; return; 
                }

                item.date = dateEl.value;
                if (timeEl) item.time = timeEl.value;

                // 픽업샌딩 전용 정보
                if (item.name.includes('픽업') || item.name.includes('샌딩')) {
                    const pFlight = document.getElementById('p-flight')?.value;
                    const sFlight = document.getElementById('s-flight')?.value;
                    const resort = document.getElementById('p-resort')?.value;
                    const exVal = document.getElementById('p-exchange')?.value;
                    
                    item.details = `픽업:${pFlight} / 샌딩:${sFlight} / 호텔:${resort} / 환전:${exVal}`;
                    combinedReq += `[픽업샌딩 정보] ${item.details}\n`;
                } else {
                    // 기타 상품 상세 정보
                    const specFields = document.querySelectorAll(`.spec-input-${idx}`);
                    let specStr = `[${item.name}] `;
                    specFields.forEach(f => { if(f.value) specStr += `${f.placeholder}:${f.value} / `; });
                    item.requests = specStr;
                    combinedReq += specStr + "\n";
                }
            });

            if (!allValid) return;

            if (confirm("정보 입력을 완료하고 입금 확인을 요청하시겠습니까?")) {
                try {
                    const btn = document.getElementById('btn-final-submit');
                    btn.disabled = true;
                    btn.innerText = "처리 중...";

                    await updateDoc(docRef, {
                        customerKorName: korName,
                        engName: engName,
                        contact: contact,
                        items: updatedItems,
                        requests: combinedReq,
                        status: '입금확인요청',
                        updatedAt: new Date()
                    });
                    document.getElementById('success-overlay').style.display = 'flex';
                } catch (e) { alert('오류가 발생했습니다. 다시 시도해 주세요.'); btn.disabled = false; }
            }
        };

        document.getElementById('loading').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

    } catch (e) { console.error(e); document.getElementById('loading').innerText = "데이터 로딩 오류"; }
}

function renderProductFields(items) {
    const container = document.getElementById('dynamic-product-fields');
    let html = "";
    
    // 픽업샌딩이 포함되어 있는지 확인 (공통 섹션으로 묶기 위해)
    const hasPickup = items.some(it => it.name.includes('픽업') || it.name.includes('샌딩'));
    if (hasPickup) {
        html += `
            <div class="product-spec-box">
                <div class="product-spec-title"><span class="material-icons">flight_takeoff</span> ✈️ 픽업/샌딩 항공 및 호텔 정보</div>
                <div class="input-group"><label>픽업 항공편명 (인천➔칼리보)</label><input type="text" id="p-flight" placeholder="예: TW123 (14:00 도착)"></div>
                <div class="input-group"><label>픽업 리조트/호텔 (첫날)</label><input type="text" id="p-resort" placeholder="체크인 하시는 숙소명"></div>
                <div class="input-group"><label>샌딩 항공편명 (칼리보➔인천)</label><input type="text" id="s-flight" placeholder="예: TW124 (23:00 출발)"></div>
                <div class="input-group"><label>샌딩 리조트/호텔 (마지막날)</label><input type="text" id="s-resort" placeholder="체크아웃 하시는 숙소명"></div>
                <div class="input-group"><label>환전 요청 금액 (달러 ➔ 페소)</label><input type="text" id="p-exchange" placeholder="예: 200달러"></div>
            </div>
        `;
    }

    items.forEach((item, idx) => {
        const isPickup = item.name.includes('픽업') || item.name.includes('샌딩');
        const times = getOptionsForProduct(item.name);
        
        html += `
            <div class="product-spec-box">
                <div class="product-spec-title"><span class="material-icons">event_note</span> ${item.name} 상세 설정</div>
                <div class="input-group calendar-wrap">
                    <label>이용 날짜 선택<span>*</span></label>
                    <input type="date" id="date-${idx}" class="item-date-input" min="${new Date().toISOString().split('T')[0]}">
                    <span class="material-icons calendar-input-icon">calendar_today</span>
                    ${item.name.includes('블랙펄') ? '<p style="font-size:11px; color:#ff6a00; margin-top:5px;">※ 홀수일에만 운영되는 상품입니다.</p>' : ''}
                    ${item.name.includes('말룸파티') ? '<p style="font-size:11px; color:#ff6a00; margin-top:5px;">※ 짝수일에만 운영되는 상품입니다.</p>' : ''}
                </div>
        `;

        if (times.length > 0) {
            html += `
                <div class="input-group">
                    <label>미팅/예약 시간 선택</label>
                    <select id="time-${idx}">
                        ${times.map(t => `<option value="${t}">${t}</option>`).join('')}
                    </select>
                </div>
            `;
        }

        // 픽업샌딩이 아닌 경우 숙소명 등 추가 입력
        if (!isPickup) {
            html += `<div class="input-group"><label>숙소명 또는 미팅장소</label><input type="text" class="spec-input-${idx}" placeholder="리조트 이름"></div>`;
        }

        html += `</div>`;
    });
    
    container.innerHTML = html;
}

function getOptionsForProduct(name) {
    for (const key in PRODUCT_TIMES) { if (name.includes(key)) return PRODUCT_TIMES[key]; }
    return [];
}

loadQuote();
