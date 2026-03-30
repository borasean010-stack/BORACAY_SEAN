// admin.js - Final Full Luxury Admin (STRICT ORDER & KOREAN RESORTS)
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

    // 🚀 리조트 번역기 (한글 우선)
    function translateResort(name) {
        if (!name || name === '-') return '-';
        const n = name.toLowerCase().replace(/\s/g, '').replace(/\./g, '');
        if (n.includes('hgarden') || n.includes('henanngarden')) return '헤난 가든';
        if (n.includes('lagoon')) return '헤난 라군';
        if (n.includes('prime')) return '헤난 프라임';
        if (n.includes('palm')) return '헤난 팜';
        if (n.includes('park')) return '헤난 파크';
        if (n.includes('crystal')) return '헤난 크리스탈';
        if (n.includes('regency')) return '헤난 리젠시';
        if (n.includes('crimson')) return '크림슨';
        if (n.includes('savoy')) return '사보이';
        if (n.includes('belmont')) return '벨몬트';
        if (n.includes('hue')) return '휴 리조트';
        if (n.includes('fairway')) return '페어웨이';
        if (n.includes('discovery')) return '디스커버리';
        if (n.includes('movenpick')) return '모벤픽';
        if (n.includes('shangri')) return '샹그릴라';
        if (n.includes('astoria')) return '아스토리아';
        if (n.includes('mandarin')) return '만다린베이';
        if (n.includes('lind')) return '더 린드';
        if (n.includes('feliz')) return '펠리즈';
        if (n.includes('coast')) return '코스트';
        if (n.includes('gray')) return '세븐스톤';
        if (n.includes('henann')) return '헤난';
        return name; 
    }

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
        // 🚀 홈페이지 예약건만 관리 (퀵바우처 제외)
        onSnapshot(query(collection(db, "reservations"), orderBy("createdAt", "desc")), (snap) => {
            allReservations = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderAll();
        });
        // 🚀 스케줄 등록(운영용) 데이터만 관리
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
        // 🚀 홈페이지 예약건(allReservations)에 대해서만 카운트 계산
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

    window.switchScheduleDay = (day) => { currentScheduleDay = day; hideInputArea(); renderSchedule(); };
    window.filterSchedule = (category) => {
        currentScheduleFilter = category;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const txt = btn.innerText;
            const isMatch = (category === 'all' && txt === '전체') || 
                            (category === '마사지' && txt.includes('마사지')) ||
                            (category === '액티비티' && txt.includes('액티비티')) || 
                            txt === category;
            if (isMatch) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        renderSchedule();
    };

    function getCategory(name, details = '') {
        const combined = ((name || '') + ' ' + (details || '')).toLowerCase();
        
        if (combined.includes('픽업')) return '픽업';
        if (combined.includes('샌딩')) return '샌딩';
        if (combined.includes('hopping') || combined.includes('호핑')) return '호핑투어';
        if (combined.includes('land') || combined.includes('랜드')) return '랜드투어';
        if (combined.includes('massage') || combined.includes('마사지') || combined.includes('spa') || combined.includes('스파')) return '마사지';
        if (combined.includes('malum') || combined.includes('말룸')) return '말룸파티';
        
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

        let rawItems = [];
        
        // 🚀 홈페이지 예약(allReservations) 로직 완전 삭제
        // 오직 schedules (엑셀 등록 데이터)만 표시
        allSchedules.forEach(s => { 
            if (s.date === targetDate) {
                const lines = (s.details || '').split('\n').filter(l => l.trim() !== '');
                const displayLines = lines.length > 0 ? lines : [''];
                displayLines.forEach(line => {
                    rawItems.push({ 
                        time: s.time || "09:00", name: s.name, customer: s.customerName, count: s.count, status: '스케줄', id: s.id, source: 'schedule', 
                        resort: translateResort(s.resort || s.details?.split('리조트: ')[1] || "-"), 
                        flight: s.flight || s.details?.split('항공편: ')[1]?.split(' / ')[0] || "-",
                        details: line
                    }); 
                });
            }
        });

        if (currentScheduleFilter !== 'all') rawItems = rawItems.filter(i => getCategory(i.name, i.details) === currentScheduleFilter);
        
        // 🚀 그룹핑 로직 (항공편 또는 상품명 + 시간)
        const groups = {};
        rawItems.forEach(item => {
            const cat = getCategory(item.name, item.details);
            let groupTitle = item.name;
            
            if (cat === '픽업' || cat === '샌딩') {
                if (item.flight !== '-' && item.flight) {
                    groupTitle = item.flight;
                } else {
                    const flightMatch = item.name.match(/\(([A-Z0-9]+)\)/i);
                    if (flightMatch) groupTitle = flightMatch[1].toUpperCase();
                }
            } else if (cat === '마사지') {
                groupTitle = item.name.replace('마사지', '').replace('스파', '').trim() || '마사지';
            }
            
            const key = `${groupTitle}_${item.time}`;
            if (!groups[key]) {
                groups[key] = {
                    title: groupTitle,
                    time: item.time,
                    items: [],
                    totalCount: 0,
                    category: cat
                };
            }
            groups[key].items.push(item);
            groups[key].totalCount += item.count;
        });

        const sortedGroupKeys = Object.keys(groups).sort((a, b) => groups[a].time.localeCompare(groups[b].time));

        if (sortedGroupKeys.length === 0) { container.innerHTML = `<div class="sc-empty" style="width:100%; text-align:center; padding:30px; color:#999; font-size:12px;">일정이 없습니다.</div>`; return; }

        container.innerHTML = sortedGroupKeys.map(key => {
            const group = groups[key];
            let icon = "event_available", catClass = "cat-activity", catLabel = group.category;
            if (group.category === '픽업') { icon = "flight_land"; catClass = "cat-pickup"; catLabel = "공항 픽업"; }
            else if (group.category === '샌딩') { icon = "flight_takeoff"; catClass = "cat-sending"; catLabel = "공항 샌딩"; }
            else if (group.category === '호핑투어') { icon = "sailing"; catClass = "cat-hopping"; catLabel = "호핑투어"; }
            else if (group.category === '말룸파티') { icon = "nature_people"; catClass = "cat-malum"; catLabel = "말룸파티"; }
            else if (group.category === '랜드투어') { icon = "directions_car"; catClass = "cat-activity"; catLabel = "랜드투어"; }
            else if (group.category === '마사지') { icon = "spa"; catClass = "cat-activity"; catLabel = "마사지"; }

            let displayTitle = group.title;
            const lowerTitle = group.title.toLowerCase();
            if (lowerTitle.includes('hopping') || lowerTitle.includes('호핑')) {
                if (lowerTitle.includes('(j)') || lowerTitle.includes('점보')) {
                    displayTitle = '호핑투어 <span style="color:#ff6a00; font-size:11px;">(+점보크랩)</span>';
                } else {
                    displayTitle = '호핑투어';
                }
            }

            const itemLines = group.items.map(it => {
                const resortDisplay = it.resort !== '-' ? it.resort : '';
                return `<div class="sc-detail-row" onclick="showDetail('${it.id}', '${it.source}')">
                    <span class="sc-detail-name">${it.customer}</span>
                    <span class="sc-detail-pax">${it.count}인</span>
                    <span class="sc-detail-resort">${resortDisplay}</span>
                </div>`;
            }).join('');

            return `
            <div class="schedule-group-card">
                <div class="sg-header">
                    <div class="sg-time">${group.time}</div>
                    <div class="sg-title-row">
                        <span class="material-icons">${icon}</span>
                        <span class="sg-title">${displayTitle} <small>총 ${group.totalCount}인</small></span>
                    </div>
                    <span class="sc-category-tag ${catClass}">${catLabel}</span>
                </div>
                <div class="sg-body">
                    ${itemLines}
                </div>
            </div>`;
        }).join('');
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
            const firstItem = (res.items?.[0]?.name || '-') + (res.items?.length > 1 ? ` 외 ${res.items.length-1}건` : '');
            let actionButtons = `<button class="btn-action-received" style="background:#ff6a00; border-color:#ff6a00;" onclick="showDetail('${res.id}', 'reservation')"><span class="material-icons">visibility</span>상세</button><button class="btn-action-outline" onclick="copyCombinedVoucherLink('${res.contact}')"><span class="material-icons">content_copy</span>일정표</button>`;
            if (status === '예약접수' || status === '입금대기') actionButtons = `<button class="btn-action-received" onclick="handleAutoConfirm('${res.id}')"><span class="material-icons">payments</span>입금확인</button>` + actionButtons;
            if (status === '견적') actionButtons = `<button class="btn-action-received" onclick="handleResortQuoteComplete('${res.id}')"><span class="material-icons">task_alt</span>견적완료</button><button class="btn-action-received" style="background:#00c73c; border-color:#00c73c;" onclick="handleResortConfirm('${res.id}')"><span class="material-icons">check_circle</span>확정</button>` + actionButtons;
            tr.innerHTML = `<td><input type="checkbox"></td><td style="color:#bbb;">${filtered.length - index}</td><td>${res.reservationNumber || '-'}</td><td><div style="font-size:14px; font-weight:800;">${res.customerKorName}</div></td><td>${firstItem}</td><td>₩ ${(res.totalPrice || 0).toLocaleString()}</td><td>${res.createdAt?.toDate ? res.createdAt.toDate().toLocaleDateString() : '-'}</td><td><span class="n-badge ${status.includes('확정') ? 'badge-green' : 'badge-yellow'}">${status}</span></td><td><div style="display:flex; gap:5px;">${actionButtons}</div></td>`;
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

        const isQuote = res.status === '견적' || res.status === '견적완료';
        const totalVoucherBtn = isQuote ? '' : `<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;"><button onclick="copyCombinedVoucherLink('${res.contact}')" style="padding:12px; background:#00c73c; color:white; border:none; border-radius:8px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;"><span class="material-icons" style="font-size:18px;">people</span> 통합 링크</button><button onclick="copyVoucherLink('${res.id}', null)" style="padding:12px; background:#ff6a00; color:white; border:none; border-radius:8px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;"><span class="material-icons" style="font-size:18px;">share</span> 주문 일정</button></div>`;
        const itemsHtml = (res.items || []).map((item, idx) => `<div style="padding:12px; background:#f8f9fa; border:1px solid #eee; border-radius:8px; margin-bottom:8px;"><div style="display:flex; justify-content:space-between;"><div style="font-size:15px; font-weight:800;">${item.name}</div><div style="font-size:14px; font-weight:800; color:#ff6a00;">${item.count}명</div></div><div style="margin-top:6px; font-size:13px; color:#666;">📅 ${item.date} ${item.time || ''}</div>${!isQuote ? `<div style="margin-top:10px; display:flex; gap:5px;"><a href="reservation-schedule.html?id=${res.id}&itemIndex=${idx}" target="_blank" style="flex:1; text-align:center; padding:6px; background:#fff; border:1px solid #ddd; border-radius:4px; font-size:11px; text-decoration:none; color:#333;">바우처</a><button onclick="copyVoucherLink('${res.id}', ${idx})" style="flex:1; padding:6px; background:#ff6a00; color:white; border:none; border-radius:4px; font-size:11px; cursor:pointer;">복사</button></div>` : ''}</div>`).join('');
        const isQuick = id.startsWith('Q') || (res.reservationNumber && res.reservationNumber.startsWith('Q'));
        const displayEngName = res.engName || '-';
        const displayExchange = res.exchangeAmount || '-';
        const displayPax = res.paxInfo || (res.items?.[0]?.count ? `${res.items[0].count}명` : '-');

        body.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid #eee;"><h3 style="margin:0;">예약 상세 정보</h3><button onclick="copyGuidance('${res.id}')" style="background:#ff6a00; color:white; border:none; padding:8px 14px; border-radius:6px; font-weight:bold; cursor:pointer;">👉 안내문 복사</button></div><div id="modal-scroll-area" style="max-height: 60vh; overflow-y: auto;"><div style="margin-bottom:20px;">${totalVoucherBtn}${itemsHtml}</div><div style="background:#fcfcfc; padding:15px; border-radius:10px; border:1px solid #f0f0f0; margin-bottom:20px;"><p style="margin:0;">이름 | <b>${res.customerKorName}</b> (${displayEngName})</p><p style="margin:5px 0 0 0;">연락처 | <b>${res.contact}</b></p><p style="margin:5px 0 0 0;">인원 | <b>${displayPax}</b></p></div>${!isQuote ? `<div style="background:#fff5eb; padding:15px; border-radius:10px; border:1px solid #ffe8cc; margin-bottom:20px;"><div style="font-weight:bold; margin-bottom:10px; color:#ff6a00;">✈️ 항공 및 환전 정보</div><p style="margin:5px 0; font-size:13px;"><b>픽업:</b> ${res.pickupDate || '-'} / ${res.pickupFlight || '-'} / ${res.pickupResort || '-'}</p><p style="margin:5px 0; font-size:13px;"><b>샌딩:</b> ${res.sendingDate || '-'} / ${res.sendingFlight || '-'} / ${res.sendingResort || '-'}</p><p style="margin-top:10px; padding-top:10px; border-top:1px dashed #ffd8a8;"><b>💰 환전:</b> <span style="font-size:15px; color:#e67e22; font-weight:800;">${displayExchange}</span></p></div>` : ''}<div style="padding:10px; background:#f8f9fa; border-radius:6px; font-size:13px; white-space:pre-wrap;"><b>[요청사항]</b>\n${res.requests || '없음'}</div></div><div style="display:flex; gap:10px; margin-top:20px; padding-top:15px; border-top:1px solid #eee;"><button id="edit-btn" onclick="toggleEditMode('${res.id}')" style="flex:1; padding:12px; background:#ff6a00; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">수정하기</button><button onclick="closeModal()" style="flex:1; padding:12px; background:#333; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">창 닫기</button></div>`;
        modal.style.display = 'flex';
    };

    window.copyVoucherLink = (id, idx) => { const url = `${window.location.origin}/reservation-schedule.html?id=${id}${idx !== null ? `&itemIndex=${idx}` : ''}`; navigator.clipboard.writeText(url).then(() => alert('바우처 링크가 복사되었습니다.')); };
    window.copyCombinedVoucherLink = (contact) => { navigator.clipboard.writeText(`${window.location.origin}/reservation-schedule.html?contact=${encodeURIComponent(contact)}`).then(() => alert('통합 일정표 링크 복사 완료!')); };
    window.copyGuidance = (id) => { const res = allReservations.find(r => r.id === id); if (!res) return; let msg = `[보라카이션 예약 확정 안내]\n\n대표자: ${res.customerKorName}\n투어내역:\n${res.items.map(i => `- ${i.name} (${i.date} ${i.time || ''}) / ${i.count}명`).join('\n')}\n\n감사합니다.`; navigator.clipboard.writeText(msg).then(() => alert('안내문이 복사되었습니다.')); };
    window.showInputArea = (type) => { hideInputArea(); document.getElementById(`input-area-${type}`).style.display = 'block'; window.scrollTo({ top: 0, behavior: 'smooth' }); };
    window.hideInputArea = () => { const qa = document.getElementById('input-area-quick'), ra = document.getElementById('input-area-reg'); if(qa) qa.style.display = 'none'; if(ra) ra.style.display = 'none'; };
    window.closeModal = () => { document.getElementById('res-detail-modal').style.display = 'none'; };

    window.toggleEditMode = (id) => {
        const res = allReservations.find(r => r.id === id); if (!res) return;
        const scrollArea = document.getElementById('modal-scroll-area'); const editBtn = document.getElementById('edit-btn');
        if (editBtn.innerText === '수정하기') {
            editBtn.innerText = '저장하기';
            scrollArea.innerHTML = `<div style="background:#f8f9fa; padding:15px; border-radius:12px;"><label style="font-size:11px; color:#999;">한글명</label><input type="text" id="edit-name" value="${res.customerKorName}" style="width:100%; padding:8px; margin-bottom:10px;"><label style="font-size:11px; color:#999;">연락처</label><input type="text" id="edit-contact" value="${res.contact}" style="width:100%; padding:8px; margin-bottom:10px;"><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"><div><label style="font-size:11px; color:#999;">픽업일</label><input type="text" id="edit-p-date" value="${res.pickupDate || ''}" style="width:100%; padding:8px;"></div><div><label style="font-size:11px; color:#999;">픽업리조트</label><input type="text" id="edit-p-resort" value="${res.pickupResort || ''}" style="width:100%; padding:8px;"></div></div><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;"><div><label style="font-size:11px; color:#999;">샌딩일</label><input type="text" id="edit-s-date" value="${res.sendingDate || ''}" style="width:100%; padding:8px;"></div><div><label style="font-size:11px; color:#999;">샌딩리조트</label><input type="text" id="edit-s-resort" value="${res.sendingResort || ''}" style="width:100%; padding:8px;"></div></div><label style="font-size:11px; color:#999; margin-top:10px; display:block;">총 금액</label><input type="number" id="edit-price" value="${res.totalPrice}" style="width:100%; padding:8px; margin-bottom:10px;"><label style="font-size:11px; color:#999;">요청사항</label><textarea id="edit-requests" style="width:100%; height:80px; padding:8px;">${res.requests || ''}</textarea></div>`;
        } else {
            const newData = { customerKorName: document.getElementById('edit-name').value, contact: document.getElementById('edit-contact').value, pickupDate: document.getElementById('edit-p-date').value, pickupResort: document.getElementById('edit-p-resort').value, sendingDate: document.getElementById('edit-s-date').value, sendingResort: document.getElementById('edit-s-resort').value, totalPrice: parseInt(document.getElementById('edit-price').value) || 0, requests: document.getElementById('edit-requests').value };
            updateDoc(doc(db, "reservations", id), newData).then(() => { alert("저장 완료!"); closeModal(); });
        }
    };

    window.registerBulkSchedule = async () => {
        const inputVal = document.getElementById('schedule-reg-input').value.trim(); if (!inputVal) return;
        const currentYear = new Date().getFullYear(); const batch = writeBatch(db); let count = 0;
        const tempAddedSet = new Set();
        for (let line of inputVal.split('\n')) {
            const parts = line.split('\t'); if (parts.length < 16) continue;
            
            const p10 = (parts[10] || '').trim();
            const p15 = (parts[15] || '').trim();
            const isP10Korean = /[가-힣]/.test(p10);
            const isP15Nickname = p15.includes('맘') || p15.includes('아빠') || p15.includes('네') || p15.length > 5;
            
            let korName = p15; let engName = p10;
            if (isP10Korean && !p10.includes(' ')) { korName = p10; engName = p15; }
            else if (isP15Nickname) { if (isP10Korean) { korName = p10; engName = p15; } }

            const totalPax = (parseInt(parts[11]) || 0) + (parseInt(parts[12]) || 0) + (parseInt(parts[13]) || 0);
            const resortRaw = (parts[9] || '').trim();
            const pResort = translateResort(resortRaw.split('/')[0].trim());
            const sResort = translateResort(resortRaw.split('/')[1]?.trim() || pResort);

            const formatDate = (raw) => { if (!raw || !raw.includes('/')) return null; const [m, d] = raw.split('/').map(v => v.trim().padStart(2,'0')); return `${currentYear}-${m}-${d}`; };
            const checkAndAdd = (name, date, time, specPax = totalPax, flight = "-") => { 
                if (!date) return; const uniqueKey = `${korName}_${date}_${name}`;
                if (!allSchedules.some(s => s.customerName.includes(korName) && s.date === date && s.name === name) && !tempAddedSet.has(uniqueKey)) { 
                    const resort = name.includes('샌딩') ? sResort : pResort;
                    batch.set(doc(collection(db, "schedules")), { 
                        customerName: `${korName} (${engName})`, 
                        name, 
                        date, 
                        time, 
                        count: specPax, 
                        flight,
                        resort,
                        createdAt: new Date(), 
                        details: `리조트: ${resort}` 
                    }); 
                    tempAddedSet.add(uniqueKey); count++; 
                } 
            };

            if (parts[2] && parts[2].match(/[A-Z0-9]+/)) checkAndAdd(`✈️ 공항 픽업 (${parts[2].toUpperCase()})`, formatDate(parts[0]), "14:00", totalPax, parts[2].toUpperCase());
            if (parts[3] && parts[3].match(/[A-Z0-9]+/)) checkAndAdd(`✈️ 공항 샌딩 (${parts[3].toUpperCase()})`, formatDate(parts[1]), (parts[3].toUpperCase() === 'TW126' ? "08:30" : "21:00"), totalPax, parts[3].toUpperCase());
            
            const remarkRaw = (parts[16] || '').replace(/^"|"$/g, '');
            remarkRaw.split('\n').forEach(rLine => {
                const dm = rLine.trim().match(/^(\d{1,2})\/(\d{1,2})/);
                if (dm) {
                    const tDate = formatDate(dm[0]); let itemName = rLine.replace(dm[0], '').replace(/GET\$.*|잔금.*|\$.*/g, '').trim();
                    let itemTime = "09:00"; let itemPax = totalPax;
                    
                    const mCount = rLine.match(/\d+(?=명|인|태반|성장|스톤|오일|포쉘|진주)/g) || rLine.match(/\d+/g);
                    if ((rLine.includes('spa') || rLine.includes('스파')) && mCount) {
                        const sum = mCount.filter(n => parseInt(n) < 20).reduce((a, b) => parseInt(a) + parseInt(b), 0);
                        if (sum > 0) itemPax = sum;
                    }

                    const timeMatch = rLine.match(/(\d{1,2}):(\d{2})/); if (timeMatch) itemTime = `${timeMatch[1].padStart(2,'0')}:${timeMatch[2]}`;
                    const lowerLine = itemName.toLowerCase();
                    if (lowerLine.includes('land')) { itemName = '보라카이 랜드투어'; if(!timeMatch) itemTime = "10:30"; }
                    else if (lowerLine.includes('hopping')) { if (lowerLine.includes('(j)')) { itemName = '블랙펄 호핑투어 (+점보크랩 점심)'; if(!timeMatch) itemTime = "12:30"; } else { itemName = '블랙펄 선셋 호핑투어'; if(!timeMatch) itemTime = "13:30"; } }
                    else if (lowerLine.includes('sspa') || lowerLine.includes('에스파')) itemName = '에스파(S-SPA)';
                    else if (lowerLine.includes('luna') || lowerLine.includes('루나')) itemName = '루나스파';
                    else if (lowerLine.includes('bora') || lowerLine.includes('보라')) itemName = '보라스파';
                    else if (lowerLine.includes('para')) itemName = '파라세일링';
                    else if (lowerLine.includes('diving')) itemName = '체험다이빙';
                    else if (lowerLine.includes('zetski')) itemName = '제트스키';
                    else if (lowerLine.includes('helmet')) itemName = '헬멧다이빙';
                    if (rLine.includes('afh') || rLine.includes('AFH')) itemTime = "18:00";
                    else if (rLine.includes('afm') || rLine.includes('AFM')) itemTime = "17:00";
                    
                    checkAndAdd(itemName, tDate, itemTime, itemPax);
                }
            });
        }
        if (count > 0) { 
            await batch.commit(); 
            alert(`${count}건 업데이트 완료!`); 
            document.getElementById('schedule-reg-input').value = ''; 
            hideInputArea(); 
        }
    };

    window.handleClearSchedules = async () => {
        if (confirm("🚨 모든 스케줄 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) {
            try {
                const snap = await getDocs(collection(db, "schedules"));
                if (snap.empty) { alert("삭제할 스케줄이 없습니다."); return; }
                const docs = snap.docs;
                for (let i = 0; i < docs.length; i += 500) {
                    const batch = writeBatch(db);
                    const chunk = docs.slice(i, i + 500);
                    chunk.forEach(d => batch.delete(d.ref));
                    await batch.commit();
                }
                alert("스케줄 데이터가 초기화되었습니다.");
            } catch (e) { alert("삭제 중 오류가 발생했습니다."); }
        }
    };

    window.handleClearAllData = async () => {
        const pw = prompt("🚨 모든 데이터를 삭제하시겠습니까?\n이 작업은 절대 되돌릴 수 없습니다.\n비밀번호를 입력하세요:");
        if (pw === "sean1234!") {
            try {
                const colls = ["reservations", "quick_vouchers", "schedules"];
                for (const cName of colls) {
                    const snap = await getDocs(collection(db, cName));
                    const docs = snap.docs;
                    for (let i = 0; i < docs.length; i += 500) {
                        const batch = writeBatch(db);
                        const chunk = docs.slice(i, i + 500);
                        chunk.forEach(d => batch.delete(d.ref));
                        await batch.commit();
                    }
                }
                alert("모든 데이터가 초기화되었습니다.");
                location.reload();
            } catch (error) {
                console.error("Clear All Error:", error);
                alert("초기화 중 오류가 발생했습니다.");
            }
        } else if (pw !== null) {
            alert("비밀번호가 틀렸습니다.");
        }
    };

    window.makeQuickVoucher = async () => {
        const inputVal = document.getElementById('quick-voucher-input').value.trim(); if (!inputVal) return;
        const parts = inputVal.split('\t'); if (parts.length < 16) return;
        const currentYear = new Date().getFullYear();
        
        const p10 = (parts[10] || '').trim();
        const p15 = (parts[15] || '').trim();
        const isP10Korean = /[가-힣]/.test(p10);
        const isP15Nickname = p15.includes('맘') || p15.includes('아빠') || p15.includes('네') || p15.length > 5;
        
        let korName = p15; let engName = p10;
        if (isP10Korean && !p10.includes(' ')) { korName = p10; engName = p15; }
        else if (isP15Nickname) { if (isP10Korean) { korName = p10; engName = p15; } }

        const totalPax = (parseInt(parts[11]) || 0) + (parseInt(parts[12]) || 0) + (parseInt(parts[13]) || 0);
        const resortRaw = (parts[9] || '').trim();
        const pResort = translateResort(resortRaw.split('/')[0].trim());
        const sResort = translateResort(resortRaw.split('/')[1]?.trim() || pResort);

        const formatDate = (raw) => { if (!raw || !raw.includes('/')) return null; const [m, d] = raw.split('/').map(v => v.trim().padStart(2,'0')); return `${currentYear}-${m}-${d}`; };
        
        const remarkRaw = (parts[16] || '').replace(/^"|"$/g, '');
        // 💰 환전 금액 추출: 5번 인덱스에서만 정확하게 가져옴 (24번 등 입금 금액 절대 사용 금지)
        let exVal = (parts[5] || '').trim();
        
        // 날짜 데이터이거나 특정 기호(▲)가 포함된 경우, 혹은 값이 비어있는 경우 '-' 처리
        if (exVal.includes('/') || exVal.includes('▲') || exVal === '0' || !exVal) {
            exVal = '-';
        }

        const items = [];
        if (parts[2] && parts[2].match(/[A-Z]{2}\d+/)) items.push({ name: `✈️ 공항 픽업 (${parts[2].toUpperCase()})`, date: formatDate(parts[0]), time: "14:00", count: totalPax });
        if (parts[3] && parts[3].match(/[A-Z]{2}\d+/)) items.push({ name: `✈️ 공항 샌딩 (${parts[3].toUpperCase()})`, date: formatDate(parts[1]), time: (parts[3].toUpperCase() === 'TW126' ? "08:30" : "21:00"), count: totalPax });
        remarkRaw.split('\n').forEach(line => {
            const dm = line.trim().match(/^(\d{1,2})\/(\d{1,2})/);
            if (dm) {
                let itemName = line.replace(dm[0], '').trim(); let itemTime = "09:00"; let itemPax = totalPax;
                // 🏷️ 인원수 추출 로직 개선 (날짜/시간 오인 방지)
                const mCount = line.match(/\d+(?=명|인|태반|성장|스톤|오일|포쉘|진주)/g);
                if ((line.includes('spa') || line.includes('스파')) && mCount) {
                    const sum = mCount.filter(n => parseInt(n) < 15).reduce((a, b) => parseInt(a) + parseInt(b), 0);
                    if (sum > 0) itemPax = sum;
                } else if (line.includes('spa') || line.includes('스파')) {
                    // 명시적 키워드가 없는 경우, 줄에서 숫자만 찾되 날짜(dm)와 시간(20:00 등) 제외
                    const lineWithoutTime = line.replace(/\d{1,2}:\d{2}/g, '').replace(dm[0], '');
                    const simpleNumbers = lineWithoutTime.match(/\d+/g);
                    if (simpleNumbers) {
                        const sum = simpleNumbers.filter(n => parseInt(n) < 15).reduce((a, b) => parseInt(a) + parseInt(b), 0);
                        if (sum > 0) itemPax = sum;
                    }
                }
                const timeMatch = line.match(/(\d{1,2}):(\d{2})/); if (timeMatch) itemTime = `${timeMatch[1].padStart(2,'0')}:${timeMatch[2]}`;
                const lowerLine = itemName.toLowerCase();
                if (lowerLine.includes('sspa') || lowerLine.includes('에스파')) itemName = '에스파(S-SPA)';
                else if (lowerLine.includes('luna') || lowerLine.includes('루나')) itemName = '루나스파';
                else if (lowerLine.includes('bora') || lowerLine.includes('보라')) itemName = '보라스파';
                else if (lowerLine.includes('land')) { itemName = '보라카이 랜드투어'; if(!timeMatch) itemTime = "10:30"; }
                else if (lowerLine.includes('hopping')) { if (lowerLine.includes('(j)')) { itemName = '블랙펄 호핑투어 (+점보크랩 점심)'; if(!timeMatch) itemTime = "12:30"; } else { itemName = '블랙펄 선셋 호핑투어'; if(!timeMatch) itemTime = "13:30"; } }
                else if (lowerLine.includes('para')) itemName = '파라세일링';
                else if (lowerLine.includes('diving')) itemName = '체험다이빙';
                else if (lowerLine.includes('zetski')) itemName = '제트스키';
                else if (lowerLine.includes('helmet')) itemName = '헬멧다이빙';
                
                if (line.includes('afh') || line.includes('AFH')) itemTime = "18:00";
                else if (line.includes('afm') || line.includes('AFM')) itemTime = "17:00";
                
                items.push({ name: itemName, date: formatDate(dm[0]), time: itemTime, count: itemPax, details: line });
            }
        });
        const resData = { customerKorName: `${korName} (${engName})`, contact: (parts[14] || '').trim(), items, status: '예약확정', exchangeAmount: exVal, paxInfo: `성인 ${parts[11]}, 아동 ${parts[12]}, 유아 ${parts[13]}`, pickupResort: pResort, sendingResort: sResort, createdAt: new Date() };
        const docRef = await addDoc(collection(db, "quick_vouchers"), resData);
        navigator.clipboard.writeText(`${window.location.origin}/reservation-schedule.html?id=${docRef.id}&type=quick`).then(() => {
            alert('바우처 생성 완료!');
            document.getElementById('quick-voucher-input').value = ''; // 🔄 입력칸 리셋
            hideInputArea();
        });
    };
});