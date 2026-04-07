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

// --- 🏷️ 상품별 공식 시간대 정의 (기존 상품 페이지 기준) ---
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
    "제트스키": ["10:00", "11:00", "13:00", "14:00", "15:00"],
    "골프": ["07:40"],
    "default": ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
};

const PRODUCT_FIELDS = {
    "pickup": [
        { label: "도착 항공편명", key: "pFlight", type: "text", placeholder: "예: TW123" },
        { label: "출국 항공편명", key: "sFlight", type: "text", placeholder: "예: TW124" },
        { label: "숙소명", key: "resort", type: "text", placeholder: "리조트 이름" }
    ],
    "massage": [
        { label: "예약 시간", key: "time", type: "select" },
        { label: "마사지 종류", key: "type", type: "text", placeholder: "예: 태반, 스톤 등" },
        { label: "픽업 장소", key: "pickup", type: "text", placeholder: "리조트 로비 등" }
    ],
    "activity": [
        { label: "이용 시간", key: "time", type: "select" },
        { label: "숙소명", key: "resort", type: "text", placeholder: "머무시는 리조트" }
    ],
    "tour": [
        { label: "미팅 시간", key: "time", type: "select" },
        { label: "미팅 장소", key: "meeting", type: "text", placeholder: "리조트명 또는 사무실" }
    ]
};

function getTimeOptions(name) {
    for (const key in PRODUCT_TIMES) {
        if (name.includes(key)) return PRODUCT_TIMES[key];
    }
    return PRODUCT_TIMES.default;
}

function getFieldsForProduct(name) {
    const n = name.toLowerCase();
    if (n.includes('픽업') || n.includes('샌딩')) return PRODUCT_FIELDS.pickup;
    if (n.includes('마사지') || n.includes('스파') || n.includes('에스파') || n.includes('보라') || n.includes('루나') || n.includes('마리스') || n.includes('힐롯') || n.includes('포세이돈') || n.includes('카바얀') || n.includes('헬리오스')) return PRODUCT_FIELDS.massage;
    if (n.includes('호핑') || n.includes('말룸') || n.includes('랜드')) return PRODUCT_FIELDS.tour;
    return PRODUCT_FIELDS.activity;
}

async function loadQuote() {
    const urlParams = new URLSearchParams(window.location.search);
    const quoteId = urlParams.get('id');
    
    if (!quoteId) {
        document.getElementById('loading').innerText = "견적서 ID가 올바르지 않습니다.";
        return;
    }

    try {
        const docRef = doc(db, "reservations", quoteId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            document.getElementById('loading').innerText = "견적서를 찾을 수 없습니다.";
            return;
        }

        const data = docSnap.data();
        
        document.getElementById('q-name').innerText = data.customerKorName || '-';
        document.getElementById('q-contact').innerText = data.contact || '-';
        document.getElementById('q-date').innerText = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : '-';
        document.getElementById('q-total').innerText = `₩ ${(data.totalPrice || 0).toLocaleString()}`;
        
        const statusMap = { '견적': '견적 확인 중', '입금대기': '입금 대기 중', '입금확인요청': '입금 확인 중', '예약확정': '예약 확정 완료' };
        document.getElementById('q-status').innerText = statusMap[data.status] || data.status;

        const itemList = document.getElementById('item-list');
        itemList.innerHTML = (data.items || []).map(item => `
            <div class="item-card">
                <div class="item-header">
                    <div class="item-name">${item.name}</div>
                    <div class="item-status">${data.status === '견적' ? '입력대기' : '확인완료'}</div>
                </div>
                <div class="item-details">
                    <div class="detail-point"><span class="material-icons">calendar_today</span><b>날짜</b>${item.date || '-'}</div>
                    <div class="detail-point"><span class="material-icons">people</span><b>인원</b>${item.count || '-'}명</div>
                </div>
            </div>
        `).join('');

        if (data.status === '견적') {
            document.getElementById('customer-form').style.display = 'block';
            renderDynamicFields(data.items);
        } else {
            document.getElementById('payment-section').style.display = 'block';
            if (data.status === '입금확인요청' || data.status === '예약확정') {
                const btn = document.getElementById('btn-paid');
                btn.disabled = true;
                btn.innerHTML = `<span class="material-icons">check_circle</span> 이미 처리되었습니다`;
            }
        }

        document.getElementById('loading').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        document.getElementById('btn-submit-info').onclick = async () => {
            const name = document.getElementById('input-name').value.trim();
            const contact = document.getElementById('input-contact').value.trim();
            if (!name || !contact) { alert('성함과 연락처를 입력해 주세요.'); return; }

            const updatedItems = [...data.items];
            let allDatesFilled = true;
            let combinedRequests = "";

            updatedItems.forEach((item, idx) => {
                const dateVal = document.querySelector(`.item-date-input[data-idx="${idx}"]`).value;
                if (!dateVal) allDatesFilled = false;
                item.date = dateVal;

                const fields = getFieldsForProduct(item.name);
                let itemSpec = `[${item.name}] `;
                fields.forEach(f => {
                    const el = document.querySelector(`.extra-info[data-idx="${idx}"][data-key="${f.key}"]`);
                    if (el && el.value.trim()) {
                        itemSpec += `${f.label}: ${el.value.trim()} / `;
                        if (f.key === 'time') item.time = el.value.trim().split(' ')[0]; // 시간만 추출 (괄호 제외)
                    }
                });
                item.requests = itemSpec;
                combinedRequests += itemSpec + "\n";
            });

            if (!allDatesFilled) { alert('모든 상품의 이용 날짜를 선택해 주세요.'); return; }

            if (confirm("입력하신 정보로 예약을 진행하시겠습니까?")) {
                try {
                    await updateDoc(docRef, {
                        customerKorName: name,
                        contact: contact,
                        items: updatedItems,
                        requests: combinedRequests,
                        status: '입금대기',
                        updatedAt: new Date()
                    });
                    alert('정보가 등록되었습니다! 입금 안내를 확인해 주세요.');
                    location.reload();
                } catch (e) { alert('오류가 발생했습니다.'); }
            }
        };

        document.getElementById('btn-paid').onclick = async () => {
            if (confirm("입금을 완료하셨습니까?")) {
                try {
                    await updateDoc(docRef, { status: '입금확인요청', updatedAt: new Date() });
                    document.getElementById('success-overlay').style.display = 'flex';
                } catch (e) { alert('오류가 발생했습니다.'); }
            }
        };

    } catch (e) { console.error(e); document.getElementById('loading').innerText = "오류가 발생했습니다."; }
}

function renderDynamicFields(items) {
    const container = document.getElementById('dynamic-fields');
    let html = "";
    
    items.forEach((item, idx) => {
        const fields = getFieldsForProduct(item.name);
        const timeOptions = getTimeOptions(item.name);
        
        html += `<div style="margin-top:25px; border-top:1px solid #eee; padding-top:20px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:15px;">
                <span class="material-icons" style="color:#007aff;">stars</span>
                <b style="color:#111; font-size:16px;">${item.name} (${item.count}명)</b>
            </div>
            
            <div class="info-item" style="margin-bottom:15px;">
                <label style="font-size:12px; color:#666; font-weight:700; display:block; margin-bottom:5px;">📅 이용 날짜 선택</label>
                <input type="date" class="item-date-input" data-idx="${idx}" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:10px; box-sizing:border-box;">
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">`;
        
        fields.forEach(f => {
            html += `<div>
                <label style="font-size:11px; color:#888; font-weight:600;">${f.label}</label>`;
            
            if (f.type === 'select') {
                html += `<select class="extra-info" data-idx="${idx}" data-key="${f.key}" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:10px; box-sizing:border-box; background:#fff;">
                    <option value="">시간 선택</option>
                    ${timeOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                </select>`;
            } else {
                html += `<input type="text" class="extra-info" data-idx="${idx}" data-key="${f.key}" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:10px; box-sizing:border-box;" placeholder="${f.placeholder}">`;
            }
            
            html += `</div>`;
        });

        html += `</div></div>`;
    });
    
    container.innerHTML = html;
}

loadQuote();
