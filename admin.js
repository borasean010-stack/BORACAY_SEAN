// admin.js - Final Full Luxury Admin (Dashboard Tool + Buttons + Detail + Edit + Logic)
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
} catch (e) { console.error("Firebase Init Error", e); }

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('admin-table-body');
    const loginContainer = document.getElementById('login-container');
    const adminContainer = document.getElementById('admin-container');

    let allReservations = [];
    let allSchedules = [];
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

    document.getElementById('logout-btn').onclick = () => { sessionStorage.removeItem('isAdminLoggedIn'); location.reload(); };

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
        const cIds = ['count-new', 'count-confirmed', 'count-resorts', 'count-resort-confirmed'];
        const vals = [counts.new, counts.confirmed, counts.resorts, counts.resortConfirmed];
        cIds.forEach((id, i) => { const el = document.getElementById(id); if(el) el.innerText = vals[i]; });
    }

    function renderDateBoxes() {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const todayStr = new Date(now.getTime() - offset).toISOString().split('T')[0];
        const tomorrowStr = new Date(now.getTime() - offset + 86400000).toISOString().split('T')[0];
        const tBox = document.getElementById('box-date-today');
        const tmBox = document.getElementById('box-date-tomorrow');
        if (tBox) tBox.innerText = todayStr;
        if (tmBox) tmBox.innerText = tomorrowStr;
    }
// 🚀 3. Timeline Logic
window.switchScheduleDay = (day) => { 
    currentScheduleDay = day; 
    hideInputArea(); // 🚀 추가: 일정 전환 시 입력창 닫기
    renderSchedule(); 
};
window.filterSchedule = (category) => {
    currentScheduleFilter = category;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const isMatch = (category === 'all' && btn.innerText === '전체') || (category === '액티비티' && btn.innerText.includes('액티비티')) || btn.innerText === category;
        if (isMatch) btn.classList.add('active');
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
        allSchedules.forEach(s => { if (s.date === targetDate) items.push({ time: s.time || "09:00", name: s.name, customer: s.customerName, count: s.count, status: '스케줄', id: s.id, source: 'schedule' }); });

        if (currentScheduleFilter !== 'all') items = items.filter(i => getCategory(i.name) === currentScheduleFilter);
        items.sort((a, b) => a.time.localeCompare(b.time));

        if (items.length === 0) { container.innerHTML = `<div class="sc-empty" style="width:100%; text-align:center; padding:30px; color:#ccc; font-size:12px;">일정이 없습니다.</div>`; return; }
        container.innerHTML = items.map(item => `<div class="schedule-card" onclick="showDetail('${item.id}', '${item.source}')" style="border-top-color: ${item.status.includes('확정') ? '#ff6a00' : '#00c73c'}; min-width:250px;"><div class="sc-status" style="background: ${item.status.includes('확정') ? '#ff6a00' : '#00c73c'}; color:white;">${item.status}</div><div class="sc-time"><span class="material-icons">access_time</span> ${item.time}</div><div class="sc-item">${item.name}</div><div class="sc-info"><div class="sc-customer"><b>${item.customer}</b> ${item.count}명</div></div></div>`).join('');
    }

    window.switchMainView = () => {
        document.querySelectorAll('.ss-nav-item').forEach(el => el.classList.remove('active'));
        const firstNav = document.querySelector('.ss-nav-item:first-child');
        if (firstNav) firstNav.classList.add('active');
        document.getElementById('breadcrumb-active').innerText = '메인 페이지';
        activeTab = 'new'; 
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
        if (tab === 'system') {
            document.getElementById('system-setup-section').style.display = 'block';
            document.getElementById('data-view-section').style.display = 'none';
            if (bActive) bActive.innerText = '시스템 초기화';
        } else {
            document.getElementById('system-setup-section').style.display = 'none';
            document.getElementById('data-view-section').style.display = 'block';
            if (bActive) { const labels = { 'new': '신규예약', 'confirmed': '예약확정', 'resorts': '리조트 견적', 'resort-confirmed': '리조트 확정' }; bActive.innerText = labels[tab] || '메인 페이지'; }
            renderTable();
        }
    };

    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        const searchInput = document.getElementById('header-global-search');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const filtered = allReservations.filter(r => {
            const name = (r.customerKorName || '').toLowerCase();
            let matchesTab = true;
            if (activeTab === 'new') matchesTab = (r.status === '입금대기' || r.status === '예약접수');
            else if (activeTab === 'confirmed') matchesTab = (r.status === '예약확정');
            else if (activeTab === 'resorts') matchesTab = (r.status === '견적');
            else if (activeTab === 'resort-confirmed') matchesTab = (r.status === '리조트확정');
            return name.includes(searchTerm) && matchesTab;
        });

        filtered.forEach((res, index) => {
            const tr = document.createElement('tr');
            const status = res.status || '대기';
            const itemsText = (res.items?.[0]?.name || '-') + (res.items?.length > 1 ? ` 외 ${res.items.length-1}건` : '');
            let actionButtons = '';
            if (activeTab === 'resorts') {
                actionButtons = `<button class="btn-action-received" onclick="handleResortQuoteComplete('${res.id}')"><span class="material-icons">task_alt</span>견적완료</button><button class="btn-action-received" style="background:#ff6a00; border-color:#ff6a00;" onclick="showDetail('${res.id}', 'reservation')"><span class="material-icons">visibility</span>상세</button><button class="btn-action-received" style="background:#00c73c; border-color:#00c73c;" onclick="handleResortConfirm('${res.id}')"><span class="material-icons">check_circle</span>예약 확정</button>`;
            } else {
                actionButtons = `${(status === '예약접수' || status === '입금대기') ? `<button class="btn-action-received" onclick="handleAutoConfirm('${res.id}')"><span class="material-icons">payments</span>입금확인</button>` : ''}<button class="btn-action-received" style="background:#ff6a00; border-color:#ff6a00;" onclick="showDetail('${res.id}', 'reservation')"><span class="material-icons">visibility</span>상세</button><button class="btn-action-outline" onclick="copyCombinedVoucherLink('${res.contact}')"><span class="material-icons">content_copy</span>일정표</button>`;
            }
            tr.innerHTML = `<td><input type="checkbox"></td><td style="color:#bbb;">${filtered.length - index}</td><td>${res.reservationNumber || '-'}</td><td><div style="font-size:14px; font-weight:800;">${res.customerKorName}</div></td><td>${itemsText}</td><td>₩ ${(res.totalPrice || 0).toLocaleString()}</td><td>${res.createdAt?.toDate ? res.createdAt.toDate().toLocaleDateString() : '-'}</td><td><span class="n-badge ${status.includes('확정') ? 'badge-green' : 'badge-yellow'}">${status}</span></td><td><div style="display:flex; gap:5px;">${actionButtons}</div></td>`;
            tableBody.appendChild(tr);
        });
    }

    window.showDetail = (id, source) => {
        const res = source === 'schedule' ? allSchedules.find(s => s.id === id) : allReservations.find(r => r.id === id);
        if (!res) return;
        const modal = document.getElementById('res-detail-modal');
        const body = document.getElementById('modal-body');
        if (!modal || !body) return;

        if (source === 'schedule') {
            body.innerHTML = `<h3>스케줄 상세</h3><div style="background:#f8f9fa; padding:15px; border-radius:10px;"><p><b>고객명:</b> ${res.customerName}</p><p><b>상품명:</b> ${res.name}</p><p><b>날짜:</b> ${res.date}</p><p><b>시간:</b> ${res.time}</p><p><b>인원:</b> ${res.count}명</p></div>`;
            modal.style.display = 'flex'; return;
        }

        const itemsHtml = res.items.map(item => `<div style="padding:12px; background:#f8f9fa; border:1px solid #eee; border-radius:8px; margin-bottom:8px;"><div style="display:flex; justify-content:space-between;"><div style="font-size:15px; font-weight:800;">${item.name}</div><div style="font-size:14px; font-weight:800; color:#ff6a00;">${item.count}명</div></div><div style="margin-top:6px; font-size:13px; color:#666;">📅 ${item.date} ${item.time || ''}</div></div>`).join('');
        body.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid #eee;"><h3 style="margin:0;">예약 상세 정보</h3><button onclick="copyGuidance('${res.id}')" style="background:#ff6a00; color:white; border:none; padding:8px 14px; border-radius:6px; font-weight:bold; cursor:pointer;">👉 안내문 복사</button></div><div id="modal-scroll-area" style="max-height: 60vh; overflow-y: auto;"><div style="margin-bottom:20px;">${itemsHtml}</div><div style="background:#fcfcfc; padding:15px; border-radius:10px; border:1px solid #f0f0f0; margin-bottom:20px;"><p style="margin:0;">이름 | <b>${res.customerKorName}</b> (${res.engName || '-'})</p><p style="margin:5px 0 0 0;">연락처 | <b>${res.contact}</b></p></div><div style="padding:10px; background:#f8f9fa; border-radius:6px; font-size:13px; white-space:pre-wrap;"><b>[요청사항]</b>\n${res.requests || '없음'}</div></div><div style="display:flex; gap:10px; margin-top:20px; padding-top:15px; border-top:1px solid #eee;"><button id="edit-btn" onclick="toggleEditMode('${res.id}')" style="flex:1; padding:12px; background:#ff6a00; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">수정하기</button><button onclick="closeModal()" style="flex:1; padding:12px; background:#333; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">창 닫기</button></div>`;
        modal.style.display = 'flex';
    };

    window.toggleEditMode = (id) => {
        const res = allReservations.find(r => r.id === id); if (!res) return;
        const scrollArea = document.getElementById('modal-scroll-area');
        const editBtn = document.getElementById('edit-btn');
        if (editBtn.innerText === '수정하기') {
            editBtn.innerText = '저장하기';
            scrollArea.innerHTML = `<div style="background:#f8f9fa; padding:15px; border-radius:12px;"><label style="font-size:11px; color:#999;">한글명</label><input type="text" id="edit-name" value="${res.customerKorName}" style="width:100%; padding:8px; margin-bottom:10px;"><label style="font-size:11px; color:#999;">영문명</label><input type="text" id="edit-eng" value="${res.engName || ''}" style="width:100%; padding:8px; margin-bottom:10px;"><label style="font-size:11px; color:#999;">연락처</label><input type="text" id="edit-contact" value="${res.contact}" style="width:100%; padding:8px; margin-bottom:10px;"><label style="font-size:11px; color:#999;">총 결제 금액</label><input type="number" id="edit-price" value="${res.totalPrice}" style="width:100%; padding:8px; margin-bottom:10px;"><label style="font-size:11px; color:#999;">요청사항</label><textarea id="edit-requests" style="width:100%; height:80px; padding:8px;">${res.requests || ''}</textarea></div>`;
        } else handleSaveEdit(id);
    };

    async function handleSaveEdit(id) {
        const newData = { customerKorName: document.getElementById('edit-name').value, engName: document.getElementById('edit-eng').value, contact: document.getElementById('edit-contact').value, totalPrice: parseInt(document.getElementById('edit-price').value) || 0, requests: document.getElementById('edit-requests').value };
        if (confirm("저장하시겠습니까?")) { await updateDoc(doc(db, "reservations", id), newData); alert("수정 완료!"); closeModal(); }
    }

    window.copyGuidance = (id) => {
        const res = allReservations.find(r => r.id === id); if (!res) return;
        let msg = `[보라카이션 예약 확정 안내]\n\n대표자: ${res.customerKorName}\n투어내역:\n${res.items.map(i => `- ${i.name} (${i.date} ${i.time || ''}) / ${i.count}명`).join('\n')}\n\n감사합니다.`;
        navigator.clipboard.writeText(msg).then(() => alert('안내문이 복사되었습니다.'));
    };

    window.showInputArea = (type) => { hideInputArea(); document.getElementById(`input-area-${type}`).style.display = 'block'; window.scrollTo({ top: 0, behavior: 'smooth' }); };
    window.hideInputArea = () => { document.querySelectorAll('.input-area-card').forEach(el => el.style.display = 'none'); };
    window.copyCombinedVoucherLink = (contact) => { navigator.clipboard.writeText(`${window.location.origin}/reservation-schedule.html?contact=${encodeURIComponent(contact)}`).then(() => alert('통합 일정표 링크 복사 완료!')); };
    window.handleAutoConfirm = async (id) => { if (confirm("예약확정 처리를 진행합니까?")) await updateDoc(doc(db, "reservations", id), { status: "예약확정" }); };
    window.handleResortQuoteComplete = async (id) => { if (confirm("견적완료 처리를 진행합니까?")) await updateDoc(doc(db, "reservations", id), { status: "견적완료" }); };
    window.handleResortConfirm = async (id) => { const amount = prompt("입금 금액 입력"); if (amount) { const price = parseInt(amount.replace(/[^0-9]/g, '')) || 0; await updateDoc(doc(db, "reservations", id), { status: "리조트확정", totalPrice: price }); alert("확정 완료!"); } };
    window.closeModal = () => { document.getElementById('res-detail-modal').style.display = 'none'; };

    window.registerBulkSchedule = async () => {
        const inputVal = document.getElementById('schedule-reg-input').value.trim(); if (!inputVal) return;
        const lines = inputVal.split('\n'); const currentYear = new Date().getFullYear(); const batch = writeBatch(db); let count = 0;
        for (let line of lines) {
            const parts = line.split('\t'); if (parts.length < 16) continue;
            const customerName = (parts[15] || '').trim(); if (!customerName) continue;
            const engName = (parts[10] || '').trim(); const totalPax = (parseInt(parts[11]) || 0) + (parseInt(parts[12]) || 0);
            const remarks = (parts[16] || '').replace(/^"|"$/g, '').trim();
            remarks.split('\n').forEach(rLine => {
                const dm = rLine.trim().match(/^(\d{1,2})\/(\d{1,2})/);
                if (dm) {
                    const dateStr = `${currentYear}-${dm[1].padStart(2,'0')}-${dm[2].padStart(2,'0')}`; const tm = rLine.match(/(\d{1,2}):(\d{2})/);
                    let itemTime = tm ? `${tm[1].padStart(2,'0')}:${tm[2]}` : "09:00"; let itemName = rLine.replace(dm[0], '').replace(tm ? tm[0] : '', '').replace(/GET\$.*|잔금.*|\$.*/g, '').trim();
                    const lowerLine = rLine.toLowerCase();
                    if (lowerLine.includes('land')) { itemName = '보라카이 랜드투어'; itemTime = "10:30"; }
                    else if (lowerLine.includes('hopping')) { if (lowerLine.includes('(j)')) { itemName = '블랙펄 호핑투어 (+점보크랩 점심)'; itemTime = "12:30"; } else if (lowerLine.includes('(s)')) { itemName = '블랙펄 선셋 호핑투어'; itemTime = "13:30"; } }
                    if (!allSchedules.some(s => s.customerName === customerName && s.date === dateStr && s.name === itemName)) {
                        batch.set(doc(collection(db, "schedules")), { customerName, engName, name: itemName, date: dateStr, time: itemTime, count: totalPax, createdAt: new Date() }); count++;
                    }
                }
            });
        }
        if (count > 0) { await batch.commit(); alert(`${count}건의 일정이 등록되었습니다.`); hideInputArea(); }
    };

    window.makeQuickVoucher = async () => {
        const inputVal = document.getElementById('quick-voucher-input').value.trim(); if (!inputVal) return;
        const parts = inputVal.split('\t'); if (parts.length < 16) return;
        const currentYear = new Date().getFullYear(); const customerName = (parts[15] || '').trim(); const engName = (parts[10] || '').trim();
        const totalPaxCount = (parseInt(parts[11]) || 0) + (parseInt(parts[12]) || 0) + (parseInt(parts[13]) || 0); const agency = (parts[14] || '').trim();
        let rawEx = (parts[24] || parts[4] || '').trim(); let exchange = (rawEx && !rawEx.includes('/') && (rawEx.includes('$') || rawEx.includes('불'))) ? rawEx : '-';
        const remarks = (parts[16] || '').replace(/^"|"$/g, '').trim(); const items = [];
        remarks.split('\n').forEach(line => {
            const dm = line.trim().match(/^(\d{1,2})\/(\d{1,2})/);
            if (dm) {
                const dateStr = `${currentYear}-${dm[1].padStart(2,'0')}-${dm[2].padStart(2,'0')}`; let itemName = line.replace(dm[0], '').trim();
                let itemTime = "09:00", itemDetails = line;
                if (line.toLowerCase().includes('land')) { itemName = '보라카이 랜드투어'; itemTime = "10:30"; }
                else if (line.toLowerCase().includes('hopping')) { if (line.includes('(j)')) { itemName = '블랙펄 호핑투어 (+점보크랩 점심)'; itemTime = "12:30"; } else if (line.includes('(s)')) { itemName = '블랙펄 선셋 호핑투어'; itemTime = "13:30"; } }
                else if (line.includes('afh') || line.includes('afm')) { itemDetails = "투어 후 바로 이동"; itemTime = line.includes('afh') ? "18:00" : "17:00"; }
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
});
