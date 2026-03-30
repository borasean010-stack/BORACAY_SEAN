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

    function showAdminPanel() {
        if (!loginContainer || !adminContainer) return;
        loginContainer.style.display = 'none';
        adminContainer.style.display = 'flex';
        const adminId = sessionStorage.getItem('adminId') || '관리자';
        const displayIdEl = document.getElementById('display-admin-id');
        if (displayIdEl) displayIdEl.innerText = adminId;
        const systemMenu = document.getElementById('menu-system');
        if (systemMenu) systemMenu.style.display = 'flex';
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
        const cNew = document.getElementById('count-new');
        const cConfirmed = document.getElementById('count-confirmed');
        const cResorts = document.getElementById('count-resorts');
        const rcCount = document.getElementById('count-resort-confirmed');
        if (cNew) cNew.innerText = counts.new;
        if (cConfirmed) cConfirmed.innerText = counts.confirmed;
        if (cResorts) cResorts.innerText = counts.resorts;
        if (rcCount) rcCount.innerText = counts.resortConfirmed;
    }

    function getCategory(name) {
        if (!name) return '액티비티';
        const n = name.toLowerCase().trim();
        if (n.includes('픽업') && !n.includes('샌딩')) return '픽업';
        if (n.includes('샌딩')) return '샌딩';
        if (n.includes('호핑')) return '호핑';
        if (n.includes('말룸파티')) return '말룸파티';
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
                    if (item.date === targetDate && (currentScheduleFilter === 'all' || getCategory(item.name) === currentScheduleFilter)) {
                        items.push({ time: item.time || "09:00", name: item.name, customer: res.customerKorName, count: item.count, status: res.status, id: res.id });
                    }
                });
            }
        });
        items.sort((a, b) => a.time.localeCompare(b.time));
        container.innerHTML = items.length === 0 ? `<div class="sc-empty">일정이 없습니다.</div>` : items.map(item => `<div class="schedule-card" onclick="showDetail('${item.id}')"><b>${item.time}</b> ${item.name} (${item.customer} ${item.count}명)</div>`).join('');
    }

    window.switchScheduleDay = (day) => { currentScheduleDay = day; renderSchedule(); };
    window.filterSchedule = (category) => { currentScheduleFilter = category; renderSchedule(); };
    window.switchAdminTab = (tab) => { activeTab = tab; renderTable(); };

    window.handleAutoConfirm = async (id) => { if (confirm("예약확정 처리를 진행합니까?")) await updateDoc(doc(db, "reservations", id), { status: "예약확정" }); };
    window.handleResortQuoteComplete = async (id) => { if (confirm("견적완료 처리를 진행합니까?")) await updateDoc(doc(db, "reservations", id), { status: "견적완료" }); };
    window.handleResortConfirm = async (id) => {
        const amount = prompt("입금 금액을 입력해 주세요 (숫자만)");
        if (amount !== null) {
            const price = parseInt(amount.replace(/[^0-9]/g, '')) || 0;
            if (confirm(`입금 금액 ₩ ${price.toLocaleString()}으로 예약 확정 처리하시겠습니까?`)) {
                await updateDoc(doc(db, "reservations", id), { status: "리조트확정", totalPrice: price });
                alert("리조트 예약이 확정되었습니다.");
            }
        }
    };
    window.handleDeleteReservation = async (id) => { if (confirm("영구 삭제하시겠습니까?")) await deleteDoc(doc(db, "reservations", id)); };

    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        allReservations.filter(r => {
            if (activeTab === 'new') return r.status === '입금대기' || r.status === '예약접수';
            if (activeTab === 'confirmed') return r.status === '예약확정';
            if (activeTab === 'resorts') return r.status === '견적';
            if (activeTab === 'resort-confirmed') return r.status === '리조트확정';
            return true;
        }).forEach((res, idx) => {
            const tr = document.createElement('tr');
            let actionButtons = `<button onclick="showDetail('${res.id}')">상세</button>`;
            if (activeTab === 'new') actionButtons = `<button onclick="handleAutoConfirm('${res.id}')">입금확인</button>` + actionButtons;
            if (activeTab === 'resorts') actionButtons = `<button onclick="handleResortQuoteComplete('${res.id}')">견적완료</button><button onclick="handleResortConfirm('${res.id}')">예약확정</button>` + actionButtons;
            tr.innerHTML = `<td>${idx+1}</td><td>${res.reservationNumber || '-'}</td><td><b>${res.customerKorName}</b></td><td>${res.items?.[0]?.name || '-'}</td><td>₩ ${(res.totalPrice || 0).toLocaleString()}</td><td>${res.status}</td><td>${actionButtons}</td>`;
            tableBody.appendChild(tr);
        });
    }

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

        const rawCustomerName = (parts[22] || parts[6] || '').trim();
        const nameCandidate = (parts[15] || '').trim(); // 김세림 위치
        const remarksPart = (parts[16] || '').replace(/^"|"$/g, '').trim();
        const extraPart1 = (parts[17] || '').replace(/^"|"$/g, '').trim();
        const fullRemarks = `${remarksPart}\n${extraPart1}`.trim();

        // 🚀 성함 추출: 기본 칸이 없으면 김세림 후보 칸 확인
        let customerName = rawCustomerName || nameCandidate || "미입력";

        // 🚀 환전 금액: 날짜(/) 포함 시 무조건 제외
        let rawExchange = (parts[24] || parts[4] || '').replace(/^"|"$/g, '').trim(); 
        let exchangeMoney = (rawExchange && !rawExchange.includes('/') && (rawExchange.includes('$') || rawExchange.includes('불') || /^\d+$/.test(rawExchange.replace(/[^0-9]/g, '')))) ? rawExchange : '-';

        const pax = parseInt(parts[11]) || 0; 
        const chd = parseInt(parts[12]) || 0; 
        const inf = parseInt(parts[13]) || 0; 
        const totalPaxCount = pax + chd + inf;
        const resort = translateResort(parts[9] || '');
        const items = [];

        // 🚀 투어 리스트: 상품명 변환 및 시간 고정
        fullRemarks.split('\n').forEach(line => {
            const trimmed = line.trim();
            const dm = trimmed.match(/^(\d{1,2})\/(\d{1,2})/);
            if (dm) {
                const dateStr = `${currentYear}-${dm[1].padStart(2,'0')}-${dm[2].padStart(2,'0')}`;
                const lowerLine = trimmed.toLowerCase();
                let itemName = trimmed.replace(dm[0], '').replace(/GET\$.*|잔금.*|\$.*/g, '').trim();
                let itemTime = "";

                if (lowerLine.includes('land')) { 
                    itemName = '보라카이 랜드투어'; itemTime = "10:30"; 
                } else if (lowerLine.includes('hopping')) {
                    if (lowerLine.includes('(j)')) { itemName = '블랙펄 호핑투어 (+점보크랩 점심)'; itemTime = "12:30"; }
                    else if (lowerLine.includes('(s)')) { itemName = '블랙펄 선셋 호핑투어'; itemTime = "13:30"; }
                    else { itemName = '블랙펄 요트호핑'; }
                } else if (lowerLine.includes('sspa') || itemName.includes('에스파')) { 
                    itemName = '에스파(S-SPA)'; 
                } else if (lowerLine.includes('luna') || itemName.includes('루나')) { 
                    itemName = '루나스파'; 
                }

                // 줄별 개별 인원 체크 (4+3 등)
                let itemPax = totalPaxCount;
                const plusMatch = trimmed.match(/(\d+)\s*\+\s*(\d+)/);
                if (plusMatch) { itemPax = parseInt(plusMatch[1]) + parseInt(plusMatch[2]); }
                else {
                    const unitMatch = trimmed.match(/(\d+)\s*(명|인|pax)/i);
                    if (unitMatch) { itemPax = parseInt(unitMatch[1]); }
                }
                items.push({ name: itemName, date: dateStr, time: itemTime, count: itemPax, details: trimmed });
            }
        });

        // 픽업/샌딩 자동 추가
        if ((parts[2] || '').match(/[A-Z]{2}\d{2,}/)) items.unshift({ name: `✈️ 공항 픽업 (${parts[2]})`, date: `${currentYear}-${parts[0].split('/')[0].padStart(2,'0')}-${parts[0].split('/')[1].trim().padStart(2,'0')}`, time: " ", count: totalPaxCount, details: `리조트 : ${resort}` });
        if ((parts[3] || '').match(/[A-Z]{2}\d{2,}/)) items.push({ name: `✈️ 공항 샌딩 (${parts[3]})`, date: `${currentYear}-${parts[1].split('/')[0].padStart(2,'0')}-${parts[1].split('/')[1].trim().padStart(2,'0')}`, time: "21:00", count: totalPaxCount, details: `리조트 : ${resort}` });

        const reservationData = {
            reservationNumber: 'Q' + Date.now().toString().slice(-8),
            customerKorName: `${customerName} (${parts[10] || '-'})`,
            engName: exchangeMoney,
            contact: parts[14] || '', 
            pickupResort: resort,
            items: items, 
            status: '예약확정', 
            exchangeAmount: `성인 ${pax}, 아동 ${chd}, 유아 ${inf} (총 ${totalPaxCount}명)`, 
            createdAt: new Date()
        };

        try {
            const docRef = await addDoc(collection(db, "quick_vouchers"), reservationData);
            const url = `${window.location.origin}/reservation-schedule.html?id=${docRef.id}&type=quick`;
            if (confirm(`생성 완료! 링크를 복사하시겠습니까?`)) { navigator.clipboard.writeText(url).then(() => alert('복사되었습니다.')); }
        } catch (e) { alert('저장 실패: ' + e.message); }
    };

    window.showDetail = (id) => {
        const res = allReservations.find(r => r.id === id);
        if (!res) return;
        const modal = document.getElementById('res-detail-modal');
        const body = document.getElementById('modal-body');
        if (modal && body) {
            body.innerHTML = `<h3>${res.customerKorName} 예약 상세</h3><pre>${JSON.stringify(res, null, 2)}</pre>`;
            modal.style.display = 'flex';
        }
    };

    window.closeModal = () => {
        const modal = document.getElementById('res-detail-modal');
        if (modal) modal.style.display = 'none';
    };
});
