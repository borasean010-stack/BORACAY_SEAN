// admin.js (Advanced Filtering & Status Automation)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Config
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

    let allReservations = [];
    let currentView = 'reservations'; // reservations, tours, resorts, payments

    // --- 1. Authentication ---
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
            } else { 
                alert('아이디 또는 비밀번호가 일치하지 않습니다.'); 
            }
        });
    }

    document.getElementById('logout-btn').onclick = () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        location.reload();
    };

    function showAdminPanel() {
        if (loginContainer) loginContainer.style.display = 'none';
        if (adminContainer) adminContainer.style.display = 'flex';
        const adminId = sessionStorage.getItem('adminId') || 'Admin';
        document.getElementById('display-admin-id').innerText = adminId;
        
        initNavigation();
        fetchReservations();
    }

    // --- 2. Navigation & Titles ---
    function initNavigation() {
        document.querySelectorAll('.nav-item').forEach(btn => {
            const view = btn.dataset.view;
            if (!view) return;
            btn.onclick = () => {
                document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentView = view;
                
                // Set Dynamic Title
                let title = "예약 목록";
                if (view === 'tours') title = "투어/액티비티 예약";
                else if (view === 'resorts') title = "리조트 견적 신청";
                else if (view === 'payments') title = "결제/정산 관리";
                
                document.getElementById('current-view-title').innerText = title;
                renderTable();
            };
        });

        document.getElementById('header-global-search').oninput = () => renderTable();
        document.getElementById('side-status-filter').onchange = () => renderTable();
    }

    // --- 3. Data Fetching ---
    function fetchReservations() {
        if (!db) return;
        const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
            allReservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            updateSummaryStats();
            renderTable();
        });
    }

    // --- 4. Status Mapping & Summary ---
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
        document.getElementById('new-res-count').innerText = stats.new;
    }

    window.filterByStatus = (status) => {
        document.getElementById('side-status-filter').value = status;
        renderTable();
    };

    // --- 5. Main Table Rendering ---
    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        const searchTerm = document.getElementById('header-global-search').value.toLowerCase();
        const statusFilter = document.getElementById('side-status-filter').value;

        let filtered = allReservations.filter(r => {
            const name = (r.customerKorName || '').toLowerCase();
            const resNo = (r.reservationNumber || '').toLowerCase();
            const matchesSearch = name.includes(searchTerm) || resNo.includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        // --- Category Filtering Logic ---
        if (currentView === 'tours') {
            filtered = filtered.filter(r => r.items && r.items.some(i => !i.name.includes('리조트')));
        } else if (currentView === 'resorts') {
            filtered = filtered.filter(r => r.items && r.items.some(i => i.name.includes('리조트')));
        }

        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:50px; color:#999;">내역이 없습니다.</td></tr>';
            return;
        }

        filtered.forEach((res, index) => {
            const tr = document.createElement('tr');
            
            // Badge & Action Logic
            let statusMarkup = '';
            let actionMarkup = '';
            
            const status = res.status || '예약접수';

            if (status === '입금대기' || status === '예약접수') {
                statusMarkup = `<span class="n-badge badge-yellow">입금대기</span>`;
                actionMarkup = `<button class="btn-action-received" onclick="handleStatusChange('${res.id}', '입금완료')">입금 확인</button>`;
            } else if (status === '예약확정') {
                statusMarkup = `<span class="n-badge badge-green">예약확정</span>`;
                actionMarkup = `<span style="color:#03c75a; font-size:11px; font-weight:700;">✅ 처리완료</span>`;
            } else if (status === '견적') {
                statusMarkup = `<span class="n-badge badge-blue">견적신청</span>`;
                actionMarkup = `<button class="btn-action-outline" onclick="handleStatusChange('${res.id}', '입금대기')">견적안내 완료</button>`;
            } else if (status === '취소') {
                statusMarkup = `<span class="n-badge badge-gray">취소됨</span>`;
                actionMarkup = `<button class="btn-action-outline" onclick="handleStatusChange('${res.id}', '입금대기')">복구</button>`;
            }

            const itemsText = res.items ? res.items.map(i => i.name.split('-').pop().trim()).join(', ') : '-';
            const dateStr = res.createdAt?.toDate ? res.createdAt.toDate().toLocaleDateString() : '-';

            tr.innerHTML = `
                <td><input type="checkbox" class="row-check" value="${res.id}"></td>
                <td style="color:#bbb; font-size:11px;">${filtered.length - index}</td>
                <td style="font-weight:700;">${res.reservationNumber || '-'}</td>
                <td><b>${res.customerKorName || '미입력'}</b></td>
                <td style="max-width:220px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    <span title="${itemsText}" style="color:#555;">${itemsText}</span>
                </td>
                <td style="font-weight:800; color:#111;">₩ ${(res.totalPrice || 0).toLocaleString()}</td>
                <td style="color:#888; font-size:12px;">${dateStr}</td>
                <td style="text-align:center;">${statusMarkup}</td>
                <td>
                    <div style="display:flex; gap:6px; align-items:center;">
                        ${actionMarkup}
                        <button class="btn-action-outline" onclick="showDetail('${res.id}')">상세</button>
                        <select class="btn-action-more" onchange="if(this.value) handleStatusChange('${res.id}', this.value)">
                            <option value="">더보기</option>
                            <option value="취소">예약취소</option>
                            <option value="입금대기">상태리셋</option>
                        </select>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // --- 6. Status Change Logic (Automation) ---
    window.handleStatusChange = async (id, newStatus) => {
        if (!newStatus) return;
        
        let targetStatus = newStatus;
        let confirmMsg = `상태를 [${newStatus}] (으)로 변경하시겠습니까?`;
        
        // Automation: 입금완료 -> 예약확정 즉시 전환
        if (newStatus === '입금완료') {
            targetStatus = '예약확정';
            confirmMsg = `입금 확인이 되었습니까?\n확인 시 즉시 [예약확정] 상태로 변경됩니다.`;
        }

        if (confirm(confirmMsg)) {
            try {
                await updateDoc(doc(db, "reservations", id), { status: targetStatus });
            } catch (e) { alert('변경 실패'); }
        }
    };

    // --- 7. Detail View ---
    window.showDetail = (id) => {
        const res = allReservations.find(r => r.id === id);
        if (!res) return;

        const modalBody = document.getElementById('modal-body');
        const itemsHtml = res.items ? res.items.map(i => `
            <div style="padding:12px; background:#f8f9fa; border-radius:4px; margin-bottom:6px; border:1px solid #eee;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <b style="color:var(--n-green); font-size:14px;">${i.name}</b>
                        <div style="font-size:12px; color:#666; margin-top:4px;">${i.date || '-'} | ${i.time || '-'}</div>
                    </div>
                    <b style="font-size:14px;">${i.count}명</b>
                </div>
            </div>
        `).join('') : '정보 없음';

        modalBody.innerHTML = `
            <div class="res-detail-grid">
                <div class="detail-item"><label>예약번호</label><div>${res.reservationNumber || '-'}</div></div>
                <div class="detail-item"><label>현재상태</label><div><span class="n-badge badge-blue">${res.status}</span></div></div>
                <div class="detail-item"><label>고객명</label><div>${res.customerKorName} (${res.engName || '-'})</div></div>
                <div class="detail-item"><label>연락처</label><div>${res.contact}</div></div>
                <div class="detail-item"><label>총 결제금액</label><div style="color:var(--n-green); font-size:16px;">₩ ${(res.totalPrice || 0).toLocaleString()}</div></div>
                <div class="detail-item"><label>신청일시</label><div>${res.createdAt?.toDate ? res.createdAt.toDate().toLocaleString() : '-'}</div></div>
            </div>
            <div style="margin-top:20px;">
                <label style="display:block; font-size:11px; color:#999; margin-bottom:8px; font-weight:600;">🛒 예약 상품 내역</label>
                ${itemsHtml}
            </div>
            ${res.pickupDate ? `
            <div style="margin-top:15px; padding:12px; border:1px solid #ffe58f; background:#fffbe6; border-radius:4px;">
                <label style="font-weight:800; color:#d48806; display:block; margin-bottom:6px; font-size:12px;">✈️ 픽업/샌딩 상세</label>
                <div style="font-size:12px; line-height:1.5;">
                    픽업: ${res.pickupDate} (${res.pickupFlight || '-'}) / 호텔: ${res.pickupResort || '-'}<br>
                    샌딩: ${res.sendingDate} (${res.sendingFlight || '-'}) / 호텔: ${res.sendingResort || '-'}
                </div>
            </div>` : ''}
        `;
        document.getElementById('res-detail-modal').style.display = 'flex';
    };

    window.closeModal = () => {
        document.getElementById('res-detail-modal').style.display = 'none';
    };

    // Bulk Actions
    window.bulkConfirmDeposit = async () => {
        const selected = Array.from(document.querySelectorAll('.row-check:checked')).map(cb => cb.value);
        if (confirm(`${selected.length}건을 일괄 [예약확정] 처리하시겠습니까?`)) {
            for (const id of selected) { await updateDoc(doc(db, "reservations", id), { status: '예약확정' }); }
            document.getElementById('check-all').checked = false;
            updateBulkBar();
        }
    };

    window.bulkCancel = async () => {
        const selected = Array.from(document.querySelectorAll('.row-check:checked')).map(cb => cb.value);
        if (confirm(`${selected.length}건을 일괄 [취소] 처리하시겠습니까?`)) {
            for (const id of selected) { await updateDoc(doc(db, "reservations", id), { status: '취소' }); }
            document.getElementById('check-all').checked = false;
            updateBulkBar();
        }
    };

    document.getElementById('check-all').onclick = (e) => {
        document.querySelectorAll('.row-check').forEach(cb => cb.checked = e.target.checked);
        updateBulkBar();
    };

    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('row-check')) updateBulkBar();
    });

    function updateBulkBar() {
        const selected = document.querySelectorAll('.row-check:checked').length;
        const bar = document.getElementById('bulk-actions');
        if (selected > 0) {
            bar.style.display = 'flex';
            bar.querySelector('.selected-count').innerText = `${selected}개 선택됨`;
        } else {
            bar.style.display = 'none';
        }
    }
});
