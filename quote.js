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

// --- 🏷️ 상품별 필수 입력 정보 정의 (기존 예약 폼 기준) ---
const PRODUCT_FIELDS = {
    "pickup": [
        { label: "도착 항공편명", key: "pFlight", placeholder: "예: TW123" },
        { label: "출국 항공편명", key: "sFlight", placeholder: "예: TW124" },
        { label: "숙소명", key: "resort", placeholder: "리조트 이름" }
    ],
    "massage": [
        { label: "희망 시간", key: "time", placeholder: "예: 14:00" },
        { label: "픽업 장소", key: "pickup", placeholder: "리조트 로비 등" },
        { label: "마사지 종류", key: "type", placeholder: "예: 태반, 스톤 등" }
    ],
    "tour": [
        { label: "미팅 장소", key: "meeting", placeholder: "리조트명 또는 사무실" },
        { label: "추가 요청사항", key: "note", placeholder: "특이사항 입력" }
    ],
    "default": [
        { label: "이용 희망 시간", key: "time", placeholder: "예: 10:00" },
        { label: "숙소명", key: "resort", placeholder: "머무시는 리조트" }
    ]
};

function getFieldsForProduct(name) {
    const n = name.toLowerCase();
    if (n.includes('픽업') || n.includes('샌딩')) return PRODUCT_FIELDS.pickup;
    if (n.includes('마사지') || n.includes('스파') || n.includes('에스파')) return PRODUCT_FIELDS.massage;
    if (n.includes('호핑') || n.includes('말룸')) return PRODUCT_FIELDS.tour;
    return PRODUCT_FIELDS.default;
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
        
        // 1. 기본 정보 표시
        document.getElementById('q-name').innerText = data.customerKorName || '-';
        document.getElementById('q-contact').innerText = data.contact || '-';
        document.getElementById('q-date').innerText = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : '-';
        document.getElementById('q-total').innerText = `₩ ${(data.totalPrice || 0).toLocaleString()}`;
        
        const statusMap = { '견적': '견적 확인 중', '입금대기': '입금 대기 중', '입금확인요청': '입금 확인 중', '예약확정': '예약 확정 완료' };
        document.getElementById('q-status').innerText = statusMap[data.status] || data.status;

        // 2. 상품 리스트 렌더링
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

        // 3. 상태에 따른 화면 구성
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

        // 4. 정보 입력 완료 버튼 클릭 이벤트
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

                // 상품별 상세 필드 수집
                const fields = getFieldsForProduct(item.name);
                let itemSpec = `[${item.name}] `;
                fields.forEach(f => {
                    const el = document.querySelector(`.extra-info[data-idx="${idx}"][data-key="${f.key}"]`);
                    if (el && el.value.trim()) {
                        itemSpec += `${f.label}: ${el.value.trim()} / `;
                    }
                });
                item.requests = itemSpec;
                combinedRequests += itemSpec + "\n";
            });

            if (!allDatesFilled) { alert('모든 상품의 이용 날짜를 선택해 주세요.'); return; }

            if (confirm("입력하신 정보로 예약을 확정하시겠습니까?")) {
                try {
                    await updateDoc(docRef, {
                        customerKorName: name,
                        contact: contact,
                        items: updatedItems,
                        requests: combinedRequests, // 전체 요청사항에도 합산
                        status: '입금대기',
                        updatedAt: new Date()
                    });
                    alert('정보가 성공적으로 등록되었습니다!\n이제 아래 안내된 계좌로 입금을 진행해 주세요.');
                    location.reload();
                } catch (e) { alert('오류가 발생했습니다.'); }
            }
        };

        // 5. 입금 완료 버튼 클릭 이벤트
        document.getElementById('btn-paid').onclick = async () => {
            if (confirm("입금을 완료하셨습니까? 관리자가 확인 후 확정 바우처를 보내드립니다.")) {
                try {
                    await updateDoc(docRef, { status: '입금확인요청', updatedAt: new Date() });
                    document.getElementById('success-overlay').style.display = 'flex';
                } catch (e) { alert('오류가 발생했습니다.'); }
            }
        };

    } catch (e) {
        console.error(e);
        document.getElementById('loading').innerText = "오류가 발생했습니다.";
    }
}

function renderDynamicFields(items) {
    const container = document.getElementById('dynamic-fields');
    let html = "";
    
    items.forEach((item, idx) => {
        const fields = getFieldsForProduct(item.name);
        
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
                <label style="font-size:11px; color:#888; font-weight:600;">${f.label}</label>
                <input type="text" class="extra-info" data-idx="${idx}" data-key="${f.key}" data-label="${f.label}" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:10px; box-sizing:border-box;" placeholder="${f.placeholder}">
            </div>`;
        });

        html += `</div></div>`;
    });
    
    container.innerHTML = html;
}

loadQuote();
