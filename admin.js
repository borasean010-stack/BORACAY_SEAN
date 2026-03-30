// admin.js - Layout Re-integrated Logic
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, where, getDocs, addDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDkDjmGKQDF-0Vu2S_qtI6W5Hf2-j4tKcM",
    authDomain: "boracaysean-69b4a.firebaseapp.com",
    projectId: "boracaysean-69b4a",
    storageBucket: "boracaysean-69b4a.firebasestorage.app",
    messagingSenderId: "806585874771",
    appId: "1:806585874771:web:64a094d241730ca38109a6"
};

let db = null;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (e) {
    console.error("Firebase Init Error", e);
}

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('admin-table-body');
    const loginContainer = document.getElementById('login-container');
    const adminContainer = document.getElementById('admin-container');

    let allReservations = [];
    let allSchedules = [];
    let activeTab = 'new'; 
    let currentScheduleFilter = 'all';
    let currentScheduleDay = 'today'; 

    // 🚀 1. Login
    function showAdminPanel() {
        if (!loginContainer || !adminContainer) return;
        loginContainer.style.display = 'none';
        adminContainer.style.display = 'flex';
        const adminId = sessionStorage.getItem('adminId') || '관리자';
        const displayIdEl = document.getElementById('display-admin-id');
        if (displayIdEl) displayIdEl.innerText = adminId;
        fetchData();
    }

    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') { showAdminPanel(); }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const id = document.getElementById('username').value.trim();
            const pw = document.getElementById('password').value.trim();
            const admins = { 
                'admin': 'sean1234!', 'luca': 'luca1', 'zohan': 'zohan1', 'windy': 'windy1', 'sean': 'sean1',
                'kelly': 'kelly1', 'leo': 'leo1', 'anna': 'anna1', 'pablo': 'pablo1', 'josh': 'josh1', 'kay': 'kay1', 'tina': 'tina1'
            };
            if (admins[id] && admins[id] === pw) {
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                sessionStorage.setItem('adminId', id);
                showAdminPanel();
            } else { alert('아이디 또는 비밀번호가 올바르지 않습니다.'); }
        };
    }

    document.getElementById('logout-btn').onclick = () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        location.reload();
    };

    // 🚀 2. Data Fetching
    function fetchData() {
        if (!db) return;
        onSnapshot(query(collection(db, "reservations"), orderBy("createdAt", "desc")), (snap) => {
            allReservations = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderAll();
        });
        onSnapshot(query(collection(db, "schedules"), orderBy("date", "asc")), (snap) => {
            allSchedules = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderAll();
        });
    }

    function renderAll() {
        updateSummaryCounts();
        renderDateBoxes();
        renderSchedule();
        renderTable();
    }

    function updateSummaryCounts() {
        const counts = {
            new: allReservations.filter(r => r.status === '입금대기' || r.status === '예약접수').length,
            confirmed: allReservations.filter(r => r.status === '예약확정').length,
            resorts: allReservations.filter(r => r.status === '견적').length,
            resortConfirmed: allReservations.filter(r => r.status === '리조트확정').length
        };
        document.getElementById('count-new').innerText = counts.new;
        document.getElementById('count-confirmed').innerText = counts.confirmed;
        document.getElementById('count-resorts').innerText = counts.resorts;
        document.getElementById('count-resort-confirmed').innerText = counts.resortConfirmed;
    }

    function renderDateBoxes() {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const todayStr = new Date(now.getTime() - offset).toISOString().split('T')[0];
        const tomorrowStr = new Date(now.getTime() - offset + 86400000).toISOString().split('T')[0];
        document.getElementById('box-date-today').innerText = todayStr;
        document.getElementById('box-date-tomorrow').innerText = tomorrowStr;
    }

    // 🚀 3. Timeline / Schedule Logic
    window.switchScheduleDay = (day) => {
        currentScheduleDay = day;
        document.querySelectorAll('.tool-box').forEach(el => el.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)');
        // No specific active style needed for boxes as per wireframe, but let's keep it simple
        renderSchedule();
    };

    window.filterSchedule = (category) => {
        currentScheduleFilter = category;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if (btn.innerText.includes(category) || (category === 'all' && btn.innerText === '전체')) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        renderSchedule();
    };

    function getCategory(name) {
        if (!name) return '액티비티';
        const n = name.toLowerCase().trim();
        if (n.includes('픽업') && !n.includes('샌딩')) return '픽업';
        if (n.includes('샌딩')) return '샌딩';
        if (n.includes('호핑')) return '호핑';
        if (n.includes('말룸파티')) return '말룸파티';
        if (n.includes('마사지') || n.includes('스파') || n.includes('spa') || n.includes('에스파')) return '액티비티';
        return '액티비티';
    }

    function renderSchedule() {
        const container = document.getElementById('active-timeline');
        if (!container) return;

        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const todayStr = new Date(now.getTime() - offset).toISOString().split('T')[0];
        const tomorrowStr = new Date(now.getTime() - offset + 86400000).toISOString().split('T')[0];
        const targetDate = (currentScheduleDay === 'tomorrow') ? tomorrowStr : todayStr;

        let items = [];
        allReservations.forEach(res => {
            if (res.status.includes('확정') && res.items) {
                res.items.forEach(item => {
                    if (item.date === targetDate) {
                        items.push({ time: item.time || "09:00", name: item.name, customer: res.customerKorName, count: item.count, status: res.status, id: res.id, source: 'reservation' });
                    }
                });
            }
        });
        allSchedules.forEach(s => {
            if (s.date === targetDate) {
                items.push({ time: s.time || "09:00", name: s.name, customer: s.customerName, count: s.count, status: '스케줄', id: s.id, source: 'schedule' });
            }
        });

        if (currentScheduleFilter !== 'all') items = items.filter(i => getCategory(i.name) === currentScheduleFilter);
        items.sort((a, b) => a.time.localeCompare(b.time));

        if (items.length === 0) { container.innerHTML = `<div class="sc-empty" style="width:100%; text-align:center; padding:30px; color:#999;">일정이 없습니다.</div>`; return; }

        container.innerHTML = items.map(item => {
            const isConfirmed = item.status.includes('확정');
            return `<div class="schedule-card" onclick="showDetail('${item.id}', '${item.source}')" style="border-top-color: ${isConfirmed ? '#ff6a00' : '#00c73c'}; min-width:250px;">
                <div class="sc-status" style="background: ${isConfirmed ? '#ff6a00' : '#00c73c'}; color:white;">${item.status}</div>
                <div class="sc-time"><span class="material-icons">access_time</span> ${item.time}</div>
                <div class="sc-item">${item.name}</div>
                <div class="sc-info"><div class="sc-customer"><b>${item.customer}</b> ${item.count}명</div></div>
            </div>`;
        }).join('');
    }

    // 🚀 4. Tab / Sidebar Logic
    window.switchMainView = () => {
        document.querySelectorAll('.ss-nav-item').forEach(el => el.classList.remove('active'));
        document.querySelector('.ss-nav-item:first-child').classList.add('active');
        document.getElementById('breadcrumb-active').innerText = '메인 페이지';
        activeTab = 'all'; 
        document.getElementById('system-setup-section').style.display = 'none';
        document.getElementById('data-view-section').style.display = 'block';
        renderTable();
    };

    window.switchAdminTab = (tab) => {
        activeTab = tab;
        document.querySelectorAll('.ss-nav-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.stat-card').forEach(el => el.classList.remove('active'));
        
        const statCard = document.getElementById(`stat-${tab}`);
        if (statCard) statCard.classList.add('active');

        const bActive = document.getElementById('breadcrumb-active');
        const sysView = document.getElementById('system-setup-section');
        const dataView = document.getElementById('data-view-section');

        if (tab === 'system') {
            sysView.style.display = 'block';
            dataView.style.display = 'none';
            if (bActive) bActive.innerText = '시스템 초기화';
        } else {
            sysView.style.display = 'none';
            dataView.style.display = 'block';
            if (bActive) {
                const labels = { 'new': '신규예약', 'confirmed': '예약확정', 'resorts': '리조트 견적', 'resort-confirmed': '리조트 확정' };
                bActive.innerText = labels[tab] || '메인 페이지';
            }
            renderTable();
        }
    };

    // 🚀 5. Render Table
    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        const searchInput = document.getElementById('header-global-search');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        const filtered = allReservations.filter(r => {
            const name = (r.customerKorName || '').toLowerCase();
            const matchesSearch = name.includes(searchTerm);
            let matchesTab = true;
            if (activeTab === 'new') matchesTab = (r.status === '입금대기' || r.status === '예약접수');
            else if (activeTab === 'confirmed') matchesTab = (r.status === '예약확정');
            else if (activeTab === 'resorts') matchesTab = (r.status === '견적');
            else if (activeTab === 'resort-confirmed') matchesTab = (r.status === '리조트확정');
            return matchesSearch && matchesTab;
        });

        filtered.forEach((res, index) => {
            const tr = document.createElement('tr');
            const status = res.status || '대기';
            const firstItem = res.items?.[0]?.name || '-';
            const itemsText = firstItem + (res.items?.length > 1 ? ` 외 ${res.items.length-1}건` : '');

            let actionButtons = `<button class="btn-action-outline" onclick="showDetail('${res.id}', 'reservation')">상세</button>`;
            if (status === '예약접수' || status === '입금대기') actionButtons = `<button class="btn-action-received" onclick="handleAutoConfirm('${res.id}')">입금확인</button>` + actionButtons;
            if (status === '견적') actionButtons = `<button class="btn-action-received" onclick="handleResortQuoteComplete('${res.id}')">견적완료</button>` + actionButtons;

            tr.innerHTML = `<td><input type="checkbox"></td><td style="color:#bbb;">${filtered.length - index}</td><td>${res.reservationNumber || '-'}</td><td><div style="font-size:14px; font-weight:800;">${res.customerKorName}</div></td><td>${itemsText}</td><td>₩ ${(res.totalPrice || 0).toLocaleString()}</td><td>${res.createdAt?.toDate ? res.createdAt.toDate().toLocaleDateString() : '-'}</td><td><span class="n-badge ${status.includes('확정') ? 'badge-green' : 'badge-yellow'}">${status}</span></td><td><div style="display:flex; gap:5px;">${actionButtons}</div></td>`;
            tableBody.appendChild(tr);
        });
    }

    // 🚀 6. Input Area Controls
    window.showInputArea = (type) => {
        hideInputArea();
        document.getElementById(`input-area-${type}`).style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.hideInputArea = () => {
        document.querySelectorAll('.input-area-card').forEach(el => el.style.display = 'none');
    };

    // 🚀 7. Business Logic (Voucher, Bulk Reg)
    window.registerBulkSchedule = async () => {
        const inputVal = document.getElementById('schedule-reg-input').value.trim();
        if (!inputVal) { alert('데이터를 입력해주세요.'); return; }
        const lines = inputVal.split('\n');
        const currentYear = new Date().getFullYear();
        const batch = writeBatch(db);
        let count = 0;

        for (let line of lines) {
            const parts = line.split('\t');
            if (parts.length < 16) continue;
            const customerName = (parts[15] || '').trim();
            if (!customerName) continue;
            const engName = (parts[10] || '').trim();
            const totalPax = (parseInt(parts[11]) || 0) + (parseInt(parts[12]) || 0);
            const remarks = (parts[16] || '').replace(/^"|"$/g, '').trim();

            remarks.split('\n').forEach(rLine => {
                const dm = rLine.trim().match(/^(\d{1,2})\/(\d{1,2})/);
                if (dm) {
                    const dateStr = `${currentYear}-${dm[1].padStart(2,'0')}-${dm[2].padStart(2,'0')}`;
                    const tm = rLine.match(/(\d{1,2}):(\d{2})/);
                    let itemTime = tm ? `${tm[1].padStart(2,'0')}:${tm[2]}` : "09:00";
                    let itemName = rLine.replace(dm[0], '').replace(tm ? tm[0] : '', '').replace(/GET\$.*|잔금.*|\$.*/g, '').trim();
                    const lowerLine = rLine.toLowerCase();
                    if (lowerLine.includes('land')) { itemName = '보라카이 랜드투어'; itemTime = "10:30"; }
                    else if (lowerLine.includes('hopping')) {
                        if (lowerLine.includes('(j)')) { itemName = '블랙펄 호핑투어 (+점보크랩 점심)'; itemTime = "12:30"; }
                        else if (lowerLine.includes('(s)')) { itemName = '블랙펄 선셋 호핑투어'; itemTime = "13:30"; }
                    }
                    const isDup = allSchedules.some(s => s.customerName === customerName && s.date === dateStr && s.name === itemName);
                    if (!isDup) {
                        batch.set(doc(collection(db, "schedules")), { customerName, engName, name: itemName, date: dateStr, time: itemTime, count: totalPax, createdAt: new Date() });
                        count++;
                    }
                }
            });
        }
        if (count > 0) { await batch.commit(); alert(`${count}건의 일정이 등록되었습니다.`); hideInputArea(); }
        else alert('새로운 일정이 없습니다.');
    };

    window.makeQuickVoucher = async () => {
        const inputVal = document.getElementById('quick-voucher-input').value.trim();
        if (!inputVal) { alert('데이터를 입력해주세요.'); return; }
        const parts = inputVal.split('\t');
        if (parts.length < 16) { alert('데이터 형식이 올바르지 않습니다.'); return; }
        const currentYear = new Date().getFullYear();
        const customerName = (parts[15] || '').trim();
        const engName = (parts[10] || '').trim();
        const totalPaxCount = (parseInt(parts[11]) || 0) + (parseInt(parts[12]) || 0) + (parseInt(parts[13]) || 0);
        const agency = (parts[14] || '').trim();
        let rawEx = (parts[24] || parts[4] || '').trim();
        let exchange = (rawEx && !rawEx.includes('/') && (rawEx.includes('$') || rawEx.includes('불'))) ? rawEx : '-';
        const remarks = (parts[16] || '').replace(/^"|"$/g, '').trim();
        const items = [];
        remarks.split('\n').forEach(line => {
            const dm = line.trim().match(/^(\d{1,2})\/(\d{1,2})/);
            if (dm) {
                const dateStr = `${currentYear}-${dm[1].padStart(2,'0')}-${dm[2].padStart(2,'0')}`;
                let itemName = line.replace(dm[0], '').trim();
                let itemTime = "09:00", itemDetails = line;
                if (line.toLowerCase().includes('land')) { itemName = '보라카이 랜드투어'; itemTime = "10:30"; }
                else if (line.toLowerCase().includes('hopping')) {
                    if (line.includes('(j)')) { itemName = '블랙펄 호핑투어 (+점보크랩 점심)'; itemTime = "12:30"; }
                    else if (line.includes('(s)')) { itemName = '블랙펄 선셋 호핑투어'; itemTime = "13:30"; }
                } else if (line.includes('afh') || line.includes('afm')) { itemDetails = "투어 후 바로 이동"; itemTime = line.includes('afh') ? "18:00" : "17:00"; }
                items.push({ name: itemName, date: dateStr, time: itemTime, count: totalPaxCount, details: itemDetails });
            }
        });
        if (parts[3]?.toUpperCase() === 'TW126') items.push({ name: '✈️ 공항 샌딩 (TW126)', date: `${currentYear}-${parts[1].split('/')[0].padStart(2,'0')}-${parts[1].split('/')[1].trim().padStart(2,'0')}`, time: "08:30", count: totalPaxCount, details: "공항 샌딩" });
        items.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
        const resData = { customerKorName: `${customerName} (${engName})`, engName: exchange, contact: agency, items, status: '예약확정', exchangeAmount: `총 ${totalPaxCount}명`, createdAt: new Date() };
        const docRef = await addDoc(collection(db, "quick_vouchers"), resData);
        navigator.clipboard.writeText(`${window.location.origin}/reservation-schedule.html?id=${docRef.id}&type=quick`).then(() => alert('바우처 생성 및 링크 복사 완료!'));
        hideInputArea();
    };

    window.handleAutoConfirm = async (id) => { if (confirm("예약확정 처리를 진행합니까?")) await updateDoc(doc(db, "reservations", id), { status: "예약확정" }); };
    window.handleResortQuoteComplete = async (id) => { if (confirm("견적완료 처리를 진행합니까?")) await updateDoc(doc(db, "reservations", id), { status: "견적완료" }); };
    window.showDetail = (id, source) => {
        const res = source === 'reservation' ? allReservations.find(r => r.id === id) : allSchedules.find(s => s.id === id);
        if (!res) return;
        const body = document.getElementById('modal-body');
        body.innerHTML = `<pre style="white-space:pre-wrap; font-size:12px; background:#f8f9fa; padding:15px; border-radius:10px;">${JSON.stringify(res, null, 2)}</pre>`;
        document.getElementById('res-detail-modal').style.display = 'flex';
    };
    window.closeModal = () => { document.getElementById('res-detail-modal').style.display = 'none'; };
});
