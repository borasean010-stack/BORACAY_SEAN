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
    const scheduleList = document.getElementById('today-schedule-list');

    let allReservations = [];
    let currentMode = 'sales'; // sales, settlement, statistics
    let currentTab = '신규'; // 신규, 예약완료, 확정

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

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            sessionStorage.removeItem('isAdminLoggedIn');
            location.reload();
        };
    }

    function showAdminPanel() {
        if (loginContainer) loginContainer.style.display = 'none';
        if (adminContainer) adminContainer.style.display = 'flex';
        initNavigation();
        fetchReservations();
    }

    // --- Navigation ---
    function initNavigation() {
        // Sidebar Buttons
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            if (btn.classList.contains('logout-trigger')) return;
            btn.onclick = () => {
                document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                currentMode = btn.dataset.mode;
                if (btn.dataset.tab) {
                    currentTab = btn.dataset.tab;
                    // Sync summary card active state
                    document.querySelectorAll('.summary-card').forEach(sc => {
                        sc.classList.toggle('active', sc.dataset.tab === currentTab);
                    });
                }
                
                renderAll();
            };
        });

        // Summary Cards (Dashboard)
        document.querySelectorAll('.summary-card').forEach(card => {
            if (!card.dataset.tab) return;
            card.onclick = () => {
                currentTab = card.dataset.tab;
                currentMode = 'sales';
                
                // Sync sidebar active state
                document.querySelectorAll('.sidebar-btn').forEach(b => {
                    b.classList.toggle('active', b.dataset.tab === currentTab);
                });
                
                renderAll();
            };
        });

        // Search Logic
        const searchInput = document.getElementById('res-search');
        if (searchInput) {
            searchInput.oninput = () => renderMainTable(searchInput.value.toLowerCase());
        }
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
        const products = ["공항 왕복 픽업샌딩", "블랙펄 요트호핑", "말룸파티 투어", "파라세일링"];
        const names = ["김철수", "이영희", "박지민", "최현우", "정다은"];
        const statuses = ["신규", "예약완료", "확정", "취소"];
        allReservations = Array.from({length: 15}).map((_, i) => ({
            id: `BK-${1000+i}`,
            customerKorName: names[i % names.length],
            contact: "010-1234-5678",
            items: [{name: products[i % products.length], date: getTodayStr()}],
            totalPrice: 150000 + (i * 1000),
            status: statuses[i % statuses.length],
            createdAt: {seconds: (Date.now()/1000) - (i * 3600)}
        }));
        renderAll();
    }

    // --- Rendering ---
    function renderAll() {
        updateCounters();
        renderMainTable();
        renderDailySchedule();
        updateAlerts();
    }

    function updateCounters() {
        const counts = {
            신규: allReservations.filter(r => r.status === '신규').length,
            예약완료: allReservations.filter(r => r.status === '예약완료').length,
            확정: allReservations.filter(r => r.status === '확정').length
        };
        if (document.getElementById('cnt-new')) document.getElementById('cnt-new').textContent = counts.신규;
        if (document.getElementById('cnt-completed')) document.getElementById('cnt-completed').textContent = counts.예약완료;
        if (document.getElementById('cnt-confirmed')) document.getElementById('cnt-confirmed').textContent = counts.확정;

        // 정산 금액 계산
        const settleTotal = allReservations.filter(r => r.status === '확정').reduce((acc, curr) => acc + curr.totalPrice, 0);
        if (document.getElementById('settle-amount')) {
            document.getElementById('settle-amount').textContent = `₩ ${settleTotal.toLocaleString()}`;
        }
    }

    function renderMainTable(searchTerm = '') {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        
        let filtered = allReservations;
        
        if (currentMode === 'sales') {
            filtered = allReservations.filter(r => r.status === currentTab);
            document.getElementById('view-title').textContent = `${currentTab} 내역`;
        } else if (currentMode === 'settlement') {
            filtered = allReservations.filter(r => r.status === '확정');
            document.getElementById('view-title').textContent = `정산 대상 내역`;
        } else if (currentMode === 'statistics') {
            filtered = allReservations.filter(r => r.status !== '취소');
            document.getElementById('view-title').textContent = `전체 매출 통계`;
        }

        if (searchTerm) {
            filtered = filtered.filter(r => 
                r.customerKorName?.toLowerCase().includes(searchTerm) || 
                r.id?.toLowerCase().includes(searchTerm)
            );
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
                        ${res.status === '신규' ? `<button class="ss-btn-action" onclick="updateStatus('${res.id}', '예약완료')">예약완료</button>` : ''}
                        ${res.status === '예약완료' ? `<button class="ss-btn-action" onclick="updateStatus('${res.id}', '확정')">구매확정</button>` : ''}
                        <button class="ss-btn-action" style="color:var(--ss-danger)" onclick="updateStatus('${res.id}', '취소')">취소</button>
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
        
        scheduleList.innerHTML = todays.length ? '' : '<p class="empty-msg-v2">오늘 예정된 스케줄이 없습니다.</p>';
        todays.sort((a,b) => (a.time || '00:00').localeCompare(b.time || '00:00')).forEach(res => {
            const item = document.createElement('div');
            item.className = 'schedule-item-v2';
            item.innerHTML = `
                <div class="time-tag">${res.time || '종일'}</div>
                <div class="info">
                    <b>${res.customerKorName}</b><br>
                    <span style="color:#888; font-size:12px;">${res.items?.[0]?.name}</span>
                </div>
            `;
            scheduleList.appendChild(item);
        });
    }

    function updateAlerts() {
        const newCount = allReservations.filter(r => r.status === '신규').length;
        const alertBox = document.getElementById('new-order-alert');
        const noAlert = document.getElementById('no-alert-msg');
        
        if (newCount > 0) {
            if (alertBox) alertBox.style.display = 'block';
            if (noAlert) noAlert.style.display = 'none';
            const alertCntEl = document.getElementById('alert-cnt');
            if (alertCntEl) alertCntEl.textContent = newCount;
        } else {
            if (alertBox) alertBox.style.display = 'none';
            if (noAlert) noAlert.style.display = 'block';
        }
    }

    window.updateStatus = async (id, newStatus) => {
        if (!confirm(`[${newStatus}] 상태로 변경할까요?`)) return;
        if (db && !id.startsWith('BK-')) {
            await updateDoc(doc(db, "reservations", id), { status: newStatus });
        } else {
            const idx = allReservations.findIndex(r => r.id === id);
            if (idx !== -1) { allReservations[idx].status = newStatus; renderAll(); }
        }
    };

    window.goToNewOrders = () => {
        const newBtn = document.querySelector('[data-tab="신규"]');
        if (newBtn) newBtn.click();
    };

    function getTodayStr() { return new Date().toISOString().split('T')[0]; }
});
