// admin.js (Advanced Logic & Final Refinement)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDkDjmGKQDF-0Vu2S_qtI6W5Hf2-j4tKcM",
    authDomain: "boracaysean-69b4a.firebaseapp.com",
    projectId: "boracaysean-69b4a",
    storageBucket: "boracaysean-69b4a.firebasestorage.app",
    messagingSenderId: "806585874771",
    appId: "1:806585874771:web:64a094d241730ca38109a6"
};

let db = null;
try { const app = initializeApp(firebaseConfig); db = getFirestore(app); } catch (e) { console.error("Firebase Init Error", e); }

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const adminContainer = document.getElementById('admin-container');
    const loginForm = document.getElementById('login-form');
    const tableBody = document.getElementById('admin-table-body');
    const titleElement = document.getElementById('current-view-title');

    let allReservations = [];
    let currentView = 'reservations'; // reservations, tours, resorts

    // --- Auth Check ---
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') { showAdminPanel(); }
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('username').value;
            const pw = document.getElementById('password').value;
            const admins = { 'admin': 'sean1234!', 'luca': 'luca1', 'daemit': 'nimo@dori0902', 'windy': 'windy1' };
            if (admins[id] && admins[id] === pw) {
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                sessionStorage.setItem('adminId', id);
                showAdminPanel();
            } else { alert('아이디 또는 비밀번호 오류'); }
        });
    }

    function showAdminPanel() {
        if (loginContainer) loginContainer.style.display = 'none';
        if (adminContainer) adminContainer.style.display = 'flex';
        initNavigation();
        fetchReservations();
    }

    // --- Navigation & Dynamic Titles ---
    function initNavigation() {
        document.querySelectorAll('.nav-item').forEach(btn => {
            const view = btn.dataset.view;
            if (!view) return;
            btn.onclick = () => {
                document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentView = view;
                
                // Dynamic Page Title
                let displayTitle = "전체 예약 목록";
                if (view === 'tours') displayTitle = "투어/액티비티 예약";
                else if (view === 'resorts') displayTitle = "리조트 견적";
                
                titleElement.innerText = displayTitle;
                renderTable();
            };
        });

        document.getElementById('header-global-search').oninput = () => renderTable();
        document.getElementById('side-status-filter').onchange = () => renderTable();
    }

    function fetchReservations() {
        if (!db) return;
        const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
            allReservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            updateSummaryStats();
            renderTable();
        });
    }

    function updateSummaryStats() {
        const stats = {
            new: allReservations.filter(r => r.status === '예약접수' || r.status === '입금대기').length,
            pending: allReservations.filter(r => r.status === '입금대기').length,
            confirmed: allReservations.filter(r => r.status === '예약확정').length,
            quote: allReservations.filter(r => r.status === '견적').length
        };
        document.getElementById('stat-new').innerText = stats.new;
        document.getElementById('stat-pending').innerText = stats.pending;
        document.getElementById('stat-confirmed').innerText = stats.confirmed;
        document.getElementById('stat-quote').innerText = stats.quote;
    }

    // --- Main Table Rendering with Advanced Filters ---
    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        const searchTerm = document.getElementById('header-global-search').value.toLowerCase();
        const statusFilter = document.getElementById('side-status-filter').value;

        // 1. Basic Filters (Search & Status)
        let filtered = allReservations.filter(r => {
            const name = (r.customerKorName || '').toLowerCase();
            const resNo = (r.reservationNumber || '').toLowerCase();
            const matchesSearch = name.includes(searchTerm) || resNo.includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        // 2. Category Filters (Menu Specific)
        if (currentView === 'tours') {
            filtered = filtered.filter(r => r.items && r.items.some(i => !i.name.includes('리조트')));
        } else if (currentView === 'resorts') {
            filtered = filtered.filter(r => r.items && r.items.some(i => i.name.includes('리조트')));
        }

        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:40px; color:#ccc;">조건에 맞는 예약이 없습니다.</td></tr>';
            return;
        }

        filtered.forEach((res, index) => {
            const tr = document.createElement('tr');
            const status = res.status || '예약접수';
            
            // UI Status Mapping
            let badgeClass = 'badge-yellow';
            let actionBtn = '';
            
            if (status === '입금대기' || status === '예약접수') {
                badgeClass = 'badge-yellow';
                actionBtn = `<button class="btn-action-received" onclick="handleStatusUpdate('${res.id}', '예약확정')">입금 확인</button>`;
            } else if (status === '예약확정') {
                badgeClass = 'badge-green';
                actionBtn = `<span style="color:#03c75a; font-weight:700; font-size:11px;">✅ 최종확정</span>`;
            } else if (status === '취소') {
                badgeClass = 'badge-red';
                actionBtn = `<button class="btn-action-outline" onclick="handleStatusUpdate('${res.id}', '입금대기')">복구</button>`;
            } else if (status === '견적') {
                badgeClass = 'badge-blue';
                actionBtn = `<button class="btn-action-outline" onclick="handleStatusUpdate('${res.id}', '입금대기')">안내완료</button>`;
            }

            const itemsText = res.items ? res.items.map(i => i.name.split('-').pop().trim()).join(', ') : '-';
            const dateStr = res.createdAt?.toDate ? res.createdAt.toDate().toLocaleDateString() : '-';

            tr.innerHTML = `
                <td><input type="checkbox" class="row-check" value="${res.id}"></td>
                <td style="color:#bbb;">${filtered.length - index}</td>
                <td style="font-weight:700; color:#333;">${res.reservationNumber || '-'}</td>
                <td><b>${res.customerKorName || '미입력'}</b></td>
                <td style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    <span title="${itemsText}">${itemsText}</span>
                </td>
                <td style="font-weight:800;">₩ ${(res.totalPrice || 0).toLocaleString()}</td>
                <td style="color:#888;">${dateStr}</td>
                <td><span class="n-badge ${badgeClass}">${status}</span></td>
                <td>
                    <div style="display:flex; gap:5px; align-items:center;">
                        ${actionBtn}
                        <button class="btn-action-outline" onclick="showDetail('${res.id}')">상세</button>
                        <select class="btn-action-more" onchange="if(this.value) handleStatusUpdate('${res.id}', this.value)">
                            <option value="">...</option>
                            <option value="취소">예약취소</option>
                            <option value="입금대기">상태리셋</option>
                        </select>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // --- Status Change with Auto Transition ---
    window.handleStatusUpdate = async (id, newStatus) => {
        if (!newStatus) return;
        const confirmMsg = newStatus === '예약확정' ? 
            "입금을 확인하셨습니까? 확인 시 즉시 [예약확정] 처리됩니다." : 
            `상태를 [${newStatus}] (으)로 변경하시겠습니까?`;

        if (confirm(confirmMsg)) {
            try {
                await updateDoc(doc(db, "reservations", id), { status: newStatus });
            } catch (e) { alert('업데이트 실패'); }
        }
    };

    // --- Detail Modal (Window scope) ---
    window.showDetail = (id) => {
        const res = allReservations.find(r => r.id === id);
        if (!res) return;
        const modalBody = document.getElementById('modal-body');
        const itemsHtml = res.items ? res.items.map(i => `
            <div style="padding:10px; background:#f8f9fa; border-radius:4px; margin-bottom:5px; border:1px solid #eee;">
                <div style="display:flex; justify-content:space-between;">
                    <b>${i.name}</b>
                    <span>${i.count}명</span>
                </div>
                <div style="font-size:12px; color:#666; margin-top:3px;">${i.date || '-'} | ${i.time || '-'}</div>
            </div>
        `).join('') : '정보 없음';

        modalBody.innerHTML = `
            <div class="res-detail-grid">
                <div class="detail-item"><label>예약번호</label><div>${res.reservationNumber || '-'}</div></div>
                <div class="detail-item"><label>현재상태</label><div><span class="n-badge badge-blue">${res.status}</span></div></div>
                <div class="detail-item"><label>고객성함</label><div>${res.customerKorName} (${res.engName || '-'})</div></div>
                <div class="detail-item"><label>연락처</label><div>${res.contact}</div></div>
                <div class="detail-item"><label>총 결제액</label><div style="color:var(--n-green); font-size:15px;">₩ ${(res.totalPrice || 0).toLocaleString()}</div></div>
                <div class="detail-item"><label>신청일시</label><div>${res.createdAt?.toDate ? res.createdAt.toDate().toLocaleString() : '-'}</div></div>
            </div>
            <div style="margin-top:15px;">
                <label style="font-size:11px; color:#999; font-weight:600;">🛒 예약 상품 내역</label>
                ${itemsHtml}
            </div>
        `;
        document.getElementById('res-detail-modal').style.display = 'flex';
    };

    window.closeModal = () => document.getElementById('res-detail-modal').style.display = 'none';
});
