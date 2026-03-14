// admin.js (SmartStore Refined Logic)
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
    const loginContainer = document.getElementById('login-container');
    const adminContainer = document.getElementById('admin-container');
    const loginForm = document.getElementById('login-form');
    const tableBody = document.getElementById('admin-table-body');

    let allReservations = [];
    let activeTab = 'new'; // 'new', 'confirmed', 'resorts'

    // --- 1. Auth ---
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
            } else { alert('로그인 실패'); }
        });
    }

    document.getElementById('logout-btn').onclick = () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        location.reload();
    };

    function showAdminPanel() {
        if (loginContainer) loginContainer.style.display = 'none';
        if (adminContainer) adminContainer.style.display = 'flex';
        document.getElementById('display-admin-id').innerText = sessionStorage.getItem('adminId') || 'Admin';
        
        // 00:00 Reset Logic (Archive past confirmed items)
        archiveOldConfirmed();
        fetchReservations();
    }

    // --- 2. Data Fetch & Reset Logic ---
    async function archiveOldConfirmed() {
        if (!db) return;
        const today = new Date().toISOString().split('T')[0];
        const q = query(collection(db, "reservations"), where("status", "==", "예약확정"));
        const snapshot = await getDocs(q);
        
        snapshot.forEach(async (d) => {
            const data = d.data();
            const resDate = data.date || (data.items && data.items[0]?.date) || "";
            // 만약 예약된 날짜가 오늘 이전이라면 '아카이브' 상태로 변경
            if (resDate && resDate < today) {
                await updateDoc(doc(db, "reservations", d.id), { status: "완료" });
            }
        });
    }

    function fetchReservations() {
        if (!db) return;
        const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
            allReservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            updateTabCounts();
            renderTable();
        });
    }

    // --- 3. Tab & Filter Logic ---
    window.switchAdminTab = (tab) => {
        activeTab = tab;
        document.querySelectorAll('.tab-item').forEach(el => el.classList.remove('active'));
        document.getElementById(`tab-${tab}`).classList.add('active');
        
        const titles = { 'new': '신규 예약 (입금대기)', 'confirmed': '예약 확정 목록', 'resorts': '리조트 견적 신청' };
        document.getElementById('current-view-title').innerText = titles[tab];
        renderTable();
    };

    function updateTabCounts() {
        const counts = {
            new: allReservations.filter(r => r.status === '입금대기' || r.status === '예약접수').length,
            confirmed: allReservations.filter(r => r.status === '예약확정').length,
            resorts: allReservations.filter(r => r.status === '견적').length
        };
        document.getElementById('count-new').innerText = counts.new;
        document.getElementById('count-confirmed').innerText = counts.confirmed;
        document.getElementById('count-resorts').innerText = counts.resorts;
    }

    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        let filtered = [];
        if (activeTab === 'new') {
            filtered = allReservations.filter(r => r.status === '입금대기' || r.status === '예약접수');
        } else if (activeTab === 'confirmed') {
            filtered = allReservations.filter(r => r.status === '예약확정');
        } else if (activeTab === 'resorts') {
            filtered = allReservations.filter(r => r.status === '견적');
        }

        const searchTerm = document.getElementById('header-global-search').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(r => 
                (r.customerKorName || '').toLowerCase().includes(searchTerm) || 
                (r.reservationNumber || '').toLowerCase().includes(searchTerm)
            );
        }

        filtered.forEach((res, index) => {
            const tr = document.createElement('tr');
            
            let badgeClass = 'badge-yellow';
            let actionBtn = '';
            
            if (res.status === '입금대기' || res.status === '예약접수') {
                badgeClass = 'badge-yellow';
                actionBtn = `<button class="btn-action-received" onclick="handleDepositConfirm('${res.id}')">입금 확인</button>`;
            } else if (res.status === '예약확정') {
                badgeClass = 'badge-green';
                actionBtn = `<span style="color:#03c75a; font-weight:700;">확정완료</span>`;
            } else if (res.status === '견적') {
                badgeClass = 'badge-blue';
                actionBtn = `<button class="btn-action-outline" onclick="handleStatusChange('${res.id}', '입금대기')">견적완료</button>`;
            }

            const itemsText = res.items ? res.items.map(i => i.name.split('-').pop().trim()).join(', ') : '-';
            const dateStr = res.createdAt?.toDate ? res.createdAt.toDate().toLocaleDateString() : '-';

            tr.innerHTML = `
                <td><input type="checkbox" class="row-check" value="${res.id}"></td>
                <td style="color:#999;">${filtered.length - index}</td>
                <td style="font-weight:700;">${res.reservationNumber || '-'}</td>
                <td><b>${res.customerKorName || '미입력'}</b></td>
                <td style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${itemsText}</td>
                <td style="font-weight:800;">₩ ${(res.totalPrice || 0).toLocaleString()}</td>
                <td>${dateStr}</td>
                <td style="text-align:center;"><span class="n-badge ${badgeClass}">${res.status}</span></td>
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

    // --- 4. Actions ---
    window.handleDepositConfirm = async (id) => {
        if (confirm("입금을 확인하셨습니까? 확인 시 즉시 [예약확정] 처리됩니다.")) {
            try {
                await updateDoc(doc(db, "reservations", id), { status: "예약확정" });
            } catch (e) { alert('변경 실패'); }
        }
    };

    window.handleStatusChange = async (id, status) => {
        if (confirm(`상태를 [${status}] (으)로 변경하시겠습니까?`)) {
            await updateDoc(doc(db, "reservations", id), { status: status });
        }
    };

    window.showDetail = (id) => {
        const res = allReservations.find(r => r.id === id);
        if (!res) return;
        const modalBody = document.getElementById('modal-body');
        const itemsHtml = res.items ? res.items.map(i => `
            <div style="padding:10px; background:#f8f9fa; border-radius:4px; margin-bottom:5px; border:1px solid #eee;">
                <b>${i.name}</b> / ${i.count}명 / ${i.date || '-'} ${i.time || '-'}
            </div>
        `).join('') : '정보 없음';

        modalBody.innerHTML = `
            <div class="res-detail-grid">
                <div class="detail-item"><label>예약번호</label><div>${res.reservationNumber}</div></div>
                <div class="detail-item"><label>고객성함</label><div>${res.customerKorName} (${res.engName || '-'})</div></div>
                <div class="detail-item"><label>연락처</label><div>${res.contact}</div></div>
                <div class="detail-item"><label>총 결제액</label><div style="color:var(--n-green); font-size:16px;">₩ ${(res.totalPrice || 0).toLocaleString()}</div></div>
            </div>
            <div style="margin-top:15px;">
                <label style="font-size:11px; color:#999; font-weight:600;">🛒 상세 내역</label>
                ${itemsHtml}
            </div>
        `;
        document.getElementById('res-detail-modal').style.display = 'flex';
    };

    window.closeModal = () => document.getElementById('res-detail-modal').style.display = 'none';
});
