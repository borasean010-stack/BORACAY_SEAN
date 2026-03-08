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
    
    const tableBody = document.getElementById('admin-table-body');
    const settleTableBody = document.getElementById('settlement-table-body');
    const scheduleList = document.getElementById('today-schedule-list');
    
    const salesView = document.getElementById('sales-view');
    const settlementView = document.getElementById('settlement-view');

    let allReservations = [];
    let currentMode = 'sales'; 
    let currentTab = '신규'; 

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

    document.getElementById('logout-btn').onclick = () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        location.reload();
    };

    function showAdminPanel() {
        loginContainer.style.display = 'none';
        adminContainer.style.display = 'flex';
        initNavigation();
        fetchReservations();
        document.getElementById('today-date-label').textContent = getTodayStr().replace(/-/g, '.');
    }

    // --- Navigation ---
    function initNavigation() {
        // Main Mode Switch (Sales vs Settlement)
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            if (btn.classList.contains('logout-trigger')) return;
            btn.onclick = () => {
                document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMode = btn.dataset.mode;
                
                salesView.style.display = (currentMode === 'sales') ? 'block' : 'none';
                settlementView.style.display = (currentMode === 'settlement') ? 'block' : 'none';
                document.getElementById('view-title').textContent = btn.textContent.trim();
                
                renderAll();
            };
        });

        // Sales Sub-tabs
        document.querySelectorAll('.summary-card').forEach(card => {
            if (!card.dataset.tab) return;
            card.onclick = () => {
                document.querySelectorAll('.summary-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                currentTab = card.dataset.tab;
                document.getElementById('table-sub-title').textContent = `${currentTab} 내역`;
                renderMainTable();
            };
        });

        // Search
        document.getElementById('res-search').oninput = (e) => renderMainTable(e.target.value.toLowerCase());
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
        const products = ["왕복 픽업샌딩", "블랙펄 요트호핑", "말룸파티 투어", "파라세일링"];
        const names = ["김철수", "이영희", "박지민", "최현우", "정다은"];
        const statuses = ["신규", "예약완료", "확정", "취소"];
        allReservations = Array.from({length: 12}).map((_, i) => ({
            id: `BK-${240300 + i}`,
            customerKorName: names[i % names.length],
            contact: "010-1234-5678",
            items: [{name: products[i % products.length], date: getTodayStr(), time: "10:00"}],
            totalPrice: 150000 + (i * 5000),
            status: statuses[i % 3], // 신규, 예약완료, 확정 위주
            createdAt: {seconds: (Date.now()/1000) - (i * 3600)}
        }));
        renderAll();
    }

    // --- Rendering ---
    function renderAll() {
        updateCounters();
        renderMainTable();
        renderDailySchedule();
        renderSettlementTable();
        updateAlerts();
    }

    function updateCounters() {
        const counts = {
            신규: allReservations.filter(r => r.status === '신규').length,
            예약완료: allReservations.filter(r => r.status === '예약완료').length,
            확정: allReservations.filter(r => r.status === '확정').length
        };
        document.getElementById('cnt-new').textContent = counts.신규;
        document.getElementById('cnt-completed').textContent = counts.예약완료;
        document.getElementById('cnt-confirmed').textContent = counts.확정;
        
        const totalSettle = allReservations.filter(r => r.status === '확정').reduce((acc, c) => acc + (c.totalPrice || 0), 0);
        document.getElementById('total-settle-amount').textContent = `₩ ${totalSettle.toLocaleString()}`;
    }

    function renderMainTable(searchTerm = '') {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        
        let filtered = allReservations.filter(r => r.status === currentTab);
        if (searchTerm) {
            filtered = filtered.filter(r => r.customerKorName.includes(searchTerm));
        }

        filtered.forEach(res => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${res.id}</td>
                <td>${res.items?.[0]?.date || '-'}</td>
                <td><b>${res.customerKorName}</b></td>
                <td>${res.items?.[0]?.name}</td>
                <td>₩ ${res.totalPrice?.toLocaleString()}</td>
                <td><span class="ss-badge ss-badge-${res.status}">${res.status}</span></td>
                <td>
                    <div style="display:flex; gap:5px; justify-content:center;">
                        ${res.status === '신규' ? `<button class="ss-btn-action" onclick="updateStatus('${res.id}', '예약완료')">예약완료 처리</button>` : ''}
                        ${res.status === '예약완료' ? `<button class="ss-btn-action" onclick="showDetail('${res.id}')">상세 일정</button>` : ''}
                        ${res.status === '예약완료' ? `<button class="ss-btn-action" onclick="updateStatus('${res.id}', '확정')">구매확정</button>` : ''}
                        ${res.status === '확정' ? `<button class="ss-btn-action" style="color:red" onclick="updateStatus('${res.id}', '취소')">취소/환불</button>` : ''}
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function renderDailySchedule() {
        if (!scheduleList) return;
        const today = getTodayStr();
        const todays = allReservations.filter(res => (res.items?.[0]?.date === today) && res.status !== '취소');
        
        if (!todays.length) {
            scheduleList.innerHTML = '<p class="empty-msg-v2">오늘 예정된 스케줄이 없습니다.</p>';
            return;
        }

        // Group by category
        const categories = {
            "픽업/샌딩": todays.filter(r => r.items[0].name.includes('픽업')),
            "호핑투어": todays.filter(r => r.items[0].name.includes('호핑')),
            "말룸파티": todays.filter(r => r.items[0].name.includes('말룸')),
            "액티비티/기타": todays.filter(r => !r.items[0].name.includes('픽업') && !r.items[0].name.includes('호핑') && !r.items[0].name.includes('말룸'))
        };

        scheduleList.innerHTML = '';
        for (const [cat, list] of Object.entries(categories)) {
            if (list.length === 0) continue;
            const group = document.createElement('div');
            group.className = 'schedule-group';
            group.innerHTML = `<div class="schedule-group-title">${cat} (${list.length})</div>`;
            list.forEach(res => {
                const item = document.createElement('div');
                item.className = 'schedule-item-v2';
                item.innerHTML = `
                    <div class="time-tag">${res.items[0].time || '종일'}</div>
                    <div class="info"><b>${res.customerKorName}</b> | ${res.items[0].name}</div>
                `;
                group.appendChild(item);
            });
            scheduleList.appendChild(group);
        }
    }

    function renderSettlementTable() {
        if (!settleTableBody) return;
        settleTableBody.innerHTML = '';
        
        const confirmed = allReservations.filter(r => r.status === '확정');
        const groupedByDate = {};

        confirmed.forEach(r => {
            const date = r.items?.[0]?.date || '미정';
            if (!groupedByDate[date]) groupedByDate[date] = { count: 0, amount: 0 };
            groupedByDate[date].count++;
            groupedByDate[date].amount += (r.totalPrice || 0);
        });

        Object.keys(groupedByDate).sort().reverse().forEach(date => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><b>${date}</b></td>
                <td>${groupedByDate[date].count}건</td>
                <td style="color:var(--ss-green); font-weight:800;">₩ ${groupedByDate[date].amount.toLocaleString()}</td>
                <td><span style="font-size:12px; color:#999;">정산 대기</span></td>
            `;
            settleTableBody.appendChild(row);
        });
    }

    function updateAlerts() {
        const newCount = allReservations.filter(r => r.status === '신규').length;
        const alertBox = document.getElementById('new-order-alert');
        const noAlert = document.getElementById('no-alert-msg');
        if (newCount > 0) {
            alertBox.style.display = 'block';
            noAlert.style.display = 'none';
        } else {
            alertBox.style.display = 'none';
            noAlert.style.display = 'block';
        }
    }

    // --- Global Functions ---
    window.updateStatus = async (id, newStatus) => {
        if (!confirm(`[${newStatus}] 상태로 변경하시겠습니까?`)) return;
        if (db && !id.startsWith('BK-')) {
            await updateDoc(doc(db, "reservations", id), { status: newStatus });
        } else {
            const idx = allReservations.findIndex(r => r.id === id);
            if (idx !== -1) { allReservations[idx].status = newStatus; renderAll(); }
        }
    };

    window.showDetail = (id) => {
        const res = allReservations.find(r => r.id === id);
        if (!res) return;
        const modal = document.getElementById('res-detail-modal');
        const body = document.getElementById('modal-body');
        
        body.innerHTML = `
            <div class="detail-row"><span class="label">예약자명</span><span class="val">${res.customerKorName}</span></div>
            <div class="detail-row"><span class="label">연락처</span><span class="val">${res.contact || '-'}</span></div>
            <div class="detail-row"><span class="label">상품명</span><span class="val">${res.items[0].name}</span></div>
            <div class="detail-row"><span class="label">이용 일자</span><span class="val">${res.items[0].date}</span></div>
            <div class="detail-row"><span class="label">이용 시간</span><span class="val">${res.items[0].time || '정보 없음'}</span></div>
            <div class="detail-row"><span class="label">결제 금액</span><span class="val">₩ ${res.totalPrice.toLocaleString()}</span></div>
            <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
            <p style="font-size:12px; color:#888;">* 세부 픽업 정보 및 요청 사항은 Firebase 실시간 데이터에서 로드됩니다.</p>
        `;
        modal.style.display = 'flex';
    };

    window.closeModal = () => document.getElementById('res-detail-modal').style.display = 'none';
    window.goToNewOrders = () => {
        const salesBtn = document.querySelector('[data-mode="sales"]');
        if (salesBtn) salesBtn.click();
        const newTab = document.querySelector('[data-tab="신규"]');
        if (newTab) newTab.click();
    };

    function getTodayStr() { return new Date().toISOString().split('T')[0]; }
});
