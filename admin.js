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
    let currentMode = 'sales'; // sales, settlement
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

    function showAdminPanel() {
        loginContainer.style.display = 'none';
        adminContainer.style.display = 'flex';
        initNavigation();
        fetchReservations();
    }

    // --- Navigation ---
    function initNavigation() {
        // Main Mode Switch (Sales vs Settlement)
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentMode = btn.dataset.mode;
                
                document.getElementById('sales-sub-nav').style.display = (currentMode === 'sales') ? 'block' : 'none';
                document.getElementById('settlement-info-bar').style.display = (currentMode === 'settlement') ? 'flex' : 'none';
                
                renderAll();
            };
        });

        // Sub Tab Switch (New -> Completed -> Confirmed)
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentTab = tab.dataset.tab;
                renderAll();
            };
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
        const products = ["공항 왕복 픽업샌딩", "블랙펄 요트호핑", "말룸파티 투어", "파라세일링"];
        const names = ["김철수", "이영희", "박지민", "최현우", "정다은"];
        const statuses = ["신규", "예약완료", "확정", "취소"];
        allReservations = Array.from({length: 15}).map((_, i) => ({
            id: `BK-${1000+i}`,
            customerKorName: names[i % names.length],
            contact: "010-1234-5678",
            items: [{name: products[i % products.length], date: getTodayStr()}],
            totalPrice: 150000,
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
        document.getElementById('cnt-new').textContent = counts.신규;
        document.getElementById('cnt-completed').textContent = counts.예약완료;
        document.getElementById('cnt-confirmed').textContent = counts.확정;

        // 정산 금액 계산
        const settleTotal = allReservations.filter(r => r.status === '확정').reduce((acc, curr) => acc + curr.totalPrice, 0);
        document.getElementById('settle-amount').textContent = `₩ ${settleTotal.toLocaleString()}`;
    }

    function renderMainTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        
        let filtered = allReservations;
        if (currentMode === 'sales') {
            filtered = allReservations.filter(r => r.status === currentTab);
            document.getElementById('view-title').textContent = `${currentTab} 내역`;
        } else {
            filtered = allReservations.filter(r => r.status === '확정');
            document.getElementById('view-title').textContent = `정산 대상 내역`;
        }

        filtered.forEach(res => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${res.id}</td>
                <td>${res.items?.[0]?.date || '-'}</td>
                <td><b>${res.customerKorName}</b></td>
                <td>${res.items?.[0]?.name}</td>
                <td>₩ ${res.totalPrice?.toLocaleString()}</td>
                <td><span class="status-badge badge-${res.status}">${res.status}</span></td>
                <td>
                    ${res.status === '신규' ? `<button class="btn-sm" onclick="updateStatus('${res.id}', '예약완료')">예약완료 처리</button>` : ''}
                    ${res.status === '예약완료' ? `<button class="btn-sm" onclick="updateStatus('${res.id}', '확정')">구매확정 처리</button>` : ''}
                    <button class="btn-sm" style="color:red" onclick="updateStatus('${res.id}', '취소')">취소</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function renderDailySchedule() {
        if (!scheduleList) return;
        const today = getTodayStr();
        const todays = allReservations.filter(res => (res.items?.[0]?.date === today) && res.status !== '취소');
        
        scheduleList.innerHTML = todays.length ? '' : '<p class="empty-msg">오늘 예정된 스케줄이 없습니다.</p>';
        todays.sort((a,b) => (a.time || '00:00').localeCompare(b.time || '00:00')).forEach(res => {
            const item = document.createElement('div');
            item.className = 'schedule-item';
            item.innerHTML = `
                <div class="time">${res.time || '종일'}</div>
                <div class="info">
                    <b>${res.customerKorName}</b> | ${res.items?.[0]?.name}
                </div>
                <div class="status badge-${res.status}">${res.status}</div>
            `;
            scheduleList.appendChild(item);
        });
    }

    function updateAlerts() {
        const newCount = allReservations.filter(r => r.status === '신규').length;
        const alertBox = document.getElementById('new-order-alert');
        const noAlert = document.getElementById('no-alert-msg');
        
        if (newCount > 0) {
            alertBox.style.display = 'block';
            noAlert.style.display = 'none';
            document.getElementById('alert-cnt').textContent = newCount;
        } else {
            alertBox.style.display = 'none';
            noAlert.style.display = 'block';
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
        const newTab = document.querySelector('[data-tab="신규"]');
        if (newTab) newTab.click();
    };

    function getTodayStr() { return new Date().toISOString().split('T')[0]; }
});
