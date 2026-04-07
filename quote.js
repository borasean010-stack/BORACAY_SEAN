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

// --- 🏷️ 상품별 옵션 데이터 ---
const PRODUCT_CONFIG = {
    "호핑": {
        label: "점심 포함 여부 및 시간",
        options: ["점심 포함 (12:30 점보크랩 미팅) - 1인 $30 현장지불", "선셋 호핑 (13:30 미팅 장소 집결)"],
        hasPickup: false,
        noMeetingInput: true // 미팅장소 입력칸 숨김
    },
    "말룸": {
        label: "투어 옵션 선택",
        options: ["일반 투어 (09:40 사무실 미팅)", "샌딩팩 (09:00 리조트 로비 미팅)"],
        hasPickup: false,
        noMeetingInput: true
    },
    "에스파": { 
        label: "예약 시간 선택",
        options: ["12:30", "14:30", "16:30", "18:30", "19:30"], 
        hasPickup: true 
    },
    "보라스파": { options: ["10:00", "13:00", "16:00", "20:00"], hasPickup: true },
    "루나스파": { options: ["10:00", "13:00", "16:00", "20:00"], hasPickup: true },
    "마리스": { options: ["10:00", "13:30", "16:30", "19:30"], hasPickup: true },
    "포세이돈": { options: ["10:00", "13:00", "16:00", "19:00"], hasPickup: true },
    "힐롯": { options: ["10:00", "13:00", "16:00", "19:00"], hasPickup: true },
    "카바얀": { options: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"], hasPickup: false },
    "default": { options: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"], hasPickup: true }
};

function getProductConfig(name) {
    for (const key in PRODUCT_CONFIG) { if (name.includes(key)) return PRODUCT_CONFIG[key]; }
    return PRODUCT_CONFIG.default;
}

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
    if (!quoteId) return;

    try {
        const docRef = doc(db, "reservations", quoteId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        
        // 견적 상세 리스트
        const listContainer = document.getElementById('item-list-container');
        listContainer.innerHTML = (data.items || []).map(item => `
            <div style="margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid #f5f5f5;">
                <div class="detail-row">
                    <div class="detail-label">${item.name}</div>
                    <div class="detail-divider"></div>
                    <div class="detail-value price-val">₩ ${((item.price || 0) * (item.count || 1)).toLocaleString()}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">인원</div>
                    <div class="detail-divider"></div>
                    <div class="detail-value">${item.count}명</div>
                </div>
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

            if (!korName || !engName || !contact) { alert('필수 정보를 모두 입력해 주세요.'); return; }

            const updatedItems = [...data.items];
            let allValid = true;
            let combinedReq = "";

            updatedItems.forEach((item, idx) => {
                // 픽업샌딩은 날짜를 공통 필드에서 가져옴 (또는 첫번째 날짜로 간주)
                if (item.name.includes('픽업') || item.name.includes('샌딩')) {
                    item.date = document.getElementById('p-flight') ? "항복정보 참조" : "-";
                    return;
                }

                const dateEl = document.getElementById(`date-${idx}`);
                const optEl = document.getElementById(`opt-${idx}`);
                
                if (dateEl && !dateEl.value) { alert(`[${item.name}] 날짜를 선택해 주세요.`); allValid = false; return; }
                if (dateEl && !isDateAllowed(item.name, dateEl.value)) { 
                    alert(`[${item.name}] 날짜를 확인해 주세요. (홀수/짝수일)`); 
                    allValid = false; return; 
                }

                if(dateEl) item.date = dateEl.value;
                if (optEl) {
                    item.time = optEl.value.split('(')[0].trim();
                    item.option = optEl.value;
                }

                const specInput = document.getElementById(`spec-${idx}`);
                if (specInput && specInput.value) {
                    item.requests = `[${item.name}] 미팅장소: ${specInput.value}`;
                    combinedReq += item.requests + "\n";
                }
            });

            if (!allValid) return;

            // 픽업샌딩 상세 정보
            const pFlight = document.getElementById('p-flight')?.value || "";
            const pResort = document.getElementById('p-resort')?.value || "";
            const sFlight = document.getElementById('s-flight')?.value || "";
            const sResort = document.getElementById('s-resort')?.value || "";
            const exchange = document.getElementById('p-exchange')?.value || "";
            
            if (pFlight || pResort) {
                combinedReq += `[픽업정보] 항공:${pFlight} / 호텔:${pResort}\n[샌딩정보] 항공:${sFlight} / 호텔:${sResort}\n[환전] ${exchange}\n`;
            }

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
                
                // 성공 시 카카오톡 채널로 자동 연결 (새 탭) 및 오버레이 표시
                window.open('http://pf.kakao.com/_zBArM/chat', '_blank');
                document.getElementById('success-overlay').style.display = 'flex';
            } catch (e) { alert('오류 발생'); btn.disabled = false; }
        };

        document.getElementById('loading').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

    } catch (e) { console.error(e); }
}

function renderProductFields(items) {
    const container = document.getElementById('dynamic-product-fields');
    let html = "";
    
    // 1. 픽업샌딩 공통 정보 (한 번만 노출)
    const hasPickup = items.some(it => it.name.includes('픽업') || it.name.includes('샌딩'));
    if (hasPickup) {
        html += `
            <div class="product-spec-box">
                <div class="product-spec-title"><span class="material-icons">flight_takeoff</span> ✈️ 픽업/샌딩 상세 정보</div>
                <div class="input-group"><label>픽업 항공편명 (인천➔칼리보)</label><input type="text" id="p-flight" placeholder="예: TW123 (14:00 도착)"></div>
                <div class="input-group"><label>픽업 리조트/호텔 (첫날)</label><input type="text" id="p-resort" placeholder="체크인 하시는 숙소명"></div>
                <div class="input-group"><label>샌딩 항공편명 (칼리보➔인천)</label><input type="text" id="s-flight" placeholder="예: TW124 (23:00 출발)"></div>
                <div class="input-group"><label>샌딩 리조트/호텔 (마지막날)</label><input type="text" id="s-resort" placeholder="체크아웃 하시는 숙소명"></div>
                <div class="input-group"><label>환전 요청 금액 (달러 ➔ 페소)</label><input type="text" id="p-exchange" placeholder="예: 200달러"></div>
            </div>
        `;
    }

    // 2. 각 상품별 상세 설정 (픽업샌딩 자체는 제외)
    items.forEach((item, idx) => {
        if (item.name.includes('픽업') || item.name.includes('샌딩')) return;

        const config = getProductConfig(item.name);
        html += `
            <div class="product-spec-box">
                <div class="product-spec-title"><span class="material-icons">event_note</span> ${item.name} 상세 설정</div>
                <div class="input-group">
                    <label>이용 날짜 선택<span>*</span></label>
                    <input type="date" id="date-${idx}" min="${new Date().toISOString().split('T')[0]}" style="font-family:inherit;">
                    ${item.name.includes('블랙펄') ? '<p style="font-size:11px; color:var(--primary); margin-top:5px; font-weight:700;">※ 홀수일에만 운영됩니다.</p>' : ''}
                    ${item.name.includes('말룸파티') ? '<p style="font-size:11px; color:var(--primary); margin-top:5px; font-weight:700;">※ 짝수일에만 운영됩니다.</p>' : ''}
                </div>
                <div class="input-group">
                    <label>${config.label || '미팅/예약 시간 선택'}</label>
                    <select id="opt-${idx}">
                        ${config.options.map(o => `<option value="${o}">${o}</option>`).join('')}
                    </select>
                </div>
        `;

        if (!config.noMeetingInput) {
            html += `
                <div class="input-group">
                    <label>${config.hasPickup ? '미팅 장소 (리조트 로비)' : '<span style="color:#ff4b4b;">미팅 장소 (직접 이동)</span>'}</label>
                    <input type="text" id="spec-${idx}" placeholder="${config.hasPickup ? '머무시는 숙소명' : '매장 또는 사무실 직접 이동'}">
                </div>
            `;
        } else {
            html += `<p style="font-size:12px; color:#888; margin-top:10px;">※ 해당 상품은 선택하신 옵션의 미팅 장소로 직접 오셔야 합니다.</p>`;
        }

        html += `</div>`;
    });
    
    container.innerHTML = html;
}

loadQuote();
