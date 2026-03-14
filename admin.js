// admin.js - SmartStore Style Logic with Sidebar
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
    const tableBody = document.getElementById('admin-table-body');
    const loginContainer = document.getElementById('login-container');
    const adminContainer = document.getElementById('admin-container');

    let allReservations = [];
    let activeTab = 'new'; // 'new', 'confirmed', 'resorts'

    // --- 1. Authentication ---
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') { showAdminPanel(); }
    
    document.getElementById('login-form').onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('username').value;
        const pw = document.getElementById('password').value;
        const admins = { 'admin': 'sean1234!', 'luca': 'luca1', 'daemit': 'nimo@dori0902', 'windy': 'windy1' };
        if (admins[id] && admins[id] === pw) {
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            sessionStorage.setItem('adminId', id);
            showAdminPanel();
        } else { alert('아이디 또는 비밀번호가 올바르지 않습니다.'); }
    };

    document.getElementById('logout-btn').onclick = () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        location.reload();
    };

    function showAdminPanel() {
        loginContainer.style.display = 'none';
        adminContainer.style.display = 'flex';
        document.getElementById('display-admin-id').innerText = sessionStorage.getItem('adminId') || '관리자';
        fetchData();
    }

    // --- 2. Data Handling ---
    function fetchData() {
        if (!db) return;
        const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
            allReservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderTable();
        });
    }

    // --- 3. Sidebar Filtering Logic ---
    window.switchAdminTab = (tab) => {
        activeTab = tab;
        
        // Update Sidebar UI
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const activeMenu = document.getElementById(`menu-${tab}`);
        if (activeMenu) activeMenu.classList.add('active');
        
        // Update Title
        const titles = { 'new': '신규예약 관리', 'confirmed': '예약확정 내역', 'resorts': '리조트 견적 신청' };
        document.getElementById('current-view-title').innerText = titles[tab] || '예약 관리';
        
        renderTable();
    };

    // --- 4. Render Table ---
    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        const searchTerm = document.getElementById('header-global-search').value.toLowerCase();

        let filtered = allReservations.filter(r => {
            const name = (r.customerKorName || '').toLowerCase();
            const resNo = (r.reservationNumber || '').toLowerCase();
            const matchesSearch = name.includes(searchTerm) || resNo.includes(searchTerm);
            
            // Tab Filter Logic
            let matchesTab = false;
            if (activeTab === 'new') matchesTab = (r.status === '입금대기' || r.status === '예약접수');
            else if (activeTab === 'confirmed') matchesTab = (r.status === '예약확정');
            else if (activeTab === 'resorts') matchesTab = (r.status === '견적');
            
            return matchesSearch && matchesTab;
        });

        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:100px; color:#ccc;">내역이 없습니다.</td></tr>';
            return;
        }

        filtered.forEach((res, index) => {
            const tr = document.createElement('tr');
            const status = res.status || '대기';
            
            let badgeClass = 'badge-gray';
            let actionBtn = '';
            
            if (status === '입금대기' || status === '예약접수') {
                badgeClass = 'badge-yellow';
                actionBtn = `<button class="btn-action-received" onclick="handleStatusUpdate('${res.id}', '예약확정')">입금 확인</button>`;
            } else if (status === '예약확정') {
                badgeClass = 'badge-green';
                actionBtn = `<span style="color:var(--n-green); font-weight:800; font-size:11px;">최종확정</span>`;
            } else if (status === '견적') {
                badgeClass = 'badge-blue';
                actionBtn = `<button class="btn-action-outline" onclick="handleStatusUpdate('${res.id}', '입금대기')">상담완료</button>`;
            }

            const itemsText = res.items ? res.items.map(i => i.name.split('-').pop().trim()).join(', ') : '-';
            const dateStr = res.createdAt?.toDate ? res.createdAt.toDate().toLocaleDateString() : '-';

            tr.innerHTML = `
                <td><input type="checkbox" class="row-check" value="${res.id}"></td>
                <td style="color:#bbb;">${filtered.length - index}</td>
                <td style="font-weight:700;">${res.reservationNumber || '-'}</td>
                <td><b>${res.customerKorName || '미입력'}</b></td>
                <td style="max-width:220px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${itemsText}</td>
                <td style="font-weight:800;">₩ ${(res.totalPrice || 0).toLocaleString()}</td>
                <td style="color:#888;">${dateStr}</td>
                <td style="text-align:center;"><span class="n-badge ${badgeClass}">${status}</span></td>
                <td>
                    <div style="display:flex; gap:5px; align-items:center;">
                        ${actionBtn}
                        <button class="btn-action-outline" onclick="showDetail('${res.id}')">상세</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Search input event
    document.getElementById('header-global-search').oninput = renderTable;

    // --- 5. Actions ---
    window.handleStatusUpdate = async (id, newStatus) => {
        const msg = newStatus === '예약확정' ? "입금을 확인하셨습니까? 확인 시 즉시 [예약확정] 처리됩니다." : "상태를 변경하시겠습니까?";
        if (confirm(msg)) {
            try {
                await updateDoc(doc(db, "reservations", id), { status: newStatus });
            } catch (e) { alert('변경 실패'); }
        }
    };

    window.showDetail = (id) => {
        const res = allReservations.find(r => r.id === id);
        if (!res) return;
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <div class="res-detail-grid">
                <div class="detail-item"><label>예약자</label><div>${res.customerKorName} (${res.engName || '-'})</div></div>
                <div class="detail-item"><label>연락처</label><div>${res.contact}</div></div>
                <div class="detail-item"><label>예약번호</label><div>${res.reservationNumber}</div></div>
                <div class="detail-item"><label>결제금액</label><div style="color:var(--n-green); font-size:16px;">₩ ${(res.totalPrice || 0).toLocaleString()}</div></div>
            </div>
            <div style="margin-top:20px; font-size:12px; color:#666; line-height:1.6;">
                <b style="color:#333;">상품 내역:</b><br>
                ${res.items ? res.items.map(i => `- ${i.name} (${i.count}명) / ${i.date || '-'} ${i.time || '-'}`).join('<br>') : '내역 없음'}
            </div>
        `;
        document.getElementById('res-detail-modal').style.display = 'flex';
    };

    window.closeModal = () => document.getElementById('res-detail-modal').style.display = 'none';
});
