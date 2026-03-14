// admin.js - Final Guidelines Refined
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
    const titleElement = document.getElementById('current-view-title');

    let allReservations = [];
    let activeView = 'all'; // 'all', 'tours', 'resorts', 'cancelled'

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
        } else { alert('로그인 정보가 올바르지 않습니다.'); }
    };

    document.getElementById('logout-btn').onclick = () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        location.reload();
    };

    function showAdminPanel() {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('admin-container').style.display = 'flex';
        document.getElementById('display-admin-id').innerText = sessionStorage.getItem('adminId');
        
        archivePastConfirmed(); // 00:00 Reset Logic (Simulated on load)
        fetchData();
        initSidebar();
    }

    // --- 2. Sidebar & Title Control ---
    function initSidebar() {
        document.querySelectorAll('.nav-item').forEach(btn => {
            const view = btn.dataset.view;
            if (!view) return;
            btn.onclick = () => {
                document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeView = view;
                
                // Set Title Based on Guidelines
                let displayTitle = "전체 예약 목록";
                if (view === 'tours') displayTitle = "투어/액티비티 예약";
                else if (view === 'resorts') displayTitle = "리조트 견적";
                else if (view === 'cancelled') displayTitle = "취소 내역";
                
                titleElement.innerText = displayTitle;
                renderTable();
            };
        });

        document.getElementById('header-global-search').oninput = () => renderTable();
    }

    // --- 3. Data Handling ---
    function fetchData() {
        if (!db) return;
        const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
            allReservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderTable();
        });
    }

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

    // --- 4. Render Table with Filters ---
    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        const searchTerm = document.getElementById('header-global-search').value.toLowerCase();

        let filtered = allReservations.filter(r => {
            const name = (r.customerKorName || '').toLowerCase();
            const resNo = (r.reservationNumber || '').toLowerCase();
            const matchesSearch = name.includes(searchTerm) || resNo.includes(searchTerm);
            
            // View Filters
            let matchesView = true;
            if (activeView === 'tours') matchesView = r.items && r.items.some(i => !i.name.includes('리조트'));
            else if (activeView === 'resorts') matchesView = r.items && r.items.some(i => i.name.includes('리조트'));
            else if (activeView === 'cancelled') matchesView = r.status === '취소';
            else matchesView = r.status !== '취소' && r.status !== '완료';

            return matchesSearch && matchesView;
        });

        filtered.forEach((res, index) => {
            const tr = document.createElement('tr');
            const status = res.status || '예약접수';
            
            let badgeClass = 'badge-yellow';
            let actionMarkup = '';

            // Status Logic (Guidelines)
            if (status === '입금대기' || status === '예약접수') {
                badgeClass = 'badge-yellow';
                actionMarkup = `<button class="btn-action-received" onclick="handleAutoConfirm('${res.id}')">입금 완료</button>`;
            } else if (status === '예약확정') {
                badgeClass = 'badge-green';
                actionMarkup = `<span style="color:var(--n-green); font-weight:800; font-size:11px;">최종 확정</span>`;
            } else if (status === '취소') {
                badgeClass = 'badge-red';
                actionMarkup = `<button class="btn-action-outline" onclick="updateStatus('${res.id}', '입금대기')">복구</button>`;
            } else if (status === '견적') {
                badgeClass = 'badge-blue';
                actionMarkup = `<button class="btn-action-outline" onclick="updateStatus('${res.id}', '입금대기')">안내 완료</button>`;
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
                <td style="text-align:center;"><span class="n-badge ${badgeClass}">${status}</span></td>
                <td>
                    <div style="display:flex; gap:5px; align-items:center;">
                        ${actionMarkup}
                        <button class="btn-action-outline" onclick="showDetail('${res.id}')">상세</button>
                        <select class="btn-action-more" onchange="if(this.value) updateStatus('${res.id}', this.value)">
                            <option value="">...</option>
                            <option value="취소">취소</option>
                            <option value="입금대기">리셋</option>
                        </select>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // --- 5. Action Logic ---
    window.handleAutoConfirm = async (id) => {
        if (confirm("입금을 확인하셨습니까? 확인 시 즉시 [예약확정] 상태로 변경됩니다.")) {
            try {
                await updateDoc(doc(db, "reservations", id), { status: "예약확정" });
            } catch (e) { alert('변경 실패'); }
        }
    };

    window.updateStatus = async (id, status) => {
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
                <div class="detail-item"><label>고객명</label><div>${res.customerKorName} (${res.engName || '-'})</div></div>
                <div class="detail-item"><label>연락처</label><div>${res.contact}</div></div>
                <div class="detail-item"><label>예약번호</label><div>${res.reservationNumber}</div></div>
                <div class="detail-item"><label>결제금액</label><div style="color:var(--n-green);">₩ ${(res.totalPrice || 0).toLocaleString()}</div></div>
            </div>
            <div style="margin-top:15px; font-size:12px; color:#666; line-height:1.6;">
                <b style="color:#333;">선택 상품 내역:</b><br>
                ${res.items ? res.items.map(i => `- ${i.name} (${i.count}명) / ${i.date || '-'} ${i.time || '-'}`).join('<br>') : '없음'}
            </div>
        `;
        document.getElementById('res-detail-modal').style.display = 'flex';
    };

    window.closeModal = () => document.getElementById('res-detail-modal').style.display = 'none';
});
