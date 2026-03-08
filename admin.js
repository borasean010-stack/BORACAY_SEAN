import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD-PLEASE-REPLACE-WITH-REAL-KEY", 
    authDomain: "boracay-sean.firebaseapp.com",
    projectId: "boracay-sean",
    storageBucket: "boracay-sean.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

let db = null;
try { const app = initializeApp(firebaseConfig); db = getFirestore(app); } catch (e) {}

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const adminContainer = document.getElementById('admin-container');
    const loginForm = document.getElementById('login-form');
    const reservationsBody = document.getElementById('reservations-body');
    const dateSelector = document.getElementById('date-selector');
    const dateResList = document.getElementById('date-res-list');

    let allReservations = [];

    // --- Authentication ---
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') { showAdminPanel(); }
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (document.getElementById('username').value === 'luca' && document.getElementById('password').value === 'luca1') {
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                showAdminPanel();
            } else { alert('인증 실패'); }
        });
    }

    function showAdminPanel() {
        loginContainer.style.display = 'none';
        adminContainer.style.display = 'flex';
        fetchReservations();
        setupSidebar();
    }

    function setupSidebar() {
        const menuItems = document.querySelectorAll('.menu-item.has-sub');
        menuItems.forEach(item => {
            item.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                item.classList.toggle('active');
            });
        });
    }

    // --- Data Fetching ---
    function fetchReservations() {
        if (!db) { useFallback(); return; }
        const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
            allReservations = [];
            snapshot.forEach((doc) => allReservations.push({ id: doc.id, ...doc.data() }));
            if (allReservations.length === 0) useFallback();
            else renderAll();
        }, () => useFallback());
    }

    function useFallback() {
        // 모든 상품에 대한 대량 가상 데이터 생성
        const products = [
            "공항 왕복 픽업샌딩", "블랙펄 요트호핑투어", "시크릿가든 말룸파티",
            "프리다이빙 체험", "보라카이 랜드투어", "JL 스냅사진 촬영",
            "보라아재 호핑투어", "파라세일링", "체험 다이빙", "헬멧 다이빙",
            "제트스키", "비치 아일랜드 투어", "선셋 세일링",
            "아유르베다 스파", "에스파 (S-SPA)", "포세이돈 스파",
            "마리스 스파", "카바얀 스파", "루나 스파", "보라스파", "헬리오스 스파"
        ];
        
        const names = ["김철수", "이영희", "박지민", "최현우", "정다은", "강민경", "윤도현", "송중기", "한소희", "유재석"];
        const statuses = ["신규", "확정", "정산완료", "취소"];
        
        allReservations = products.map((prod, i) => {
            const status = statuses[i % statuses.length];
            return {
                id: `mock-${i}`,
                customerKorName: names[i % names.length],
                contact: `010-${1000+i}-${2000+i}`,
                items: [{name: prod, date: "2024-03-15"}],
                totalPrice: 50000 + (i * 10000),
                status: status,
                createdAt: {seconds: (Date.now()/1000) - (i * 3600)}
            };
        });

        // 사용자가 방금 직접 예약한 정보가 있다면 상단에 추가
        const lastLocal = JSON.parse(localStorage.getItem('last_booking_info') || 'null');
        if (lastLocal) allReservations.unshift({ id: 'local-temp', ...lastLocal });

        renderAll();
    }

    function renderAll() {
        renderMainTable(allReservations);
        updateDashboardStats();
        renderDateList();
    }

    function updateDashboardStats() {
        const counts = {
            new: allReservations.filter(r => r.status === '신규').length,
            confirmed: allReservations.filter(r => r.status === '확정').length,
            settled: allReservations.filter(r => r.status === '정산완료').length,
            cancelled: allReservations.filter(r => r.status === '취소' || r.status === '환불완료').length
        };
        if(document.getElementById('count-new')) document.getElementById('count-new').textContent = counts.new;
        if(document.getElementById('count-confirmed')) document.getElementById('count-confirmed').textContent = counts.confirmed;
        if(document.getElementById('count-settled')) document.getElementById('count-settled').textContent = counts.settled;
        if(document.getElementById('count-cancelled')) document.getElementById('count-cancelled').textContent = counts.cancelled;
    }

    function renderMainTable(data) {
        if (!reservationsBody) return;
        reservationsBody.innerHTML = '';
        data.forEach(res => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(res.createdAt)}</td>
                <td><b>${res.customerKorName}</b><br><small>${res.contact}</small></td>
                <td>${res.items?.[0]?.name || '상품정보없음'}</td>
                <td>₩ ${res.totalPrice?.toLocaleString()}</td>
                <td><span class="status-badge badge-${getStatusKey(res.status)}">${res.status}</span></td>
                <td>
                    <button class="btn-sm" onclick="updateStatus('${res.id}', '확정')">확정</button>
                    <button class="btn-sm btn-refund" onclick="updateStatus('${res.id}', '취소')">취소/환불</button>
                    <button class="btn-sm" onclick="updateStatus('${res.id}', '정산완료')">정산</button>
                </td>
            `;
            reservationsBody.appendChild(row);
        });
    }

    dateSelector?.addEventListener('change', renderDateList);
    function renderDateList() {
        if (!dateResList || !dateSelector.value) return;
        const selectedDate = dateSelector.value;
        const filtered = allReservations.filter(res => {
            const resDate = res.items?.[0]?.date || formatDate(res.createdAt, true);
            return resDate === selectedDate;
        });

        dateResList.innerHTML = filtered.length ? '' : '<p class="empty-msg">해당 날짜에 예약이 없습니다.</p>';
        filtered.forEach(res => {
            const div = document.createElement('div');
            div.className = 'date-res-item';
            div.innerHTML = `
                <div class="time">${res.status}</div>
                <div class="name">${res.customerKorName} (${res.contact})</div>
                <div class="tour">${res.items?.[0]?.name}</div>
            `;
            dateResList.appendChild(div);
        });
    }

    window.updateStatus = async (id, newStatus) => {
        if (confirm(`상태를 '${newStatus}'(으)로 변경하시겠습니까?`)) {
            if (db && !id.includes('mock') && !id.includes('local')) {
                await updateDoc(doc(db, "reservations", id), { status: newStatus });
            } else {
                const idx = allReservations.findIndex(r => r.id === id);
                if (idx !== -1) { allReservations[idx].status = newStatus; renderAll(); }
            }
        }
    };

    function formatDate(ts, onlyDate = false) {
        if (!ts) return '-';
        const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
        if (onlyDate) return d.toISOString().split('T')[0];
        return d.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function getStatusKey(status) {
        if (status === '신규') return 'new-res';
        if (status === '확정') return 'confirmed';
        if (status === '정산완료') return 'settled';
        return 'cancelled';
    }
});
