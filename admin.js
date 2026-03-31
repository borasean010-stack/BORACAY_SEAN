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
        if (n.includes('crystal') || n.includes('sands')) return '헤난 크리스탈';
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
        
        onSnapshot(query(collection(db, "reservations"), orderBy("createdAt", "desc")), (snap) => {
            allReservations = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderAll();
        });
        
        onSnapshot(query(collection(db, "schedules"), orderBy("date", "asc")), (snap) => {
            allSchedules = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderAll();
        });

        autoCleanupOldSchedules();
    }

    async function autoCleanupOldSchedules() {
        if (!db) return;
        try {
            const now = new Date();
            const offset = now.getTimezoneOffset() * 60000;
            const todayStr = new Date(now.getTime() - offset).toISOString().split('T')[0];
            const q = query(collection(db, "schedules"), where("date", "<", todayStr));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const batch = writeBatch(db);
                snap.docs.forEach(d => batch.delete(d.ref));
                await batch.commit();
            }
        } catch (e) { console.error("Auto cleanup error:", e); }
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

    window.switchScheduleDay = (day) => { currentScheduleDay = day; window.hideInputArea(); renderSchedule(); };
    window.filterSchedule = (category) => {
        currentScheduleFilter = category;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const txt = btn.innerText;
            const isMatch = (category === 'all' && txt === '전체') || txt === category;
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
        
        const groups = {};
        rawItems.forEach(item => {
            const cat = getCategory(item.name, item.details);
            let groupTitle = item.name;
            if (cat === '픽업' || cat === '샌딩') {
                groupTitle = (item.flight !== '-' && item.flight) ? item.flight : '기타 항공편';
            } else if (item.name.toLowerCase().includes('마사지') || item.name.toLowerCase().includes('스파')) {
                groupTitle = item.name.replace(/마사지|스파|\(|\)/g, '').trim() || '마사지';
            }
            const key = `${cat}_${groupTitle}_${item.time}`;
            if (!groups[key]) {
                groups[key] = { title: groupTitle, time: item.time, items: [], totalCount: 0, category: cat };
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
            if (group.items.some(it => it.name.toLowerCase().includes('마사지') || it.name.toLowerCase().includes('스파'))) icon = "spa";

            let headerTitle = `${group.title} <small>(${group.totalCount}명)</small>`;
            if (group.category === '픽업' || group.category === '샌딩') { headerTitle = `${group.title} <small>(총 ${group.totalCount}명)</small>`; }

            let bodyHtml = "";
            if (group.category === '호핑투어') {
                const withJumbo = group.items.filter(it => it.name.includes('점보') || it.name.toLowerCase().includes('(j)'));
                const withoutJumbo = group.items.filter(it => !it.name.includes('점보') && !it.name.toLowerCase().includes('(j)'));
                if (withJumbo.length > 0) {
                    const count = withJumbo.reduce((acc, i) => acc + i.count, 0);
                    bodyHtml += `<div style="padding:8px 12px; background:#fff5eb; font-weight:bold; font-size:12px; color:#e67e22;">- 점보크랩 런치 포함 (${count}명)</div>`;
                    bodyHtml += withJumbo.map(it => `<div class="sc-detail-row" onclick="showDetail('${it.id}', '${it.source}')"><span class="sc-detail-name">${it.customer}</span><span class="sc-detail-pax">${it.count}인</span></div>`).join('');
                }
                if (withoutJumbo.length > 0) {
                    const count = withoutJumbo.reduce((acc, i) => acc + i.count, 0);
                    bodyHtml += `<div style="padding:8px 12px; background:#f8f9fa; font-weight:bold; font-size:12px; color:#666;">- 점보크랩 런치 불포함 (${count}명)</div>`;
                    bodyHtml += withoutJumbo.map(it => `<div class="sc-detail-row" onclick="showDetail('${it.id}', '${it.source}')"><span class="sc-detail-name">${it.customer}</span><span class="sc-detail-pax">${it.count}인</span></div>`).join('');
                }
            } else if (icon === "spa") {
                const hasShuttle = ["에스파", "루나", "보라"].some(s => group.title.includes(s));
                bodyHtml += `<div style="padding:8px 12px; background:#f0f7ff; font-weight:bold; font-size:12px; color:#007bff;">${group.title} (${hasShuttle ? '셔틀O' : '셔틀X'})</div>`;
                bodyHtml += group.items.map(it => {
                    const resortStr = hasShuttle ? `<span class="sc-detail-resort">${it.resort}</span>` : "";
                    return `<div class="sc-detail-row" onclick="showDetail('${it.id}', '${it.source}')"><span class="sc-detail-name">${it.customer}</span><span class="sc-detail-pax">${it.count}인</span>${resortStr}</div>`;
                }).join('');
            } else {
                bodyHtml = group.items.map(it => {
                    const showResort = (group.category === '픽업' || group.category === '샌딩' || group.category === '액티비티');
                    const resortStr = (showResort && it.resort !== '-') ? `<span class="sc-detail-resort">${it.resort}</span>` : '';
                    const activityName = (group.category === '액티비티' && !it.name.includes('마사지') && !it.name.includes('스파')) ? `<span style="font-size:11px; color:#999; margin-right:5px;">[${it.name}]</span>` : "";
                    return `<div class="sc-detail-row" onclick="showDetail('${it.id}', '${it.source}')">${activityName}<span class="sc-detail-name">${it.customer}</span><span class="sc-detail-pax">${it.count}인</span>${resortStr}</div>`;
                }).join('');
            }

            return `<div class="schedule-group-card">
                <div class="sg-header">
                    <div class="sg-time">${group.time}</div>
                    <div class="sg-title-row">
                        <span class="material-icons">${icon}</span>
                        <span class="sg-title">${headerTitle}</span>
                    </div>
                    <span class="sc-category-tag ${catClass}">${catLabel}</span>
                </div>
                <div class="sg-body">${bodyHtml}</div>
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
        const toolGrid = document.querySelector('.main-tool-grid');
        const timelineSec = document.querySelector('.timeline-section');
        if (tab === 'system') {
            if (toolGrid) toolGrid.style.display = 'none';
            if (timelineSec) timelineSec.style.display = 'none';
            document.getElementById('system-setup-section').style.display = 'block';
            document.getElementById('data-view-section').style.display = 'block';
            if (bActive) bActive.innerText = '시스템 초기화';
            renderCleanupTable();
        } else {
            if (toolGrid) toolGrid.style.display = 'grid';
            if (timelineSec) timelineSec.style.display = 'block';
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
            let matchesTab = false;
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

    window.deleteSingleReservation = async (id) => {
        if (confirm("이 예약을 정말로 삭제하시겠습니까?")) {
            try { await deleteDoc(doc(db, "reservations", id)); alert("삭제되었습니다."); fetchData(); } catch (e) { alert("삭제 실패"); }
        }
    };

    window.handleAutoConfirm = async (id) => {
        if (!confirm("입금 확인 및 예약 확정 처리를 하시겠습니까?")) return;
        try {
            await updateDoc(doc(db, "reservations", id), { status: '예약확정' });
            alert("예약이 확정되었습니다.");
            fetchData();
        } catch (e) { alert("확정 처리 실패"); }
    };

    window.handleResortConfirm = async (id) => {
        if (!confirm("리조트 예약을 확정하시겠습니까?")) return;
        try {
            await updateDoc(doc(db, "reservations", id), { status: '리조트확정' });
            alert("리조트 예약이 확정되었습니다.");
            fetchData();
        } catch (e) { alert("확정 처리 실패"); }
    };

    window.handleResortQuoteComplete = async (id) => {
        try { await deleteDoc(doc(db, "reservations", id)); fetchData(); } catch (e) { console.error("삭제 실패", e); }
    };

    function renderCleanupTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        allReservations.forEach((res, index) => {
            const tr = document.createElement('tr');
            const firstItem = (res.items?.[0]?.name || '-') + (res.items?.length > 1 ? ` 외 ${res.items.length-1}건` : '');
            tr.innerHTML = `<td><input type="checkbox"></td><td style="color:#bbb;">${allReservations.length - index}</td><td>${res.reservationNumber || '-'}</td><td><b>${res.customerKorName}</b></td><td>${firstItem}</td><td>₩ ${(res.totalPrice || 0).toLocaleString()}</td><td>-</td><td>${res.status}</td><td><button class="btn-action-received" style="background:#ff4b4b; border-color:#ff4b4b;" onclick="deleteSingleReservation('${res.id}')"><span class="material-icons">delete</span>단품삭제</button></td>`;
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
        const displayEngName = res.engName || '-';
        const displayExchange = res.exchangeAmount || '-';
        const displayPax = res.paxInfo || (res.items?.[0]?.count ? `${res.items[0].count}명` : '-');
        body.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid #eee;"><h3 style="margin:0;">예약 상세 정보</h3><button onclick="copyGuidance('${res.id}')" style="background:#ff6a00; color:white; border:none; padding:8px 14px; border-radius:6px; font-weight:bold; cursor:pointer;">👉 안내문 복사</button></div><div id="modal-scroll-area" style="max-height: 60vh; overflow-y: auto;"><div style="margin-bottom:20px;">${totalVoucherBtn}${itemsHtml}</div><div style="background:#fcfcfc; padding:15px; border-radius:10px; border:1px solid #f0f0f0; margin-bottom:20px;"><p style="margin:0;">이름 | <b>${res.customerKorName}</b> (${displayEngName})</p><p style="margin:5px 0 0 0;">연락처 | <b>${res.contact}</b></p><p style="margin:5px 0 0 0;">인원 | <b>${displayPax}</b></p></div>${!isQuote ? `<div style="background:#fff5eb; padding:15px; border-radius:10px; border:1px solid #ffe8cc; margin-bottom:20px;"><div style="font-weight:bold; margin-bottom:10px; color:#ff6a00;">✈️ 항공 및 환전 정보</div><p style="margin:5px 0; font-size:13px;"><b>픽업:</b> ${res.pickupDate || '-'} / ${res.pickupFlight || '-'} / ${res.pickupResort || '-'}</p><p style="margin:5px 0; font-size:13px;"><b>샌딩:</b> ${res.sendingDate || '-'} / ${res.sendingFlight || '-'} / ${res.sendingResort || '-'}</p><p style="margin-top:10px; padding-top:10px; border-top:1px dashed #ffd8a8;"><b>💰 환전:</b> <span style="font-size:15px; color:#e67e22; font-weight:800;">${displayExchange}</span></p></div>` : ''}<div style="padding:10px; background:#f8f9fa; border-radius:6px; font-size:13px; white-space:pre-wrap;"><b>[요청사항]</b>\n${res.requests || '없음'}</div></div><div style="display:flex; gap:10px; margin-top:20px; padding-top:15px; border-top:1px solid #eee;"><button id="edit-btn" onclick="toggleEditMode('${res.id}')" style="flex:1; padding:12px; background:#ff6a00; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">수정하기</button><button onclick="closeModal()" style="flex:1; padding:12px; background:#333; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">창 닫기</button></div>`;
        modal.style.display = 'flex';
    };

    window.copyVoucherLink = (id, idx) => { const url = `${window.location.origin}/reservation-schedule.html?id=${id}${idx !== null ? `&itemIndex=${idx}` : ''}`; navigator.clipboard.writeText(url).then(() => alert('바우처 링크가 복사되었습니다.')); };
    window.copyCombinedVoucherLink = (contact) => { navigator.clipboard.writeText(`${window.location.origin}/reservation-schedule.html?contact=${encodeURIComponent(contact)}`).then(() => alert('통합 일정표 링크 복사 완료!')); };
    window.copyGuidance = (id) => { const res = allReservations.find(r => r.id === id); if (!res) return; let msg = `[보라카이션 예약 확정 안내]\n\n대표자: ${res.customerKorName}\n투어내역:\n${res.items.map(i => `- ${i.name} (${i.date} ${i.time || ''}) / ${i.count}명`).join('\n')}\n\n감사합니다.`; navigator.clipboard.writeText(msg).then(() => alert('안내문이 복사되었습니다.')); };
    window.showInputArea = (type) => { window.hideInputArea(); document.getElementById(`input-area-${type}`).style.display = 'block'; window.scrollTo({ top: 0, behavior: 'smooth' }); };
    window.hideInputArea = () => { const qa = document.getElementById('input-area-quick'), ra = document.getElementById('input-area-reg'); if(qa) qa.style.display = 'none'; if(ra) ra.style.display = 'none'; };
    window.closeModal = () => { document.getElementById('res-detail-modal').style.display = 'none'; };

    window.registerBulkSchedule = async () => {
        const input = document.getElementById('schedule-reg-input').value.trim();
        if (!input) return;
        try {
            // "베스트" 로직: 빈 줄을 기준으로 데이터 블록을 나누거나, 이름 패턴으로 블록을 구분
            const blocks = input.split(/\n(?=[가-힣a-zA-Z]{2,}\t|\n)/).filter(b => b.trim());
            const batch = writeBatch(db);
            let count = 0;
            const currentYear = new Date().getFullYear();

            for (const block of blocks) {
                const lines = block.split('\n').filter(l => l.trim());
                if (lines.length === 0) continue;

                // 첫 번째 줄에서 이름과 기본 인원 파악 (탭 구분 우선)
                const firstLine = lines[0];
                const tabs = firstLine.split('\t');
                let customer = "고객";
                let basePax = 0;

                if (tabs.length >= 2) {
                    customer = tabs[0].trim();
                    // 4 3 1 패턴 인식 (탭으로 구분된 경우)
                    const p1 = parseInt(tabs[1]) || 0;
                    const p2 = parseInt(tabs[2]) || 0;
                    basePax = p1 + p2; // 성인 + 아동
                } else {
                    // 탭이 없는 경우 이름 추출
                    const nameMatch = firstLine.match(/^[가-힣a-zA-Z\s]{2,}/);
                    if (nameMatch) customer = nameMatch[0].trim();
                }

                // 블록 내의 모든 줄을 검사하여 날짜가 있는 줄을 스케줄로 등록
                for (const line of lines) {
                    const dateMatch = line.match(/(\d{1,2})\/(\d{1,2})/);
                    if (!dateMatch) continue;

                    const dateStr = `${currentYear}-${dateMatch[1].padStart(2,'0')}-${dateMatch[2].padStart(2,'0')}`;
                    const timeMatch = line.match(/(\d{1,2}):(\d{2})/);
                    const timeStr = timeMatch ? `${timeMatch[1].padStart(2,'0')}:${timeMatch[2]}` : "09:00";

                    // 세부 인원 계산 (태반4, 성장3 등)
                    let paxCount = 0;
                    const mCount = line.match(/\d+(?=명|인|태반|성장|스톤|오일|포쉘|진주)/g);
                    if (mCount) {
                        paxCount = mCount.reduce((a, b) => a + parseInt(b), 0);
                    }
                    if (paxCount === 0) paxCount = basePax || 2;

                    // 장소 및 상품명 추출
                    let name = "기타 일정";
                    let resort = "-";
                    const lowerLine = line.toLowerCase();
                    
                    // Savemore 등 장소 키워드
                    if (lowerLine.includes('savemore') || line.includes('세이브모어')) resort = "세이브모어";
                    else {
                        const locMatch = line.match(/([가-힣a-zA-Z]+)\s?(?:pick\s?up|픽업)/i);
                        if (locMatch && !['공항','샌딩'].includes(locMatch[1])) resort = locMatch[1];
                    }

                    if (line.includes('픽업')) name = '공항 픽업';
                    else if (line.includes('샌딩')) name = '공항 샌딩';
                    else if (line.includes('호핑')) name = '호핑투어';
                    else if (line.includes('말룸')) name = '말룸파티';
                    else if (line.includes('랜드')) name = '보라카이 랜드투어';
                    else if (lowerLine.includes('spa') || line.includes('스파') || line.includes('마사지')) {
                        if (lowerLine.includes('luna') || line.includes('루나')) name = '루나스파';
                        else if (lowerLine.includes('bora') || line.includes('보라')) name = '보라스파';
                        else if (lowerLine.includes('sspa') || line.includes('에스파')) name = '에스파(S-SPA)';
                        else name = '마사지';
                    }

                    const docRef = doc(collection(db, "schedules"));
                    batch.set(docRef, { 
                        date: dateStr, 
                        time: timeStr, 
                        name: name, 
                        customerName: customer, 
                        count: paxCount, 
                        resort: translateResort(resort), 
                        details: line.trim(), 
                        createdAt: new Date() 
                    });
                    count++;
                }
            }

            if (count > 0) { 
                await batch.commit(); 
                alert(`${count}건의 스케줄이 성공적으로 등록되었습니다.`); 
                document.getElementById('schedule-reg-input').value = ''; 
                window.hideInputArea(); 
            } else {
                alert("등록 가능한 날짜 정보(예: 3/30)를 찾지 못했습니다.");
            }
        } catch (e) { 
            console.error("Bulk Register Error:", e);
            alert("등록 중 오류가 발생했습니다."); 
        }
    };

    window.handleClearSchedules = async () => {
        if (!confirm("현재 등록된 모든 일정(스케줄)만 삭제하시겠습니까?\n(예약 내역이나 바우처는 삭제되지 않습니다.)")) return;
        try {
            if (!db) { alert("데이터베이스 연결 오류"); return; }
            const snap = await getDocs(collection(db, "schedules"));
            if (snap.empty) { alert("삭제할 일정이 없습니다."); return; }
            
            const batch = writeBatch(db);
            snap.docs.forEach(d => batch.delete(d.ref));
            await batch.commit();
            alert("일정 데이터만 삭제 완료되었습니다.");
        } catch (e) { 
            console.error("Clear Schedules Error:", e);
            alert("삭제 중 오류가 발생했습니다."); 
        }
    };

    window.handleClearAllData = async () => {
        if (!confirm("정말로 모든 데이터를 초기화하시겠습니까? (예약, 바우처, 스케줄 포함)")) return;
        try {
            const colls = ["reservations", "quick_vouchers", "schedules", "resort_quotes"];
            for (const c of colls) {
                const snap = await getDocs(collection(db, c));
                const batch = writeBatch(db);
                snap.docs.forEach(d => batch.delete(d.ref));
                await batch.commit();
            }
            alert("전체 초기화 완료");
            location.reload();
        } catch (e) { alert("초기화 실패"); }
    };

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

    window.makeQuickVoucher = async () => {
        const inputVal = document.getElementById('quick-voucher-input').value.trim(); if (!inputVal) return;
        
        const parseRobustTSV = (text) => {
            const rows = [];
            let currentRow = [];
            let currentField = "";
            let inQuotes = false;
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                if (char === '"') { inQuotes = !inQuotes; }
                else if (char === '\t' && !inQuotes) { currentRow.push(currentField); currentField = ""; }
                else if (char === '\n' && !inQuotes) { currentRow.push(currentField); rows.push(currentRow); currentRow = []; currentField = ""; }
                else { currentField += char; }
            }
            if (currentField || currentRow.length > 0) { currentRow.push(currentField); rows.push(currentRow); }
            return rows;
        };

        const rows = parseRobustTSV(inputVal);
        const currentYear = new Date().getFullYear();
        
        let combinedKorNames = [];
        let totalAdults = 0, totalChildren = 0, totalInfants = 0;
        let allItems = [];
        let firstResort = '', secondResort = '', firstContact = '', firstExVal = '';
        let totalExAmount = 0;
        let isExNumeric = true;

        rows.forEach(row => {
            if (row.length < 16) return;
            const p10 = (row[10] || '').trim();
            const p15 = (row[15] || '').trim().replace(/\n/g, ', ');
            const isP10Korean = /[가-힣]/.test(p10);
            let korName = p15; let engName = p10;
            if (isP10Korean && !p10.includes(' ')) { korName = p10; engName = p15; }
            else if (p15.includes('맘') || p15.includes('아빠') || p15.includes('네') || p15.length > 5) { if (isP10Korean) { korName = p10; engName = p15; } }
            combinedKorNames.push(`${korName} (${engName})`);

            totalAdults += (parseInt(row[11]) || 0);
            totalChildren += (parseInt(row[12]) || 0);
            totalInfants += (parseInt(row[13]) || 0);

            if (!firstContact) firstContact = (row[14] || '').trim();
            const resortRaw = (row[9] || '').trim();
            const pResort = translateResort(resortRaw.split('/')[0].trim());
            const sResort = translateResort(resortRaw.split('/')[1]?.trim() || pResort);
            if (!firstResort) { firstResort = pResort; secondResort = sResort; }

            let exVal = (row[5] || '').trim();
            if (exVal && !exVal.includes('/') && !exVal.includes('▲') && exVal !== '0') {
                const numericEx = parseInt(exVal.replace(/[^0-9]/g, ''));
                if (!isNaN(numericEx)) totalExAmount += numericEx; else isExNumeric = false;
            } else if (exVal === '0' || !exVal) { } else { isExNumeric = false; }
            if (!firstExVal) firstExVal = exVal;

            const totalPax = (parseInt(row[11]) || 0) + (parseInt(row[12]) || 0) + (parseInt(row[13]) || 0);
            const formatDate = (raw) => { if (!raw || !raw.includes('/')) return null; const [m, d] = raw.split('/').map(v => v.trim().padStart(2,'0')); return `${currentYear}-${m}-${d}`; };
            
            if (row[2] && row[2].match(/[A-Z]{2}\d+/)) { allItems.push({ name: `✈️ 공항 픽업 (${row[2].toUpperCase()})`, date: formatDate(row[0]), time: "14:00", count: totalPax }); }
            if (row[3] && row[3].match(/[A-Z]{2}\d+/)) { allItems.push({ name: `✈️ 공항 샌딩 (${row[3].toUpperCase()})`, date: formatDate(row[1]), time: (row[3].toUpperCase() === 'TW126' ? "08:30" : "21:00"), count: totalPax }); }

            const remarkRaw = (row[16] || '').trim();
            remarkRaw.split('\n').forEach(line => {
                const dm = line.trim().match(/^(\d{1,2})\/(\d{1,2})/);
                if (dm) {
                    const tDate = formatDate(dm[0]);
                    let itemName = line.replace(dm[0], '').trim(); let itemTime = "09:00"; let itemPax = totalPax;
                    const mCount = line.match(/\d+(?=명|인|태반|성장|스톤|오일|포쉘|진주)/g);
                    if ((line.includes('spa') || line.includes('스파')) && mCount) {
                        const sum = mCount.filter(n => parseInt(n) < 15).reduce((a, b) => parseInt(a) + parseInt(b), 0);
                        if (sum > 0) itemPax = sum;
                    }
                    const timeMatch = line.match(/(\d{1,2}):(\d{2})/); if (timeMatch) itemTime = `${timeMatch[1].padStart(2,'0')}:${timeMatch[2]}`;
                    const lowerLine = line.toLowerCase();
                    if (lowerLine.includes('sspa') || lowerLine.includes('에스파')) itemName = '에스파(S-SPA)';
                    else if (lowerLine.includes('luna') || lowerLine.includes('루나')) itemName = '루나스파';
                    else if (lowerLine.includes('bora') || lowerLine.includes('보라')) itemName = '보라스파';
                    else if (lowerLine.includes('land') || lowerLine.includes('랜드')) { itemName = '보라카이 랜드투어'; if(!timeMatch) itemTime = "10:30"; }
                    else if (lowerLine.includes('hopping') || lowerLine.includes('호핑')) { if (lowerLine.includes('(j)') || lowerLine.includes('점보')) { itemName = '블랙펄 호핑투어 (+점보크랩 점심)'; if(!timeMatch) itemTime = "12:30"; } else { itemName = '블랙펄 선셋 호핑투어'; if(!timeMatch) itemTime = "13:30"; } }
                    else if (lowerLine.includes('malum') || lowerLine.includes('말룸')) { itemName = '말룸파티'; if(!timeMatch) itemTime = "09:00"; }
                    else if (lowerLine.includes('jetski') || lowerLine.includes('제트스키')) itemName = '제트스키';
                    else if (lowerLine.includes('helmet') || lowerLine.includes('헬멧')) itemName = '헬멧다이빙';
                    else if (lowerLine.includes('para') || lowerLine.includes('파라')) itemName = '파라세일링';
                    else if (lowerLine.includes('diving') || lowerLine.includes('다이빙')) itemName = '체험다이빙';
                    
                    if (line.includes('afh') || line.includes('AFH')) itemTime = "18:00";
                    else if (line.includes('afm') || line.includes('AFM')) itemTime = "17:00";
                    allItems.push({ name: itemName, date: tDate, time: itemTime, count: itemPax, details: line });
                }
            });
        });

        if (combinedKorNames.length === 0) return;
        const mergedItemsMap = {};
        allItems.forEach(it => {
            const key = `${it.name}_${it.date}_${it.time}`;
            if (!mergedItemsMap[key]) { mergedItemsMap[key] = { ...it }; }
            else { mergedItemsMap[key].count += it.count; }
        });
        const finalExAmount = (isExNumeric && totalExAmount > 0) ? totalExAmount.toString() : firstExVal;
        const resData = { 
            customerKorName: combinedKorNames.join(', '), 
            contact: firstContact, 
            items: Object.values(mergedItemsMap), 
            status: '예약확정', 
            exchangeAmount: finalExAmount || '-', 
            paxInfo: `성인 ${totalAdults}, 아동 ${totalChildren}, 유아 ${totalInfants}`, 
            pickupResort: firstResort, 
            sendingResort: secondResort, 
            createdAt: new Date() 
        };
        const docRef = await addDoc(collection(db, "quick_vouchers"), resData);
        navigator.clipboard.writeText(`${window.location.origin}/reservation-schedule.html?id=${docRef.id}&type=quick`).then(() => {
            alert('통합 바우처 생성 완료!');
            document.getElementById('quick-voucher-input').value = ''; 
            window.hideInputArea();
        });
    };
});