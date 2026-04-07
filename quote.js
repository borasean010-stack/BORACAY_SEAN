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
                    <div class="item-status">상세확인</div>
                </div>
                <div class="item-details">
                    <div class="detail-point"><span class="material-icons">calendar_today</span><b>날짜</b>${item.date || '-'}</div>
                    <div class="detail-point"><span class="material-icons">people</span><b>인원</b>${item.count || '-'}명</div>
                </div>
            </div>
        `).join('');

        // 3. 상태에 따른 화면 구성
        if (data.status === '견적') {
            // 손님이 아직 정보를 입력하지 않은 경우 -> 입력 폼 표시
            document.getElementById('customer-form').style.display = 'block';
            renderDynamicFields(data.items);
        } else {
            // 이미 정보가 입력된 경우 -> 결제 섹션 표시
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
            const extraFields = document.querySelectorAll('.extra-info');
            extraFields.forEach(field => {
                const idx = field.dataset.idx;
                const label = field.dataset.label;
                const val = field.value.trim();
                if (val) {
                    if (!updatedItems[idx].requests) updatedItems[idx].requests = "";
                    updatedItems[idx].requests += `[${label}: ${val}] `;
                }
            });

            if (confirm("입력하신 정보로 예약을 진행하시겠습니까?")) {
                try {
                    await updateDoc(docRef, {
                        customerKorName: name,
                        contact: contact,
                        items: updatedItems,
                        status: '입금대기',
                        updatedAt: new Date()
                    });
                    alert('정보가 등록되었습니다! 이제 결제 안내에 따라 입금을 진행해 주세요.');
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
        const name = item.name.toLowerCase();
        html += `<div style="margin-top:20px; border-top:1px dashed #ddd; padding-top:15px;"><b style="color:#007aff; font-size:14px;">[${item.name}] 상세 정보</b></div>`;
        
        if (name.includes('픽업') || name.includes('샌딩')) {
            html += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                <div><label style="font-size:11px; color:#888;">항공편명</label><input type="text" class="extra-info" data-idx="${idx}" data-label="항공편" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;" placeholder="예: TW123"></div>
                <div><label style="font-size:11px; color:#888;">숙소명</label><input type="text" class="extra-info" data-idx="${idx}" data-label="숙소" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;" placeholder="리조트 이름"></div>
            </div>`;
        } else if (name.includes('마사지') || name.includes('스파')) {
            html += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                <div><label style="font-size:11px; color:#888;">희망 시간</label><input type="text" class="extra-info" data-idx="${idx}" data-label="예약시간" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;" placeholder="예: 14:00"></div>
                <div><label style="font-size:11px; color:#888;">픽업 장소</label><input type="text" class="extra-info" data-idx="${idx}" data-label="픽업지" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;" placeholder="리조트 로비 등"></div>
            </div>`;
        } else {
            html += `<div style="margin-top:10px;">
                <label style="font-size:11px; color:#888;">추가 요청사항 (선택)</label>
                <input type="text" class="extra-info" data-idx="${idx}" data-label="요청사항" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;" placeholder="특이사항이 있으면 입력해 주세요">
            </div>`;
        }
    });
    
    container.innerHTML = html;
}

loadQuote();
