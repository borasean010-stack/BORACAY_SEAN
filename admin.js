// admin.js - Naver SmartStore Style + Luxury Schedule & System Logic
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
    let activeTab = 'new'; 
    let currentScheduleFilter = 'all';
    let currentScheduleDay = 'today'; 

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
            } else { 
                alert('아이디 또는 비밀번호가 올바르지 않습니다.'); 
            }
        };
    }

    document.getElementById('logout-btn').onclick = () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        location.reload();
    };

    function showAdminPanel() {
        loginContainer.style.display = 'none';
        adminContainer.style.display = 'flex';
        const adminId = sessionStorage.getItem('adminId') || '관리자';
        document.getElementById('display-admin-id').innerText = adminId;
        const systemMenu = document.getElementById('menu-system');
        if (systemMenu) systemMenu.style.display = 'flex';
        fetchData();
    }

    function fetchData() {
        if (!db) return;
        const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
            allReservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            updateSummaryCounts();
            renderSchedule();
            renderTable();
        });
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
        const rcCount = document.getElementById('count-resort-confirmed');
        if (rcCount) rcCount.innerText = counts.resortConfirmed;
    }

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
        const targetDate = currentScheduleDay === 'today' ? todayStr : new Date(now.getTime() - offset + 86400000).toISOString().split('T')[0];

        let items = [];
        allReservations.forEach(res => {
            if (res.items) {
                res.items.forEach(item => {
                    const itemCat = getCategory(item.name);
                    const isMatch = currentScheduleFilter === 'all' || itemCat === currentScheduleFilter;
                    if (item.date === targetDate && isMatch) {
                        items.push({ time: item.time || "09:00", name: item.name, customer: res.customerKorName, count: item.count, status: res.status, id: res.id, resort: res.activityPickupResort || res.pickupResort || "-" });
                    }
                });
            }
        });

        items.sort((a, b) => a.time.localeCompare(b.time));

        if (items.length === 0) {
            container.innerHTML = `<div class="sc-empty">일정이 없습니다.</div>`;
            return;
        }

        container.innerHTML = items.map(item => {
            const isConfirmed = item.status === '예약확정' || item.status === '리조트확정';
            return `<div class="schedule-card" onclick="showDetail('${item.id}')" style="border-top-color: ${isConfirmed ? '#ff6a00' : '#ff8c00'}">
                <div class="sc-status ${isConfirmed ? 'confirmed' : 'pending'}">${item.status}</div>
                <div class="sc-time"><span class="material-icons">access_time</span> ${item.time}</div>
                <div class="sc-item">${item.name}</div>
                <div class="sc-info"><div class="sc-customer"><b>${item.customer}</b> ${item.count}명</div></div>
            </div>`;
        }).join('');
    }

    window.switchScheduleDay = (day) => { currentScheduleDay = day; renderSchedule(); };
    window.filterSchedule = (category) => { currentScheduleFilter = category; renderSchedule(); };
    window.switchAdminTab = (tab) => { activeTab = tab; renderTable(); };

    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        const searchInput = document.getElementById('header-global-search');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

        let filtered = allReservations.filter(r => {
            const name = (r.customerKorName || '').toLowerCase();
            const resNo = (r.reservationNumber || '').toLowerCase();
            const matchesSearch = name.includes(searchTerm) || resNo.includes(searchTerm);
            let matchesTab = false;
            
            if (activeTab === 'new') matchesTab = (r.status === '입금대기' || r.status === '예약접수');
            else if (activeTab === 'confirmed') matchesTab = (r.status === '예약확정');
            else if (activeTab === 'resorts') matchesTab = (r.status === '견적');
            else if (activeTab === 'resort-confirmed') matchesTab = (r.status === '리조트확정');
            else if (activeTab === 'system') matchesTab = true;
            return matchesSearch && matchesTab;
        });

        filtered.forEach((res, index) => {
            const tr = document.createElement('tr');
            const status = res.status || '대기';
            const firstItem = res.items && res.items.length > 0 ? res.items[0] : null;
            let itemsText = firstItem ? (firstItem.name + (res.items.length > 1 ? ` 외 ${res.items.length-1}건` : '')) : '-';

            let actionButtons = '';
            if (activeTab === 'resorts') {
                actionButtons = `
                    <button class="btn-action-received" onclick="handleResortQuoteComplete('${res.id}')"><span class="material-icons">task_alt</span>견적완료</button>
                    <button class="btn-action-outline" onclick="showDetail('${res.id}')">상세</button>
                    <button class="btn-action-received" style="background:#00c73c; border-color:#00c73c;" onclick="handleResortConfirm('${res.id}')">예약확정</button>
                `;
            } else {
                actionButtons = `
                    ${status !== '예약확정' && status !== '리조트확정' ? `<button class="btn-action-received" onclick="handleAutoConfirm('${res.id}')">입금확인</button>` : ''}
                    <button class="btn-action-received" style="background:#ff6a00; border-color:#ff6a00;" onclick="showDetail('${res.id}')">상세</button>
                `;
            }

            tr.innerHTML = `<td><input type="checkbox"></td><td style="color:#bbb;">${filtered.length - index}</td><td style="font-weight:700;">${res.reservationNumber || '-'}</td><td><div style="font-size:14px; font-weight:800;">${res.customerKorName}</div></td><td>${itemsText}</td><td>₩ ${(res.totalPrice || 0).toLocaleString()}</td><td style="text-align:center;"><span class="n-badge ${status.includes('확정') ? 'badge-green' : 'badge-yellow'}">${status}</span></td><td><div style="display:flex; gap:5px;">${actionButtons}</div></td>`;
            tableBody.appendChild(tr);
        });
    }

    window.handleAutoConfirm = async (id) => { if (confirm("예약확정 처리를 진행합니까?")) await updateDoc(doc(db, "reservations", id), { status: "예약확정" }); };
    window.handleResortQuoteComplete = async (id) => { if (confirm("견적완료 처리를 진행합니까?")) await updateDoc(doc(db, "reservations", id), { status: "견적완료" }); };
    window.handleResortConfirm = async (id) => {
        const amount = prompt("입금 금액을 입력해 주세요");
        if (amount !== null) {
            const price = parseInt(amount.replace(/[^0-9]/g, '')) || 0;
            await updateDoc(doc(db, "reservations", id), { status: "리조트확정", totalPrice: price });
            alert("확정되었습니다.");
        }
    };

    window.showDetail = (id) => {
        const res = allReservations.find(r => r.id === id);
        if (!res) return;
        const modal = document.getElementById('res-detail-modal');
        const body = document.getElementById('modal-body');
        if (modal && body) {
            body.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="margin:0;">예약 상세 정보</h3>
                    <button onclick="copyGuidance('${res.id}')" style="background:#ff6a00; color:white; border:none; padding:8px 14px; border-radius:6px; font-weight:bold;">안내문 복사</button>
                </div>
                <div style="max-height: 60vh; overflow-y: auto; background:#f8f9fa; padding:15px; border-radius:10px;">
                    <pre style="white-space:pre-wrap; font-size:13px;">${JSON.stringify(res, null, 2)}</pre>
                </div>
                <div style="margin-top:20px; text-align:right;">
                    <button onclick="closeModal()" style="padding:10px 20px; background:#333; color:white; border:none; border-radius:6px; font-weight:bold;">닫기</button>
                </div>`;
            modal.style.display = 'flex';
        }
    };

    window.makeQuickVoucher = async () => {
        const inputVal = document.getElementById('quick-voucher-input').value.trim();
        if (!inputVal) { alert('데이터를 입력해주세요.'); return; }
        const parts = inputVal.includes('\t') ? inputVal.split('\t') : inputVal.split(' / ');
        const currentYear = new Date().getFullYear();

        const translateResort = (name) => {
            if (!name) return "";
            let n = name.toLowerCase().replace(/[\s,.]/g, ''); 
            if (name.toLowerCase().startsWith('h.') || name.toLowerCase().startsWith('h,')) n = '헤난 ' + name.substring(2);
            if (name.toLowerCase().startsWith('m.') || name.toLowerCase().startsWith('m,')) n = '만다린 ' + name.substring(2);
            if (n.includes('garden')) return "헤난 가든";
            if (n.includes('lagoon')) return "헤난 라군";
            if (n.includes('park')) return "헤난 파크";
            if (n.includes('prime')) return "헤난 프라임";
            if (n.includes('palm')) return "헤난 팜 비치";
            if (n.includes('crystal')) return "헤난 크리스탈 샌즈";
            if (n.includes('regency')) return "헤난 리젠시";
            if (n.includes('bay')) return "만다린 베이";
            return n.trim();
        };

        const agencySource = (parts[14] || '').trim(); 
        const customerName = (parts[15] || '').trim(); 
        const engName = (parts[10] || '').trim();      
        const pax = parseInt(parts[11]) || 0; 
        const chd = parseInt(parts[12]) || 0; 
        const inf = parseInt(parts[13]) || 0; 
        const totalPaxCount = pax + chd + inf;
        const resort = translateResort(parts[9] || '');

        let rawExchange = (parts[24] || parts[4] || '').replace(/^"|"$/g, '').trim(); 
        let exchangeMoney = (rawExchange && !rawExchange.includes('/') && (rawExchange.includes('$') || rawExchange.includes('불') || /^\d+$/.test(rawExchange.replace(/[^0-9]/g, '')))) ? rawExchange : '-';

        const remarksPart = (parts[16] || '').replace(/^"|"$/g, '').trim();
        const fullRemarks = remarksPart + "\n" + (parts[17] || '');

        const items = [];
        fullRemarks.split('\n').forEach(line => {
            const trimmed = line.trim();
            const dm = trimmed.match(/^(\d{1,2})\/(\d{1,2})/);
            if (dm) {
                const dateStr = `${currentYear}-${dm[1].padStart(2,'0')}-${dm[2].padStart(2,'0')}`;
                const lowerLine = trimmed.toLowerCase();
                let itemName = trimmed.replace(dm[0], '').replace(/GET\$.*|잔금.*|\$.*/g, '').trim();
                let itemTime = "";
                let itemDetails = trimmed;

                const tm = trimmed.match(/(\d{1,2}):(\d{2})/);
                if (tm) itemTime = `${tm[1].padStart(2,'0')}:${tm[2]}`;

                if (lowerLine.includes('land')) { itemName = '보라카이 랜드투어'; if (!itemTime) itemTime = "10:30"; }
                else if (lowerLine.includes('hopping')) {
                    if (lowerLine.includes('(j)')) { itemName = '블랙펄 호핑투어 (+점보크랩 점심)'; if (!itemTime) itemTime = "12:30"; }
                    else if (lowerLine.includes('(s)')) { itemName = '블랙펄 선셋 호핑투어'; if (!itemTime) itemTime = "13:30"; }
                    else { itemName = '블랙펄 요트호핑'; }
                } else if (lowerLine.includes('sspa') || itemName.includes('에스파')) { 
                    itemName = '에스파(S-SPA)'; 
                    if (lowerLine.includes('afh')) { itemTime = "18:00"; itemDetails = "호핑투어 후 바로 이동"; }
                    else if (lowerLine.includes('afm')) { itemTime = "17:00"; itemDetails = "말룸파티 후 바로 이동"; }
                } else if (lowerLine.includes('luna') || itemName.includes('루나')) { 
                    itemName = '루나스파'; 
                    if (lowerLine.includes('afh')) { itemTime = "18:00"; itemDetails = "호핑투어 후 바로 이동"; }
                    else if (lowerLine.includes('afm')) { itemTime = "17:00"; itemDetails = "말룸파티 후 바로 이동"; }
                }
                items.push({ name: itemName, date: dateStr, time: itemTime, count: totalPaxCount, details: itemDetails });
            }
        });

        if ((parts[2] || '').match(/[A-Z]{2}\d{2,}/)) items.push({ name: `✈️ 공항 픽업 (${parts[2]})`, date: `${currentYear}-${parts[0].split('/')[0].padStart(2,'0')}-${parts[0].split('/')[1].trim().padStart(2,'0')}`, time: "00:01", count: totalPaxCount, details: `리조트 : ${resort}` });
        if ((parts[3] || '').match(/[A-Z]{2}\d{2,}/)) {
            let sTime = (parts[3].toUpperCase() === 'TW126') ? "08:30" : "21:00";
            items.push({ name: `✈️ 공항 샌딩 (${parts[3]})`, date: `${currentYear}-${parts[1].split('/')[0].padStart(2,'0')}-${parts[1].split('/')[1].trim().padStart(2,'0')}`, time: sTime, count: totalPaxCount, details: `리조트 : ${resort}` });
        }

        items.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

        const reservationData = {
            reservationNumber: 'Q' + Date.now().toString().slice(-8),
            customerKorName: `${customerName} (${engName})`,
            engName: exchangeMoney,
            contact: agencySource, 
            pickupResort: resort,
            items: items, 
            status: '예약확정', 
            exchangeAmount: `성인 ${pax}, 아동 ${chd}, 유아 ${inf} (총 ${totalPaxCount}명)`, 
            createdAt: new Date()
        };

        try {
            const docRef = await addDoc(collection(db, "quick_vouchers"), reservationData);
            const url = `${window.location.origin}/reservation-schedule.html?id=${docRef.id}&type=quick`;
            if (confirm(`성공! 링크를 복사하시겠습니까?`)) { navigator.clipboard.writeText(url).then(() => alert('복사되었습니다.')); }
        } catch (e) { alert('저장 실패: ' + e.message); }
    };

    window.closeModal = () => { document.getElementById('res-detail-modal').style.display = 'none'; };
});
