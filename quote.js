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
        const docSnap = await getDoc(doc(db, "reservations", quoteId));
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // 데이터 매핑
            document.getElementById('q-name').innerText = data.customerKorName || '-';
            document.getElementById('q-contact').innerText = data.contact || '-';
            document.getElementById('q-date').innerText = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : '-';
            document.getElementById('q-total').innerText = `₩ ${(data.totalPrice || 0).toLocaleString()}`;
            
            const statusMap = {
                '견적발송': '견적 확인 중',
                '입금대기': '견적 확인 중',
                '입금확인요청': '입금 확인 중',
                '예약확정': '예약 확정 완료'
            };
            document.getElementById('q-status').innerText = statusMap[data.status] || data.status;

            // 아이템 리스트 렌더링
            const itemList = document.getElementById('item-list');
            itemList.innerHTML = (data.items || []).map(item => `
                <div class="item-card">
                    <div class="item-header">
                        <div class="item-name">${item.name}</div>
                        <div class="item-status">준비완료</div>
                    </div>
                    <div class="item-details">
                        <div class="detail-point"><span class="material-icons">calendar_today</span><b>날짜</b>${item.date || '-'}</div>
                        ${item.time ? `<div class="detail-point"><span class="material-icons">access_time</span><b>시간</b>${item.time}</div>` : ''}
                        <div class="detail-point"><span class="material-icons">people</span><b>인원</b>${item.count || '-'}명</div>
                    </div>
                </div>
            `).join('');

            // 이미 입금 확인 요청이나 확정된 경우 버튼 비활성화
            if (data.status === '입금확인요청' || data.status === '예약확정') {
                const btn = document.getElementById('btn-paid');
                btn.disabled = true;
                btn.innerHTML = `<span class="material-icons">check_circle</span> 이미 처리되었습니다`;
            }

            document.getElementById('loading').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';

            // 버튼 클릭 이벤트
            document.getElementById('btn-paid').onclick = async () => {
                if (confirm("정말로 입금을 완료하셨나요? 관리자에게 알림이 전송됩니다.")) {
                    try {
                        const btn = document.getElementById('btn-paid');
                        btn.disabled = true;
                        btn.innerText = "처리 중...";
                        
                        await updateDoc(doc(db, "reservations", quoteId), {
                            status: '입금확인요청',
                            updatedAt: new Date()
                        });
                        
                        document.getElementById('success-overlay').style.display = 'flex';
                    } catch (err) {
                        alert("오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
                        console.error(err);
                    }
                }
            };

        } else {
            document.getElementById('loading').innerText = "견적서를 찾을 수 없습니다.";
        }
    } catch (e) {
        console.error(e);
        document.getElementById('loading').innerText = "데이터를 불러오는 중 오류가 발생했습니다.";
    }
}

loadQuote();
