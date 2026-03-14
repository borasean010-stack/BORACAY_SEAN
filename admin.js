// admin.js - Naver SmartStore Perfect 연동 로직
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
        } else { alert('로그인 실패'); }
    };

    document.getElementById('logout-btn').onclick = () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        location.reload();
    };

    function showAdminPanel() {
        loginContainer.style.display = 'none';
        adminContainer.style.display = 'flex';
        document.getElementById('display-admin-id').innerText = sessionStorage.getItem('adminId') || '관리자';
        
        archivePastConfirmed();
        fetchData();
    }

    // --- 2. Data Handlers ---
    async function archivePastConfirmed() {
        const today = new Date().toISOString().split('T')[0];
        const q = query(collection(db, "reservations"), where("status", "==", "예약확정"));
        const snap = await getDocs(q);
        snap.forEach(async (d) => {
            const data = d.data();
            const tourDate = data.date || (data.items && data.items[0]?.date) || "";
            if (tourDate && tourDate < today) {
                await updateDoc(doc(db, "reservations", d.id), { status: "완료" });
            }
        });
    }

    function fetchData() {
        if (!db) return;
        const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
            allReservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            updateSummaryCounts();
            renderTable();
        });
    }

    function updateSummaryCounts() {
        const counts = {
            new: allReservations.filter(r => r.status === '입금대기' || r.status === '예약접수').length,
            confirmed: allReservations.filter(r => r.status === '예약확정').length,
            resorts: allReservations.filter(r => r.status === '견적').length
        };
        document.getElementById('count-new').innerText = counts.new;
        document.getElementById('count-confirmed').innerText = counts.confirmed;
        document.getElementById('count-resorts').innerText = counts.resorts;
    }

    // --- 3. Sidebar & Tab 연동 ---
    window.switchAdminTab = (tab) => {
        activeTab = tab;
        
        // UI Sync: Sidebar
        document.querySelectorAll('.ss-nav-item').forEach(el => el.classList.remove('active'));
        const sideMenu = document.getElementById(`menu-${tab}`);
        if(sideMenu) sideMenu.classList.add('active');

        // UI Sync: Top Status Cards
        document.querySelectorAll('.ss-status-card').forEach(el => el.classList.remove('active'));
        const statusCard = document.getElementById(`tab-${tab}`);
        if(statusCard) statusCard.classList.add('active');

        // UI Sync: Titles & Breadcrumb
        const titles = { 'new': '신규예약 관리', 'confirmed': '예약확정 내역', 'resorts': '리조트 견적 신청' };
        const crumbs = { 'new': '신규예약', 'confirmed': '예약확정', 'resorts': '리조트 견적' };
        document.getElementById('current-view-title').innerText = titles[tab];
        document.getElementById('breadcrumb-active').innerText = crumbs[tab];

        renderTable();
    };

    // --- 4. Main Rendering ---
    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        const searchTerm = document.getElementById('header-global-search').value.toLowerCase();

        let filtered = allReservations.filter(r => {
            const name = (r.customerKorName || '').toLowerCase();
            const resNo = (r.reservationNumber || '').toLowerCase();
            const matchesSearch = name.includes(searchTerm) || resNo.includes(searchTerm);
            
            let matchesTab = false;
            if (activeTab === 'new') matchesTab = (r.status === '입금대기' || r.status === '예약접수');
            else if (activeTab === 'confirmed') matchesTab = (r.status === '예약확정');
            else if (activeTab === 'resorts') matchesTab = (r.status === '견적');
            
            return matchesSearch && matchesTab;
        });

        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:100px; color:#ccc; font-size:14px;">데이터가 없습니다.</td></tr>';
            return;
        }

        filtered.forEach((res, index) => {
            const tr = document.createElement('tr');
            const status = res.status || '대기';
            
            let badgeClass = 'badge-gray';
            let actionMarkup = '';
            
            if (status === '입금대기' || status === '예약접수') {
                badgeClass = 'badge-yellow';
                actionMarkup = `<button class="btn-action-received" onclick="handleAutoConfirm('${res.id}')">입금 확인</button>`;
            } else if (status === '예약확정') {
                badgeClass = 'badge-green';
                actionMarkup = `<span style="color:var(--ss-green); font-weight:800; font-size:11px;">최종 확정</span>`;
            } else if (status === '견적') {
                badgeClass = 'badge-blue';
                actionMarkup = `<button class="btn-action-outline" onclick="handleStatusChange('${res.id}', '입금대기')">상담 완료</button>`;
            }

            const itemsText = res.items ? res.items.map(i => i.name.split('-').pop().trim()).join(', ') : '-';
            const dateStr = res.createdAt?.toDate ? res.createdAt.toDate().toLocaleDateString() : '-';

            tr.innerHTML = `
                <td><input type="checkbox" class="row-check" value="${res.id}"></td>
                <td style="color:#bbb;">${filtered.length - index}</td>
                <td style="font-weight:700;">${res.reservationNumber || '-'}</td>
                <td><b>${res.customerKorName || '미입력'}</b></td>
                <td style="max-width:250px; overflow:hidden; text-overflow:ellipsis;">${itemsText}</td>
                <td style="font-weight:800; color:#111;">₩ ${(res.totalPrice || 0).toLocaleString()}</td>
                <td style="color:#888;">${dateStr}</td>
                <td style="text-align:center;"><span class="n-badge ${badgeClass}">${status}</span></td>
                <td>
                    <div style="display:flex; gap:5px; align-items:center;">
                        ${actionMarkup}
                        <button class="btn-action-outline" onclick="showDetail('${res.id}')">상세</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    document.getElementById('header-global-search').oninput = renderTable;

    // --- 5. Global Actions ---
    window.handleAutoConfirm = async (id) => {
        if (confirm("입금을 확인하셨습니까? 확인 시 즉시 [예약확정] 처리됩니다.")) {
            try { await updateDoc(doc(db, "reservations", id), { status: "예약확정" }); } 
            catch (e) { alert('변경 실패'); }
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
        modalBody.innerHTML = `
            <div class="res-detail-grid">
                <div class="detail-item"><label>예약번호</label><div>${res.reservationNumber}</div></div>
                <div class="detail-item"><label>고객명</label><div>${res.customerKorName} (${res.engName || '-'})</div></div>
                <div class="detail-item"><label>연락처</label><div>${res.contact}</div></div>
                <div class="detail-item"><label>결제금액</label><div style="color:var(--ss-green);">₩ ${(res.totalPrice || 0).toLocaleString()}</div></div>
            </div>
            <div style="margin-top:20px; font-size:12px; color:#666; line-height:1.6;">
                <b style="color:#333;">상품 내역:</b><br>
                ${res.items ? res.items.map(i => `- ${i.name} (${i.count}명) / ${i.date || '-'} ${i.time || '-'}`).join('<br>') : '없음'}
            </div>
        `;
        document.getElementById('res-detail-modal').style.display = 'flex';
    };

    window.closeModal = () => document.getElementById('res-detail-modal').style.display = 'none';
});
