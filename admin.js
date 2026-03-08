import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD-PLEASE-REPLACE-WITH-REAL-KEY", 
    authDomain: "boracay-sean.firebaseapp.com",
    projectId: "boracay-sean",
    storageBucket: "boracay-sean.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

let db = null;
try { const app = initializeApp(firebaseConfig); db = getFirestore(app); } catch (e) { console.error("Firebase Init Error"); }

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const adminContainer = document.getElementById('admin-container');
    const loginForm = document.getElementById('login-form');
    const reservationsBody = document.getElementById('reservations-body');
    const dateSelector = document.getElementById('date-selector');

    let allReservations = [];

    // --- 1. 로그인 로직 ---
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') { showAdminPanel(); }
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (document.getElementById('username').value === 'luca' && document.getElementById('password').value === 'luca1') {
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                showAdminPanel();
            } else { alert('아이디 또는 비밀번호가 틀렸습니다.'); }
        });
    }

    function showAdminPanel() {
        loginContainer.style.display = 'none';
        adminContainer.style.display = 'flex';
        fetchReservations();
        setupSidebar();
    }

    function setupSidebar() {
        document.querySelectorAll('.menu-item.has-sub > a').forEach(el => {
            el.onclick = (e) => { e.preventDefault(); el.parentElement.classList.toggle('active'); };
        });
    }

    // --- 2. 데이터 불러오기 (실시간 리스너) ---
    function fetchReservations() {
        if (!db) { useFallback(); return; }
        const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
        
        // onSnapshot을 통해 DB 값이 변하면 자동으로 아래 함수가 실행됨 (실시간 카운트 업데이트의 핵심)
        onSnapshot(q, (snapshot) => {
            allReservations = [];
            snapshot.forEach((doc) => allReservations.push({ id: doc.id, ...doc.data() }));
            
            if (allReservations.length === 0) useFallback();
            else renderAll();
        }, (error) => {
            console.error("Firestore Error:", error);
            useFallback();
        });
    }

    // DB 미연동 시 테스트를 위한 가상 데이터
    function useFallback() {
        if (allReservations.length > 0 && allReservations[0].id.includes('mock')) return;
        
        const products = ["공항 왕복 픽업샌딩", "블랙펄 요트호핑투어", "시크릿가든 말룸파티", "파라세일링", "체험 다이빙", "포세이돈 스파"];
        const names = ["김철수", "이영희", "박지민", "최현우", "정다은"];
        const statuses = ["신규", "확정", "정산완료", "취소"];
        
        allReservations = Array.from({length: 12}).map((_, i) => ({
            id: `mock-${i}`,
            customerKorName: names[i % names.length],
            contact: `010-1234-${1000+i}`,
            items: [{name: products[i % products.length]}],
            totalPrice: 50000 + (i * 10000),
            status: statuses[i % statuses.length],
            createdAt: {seconds: (Date.now()/1000) - (i * 3600)}
        }));
        renderAll();
    }

    // --- 3. 렌더링 및 통계 업데이트 (핵심 포인트) ---
    function renderAll() {
        renderMainTable();
        updateDashboardStats();
    }

    function updateDashboardStats() {
        // 현재 로드된 데이터에서 상태별 갯수를 계산
        const counts = {
            new: allReservations.filter(r => r.status === '신규').length,
            confirmed: allReservations.filter(r => r.status === '확정').length,
            settled: allReservations.filter(r => r.status === '정산완료').length,
            cancelled: allReservations.filter(r => r.status === '취소' || r.status === '환불완료').length
        };

        // UI 숫자를 즉시 업데이트
        const elements = {
            'count-new': counts.new,
            'count-confirmed': counts.confirmed,
            'count-settled': counts.settled,
            'count-cancelled': counts.cancelled
        };

        for (const [id, val] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        }
    }

    function renderMainTable() {
        if (!reservationsBody) return;
        reservationsBody.innerHTML = '';
        
        allReservations.forEach(res => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(res.createdAt)}</td>
                <td><b>${res.customerKorName}</b><br><small>${res.contact}</small></td>
                <td>${res.items?.[0]?.name || '상품정보없음'}</td>
                <td>₩ ${res.totalPrice?.toLocaleString()}</td>
                <td><span class="status-badge badge-${getStatusKey(res.status)}">${res.status}</span></td>
                <td>
                    <button class="btn-sm" onclick="updateStatus('${res.id}', '확정')">확정</button>
                    <button class="btn-sm btn-refund" onclick="updateStatus('${res.id}', '취소')">취소</button>
                    <button class="btn-sm" onclick="updateStatus('${res.id}', '정산완료')">정산</button>
                </td>
            `;
            reservationsBody.appendChild(row);
        });
    }

    // --- 4. 상태 변경 함수 (버튼 클릭 시 실행) ---
    window.updateStatus = async (id, newStatus) => {
        if (!confirm(`예약 상태를 [${newStatus}](으)로 변경하시겠습니까?`)) return;

        // DB 연동 모드일 때
        if (db && !id.startsWith('mock')) {
            try {
                const docRef = doc(db, "reservations", id);
                await updateDoc(docRef, { status: newStatus });
                // onSnapshot이 있으므로 여기서 수동 렌더링을 안 해도 자동으로 바뀜
            } catch (error) {
                console.error("Update Error:", error);
                alert("상태 변경 중 오류가 발생했습니다.");
            }
        } 
        // 테스트 모드(Mock)일 때
        else {
            const idx = allReservations.findIndex(r => r.id === id);
            if (idx !== -1) {
                allReservations[idx].status = newStatus;
                renderAll(); // 수동으로 화면과 숫자 갱신
            }
        }
    };

    function formatDate(ts) {
        if (!ts) return '-';
        const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
        return d.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function getStatusKey(status) {
        if (status === '신규') return 'new-res';
        if (status === '확정') return 'confirmed';
        if (status === '정산완료') return 'settled';
        return 'cancelled';
    }
});
