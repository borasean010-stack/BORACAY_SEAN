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
try { const app = initializeApp(firebaseConfig); db = getFirestore(app); } catch (e) {}

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const adminContainer = document.getElementById('admin-container');
    const loginForm = document.getElementById('login-form');
    const reservationsBody = document.getElementById('reservations-body');
    const dateSelector = document.getElementById('date-selector');
    const dateResList = document.getElementById('date-res-list');

    let allReservations = [];
    let currentTab = 'dashboard'; // 기본 탭

    // --- 1. 로그인 ---
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') { showAdminPanel(); }
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (document.getElementById('username').value === 'luca' && document.getElementById('password').value === 'luca1') {
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                showAdminPanel();
            } else { alert('실패'); }
        });
    }

    function showAdminPanel() {
        loginContainer.style.display = 'none';
        adminContainer.style.display = 'flex';
        setupSidebar();
        fetchReservations();
    }

    // --- 2. 탭 전환 및 사이드바 ---
    function setupSidebar() {
        const menuItems = document.querySelectorAll('.menu-item, .sub-menu li');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = item.getAttribute('data-tab');
                if (!tab) return;
                
                e.stopPropagation();
                currentTab = tab;

                // UI 업데이트
                document.querySelectorAll('.menu-item, .sub-menu li').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                if (item.closest('.has-sub')) item.closest('.has-sub').classList.add('active');

                // 페이지 제목 및 섹션 표시 처리
                updatePageUI();
                renderAll();
            });
        });
    }

    function updatePageUI() {
        const titleMap = {
            'dashboard': '대시보드',
            'search-all': '주문 통합 검색',
            'search-confirmed': '구매 확정 내역',
            'search-cancelled': '취소 관리'
        };
        document.getElementById('page-title').textContent = titleMap[currentTab] || '관리자';
        document.getElementById('table-title').textContent = titleMap[currentTab] || '내역';

        // 대시보드 탭에서만 현황판과 우측 패널 보이기
        const isDashboard = currentTab === 'dashboard';
        document.getElementById('status-board-section').style.display = isDashboard ? 'block' : 'none';
        document.getElementById('side-panel-section').style.display = isDashboard ? 'block' : 'none';
        
        // 그리드 조정
        document.querySelector('.dashboard-grid').style.gridTemplateColumns = isDashboard ? '1fr 320px' : '1fr';
    }

    // --- 3. 데이터 Fetching ---
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
        const products = ["공항 왕복 픽업샌딩", "블랙펄 요트호핑투어", "시크릿가든 말룸파티", "파라세일링", "체험 다이빙"];
        const names = ["김철수", "이영희", "박지민", "최현우", "정다은"];
        allReservations = Array.from({length: 15}).map((_, i) => ({
            id: `mock-${i}`,
            customerKorName: names[i % names.length],
            contact: `010-1234-${1000+i}`,
            items: [{name: products[i % products.length], date: "2024-03-15"}],
            totalPrice: 50000 + (i * 10000),
            status: i < 3 ? '신규' : (i < 8 ? '확정' : '취소'),
            createdAt: {seconds: (Date.now()/1000) - (i * 3600)}
        }));
        renderAll();
    }

    function renderAll() {
        let filtered = allReservations;
        
        // 탭별 필터링 (가장 핵심 로직)
        if (currentTab === 'search-confirmed') filtered = allReservations.filter(r => r.status === '확정');
        if (currentTab === 'search-cancelled') filtered = allReservations.filter(r => r.status === '취소');
        
        renderMainTable(filtered);
        updateDashboardStats();
        renderDateList();
    }

    function updateDashboardStats() {
        const counts = {
            new: allReservations.filter(r => r.status === '신규').length,
            confirmed: allReservations.filter(r => r.status === '확정').length,
            settled: allReservations.filter(r => r.status === '정산완료').length,
            cancelled: allReservations.filter(r => r.status === '취소').length
        };

        // 현황판 숫자
        ['count-new', 'count-confirmed', 'count-settled', 'count-cancelled'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = counts[id.replace('count-', '')] || 0;
        });

        // 사이드바 메뉴 숫자
        if (document.getElementById('menu-cnt-all')) document.getElementById('menu-cnt-all').textContent = allReservations.length;
        if (document.getElementById('menu-cnt-confirmed')) document.getElementById('menu-cnt-confirmed').textContent = counts.confirmed;
        if (document.getElementById('menu-cnt-cancelled')) document.getElementById('menu-cnt-cancelled').textContent = counts.cancelled;
    }

    function renderMainTable(data) {
        if (!reservationsBody) return;
        reservationsBody.innerHTML = '';
        data.forEach(res => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><b>${res.items?.[0]?.date || '-'}</b><br><small>${formatDate(res.createdAt)}</small></td>
                <td><b>${res.customerKorName}</b><br><small>${res.contact}</small></td>
                <td>${res.items?.[0]?.name || '-'}</td>
                <td>₩ ${res.totalPrice?.toLocaleString()}</td>
                <td><span class="status-badge badge-${getStatusKey(res.status)}">${res.status}</span></td>
                <td>
                    <button class="btn-sm" onclick="updateStatus('${res.id}', '확정')">확정</button>
                    <button class="btn-sm" style="color:red" onclick="updateStatus('${res.id}', '취소')">취소</button>
                </td>
            `;
            reservationsBody.appendChild(row);
        });
    }

    function renderDateList() {
        if (!dateResList || !dateSelector?.value) return;
        const filtered = allReservations.filter(res => (res.items?.[0]?.date || formatDate(res.createdAt, true)) === dateSelector.value);
        dateResList.innerHTML = filtered.length ? '' : '<p class="empty-msg">내역 없음</p>';
        filtered.forEach(res => {
            const div = document.createElement('div');
            div.className = 'date-res-item';
            div.innerHTML = `<div class="time">${res.status}</div><div class="name">${res.customerKorName}</div><div class="tour">${res.items?.[0]?.name}</div>`;
            dateResList.appendChild(div);
        });
    }

    window.updateStatus = async (id, newStatus) => {
        if (!confirm(`상태를 [${newStatus}](으)로 변경하시겠습니까?`)) return;
        if (db && !id.startsWith('mock')) {
            await updateDoc(doc(db, "reservations", id), { status: newStatus });
        } else {
            const idx = allReservations.findIndex(r => r.id === id);
            if (idx !== -1) { allReservations[idx].status = newStatus; renderAll(); }
        }
    };

    function formatDate(ts, onlyDate = false) {
        if (!ts) return '-';
        const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
        return onlyDate ? d.toISOString().split('T')[0] : d.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    function getStatusKey(status) {
        if (status === '신규') return 'new-res';
        if (status === '확정') return 'confirmed';
        return 'cancelled';
    }
});
