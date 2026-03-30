// admin.js - Naver SmartStore Style + Luxury Schedule & System Logic
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
    let activeTab = 'today'; 
    let currentScheduleFilter = 'all';

    // 🚀 1. Login Logic
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
        // Reservations (Real Bookings)
        const qRes = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
        onSnapshot(qRes, (snapshot) => {
            allReservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderAll();
        });
        // Registered Schedules
        const qSched = query(collection(db, "schedules"), orderBy("date", "asc"));
        onSnapshot(qSched, (snapshot) => {
            allSchedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderAll();
        });
    }

    function renderAll() {
        updateSummaryCounts();
        renderSchedule();
        renderTable();
    }

    function updateSummaryCounts() {
        const cNew = document.getElementById('count-new');
        if (cNew) {
            cNew.innerText = allReservations.filter(r => r.status === '예약접수' || r.status === '입금대기').length;
        }
    }

    // 🚀 3. Navigation & Filtering
    window.switchAdminTab = (tab) => {
        activeTab = tab;
        document.querySelectorAll('.ss-nav-item').forEach(el => el.classList.remove('active'));
        const menuEl = document.getElementById(`menu-${tab}`) || document.getElementById(`menu-today`) || document.getElementById(`menu-tomorrow`);
        if (menuEl) menuEl.classList.add('active');

        // Hide all views
        document.querySelectorAll('.admin-view').forEach(v => v.style.display = 'none');
        const bActive = document.getElementById('breadcrumb-active');

        if (tab === 'today' || tab === 'tomorrow') {
            document.getElementById('view-schedule').style.display = 'block';
            if (bActive) bActive.innerText = (tab === 'today' ? '오늘 일정' : '내일 일정');
            renderSchedule();
        } else if (tab === 'quick') {
            document.getElementById('view-quick').style.display = 'block';
            if (bActive) bActive.innerText = '퀵바우처 생성기';
        } else if (tab === 'reg') {
            document.getElementById('view-reg').style.display = 'block';
            if (bActive) bActive.innerText = '스케줄 등록';
        } else if (tab === 'new') {
            document.getElementById('view-new').style.display = 'block';
            if (bActive) bActive.innerText = '예약 접수';
            renderTable();
        } else if (tab === 'system') {
            document.getElementById('view-system').style.display = 'block';
            if (bActive) bActive.innerText = '초기화';
        }
    };

    window.filterSchedule = (category) => {
        currentScheduleFilter = category;
        document.querySelectorAll('.s-tab').forEach(btn => {
            const txt = btn.innerText;
            if (category === 'all' && txt === '전체') btn.classList.add('active');
            else if (txt.includes(category)) btn.classList.add('active');
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

    // 🚀 4. Render Schedule (Merged from Reservations & Schedules)
    function renderSchedule() {
        const container = document.getElementById('active-timeline');
        if (!container) return;

        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const todayStr = new Date(now.getTime() - offset).toISOString().split('T')[0];
        const tomorrowStr = new Date(now.getTime() - offset + 86400000).toISOString().split('T')[0];
        const targetDate = (activeTab === 'today' || activeTab === 'tomorrow') ? (activeTab === 'today' ? todayStr : tomorrowStr) : todayStr;

        let items = [];

        // Add items from reservations (only confirmed)
        allReservations.forEach(res => {
            if (res.status === '예약확정' || res.status === '리조트확정') {
                if (res.items) {
                    res.items.forEach(item => {
                        if (item.date === targetDate) {
                            items.push({ 
                                time: item.time || "09:00", 
                                name: item.name, 
                                customer: res.customerKorName, 
                                count: item.count, 
                                status: res.status, 
                                id: res.id,
                                source: 'reservation'
                            });
                        }
                    });
                }
            }
        });

        // Add items from schedules
        allSchedules.forEach(s => {
            if (s.date === targetDate) {
                items.push({
                    time: s.time || "09:00",
                    name: s.name,
                    customer: s.customerName,
                    count: s.count,
                    status: '스케줄',
                    id: s.id,
                    source: 'schedule'
                });
            }
        });

        // Filter by category
        if (currentScheduleFilter !== 'all') {
            items = items.filter(item => getCategory(item.name) === currentScheduleFilter);
        }

        items.sort((a, b) => a.time.localeCompare(b.time));

        if (items.length === 0) {
            container.innerHTML = `<div class="sc-empty" style="width:100%; text-align:center; padding:50px; color:#999;">해당하는 일정이 없습니다.</div>`;
            return;
        }

        container.innerHTML = items.map(item => {
            const isConfirmed = item.status.includes('확정');
            return `<div class="schedule-card" onclick="showDetail('${item.id}', '${item.source}')" style="border-top-color: ${isConfirmed ? '#ff6a00' : '#00c73c'}">
                <div class="sc-status" style="background: ${isConfirmed ? '#ff6a00' : '#00c73c'}; color:white;">${item.status}</div>
                <div class="sc-time"><span class="material-icons">access_time</span> ${item.time}</div>
                <div class="sc-item">${item.name}</div>
                <div class="sc-info"><div class="sc-customer"><b>${item.customer}</b> ${item.count}명</div></div>
            </div>`;
        }).join('');
    }

    // 🚀 5. Render Table (New Reservations)
    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        const searchInput = document.getElementById('header-global-search');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        const filtered = allReservations.filter(r => (r.status === '예약접수' || r.status === '입금대기') && (r.customerKorName || '').toLowerCase().includes(searchTerm));

        filtered.forEach((res, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${filtered.length - index}</td>
                <td><div style="font-size:14px; font-weight:800;">${res.customerKorName}</div></td>
                <td>${res.items?.[0]?.name || '-'}</td>
                <td>₩ ${(res.totalPrice || 0).toLocaleString()}</td>
                <td><span class="n-badge badge-yellow">${res.status}</span></td>
                <td><button class="btn-action-received" onclick="showDetail('${res.id}', 'reservation')">상세</button></td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // 🚀 6. Schedule Registration (Bulk)
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
            const engName = (parts[10] || '').trim();
            const pax = parseInt(parts[11]) || 0;
            const chd = parseInt(parts[12]) || 0;
            const totalPax = pax + chd;
            const remarks = (parts[16] || '').replace(/^"|"$/g, '').trim();
            const extra = (parts[17] || '').replace(/^"|"$/g, '').trim();
            const fullRemarks = remarks + '\n' + extra;

            const remarkLines = fullRemarks.split('\n');
            for (let rLine of remarkLines) {
                const trimmed = rLine.trim();
                const dm = trimmed.match(/^(\d{1,2})\/(\d{1,2})/);
                if (dm) {
                    const dateStr = `${currentYear}-${dm[1].padStart(2,'0')}-${dm[2].padStart(2,'0')}`;
                    const tm = trimmed.match(/(\d{1,2}):(\d{2})/);
                    let itemTime = tm ? `${tm[1].padStart(2,'0')}:${tm[2]}` : "09:00";
                    let itemName = trimmed.replace(dm[0], '').replace(tm ? tm[0] : '', '').replace(/GET\$.*|잔금.*|\$.*/g, '').trim();
                    const lowerLine = trimmed.toLowerCase();

                    // Product Translation
                    if (lowerLine.includes('land')) { itemName = '보라카이 랜드투어'; itemTime = "10:30"; }
                    else if (lowerLine.includes('hopping')) {
                        if (lowerLine.includes('(j)')) { itemName = '블랙펄 호핑투어 (+점보크랩 점심)'; itemTime = "12:30"; }
                        else if (lowerLine.includes('(s)')) { itemName = '블랙펄 선셋 호핑투어'; itemTime = "13:30"; }
                        else { itemName = '블랙펄 요트호핑'; }
                    } else if (lowerLine.includes('sspa') || itemName.includes('에스파')) { 
                        itemName = '에스파(S-SPA)'; 
                        if (lowerLine.includes('afh')) { itemTime = "18:00"; }
                        else if (lowerLine.includes('afm')) { itemTime = "17:00"; }
                    }

                    // Deduplication: Check if same customer + name + date exists
                    const isDuplicate = allSchedules.some(s => s.customerName === customerName && s.name === itemName && s.date === dateStr);
                    if (!isDuplicate) {
                        const newDocRef = doc(collection(db, "schedules"));
                        batch.set(newDocRef, {
                            customerName: customerName,
                            engName: engName,
                            name: itemName,
                            date: dateStr,
                            time: itemTime,
                            count: totalPax,
                            createdAt: new Date()
                        });
                        count++;
                    }
                }
            }
        }

        if (count > 0) {
            await batch.commit();
            alert(`${count}건의 일정이 등록되었습니다.`);
            document.getElementById('schedule-reg-input').value = '';
        } else {
            alert('등록할 수 있는 새로운 일정이 없습니다.');
        }
    };

    // 🚀 7. Quick Voucher
    window.makeQuickVoucher = async () => {
        const inputVal = document.getElementById('quick-voucher-input').value.trim();
        if (!inputVal) { alert('데이터를 입력해주세요.'); return; }
        const parts = inputVal.split('\t');
        if (parts.length < 16) { alert('데이터 형식이 올바르지 않습니다.'); return; }

        const currentYear = new Date().getFullYear();
        const customerName = (parts[15] || '').trim();
        const engName = (parts[10] || '').trim();
        const pax = parseInt(parts[11]) || 0;
        const chd = parseInt(parts[12]) || 0;
        const inf = parseInt(parts[13]) || 0;
        const totalPaxCount = pax + chd + inf;
        const agency = (parts[14] || '').trim();

        let rawEx = (parts[24] || parts[4] || '').trim();
        let exchange = (rawEx && !rawEx.includes('/') && (rawEx.includes('$') || rawEx.includes('불') || /^\d+$/.test(rawEx.replace(/[^0-9]/g, '')))) ? rawEx : '-';

        const remarks = (parts[16] || '').replace(/^"|"$/g, '').trim();
        const items = [];

        remarks.split('\n').forEach(line => {
            const trimmed = line.trim();
            const dm = trimmed.match(/^(\d{1,2})\/(\d{1,2})/);
            if (dm) {
                const dateStr = `${currentYear}-${dm[1].padStart(2,'0')}-${dm[2].padStart(2,'0')}`;
                const lowerLine = trimmed.toLowerCase();
                let itemName = trimmed.replace(dm[0], '').replace(/GET\$.*|잔금.*|\$.*/g, '').trim();
                let itemTime = "09:00";
                let itemDetails = trimmed;

                const tm = trimmed.match(/(\d{1,2}):(\d{2})/);
                if (tm) itemTime = `${tm[1].padStart(2,'0')}:${tm[2]}`;

                if (lowerLine.includes('land')) { itemName = '보라카이 랜드투어'; itemTime = "10:30"; }
                else if (lowerLine.includes('hopping')) {
                    if (lowerLine.includes('(j)')) { itemName = '블랙펄 호핑투어 (+점보크랩 점심)'; itemTime = "12:30"; }
                    else if (lowerLine.includes('(s)')) { itemName = '블랙펄 선셋 호핑투어'; itemTime = "13:30"; }
                } else if (lowerLine.includes('sspa')) { 
                    itemName = '에스파(S-SPA)'; 
                    if (lowerLine.includes('afh')) { itemTime = "18:00"; itemDetails = "투어 후 바로 이동"; }
                    else if (lowerLine.includes('afm')) { itemTime = "17:00"; itemDetails = "투어 후 바로 이동"; }
                }
                items.push({ name: itemName, date: dateStr, time: itemTime, count: totalPaxCount, details: itemDetails });
            }
        });

        // Add Landing/Sending
        if (parts[2] && parts[2].match(/[A-Z]{2}\d{2,}/)) items.push({ name: `✈️ 공항 픽업 (${parts[2]})`, date: `${currentYear}-${parts[0].split('/')[0].padStart(2,'0')}-${parts[0].split('/')[1].padStart(2,'0')}`, time: "00:01", count: totalPaxCount, details: "공항 픽업" });
        if (parts[3] && parts[3].match(/[A-Z]{2}\d{2,}/)) {
            let sTime = (parts[3].toUpperCase() === 'TW126') ? "08:30" : "21:00";
            items.push({ name: `✈️ 공항 샌딩 (${parts[3]})`, date: `${currentYear}-${parts[1].split('/')[0].padStart(2,'0')}-${parts[1].split('/')[1].padStart(2,'0')}`, time: sTime, count: totalPaxCount, details: "공항 샌딩" });
        }

        items.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

        const resData = {
            reservationNumber: 'Q' + Date.now().toString().slice(-8),
            customerKorName: `${customerName} (${engName})`,
            engName: exchange,
            contact: agency,
            items: items,
            status: '예약확정',
            exchangeAmount: `성인 ${pax}, 아동 ${chd}, 유아 ${inf} (총 ${totalPaxCount}명)`,
            createdAt: new Date()
        };

        const docRef = await addDoc(collection(db, "quick_vouchers"), resData);
        const url = `${window.location.origin}/reservation-schedule.html?id=${docRef.id}&type=quick`;
        if (confirm(`생성 완료! 링크를 복사하시겠습니까?`)) { navigator.clipboard.writeText(url).then(() => alert('복사되었습니다.')); }
    };

    window.showDetail = (id, source) => {
        const res = source === 'reservation' ? allReservations.find(r => r.id === id) : allSchedules.find(s => s.id === id);
        if (!res) return;
        const body = document.getElementById('modal-body');
        body.innerHTML = `<pre style="white-space:pre-wrap; font-size:12px;">${JSON.stringify(res, null, 2)}</pre>`;
        document.getElementById('res-detail-modal').style.display = 'flex';
    };

    window.closeModal = () => { document.getElementById('res-detail-modal').style.display = 'none'; };
});
