// admin.js - Final Full Luxury Admin (STRICT ORDER & KOREAN RESORTS)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, getDoc, updateDoc, deleteDoc, where, getDocs, addDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
        const n = name.toLowerCase().replace(/\s/g, '').replace(/\./g, '').replace(/,/g, '');
        
        // 1. 헤난 계열 (가장 많음)
        if (n.includes('hgarden') || n.includes('henanngarden')) return '헤난 가든';
        if (n.includes('lagoon')) return '헤난 라군';
        if (n.includes('prime')) return '헤난 프라임';
        if (n.includes('palm')) return '헤난 팜 비치';
        if (n.includes('park')) return '헤난 파크';
        if (n.includes('crystal') || n.includes('sands')) return '헤난 크리스탈 샌즈';
        if (n.includes('regency')) return '헤난 리젠시';
        
        // 2. 만다린 계열 (구분 필수)
        if (n.includes('mandarinbay') || n.includes('mbay')) return '만다린 베이';
        if (n.includes('mandarinisland')) return '만다린 아일랜드';
        if (n.includes('mandarin')) return '만다린'; // 기본값

        // 3. 기타 주요 리조트
        if (n.includes('crimson')) return '크림슨';
        if (n.includes('asya')) return '아샤';
        if (n.includes('savoy')) return '사보이';
        if (n.includes('belmont')) return '벨몬트';
        if (n.includes('hue')) return '휴 리조트';
        if (n.includes('fairway')) return '페어웨이';
        if (n.includes('discovery')) return '디스커버리 쇼어';
        if (n.includes('movenpick')) return '모벤픽';
        if (n.includes('shangri')) return '샹그릴라';
        if (n.includes('astoria')) return '아스토리아';
        if (n.includes('mandarin')) return '만다린 베이'; // Old logic fallback (redundant but safe)
        if (n.includes('lind')) return '더 린드';
        if (n.includes('feliz')) return '펠리즈';
        if (n.includes('coast')) return '코스트';
        if (n.includes('aqua')) return '아쿠아 보라카이';
        if (n.includes('canyon')) return '캐년';
        if (n.includes('lacarmela')) return '라카멜라';
        if (n.includes('gray')) return '그레이호텔';
        if (n.includes('henann')) return '헤난';
        
        return name; 
    }

    function parsePaxFromLine(line, fallbackCount) {
        if (!line) return fallbackCount;
        let cleanLine = line.replace(/\d{1,2}\/\d{1,2}/g, ''); // 날짜 제거
        cleanLine = cleanLine.replace(/\d{1,2}:\d{2}/g, '');   // 시간 제거
        
        const mCount = cleanLine.match(/\d+(?=명|인|태반|성장|스톤|오일|포쉘|진주)/g);
        if (mCount) {
            return mCount.reduce((a, b) => a + parseInt(b), 0);
        }
        
        const remainingNumbers = cleanLine.match(/\d+/g);
        if (remainingNumbers && remainingNumbers.length > 0) {
            const firstNum = parseInt(remainingNumbers[0]);
            if (firstNum > 0 && firstNum < 50) {
                return firstNum;
            }
        }
        return fallbackCount;
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
            new: allReservations.filter(r => ['입금대기', '예약접수', '견적발송', '입금확인요청'].includes(r.status)).length,
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

    window.switchScheduleDay = (day) => { 
        currentScheduleDay = day; 
        window.hideInputArea(); 
        document.getElementById('tool-box-today')?.classList.toggle('active', day === 'today');
        document.getElementById('tool-box-tomorrow')?.classList.toggle('active', day === 'tomorrow');
        renderSchedule(); 
    };
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
        if (combined.includes('픽업') || combined.includes('샌딩')) return '픽업/샌딩';
        if (combined.includes('hopping') || combined.includes('호핑')) return '호핑투어';
        if (combined.includes('land') || combined.includes('랜드')) return '랜드투어';
        if (combined.includes('malum') || combined.includes('말룸')) return '시크릿가든 말룸파티';
        if (combined.includes('shark') || combined.includes('고래상어')) return '고래상어';
        return '액티비티';
    }

    function renderSchedule() {
        const container = document.getElementById('active-timeline');
        if (!container) return;
        
        // 🌏 필리핀 시간(UTC+8) 기준으로 오늘/내일 날짜 계산
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const krTime = new Date(utc + (9 * 3600000)); // 한국/필리핀 시간 (거의 동일)
        
        const todayStr = krTime.toISOString().split('T')[0];
        const tomorrow = new Date(krTime.getTime() + 86400000);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const targetDate = (currentScheduleDay === 'tomorrow') ? tomorrowStr : todayStr;
        const titleDateEl = document.getElementById('schedule-title-date');
        if (titleDateEl) titleDateEl.innerText = targetDate;

        let rawItems = [];
        allSchedules.forEach(s => { 
            if (s.date === targetDate) {
                const lines = (s.details || '').split('\n').filter(l => l.trim() !== '');
                const displayLines = lines.length > 0 ? lines : [''];
                displayLines.forEach(line => {
                    let displayPax = parsePaxFromLine(line, s.count);

                    rawItems.push({ 
                        time: s.time || "09:00", 
                        name: s.name, 
                        customer: s.customerName || "고객", 
                        count: displayPax, 
                        status: '스케줄', id: s.id, source: 'schedule', 
                        resort: translateResort(s.resort || "-"), 
                        flight: s.flight || "-",
                        details: line || s.name
                    }); 
                });
            }
        });

        // 필터링 적용
        let filteredItems = rawItems;
        if (currentScheduleFilter !== 'all') {
            filteredItems = rawItems.filter(i => getCategory(i.name, i.details) === currentScheduleFilter);
        }
        
        const groups = {};
        filteredItems.forEach(item => {
            const cat = getCategory(item.name, item.details);
            let groupTitle = item.name;
            if (cat === '픽업/샌딩') {
                groupTitle = (item.flight !== '-' && item.flight) ? item.flight : '기타 항공편';
            } else if (cat === '호핑투어' || cat === '시크릿가든 말룸파티' || cat === '랜드투어' || cat === '고래상어') {
                groupTitle = cat;
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
        if (sortedGroupKeys.length === 0) { 
            container.innerHTML = `<div class="sc-empty" style="width:100%; text-align:center; padding:30px; color:#999; font-size:12px;">일정이 없습니다. (${targetDate})</div>`; 
            return; 
        }

        container.innerHTML = sortedGroupKeys.map(key => {
            const group = groups[key];
            let icon = "event_available", catClass = "cat-activity", catLabel = group.category;
            if (group.category === '픽업/샌딩') { icon = "local_airport"; catClass = "cat-pickup"; catLabel = "픽업/샌딩"; }
            else if (group.category === '호핑투어') { icon = "sailing"; catClass = "cat-hopping"; catLabel = "호핑투어"; }
            else if (group.category === '시크릿가든 말룸파티') { icon = "nature_people"; catClass = "cat-malum"; catLabel = "시크릿가든 말룸파티"; }
            else if (group.category === '랜드투어') { icon = "directions_car"; catClass = "cat-activity"; catLabel = "랜드투어"; }
            else if (group.category === '고래상어') { icon = "waves"; catClass = "cat-whale"; catLabel = "고래상어"; }
            
            const isSpa = group.items.some(it => it.name.toLowerCase().includes('마사지') || it.name.toLowerCase().includes('스파'));
            if (isSpa) icon = "spa";

            let headerTitle = `${group.title} (${group.totalCount}명)`;

            let bodyHtml = "";
            if (group.category === '호핑투어') {
                const withJumbo = group.items.filter(it => it.details.includes('점보') || it.details.toLowerCase().includes('(j)'));
                const withoutJumbo = group.items.filter(it => !it.details.includes('점보') && !it.details.toLowerCase().includes('(j)'));
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
            } else if (isSpa) {
                bodyHtml += group.items.map(it => {
                    return `<div class="sc-detail-row" onclick="showDetail('${it.id}', '${it.source}')"><span class="sc-detail-name">${it.customer}</span><span class="sc-detail-pax">${it.count}인</span><span class="sc-detail-resort">${it.resort}</span></div>`;
                }).join('');
            } else if (group.category === '픽업/샌딩') {
                bodyHtml = group.items.map(it => {
                    const flightInfo = (it.flight && it.flight !== '-') ? `[${it.flight}] ` : "";
                    return `<div class="sc-detail-row" onclick="showDetail('${it.id}', '${it.source}')"><span class="sc-detail-name">${it.customer}</span><span class="sc-detail-pax">${it.count}인</span><span class="sc-detail-resort">${flightInfo}${it.resort}</span></div>`;
                }).join('');
            } else if (group.category === '액티비티' || group.category === '랜드투어') {
                bodyHtml = group.items.map(it => {
                    const prefix = group.category === '액티비티' ? `[${it.name}] ` : "";
                    return `<div class="sc-detail-row" onclick="showDetail('${it.id}', '${it.source}')"><span class="sc-detail-name">${it.customer}</span><span class="sc-detail-pax">${it.count}인</span><span class="sc-detail-resort">${prefix}${it.resort}</span></div>`;
                }).join('');
            } else {
                bodyHtml = group.items.map(it => {
                    return `<div class="sc-detail-row" onclick="showDetail('${it.id}', '${it.source}')"><span class="sc-detail-name">${it.customer}</span><span class="sc-detail-pax">${it.count}인</span></div>`;
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
            if (activeTab === 'new') matchesTab = ['입금대기', '예약접수', '견적발송', '입금확인요청'].includes(r.status);
            else if (activeTab === 'confirmed') matchesTab = (r.status === '예약확정');
            else if (activeTab === 'resorts') matchesTab = (r.status === '견적');
            else if (activeTab === 'resort-confirmed') matchesTab = (r.status === '리조트확정');
            return name.includes(searchTerm) && matchesTab;
        });
        filtered.forEach((res, index) => {
            const tr = document.createElement('tr');
            const status = res.status || '대기';
            
            // 🏨 리조트 견적일 경우 날짜 표시 강화
            let firstItem = (res.items?.[0]?.name || '-');
            if (firstItem.includes('리조트 견적')) {
                const checkin = res.resortCheckin || (res.items?.[0]?.details?.checkin) || '';
                const checkout = res.resortCheckout || (res.items?.[0]?.details?.checkout) || '';
                if (checkin) firstItem += ` <br><small style="color:#666;">📅 ${checkin} ~ ${checkout}</small>`;
            }
            if (res.items?.length > 1) firstItem += ` 외 ${res.items.length-1}건`;

            let actionButtons = `<button class="btn-action-received" style="background:#ff6a00; border-color:#ff6a00;" onclick="showDetail('${res.id}', 'reservation')"><span class="material-icons">visibility</span>상세</button><button class="btn-action-outline" onclick="copyCombinedVoucherLink('${res.contact}')"><span class="material-icons">content_copy</span>일정표</button>`;
            
            if (status === '입금확인요청') {
                actionButtons = `<button class="btn-action-received" style="background:#00c73c; border-color:#00c73c;" onclick="handleAutoConfirm('${res.id}')"><span class="material-icons">payments</span>입금확인</button>` + actionButtons;
            } else if (status === '예약접수' || status === '입금대기') {
                actionButtons = `<button class="btn-action-received" onclick="handleAutoConfirm('${res.id}')"><span class="material-icons">payments</span>입금확인</button>` + actionButtons;
            } else if (status === '견적발송') {
                actionButtons = `<button class="btn-action-outline" onclick="navigator.clipboard.writeText('${window.location.origin}/quote.html?id=${res.id}').then(()=>alert('링크복사됨'))"><span class="material-icons">link</span>견적링크</button>` + actionButtons;
            }

            if (status === '견적') actionButtons = `<button class="btn-action-received" onclick="handleResortQuoteComplete('${res.id}')"><span class="material-icons">task_alt</span>견적완료</button><button class="btn-action-received" style="background:#00c73c; border-color:#00c73c;" onclick="handleResortConfirm('${res.id}')"><span class="material-icons">check_circle</span>확정</button>` + actionButtons;
            
            const badgeClass = status === '입금확인요청' ? 'badge-yellow' : (status.includes('확정') ? 'badge-green' : 'badge-yellow');
            const displayStatus = status === '입금확인요청' ? '입금완료' : status;
            
            tr.innerHTML = `<td><input type="checkbox"></td><td style="color:#bbb;">${filtered.length - index}</td><td>${res.reservationNumber || '-'}</td><td><div style="font-size:14px; font-weight:800;">${res.customerKorName}</div></td><td>${firstItem}</td><td>₩ ${(res.totalPrice || 0).toLocaleString()}</td><td>${res.createdAt?.toDate ? res.createdAt.toDate().toLocaleDateString() : '-'}</td><td><span class="n-badge ${badgeClass}">${displayStatus}</span></td><td><div style="display:flex; gap:5px;">${actionButtons}</div></td>`;
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
        const itemsHtml = (res.items || []).map((item, idx) => {
            let dateStr = item.date || '-';
            if (item.name.includes('리조트 견적')) {
                const checkin = item.details?.checkin || res.resortCheckin;
                const checkout = item.details?.checkout || res.resortCheckout;
                if (checkin) dateStr = `${checkin} ~ ${checkout}`;
            }
            const detailStr = (item.details && typeof item.details === 'string') ? `<div style="margin-top:4px; font-size:12px; color:#999;">${item.details}</div>` : '';
            
            let subToursHtml = '';
            if (item.isPackage) {
                let subTours = [];
                if (res.pickupDate) subTours.push(`✈️ 공항 픽업: ${res.pickupDate} (${res.pickupFlight || '-'})`);
                if (res.sendingDate) subTours.push(`✈️ 공항 샌딩: ${res.sendingDate} (${res.sendingFlight || '-'})`);
                if (res.hoppingDate) {
                    if (res.hoppingJumbo) {
                        subTours.push(`⛵ 블랙펄 호핑: ${res.hoppingDate} ➔ 🦀 점보크랩 추가 (${res.jumboQty || item.count}명 - 현지 지불 인당 $30)`);
                    } else {
                        subTours.push(`⛵ 블랙펄 호핑: ${res.hoppingDate}`);
                    }
                }
                if (res.malumDate) subTours.push(`🌳 말룸파티: ${res.malumDate}`);
                if (res.oneDayDate) subTours.push(`🌊 원데이(말룸+고래): ${res.oneDayDate}`);
                if (res.whaleDate) subTours.push(`🐋 고래상어: ${res.whaleDate}`);
                
                if (subTours.length > 0) {
                    subToursHtml = `<div style="margin-top:10px; padding:10px; background:#fff; border:1px dashed #ffd8a8; border-radius:6px; font-size:13px;">
                        <b style="color:#ff6a00;">📦 패키지 포함 투어 일정:</b>
                        ${subTours.map(t => `<div style="margin-top:4px; color:#444;">${t}</div>`).join('')}
                    </div>`;
                }
            }

            return `<div style="padding:12px; background:#f8f9fa; border:1px solid #eee; border-radius:8px; margin-bottom:8px;"><div style="display:flex; justify-content:space-between;"><div style="font-size:15px; font-weight:800;">${item.name}</div><div style="font-size:14px; font-weight:800; color:#ff6a00;">${item.count}명</div></div><div style="margin-top:6px; font-size:13px; color:#666;">📅 ${dateStr} ${item.time || ''}</div>${detailStr}${subToursHtml}${!isQuote ? `<div style="margin-top:10px; display:flex; gap:5px;"><a href="reservation-schedule.html?id=${res.id}&itemIndex=${idx}" target="_blank" style="flex:1; text-align:center; padding:6px; background:#fff; border:1px solid #ddd; border-radius:4px; font-size:11px; text-decoration:none; color:#333;">바우처</a><button onclick="copyVoucherLink('${res.id}', ${idx})" style="flex:1; padding:6px; background:#ff6a00; color:white; border:none; border-radius:4px; font-size:11px; cursor:pointer;">복사</button></div>` : ''}</div>`;
        }).join('');
        const displayEngName = res.engName || '-';
        const displayExchange = res.exchangeAmount || '-';
        const displayPax = res.paxInfo || (res.items?.[0]?.count ? `${res.items[0].count}명` : '-');
        const displayPrivate = res.hasPrivateTransfer ? '<span style="background:#ff4b4b; color:white; padding:2px 8px; border-radius:4px; font-size:11px; margin-left:10px; vertical-align:middle;">단독 차량</span>' : '';

        body.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid #eee;"><h3 style="margin:0;">예약 상세 정보 ${displayPrivate}</h3><button onclick="copyGuidance('${res.id}')" style="background:#ff6a00; color:white; border:none; padding:8px 14px; border-radius:6px; font-weight:bold; cursor:pointer;">👉 안내문 복사</button></div>
            <div id="modal-scroll-area" style="max-height: 60vh; overflow-y: auto;">
                <div style="margin-bottom:20px;">${totalVoucherBtn}${itemsHtml}</div>
                <div style="background:#fcfcfc; padding:15px; border-radius:10px; border:1px solid #f0f0f0; margin-bottom:20px;">
                    <p style="margin:0;">이름 | <b>${res.customerKorName}</b> (${displayEngName})</p>
                    <p style="margin:5px 0 0 0;">연락처 | <b>${res.contact}</b></p>
                    <p style="margin:5px 0 0 0;">인원 | <b>${displayPax}</b></p>
                </div>
                ${!isQuote ? `<div style="background:#fff5eb; padding:15px; border-radius:10px; border:1px solid #ffe8cc; margin-bottom:20px;">
                    <div style="font-weight:bold; margin-bottom:10px; color:#ff6a00;">✈️ 항공 및 일정 정보</div>
                    <p style="margin:5px 0; font-size:13px;"><b>픽업:</b> ${res.pickupDate || '-'} / ${res.pickupFlight || '-'} / ${res.pickupResort || '-'}</p>
                    <p style="margin:5px 0; font-size:13px;"><b>샌딩:</b> ${res.sendingDate || '-'} / ${res.sendingFlight || '-'} / ${res.sendingResort || '-'}</p>
                    ${res.hoppingDate ? `<p style="margin:5px 0; font-size:13px;"><b>호핑:</b> ${res.hoppingDate}</p>` : ''}
                    ${res.malumDate ? `<p style="margin:5px 0; font-size:13px;"><b>말룸:</b> ${res.malumDate}</p>` : ''}
                    ${res.oneDayDate ? `<p style="margin:5px 0; font-size:13px;"><b>원데이(말룸+고래):</b> ${res.oneDayDate}</p>` : ''}
                    ${res.whaleDate ? `<p style="margin:5px 0; font-size:13px;"><b>고래상어:</b> ${res.whaleDate}</p>` : ''}
                    ${res.activityPickupResort ? `<p style="margin:5px 0; font-size:13px; color:#d35400;"><b>📍 활동 픽업:</b> ${res.activityPickupResort}</p>` : ''}
                    <p style="margin-top:10px; padding-top:10px; border-top:1px dashed #ffd8a8;"><b>💰 환전:</b> <span style="font-size:15px; color:#e67e22; font-weight:800;">${displayExchange}</span></p>
                </div>` : ''}
                <div style="padding:10px; background:#f8f9fa; border-radius:6px; font-size:13px; white-space:pre-wrap;"><b>[요청사항]</b>\n${res.requests || '없음'}</div>
            </div>
            <div style="display:flex; gap:10px; margin-top:20px; padding-top:15px; border-top:1px solid #eee;">
                <button id="edit-btn" onclick="toggleEditMode('${res.id}')" style="flex:1; padding:12px; background:#ff6a00; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">수정하기</button>
                <button onclick="closeModal()" style="flex:1; padding:12px; background:#333; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">창 닫기</button>
            </div>`;
        modal.style.display = 'flex';
    };

    window.copyVoucherLink = (id, idx) => { const url = `${window.location.origin}/reservation-schedule.html?id=${id}${idx !== null ? `&itemIndex=${idx}` : ''}`; navigator.clipboard.writeText(url).then(() => alert('바우처 링크가 복사되었습니다.')); };
    window.copyCombinedVoucherLink = (contact) => { navigator.clipboard.writeText(`${window.location.origin}/reservation-schedule.html?contact=${encodeURIComponent(contact)}`).then(() => alert('통합 일정표 링크 복사 완료!')); };

    window.copyGuidance = (id) => { 
        const res = allReservations.find(r => r.id === id); 
        if (!res) return; 
        
        let itemsDesc = [];
        res.items.forEach(i => {
            if (i.isPackage) {
                itemsDesc.push(`- ${i.name} (패키지 상품) / ${i.count}명`);
                if (res.pickupDate) itemsDesc.push(`  ✈️ 공항 픽업: ${res.pickupDate} (${res.pickupFlight || '-'})`);
                if (res.sendingDate) itemsDesc.push(`  ✈️ 공항 샌딩: ${res.sendingDate} (${res.sendingFlight || '-'})`);
                if (res.hoppingDate) {
                    if (res.hoppingJumbo) {
                        itemsDesc.push(`  ⛵ 블랙펄 호핑 (+점보크랩 점심): ${res.hoppingDate} (12:30 미팅 / 점보크랩 추가 ${res.jumboQty || i.count}명 - 현지 지불 $30/인)`);
                    } else {
                        itemsDesc.push(`  ⛵ 블랙펄 호핑: ${res.hoppingDate}`);
                    }
                }
                if (res.malumDate) itemsDesc.push(`  🌳 말룸파티: ${res.malumDate}`);
                if (res.oneDayDate) itemsDesc.push(`  🌊 원데이(말룸+고래): ${res.oneDayDate}`);
                if (res.whaleDate) itemsDesc.push(`  🐋 고래상어: ${res.whaleDate}`);
            } else {
                itemsDesc.push(`- ${i.name} (${i.date} ${i.time || ''}) / ${i.count}명`);
            }
        });

        let msg = `[보라카이션 예약 확정 안내]\n\n대표자: ${res.customerKorName}\n투어내역:\n${itemsDesc.join('\n')}`;
        
        // 보라아재 호핑투어 포함 시 전용 안내문 추가
        const hasBoraAjae = res.items.some(i => i.name.includes('보라아재') || i.name.includes('카라바오'));
        if (hasBoraAjae) {
            msg += `\n\n------------------\n🚨📢 8시 (08:00) / 각반 선착장 미팅😊💜\n보라카이가 제주도라면, 카라바오는 우도라고 생각하시면 이해가 편하십니다. 보라카이에서 배를 타고 1시간정도 이동, 카라바오 섬에 도착하여 아재호핑 전용공간으로 안내해드립니다. 해당 장소에서 진행하는 온종일 투어입니다. 아재투어의 전용공간은 보라아재에서 준비한 다양한 액티비티 및 사진 포인트가 많이 있는 매력적인 장소입니다. 넉넉한 시간으로 편안하고 즐거운 시간이 되시길 바랍니다.\n\n✅ 미팅 시간 및 장소\n🔺현지시각 오전 8시 까지 각반 선착장 도착\n** 미팅시간 10분 전 도착 권장. 미팅 시간내 미 도착시 노쇼처리, 환불불가합니다 **\n🔺각반(CAGBAN PORT) 선착장 세븐일레븐 앞 보라아재 피켓 든 직원을 찾아주세요! 👍\n주의!!! 각반선착장 입니다. E-트라이크(툭툭이) 탑승 후 각반 혹은 각반포트 말씀해주시면 됩니다. \n디몰출발을 기준으로 시간은 15분 내외, 비용은 한 대당 150페소~200페소 정도이니 참고해주세요.\n\n✅ 포함 사항\n씨푸드런치, 무제한 음료+맥주+물, 라면간식, 선상 사진촬영, 수중 사진촬영, vip 밀착케어, 스노클 장비 무상 대여(구명조끼, 스노클마스크), 스노클링, 스킨다이빙, 슬라이드, 포토스팟, 줄낚시, 클리프다이빙 등등\n\n✅ 필수 준비물\n래쉬가드, 선크림, 비치타올, 아쿠아슈즈, 불포함 매너팁 인당 100페소(유아 포함)\n\n✅ 안내 및 주의사항\n* 투어 당일 출발시 날씨에 따라 호핑투어 진행 동선 및 장소, 내용 등등이 변경되어 진행될 수 있습니다.\n* 미팅 후 다른 분들과 함께 조인으로 액티비티가 진행됩니다. 서로 피해가 없도록, 약속시간은 꼭 지켜주세요.\n* 고가의 귀중품, 많은 현금, 여권은 필히 리조트에 두고 오세요!\n* 식사 불포함인 36개월 이하의 아이들의 식사는 따로 준비가 되어 있지 않습니다. (흰 쌀밥은 제공)\n* 맥주와 음료를 무제한으로 제공 해드리고 있지만, 테이크 아웃은 엄격히 금하고 있습니다!\n* 수중사진은 서비스 품목으로 현지 사정상 제공 불가일 수 있는 점 양해 부탁드립니다.\n* 지나친 음주로 물놀이가 안전하지 않다 판단되는 경우 제재를 받으실 수도 있습니다.\n\n📌 우천 시 안내\n보라카이는 스콜성 비가 자주 내리는 지역입니다. 비가 내리더라도 별도의 안내가 없는 경우, 호핑투어는 정상적으로 진행됩니다. 😊`;
        }

        // 리버타드 고래상어 투어 포함 시 전용 안내문 추가
        const hasWhaleShark = res.items.some(i => i.name.includes('고래상어') || i.name.toLowerCase().includes('shark')) || res.oneDayDate || res.whaleDate;
        if (hasWhaleShark) {
            msg += `\n\n------------------\n🚨📢 리버타드 고래상어 투어 안내\n미팅 시간: 07:30\n미팅 장소: 메인로드 졸리비\n구글맵 주소: https://maps.app.goo.gl/xgty5kLRCpBrwzvL7\n\n★★ 주의 사항 및 준비물 ★★\n-편한 물놀이 복장, 비치타올 1인 1장\n-스노클 마스크(보유시)\n- 매너팁 1인 100페소 (성인, 소인 동일)\n- 자외선 차단제 불가능\n\n*미팅시간 5분 이상 늦으실 경우 노쇼 처리 될 수 있습니다\n\n🔴 고래상어 미출현 환불 안내\n고래상어 출현 지점까지 투어가 정상적으로 진행되었으나, 야생동물의 특성 및 현지 기상 상황으로 인해 고래상어를 관찰하지 못한 경우에는 발생한 차량비, 보트 운영비 및 기타 현지 운영 비용 $20(30,000원)을 제외한 나머지 투어비를 환불해 드립니다.`;
        }
        
        msg += `\n\n감사합니다.`;
        navigator.clipboard.writeText(msg).then(() => alert('안내문이 복사되었습니다.')); 
    };
    window.showInputArea = (type) => { 
        if (type === 'quote') {
            window.open('admin-quote-maker.html', '_blank');
            return;
        }
        window.hideInputArea(); 
        document.getElementById(`input-area-${type}`).style.display = 'block'; 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };
    window.hideInputArea = () => { ['quick', 'reg', 'quote', 'cafe'].forEach(id => { const el = document.getElementById(`input-area-${id}`); if(el) el.style.display = 'none'; }); };
    window.closeModal = () => { document.getElementById('res-detail-modal').style.display = 'none'; };

    window.registerBulkSchedule = async () => {
        const input = document.getElementById('schedule-reg-input').value.trim();
        if (!input) return;
        
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

        try {
            const rows = parseRobustTSV(input);
            const batch = writeBatch(db);
            let count = 0;
            const currentYear = new Date().getFullYear();

            for (const row of rows) {
                if (row.length < 10) continue; // 유효하지 않은 행 스킵

                // 데이터 위치 (제공된 스니펫 기준)
                // 0:픽업일, 1:샌딩일, 2:픽업편, 3:샌딩편, 9:리조트, 10:영문명, 11~13:인원, 15:한글명, 16:비고
                const pickupDateRaw = (row[0] || '').trim();
                const sendingDateRaw = (row[1] || '').trim();
                const pickupFlight = (row[2] || '').trim();
                const sendingFlight = (row[3] || '').trim();
                const resortRaw = (row[9] || '').trim();
                
                const engName = (row[10] || '').trim().toUpperCase();
                const korNameOnly = (row[15] || '').trim();
                const customerName = engName ? `${engName} (${korNameOnly || ''})`.replace(' ()', '') : (korNameOnly || '고객');
                const remarks = (row[16] || '').trim();
                
                const p1 = parseInt(row[11]) || 0;
                const p2 = parseInt(row[12]) || 0;
                const p3 = parseInt(row[13]) || 0;
                const totalPax = p1 + p2 + p3 || 1;

                const formatDate = (raw) => {
                    if (!raw || !raw.includes('/')) return null;
                    const parts = raw.split('/');
                    const m = parts[0].trim().padStart(2, '0');
                    const d = parts[1].trim().replace(/[^0-9]/g, '').padStart(2, '0');
                    return `${currentYear}-${m}-${d}`;
                };

                // 1. 공항 픽업 등록
                const pDate = formatDate(pickupDateRaw);
                if (pDate && pickupFlight && pickupFlight !== '-') {
                    let pTime = "14:00"; // TW125 포함 모든 픽업 기본 14:00
                    const docRef = doc(collection(db, "schedules"));
                    batch.set(docRef, {
                        date: pDate, time: pTime, name: "공항 픽업",
                        customerName: customerName, count: totalPax, flight: pickupFlight,
                        resort: translateResort(resortRaw), details: `픽업편: ${pickupFlight}`,
                        createdAt: new Date()
                    });
                    count++;
                }

                // 2. 공항 샌딩 등록
                const sDate = formatDate(sendingDateRaw);
                if (sDate && sendingFlight && sendingFlight !== '-') {
                    const fl = sendingFlight.toUpperCase().trim();
                    let sTime = "21:00";
                    const isStation10 = (resort) => {
                        if (!resort) return false;
                        const low = resort.toLowerCase();
                        const station10Keywords = ['crimson', 'movenpick', 'shangri-la', 'shangrila', 'discovery', 'the lind', 'lind', 'prime', 'aqua', 'two seasons', 'canyon', 'savoy', 'belmont', 'fairways'];
                        return station10Keywords.some(kw => low.includes(kw));
                    };

                    if (fl === 'TW126') sTime = isStation10(resortRaw) ? "08:10" : "08:30";
                    else if (fl.startsWith('TW') || fl.startsWith('5J') || fl.startsWith('Z2') || fl.startsWith('DG') || (fl.startsWith('PR') && !['PR469', 'PR489'].includes(fl)) || fl.includes('KLO') || fl.includes('MPH')) sTime = "전날 재안내";
                    
                    const docRef = doc(collection(db, "schedules"));
                    batch.set(docRef, {
                        date: sDate, time: sTime, name: "공항 샌딩",
                        customerName: customerName, count: totalPax, flight: sendingFlight,
                        resort: translateResort(resortRaw), details: `샌딩편: ${sendingFlight}`,
                        createdAt: new Date()
                    });
                    count++;
                }

                // 3. 비고란 상세 스케줄 파싱
                if (remarks) {
                    const lines = remarks.split('\n');
                    for (const line of lines) {
                        const dateMatch = line.match(/(\d{1,2})\/(\d{1,2})/);
                        if (!dateMatch) continue;

                        const itemDate = `${currentYear}-${dateMatch[1].padStart(2, '0')}-${dateMatch[2].padStart(2, '0')}`;
                        let itemTime = "09:00";
                        let itemName = "기타 일정";
                        const lowerLine = line.toLowerCase();

                        // 시간 추출
                        const timeMatch = line.match(/(\d{1,2}):(\d{2})/);
                        if (timeMatch) itemTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;

                        // 상품명 및 특이 시간 설정
                        if (lowerLine.includes('land') || lowerLine.includes('랜드')) {
                            itemName = "보라카이 랜드투어";
                            itemTime = "10:30"; // 랜드투어 무조건 10:30
                        }
                        else if (lowerLine.includes('hopping') || lowerLine.includes('호핑')) {
                            if (lowerLine.includes('j') || lowerLine.includes('점보')) itemName = "블랙펄 호핑투어 (+점보크랩 점심)";
                            else itemName = "블랙펄 선셋 호핑투어";
                            if (!timeMatch) itemTime = lowerLine.includes('j') ? "12:30" : "13:30";
                        }
                        else if (lowerLine.includes('malum') || lowerLine.includes('말룸')) {
                            itemName = "시크릿가든 말룸파티";
                            if (!timeMatch) itemTime = "09:40";
                        }
                        else if (lowerLine.includes('shark') || lowerLine.includes('고래상어')) {
                            itemName = "리버타드 고래상어";
                            if (!timeMatch) itemTime = "07:30";
                        }
                        else if (lowerLine.includes('luna') || lowerLine.includes('루나')) itemName = "루나스파";
                        else if (lowerLine.includes('bora') || lowerLine.includes('보라')) itemName = "보라스파";
                        else if (lowerLine.includes('maris') || lowerLine.includes('마리스') || lowerLine.includes('marisspa')) itemName = "마리스스파";
                        else if (lowerLine.includes('sspa') || lowerLine.includes('에스파')) itemName = "에스파(SSPA)";
                        else if (lowerLine.includes('kabayan') || lowerLine.includes('카바얀')) itemName = "카바얀";
                        else if (lowerLine.includes('hilot') || lowerLine.includes('힐롯')) itemName = "힐롯마사지";
                        else if (lowerLine.includes('poseidon') || lowerLine.includes('포세이돈')) itemName = "포세이돈";
                        else if (lowerLine.includes('diving') || lowerLine.includes('다이빙')) itemName = "체험다이빙";
                        else if (lowerLine.includes('jumbo') || lowerLine.includes('점보')) itemName = "점보크랩";
                        else if (lowerLine.includes('golf') || lowerLine.includes('골프')) itemName = "골프";
                        else if (lowerLine.includes('jetski') || lowerLine.includes('zetski') || lowerLine.includes('제트스키')) itemName = "제트스키";
                        else if (lowerLine.includes('helmet') || lowerLine.includes('헬멧')) itemName = "헬멧다이빙";
                        else if (lowerLine.includes('para') || lowerLine.includes('파라')) itemName = "파라세일링";
                        else if (lowerLine.includes('마사지') || lowerLine.includes('스파')) itemName = "마사지";


                        // 세부 인원
                        let itemPax = parsePaxFromLine(line, totalPax);

                        const docRef = doc(collection(db, "schedules"));
                        batch.set(docRef, {
                            date: itemDate, time: itemTime, name: itemName,
                            customerName: customerName, count: itemPax,
                            resort: translateResort(resortRaw), details: line.trim(),
                            createdAt: new Date()
                        });
                        count++;
                    }
                }
            }

            if (count > 0) {
                await batch.commit();
                alert(`${count}건의 스케줄이 성공적으로 등록되었습니다.`);
                document.getElementById('schedule-reg-input').value = '';
                window.hideInputArea();
                renderSchedule();
            } else {
                alert("등록 가능한 데이터를 찾지 못했습니다. 형식을 확인해주세요.");
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
            scrollArea.innerHTML = `<div style="background:#f8f9fa; padding:15px; border-radius:12px;">
                <label style="font-size:11px; color:#999;">한글명</label>
                <input type="text" id="edit-name" value="${res.customerKorName}" style="width:100%; padding:8px; margin-bottom:10px;">
                <label style="font-size:11px; color:#999;">연락처</label>
                <input type="text" id="edit-contact" value="${res.contact}" style="width:100%; padding:8px; margin-bottom:10px;">
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div><label style="font-size:11px; color:#999;">픽업일</label><input type="text" id="edit-p-date" value="${res.pickupDate || ''}" style="width:100%; padding:8px;"></div>
                    <div><label style="font-size:11px; color:#999;">픽업 항공</label><input type="text" id="edit-p-flight" value="${res.pickupFlight || ''}" style="width:100%; padding:8px;"></div>
                </div>
                <div style="margin-top:10px;"><label style="font-size:11px; color:#999;">픽업 리조트</label><input type="text" id="edit-p-resort" value="${res.pickupResort || ''}" style="width:100%; padding:8px;"></div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                    <div><label style="font-size:11px; color:#999;">샌딩일</label><input type="text" id="edit-s-date" value="${res.sendingDate || ''}" style="width:100%; padding:8px;"></div>
                    <div><label style="font-size:11px; color:#999;">샌딩 항공</label><input type="text" id="edit-s-flight" value="${res.sendingFlight || ''}" style="width:100%; padding:8px;"></div>
                </div>
                <div style="margin-top:10px;"><label style="font-size:11px; color:#999;">샌딩 리조트</label><input type="text" id="edit-s-resort" value="${res.sendingResort || ''}" style="width:100%; padding:8px;"></div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                    <div><label style="font-size:11px; color:#999;">호핑일</label><input type="text" id="edit-h-date" value="${res.hoppingDate || ''}" style="width:100%; padding:8px;"></div>
                    <div><label style="font-size:11px; color:#999;">말룸일</label><input type="text" id="edit-m-date" value="${res.malumDate || ''}" style="width:100%; padding:8px;"></div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                    <div><label style="font-size:11px; color:#999;">원데이투어일</label><input type="text" id="edit-o-date" value="${res.oneDayDate || ''}" style="width:100%; padding:8px;"></div>
                    <div><label style="font-size:11px; color:#999;">고래상어일</label><input type="text" id="edit-w-date" value="${res.whaleDate || ''}" style="width:100%; padding:8px;"></div>
                </div>

                <label style="font-size:11px; color:#999; margin-top:10px; display:block;">활동 픽업 리조트</label>
                <input type="text" id="edit-activity-resort" value="${res.activityPickupResort || ''}" style="width:100%; padding:8px; margin-bottom:10px;">

                <label style="font-size:11px; color:#999; margin-top:10px; display:block;">총 금액</label>
                <input type="number" id="edit-price" value="${res.totalPrice}" style="width:100%; padding:8px; margin-bottom:10px;">
                
                <label style="font-size:11px; color:#999;">요청사항</label>
                <textarea id="edit-requests" style="width:100%; height:80px; padding:8px;">${res.requests || ''}</textarea>
            </div>`;
        } else {
            const newData = { 
                customerKorName: document.getElementById('edit-name').value, 
                contact: document.getElementById('edit-contact').value, 
                pickupDate: document.getElementById('edit-p-date').value, 
                pickupFlight: document.getElementById('edit-p-flight').value,
                pickupResort: document.getElementById('edit-p-resort').value, 
                sendingDate: document.getElementById('edit-s-date').value, 
                sendingFlight: document.getElementById('edit-s-flight').value,
                sendingResort: document.getElementById('edit-s-resort').value, 
                hoppingDate: document.getElementById('edit-h-date').value,
                malumDate: document.getElementById('edit-m-date').value,
                oneDayDate: document.getElementById('edit-o-date').value,
                whaleDate: document.getElementById('edit-w-date').value,
                activityPickupResort: document.getElementById('edit-activity-resort').value,
                totalPrice: parseInt(document.getElementById('edit-price').value) || 0, 
                requests: document.getElementById('edit-requests').value 
            };
            updateDoc(doc(db, "reservations", id), newData).then(() => { alert("저장 완료!"); closeModal(); });
        }
    };

    window.makeQuickVoucher = async () => {
        const inputVal = document.getElementById('quick-voucher-input').value.trim(); if (!inputVal) return;
        
        const parseRobustTSV = (text) => {
            // 문자 하나씩 읽어서 따옴표 안의 \n, \t를 모두 셀 내용으로 처리
            // → 멀티라인 셀("9/21 hopping\n9/20 malum") + 이름 따옴표 밀림 모두 해결
            const rows = [];
            let currentRow = [];
            let currentField = "";
            let inQuotes = false;
            for (let i = 0; i < text.length; i++) {
                const ch = text[i];
                if (ch === '"') {
                    inQuotes = !inQuotes;
                    // 따옴표 문자 자체는 필드값에 추가하지 않음
                } else if (ch === '\t' && !inQuotes) {
                    currentRow.push(currentField.trim());
                    currentField = "";
                } else if (ch === '\n' && !inQuotes) {
                    currentRow.push(currentField.trim());
                    if (currentRow.length > 1 || currentRow[0]) rows.push(currentRow);
                    currentRow = [];
                    currentField = "";
                } else {
                    currentField += ch;
                }
            }
            if (currentField || currentRow.length > 0) {
                currentRow.push(currentField.trim());
                rows.push(currentRow);
            }
            return rows;
        };

        const rows = parseRobustTSV(inputVal);
        const currentYear = new Date().getFullYear();
        
        let combinedKorNames = [];
        let totalAdults = 0, totalChildren = 0, totalInfants = 0;
        let allItems = [];
        let firstResort = '', secondResort = '', firstContact = '', firstExVal = '';
        let firstPickupFlight = '', firstSendingFlight = '';
        let totalExAmount = 0;
        let isExNumeric = true;

        rows.forEach(row => {
            if (row.length < 4) return;
            const p10 = (row[10] || '').trim();
            const p15 = (row[15] || '').trim().replace(/\n/g, ', ');
            const isP10Korean = /[가-힣]/.test(p10);
            let korName = p15; let engName = p10;
            if (isP10Korean && !p10.includes(' ')) { korName = p10; engName = p15.toUpperCase(); }
            else if (p15.includes('맘') || p15.includes('아빠') || p15.includes('네') || p15.length > 5) { if (isP10Korean) { korName = p10; engName = p15.toUpperCase(); } }
            else { engName = p10.toUpperCase(); korName = p15; }
            combinedKorNames.push(engName ? `${engName} (${korName || ''})`.replace(' ()', '') : (korName || '고객'));

            if (!firstPickupFlight) firstPickupFlight = (row[2] || '').trim().toUpperCase().replace(/\s/g, '');
            if (!firstSendingFlight) firstSendingFlight = (row[3] || '').trim().toUpperCase().replace(/\s/g, '');

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
            
            const fl2 = (row[2] || '').trim().toUpperCase().replace(/\s/g, '');
            if (fl2 && (fl2.match(/[A-Z0-9]{2}\d+/) || fl2.includes('KLO') || fl2.includes('MPH'))) {
                allItems.push({ name: `공항 픽업 (${fl2})`, date: formatDate(row[0]), time: "14:00", count: totalPax });
            }

            // 📌 리마크: 컬럼 번호에 의존하지 않고 행 전체를 합쳐서 날짜 패턴(M/D) 찾기
            // 이렇게 하면 따옴표로 인한 컬럼 밀림 현상을 완전히 회피
            const remarkRaw = row.slice(4).join('\n').trim(); // col 4 이후 전체를 합쳐서 뒤짐
            const sendingDateStr = formatDate(row[1]);
            let remarkSendingTime = null;
            remarkRaw.split('\n').forEach(rLine => {
                const rdm = rLine.trim().match(/^(\d{1,2})\/(\d{1,2})/);
                if (!rdm) return;
                if (formatDate(rdm[0]) !== sendingDateStr) return;
                const rLower = rLine.toLowerCase();
                if (rLower.includes('sending') || rLower.includes('샌딩')) {
                    const tMatch = rLine.match(/(\d{1,2}):(\d{2})/);
                    if (tMatch) remarkSendingTime = `${tMatch[1].padStart(2,'0')}:${tMatch[2]}`;
                }
            });

            const fl3 = (row[3] || '').trim().toUpperCase().replace(/\s/g, '');
            if (fl3 && (fl3.match(/[A-Z0-9]{2}\d+/) || fl3.includes('KLO') || fl3.includes('MPH'))) { 
                let sTime;
                if (fl3 === 'TW126') {
                    // TW126: 리조트 기반 고정 시간 (바우쳐 표시 시 조정됨)
                    sTime = "08:10";
                } else if (fl3.startsWith('TW')) {
                    // TW 다른 편: 항상 전날 재안내
                    sTime = "전날 재안내";
                } else if (remarkSendingTime) {
                    // TW 제외 전체: remark에 sending HH:MM 있으면 그 시간 사용
                    sTime = remarkSendingTime;
                } else if (fl3.startsWith('5J') || fl3.startsWith('Z2') || fl3.startsWith('DG') || (fl3.startsWith('PR') && !['PR469', 'PR489'].includes(fl3)) || fl3.includes('KLO') || fl3.includes('MPH')) {
                    // remark 없는 국제선
                    sTime = "전날 재안내";
                } else {
                    // remark 없는 국내선 기본&#xA;
                    sTime = "21:00";
                }
                allItems.push({ name: `공항 샌딩 (${fl3})`, date: sendingDateStr, time: sTime, count: totalPax }); 
            }

            remarkRaw.split('\n').forEach(line => {
                const dm = line.trim().match(/^(\d{1,2})\/(\d{1,2})/);
                if (dm) {
                    const tDate = formatDate(dm[0]);
                    let itemName = line.replace(dm[0], '').trim(); let itemTime = "09:00"; 
                    let itemPax = parsePaxFromLine(line, totalPax);
                    const timeMatch = line.match(/(\d{1,2})\/(\d{1,2})/); // Prevent re-matching dates
                    const actualTimeMatch = line.match(/(\d{1,2}):(\d{2})/); if (actualTimeMatch) itemTime = `${actualTimeMatch[1].padStart(2,'0')}:${actualTimeMatch[2]}`;
                    const lowerLine = line.toLowerCase();
                    
                    if (lowerLine.includes('maris') || lowerLine.includes('마리스') || lowerLine.includes('marisspa')) itemName = '마리스스파';
                    else if (lowerLine.includes('sspa') || lowerLine.includes('에스파')) itemName = '에스파(S-SPA)';
                    else if (lowerLine.includes('luna') || lowerLine.includes('루나')) itemName = '루나스파';
                    else if (lowerLine.includes('bora') || lowerLine.includes('보라')) itemName = '보라스파';
                    else if (lowerLine.includes('kabayan') || lowerLine.includes('카바얀')) itemName = '카바얀스파';
                    else if (lowerLine.includes('hilot') || lowerLine.includes('힐롯')) itemName = '힐롯마사지';
                    else if (lowerLine.includes('poseidon') || lowerLine.includes('포세이돈')) itemName = '포세이돈 스파';
                    else if (lowerLine.includes('helios') || lowerLine.includes('헬리오스')) itemName = '헬리오스 스파';
                    else if (lowerLine.includes('meeting') || lowerLine.includes('pickup') || lowerLine.includes('픽업')) itemName = '✈️ 공항 픽업';
                    else if (lowerLine.includes('sending') || lowerLine.includes('샌딩')) {
                        // fl3 샌딩과 날짜가 겹치면 중복 생성 방지 (fl3에서 이미 remark 시간 적용됨)
                        if (tDate === sendingDateStr && fl3) return;
                        itemName = '✈️ 공항 샌딩';
                    }
                    else if (lowerLine.includes('land') || lowerLine.includes('랜드')) { itemName = '보라카이 랜드투어'; if(!actualTimeMatch) itemTime = "10:30"; }
                    else if (lowerLine.includes('hopping') || lowerLine.includes('호핑')) { 
                        if (lowerLine.includes('보라아재') || lowerLine.includes('카라바오')) { itemName = '보라아재 호핑투어'; if(!actualTimeMatch) itemTime = "08:00"; }
                        else if (lowerLine.includes('(j)') || lowerLine.includes('점보')) { itemName = '블랙펄 호핑투어 (+점보크랩 점심)'; if(!actualTimeMatch) itemTime = "12:30"; } 
                        else { itemName = '블랙펄 요트호핑투어'; if(!actualTimeMatch) itemTime = "13:30"; } 
                    }
                    const hasWhaleKeyword = lowerLine.includes('shark') || lowerLine.includes('고래');
                    const hasMalumKeyword = lowerLine.includes('malum') || lowerLine.includes('말룸');
                    
                    if (lowerLine.includes('고말팩') || (hasWhaleKeyword && hasMalumKeyword)) { itemName = '고말팩(고래상어+말룸파티)'; if(!actualTimeMatch) itemTime = "07:30"; }
                    else if (hasMalumKeyword) { itemName = '시크릿가든 말룸파티'; if(!actualTimeMatch) itemTime = "09:40"; }
                    else if (hasWhaleKeyword) { itemName = '리버타드 고래상어'; if(!actualTimeMatch) itemTime = "07:30"; }
                    else if (lowerLine.includes('jetski') || lowerLine.includes('zetski') || lowerLine.includes('제트스키')) itemName = '제트스키';
                    else if (lowerLine.includes('helmet') || lowerLine.includes('헬멧')) itemName = '헬멧다이빙';
                    else if (lowerLine.includes('para') || lowerLine.includes('파라')) itemName = '파라세일링';
                    else if (lowerLine.includes('diving') || lowerLine.includes('다이빙')) itemName = '체험다이빙';
                    else if (lowerLine.includes('jumbo') || lowerLine.includes('점보')) itemName = '점보크랩';
                    else if (lowerLine.includes('golf') || lowerLine.includes('골프')) itemName = '페어웨이 골프';
                    else if (lowerLine.includes('sub') || lowerLine.includes('잠수함')) itemName = '잠수함';
                    else if (lowerLine.includes('yacht') || lowerLine.includes('요트')) itemName = '프라이빗 요트';
                    else if (lowerLine.includes('sunset') || lowerLine.includes('선셋')) itemName = '선셋 세일링';
                    
                    if (line.includes('afh') || line.includes('AFH')) itemTime = "18:00";
                    else if (line.includes('afm') || line.includes('AFM')) itemTime = "17:00";
                    
                    // 특수기호만 있거나 비어있는 항목은 무시 (예: '▲', '-', '')
                    const cleanedName = itemName.replace(/[^\w가-힣a-zA-Z]/g, '').trim();
                    if (!cleanedName) return;

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
            pickupFlight: firstPickupFlight,
            sendingFlight: firstSendingFlight,
            createdAt: new Date() 
        };
        const docRef = await addDoc(collection(db, "quick_vouchers"), resData);
        navigator.clipboard.writeText(`${window.location.origin}/reservation-schedule.html?id=${docRef.id}&type=quick`).then(() => {
            alert('통합 바우처 생성 완료!');
            document.getElementById('quick-voucher-input').value = ''; 
            window.hideInputArea();
        });
    };

    window.openSchedulePopup = (mode) => {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const krTime = new Date(utc + (9 * 3600000));
        const todayStr = krTime.toISOString().split('T')[0];
        const tomorrow = new Date(krTime.getTime() + 86400000);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const targetDate = (currentScheduleDay === 'tomorrow') ? tomorrowStr : todayStr;

        let rawItems = [];
        allSchedules.forEach(s => {
            if (s.date === targetDate) {
                const lines = (s.details || '').split('\n').filter(l => l.trim() !== '');
                const displayLines = lines.length > 0 ? lines : [''];
                displayLines.forEach(line => {
                    let displayPax = parsePaxFromLine(line, s.count);
                    rawItems.push({
                        time: s.time || "09:00",
                        name: s.name,
                        customer: s.customerName || "고객",
                        count: displayPax,
                        resort: translateResort(s.resort || "-"),
                        flight: s.flight || "-",
                        details: line || s.name
                    });
                });
            }
        });

        let filtered = [];
        if (mode === 'pickup') {
            filtered = rawItems.filter(i => getCategory(i.name, i.details) === '픽업/샌딩');
        } else {
            filtered = rawItems.filter(i => getCategory(i.name, i.details) !== '픽업/샌딩');
        }

        // 시간순 정렬 + 같은 시간일 경우 리조트순 정렬
        filtered.sort((a, b) => {
            const timeCompare = a.time.localeCompare(b.time);
            if (timeCompare !== 0) return timeCompare;
            return a.resort.localeCompare(b.resort);
        });

        if (filtered.length === 0) { alert('해당 항목이 없습니다.'); return; }

        const popup = window.open('', '_blank', 'width=1000,height=800');
        const title = mode === 'pickup' ? `✈️ 픽업샌딩 명단 (${targetDate})` : `🏖️ 액티비티 명단 (${targetDate})`;
        
        let html = `<html><head><title>${title}</title><style>
            body { font-family: 'Pretendard', sans-serif; padding: 30px; }
            h1 { font-size: 22px; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px 10px; text-align: left; font-size: 13px; }
            th { background: #f8f9fa; font-weight: 800; }
            tr:nth-child(even) { background: #fafafa; }
            .pax { font-weight: 800; color: #ff6a00; }
            .time { font-weight: 900; color: #333; }
            .btn-print { background: #333; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; }
            @media print { .btn-print { display: none; } }
        </style></head><body>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h1>${title}</h1>
                <button class="btn-print" onclick="window.print()">인쇄하기</button>
            </div>
            <table>
                <thead><tr><th>시간</th><th>이름</th><th>인원</th><th>리조트</th><th>항공/상품</th><th>상세내용</th></tr></thead>
                <tbody>
                    ${filtered.map(it => `<tr>
                        <td class="time">${it.time}</td>
                        <td style="font-weight:700;">${it.customer}</td>
                        <td class="pax">${it.count}인</td>
                        <td>${it.resort}</td>
                        <td style="font-weight:bold; color:#1890ff;">${mode === 'pickup' ? it.flight : it.name}</td>
                        <td style="font-size:12px; color:#666;">${it.details}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </body></html>`;
        popup.document.write(html);
        popup.document.close();
    };
});

/* 🚀 네이버 카페 포스팅용 예약 확인증 생성기 로직 추가 */
const CAFE_TOUR_DB = {
    '고래': {
        name: '고래상어',
        emoji: '🐋',
        time: '오전 07:30 ~ 약 오후 12:30',
        program: '메인로드 졸리비 ➔ 리버타드 도착 및 브리핑 ➔ 고래상어 스노클링 ➔ 메인로드 졸리비 드랍',
        tips: '✔️ 수영복은 미리 입고 오시면 편해요!\n✔️ 비치타월 챙겨오심이 좋습니다'
    },
    '고말팩': {
        name: '보라카이션 고말팩 (고래상어+말룸파티)',
        emoji: '🐋🌿',
        time: '오전 07:30 ~ 오후 17:00 (종일 투어)',
        program: '07:30 미팅 ➔ 고래상어 스노클링 ➔ 말룸파티로 이동 ➔ 튜브트래킹 or 시크릿가든 물놀이 ➔ 점심 한방백숙 ➔ 오후 물놀이 ➔ 17:30 숙소 복귀',
        tips: '✔️ 수영복은 미리 입고 오시고 비치타월을 챙겨주세요!\n✔️ 말룸파티 튜빙 트래킹 시 래쉬가드와 아쿠아슈즈가 필수입니다!'
    },
    '호핑': {
        name: '블랙펄 요트 호핑투어',
        emoji: '⛵',
        time: '오후 13:30 ~ 18:00 (약 6시간)',
        program: '12:30 / 13:30\n기분 좋은 미팅 시작! (점보크랩 포함 여부에 따라 달라요!)\n14:00 ~ 15:30\n1차 물놀이 타임! 스노클링하고 간식 먹고 무한 반복!\n15:30 ~ 16:30\n2차 물놀이 타임!! 댄스 공연부터 감성 폭발 라이브까지!\n17:00 물놀이 후 국룰! \'선상 라면+주먹밥\' 타임 (이게 진짜 맛도리인 거 아시죠?)\n17:30 ~ 18:00 보라카이의 하이라이트, 황홀한 선셋 감상 후 복귀',
        tips: '✔️ 멀미가 심하신 분들은 배 타기 전 멀미약을 꼭 챙겨주세요!\n✔️ 인생샷을 위해 예쁜 수영복과 방수팩 챙겨오시면 좋습니다.'
    },
    '말룸': {
        name: '시크릿가든 말룸파티',
        emoji: '🛟',
        time: '오전 09:40 ~ 오후 17:00 (약 8시간)',
        program: '09:40 미팅 (정해진 장소)\n10:30 말룸파티 이동\n11:00 튜브트래킹 or 시크릿가든\n13:00 점심 한방백숙\n14:00 튜브트래킹 or 시크릿가든\n16:00 간식 타임\n16:30 보라카이 복귀\n17:30 숙소 드랍',
        tips: '✔️ 튜빙 트래킹을 하실 경우 래쉬가드와 아쿠아슈즈가 필수입니다!\n✔️ 물놀이 후 갈아입을 여벌 옷을 꼭 챙겨주세요.'
    },
    '스파': {
        name: '보라카이 마사지 샵별',
        emoji: '💆‍♀️',
        time: '예약 확정 시간 기준',
        program: '픽업 차량 탑승 ➔ 스파샵 도착 및 웰컴티 ➔ 전신 힐링 마사지',
        tips: ''
    },
    '픽업': {
        name: '보라카이 공항 픽업',
        emoji: '🚐',
        time: '고객님 항공편 도착/출발 시간에 맞춰 진행',
        program: '칼리보 공항 픽업 ➔ 까띠끌란 선착장 이동 ➔ 보라카이 섬 진입 ➔ 예약하신 리조트 도착',
        tips: '✔️ 공항 출구에서 "보라카이션" 피켓을 들고 있는 가이드를 찾아주세요!\n✔️ 이동 시간(약 2시간)이 다소 기니 목베개나 가벼운 겉옷을 챙기시면 좋습니다.'
    },
    '샌딩': {
        name: '보라카이 공항 샌딩',
        emoji: '🚐',
        time: '고객님 항공편 도착/출발 시간에 맞춰 진행',
        program: '리조트 픽업 ➔ 까띠끌란 선착장 이동 ➔ 칼리보 공항 도착',
        tips: '✔️ 공항세 1인 900페소 준비해주세요 ! 현금만 가능 합니다\n✔️ 이동 시간(약 2시간)이 다소 기니 목베개나 가벼운 겉옷을 챙기시면 좋습니다.'
    }
};

function maskCustomerName(name) {
    if (!name) return "고객";
    // 한글 이름이 섞여있다면 한글(2~4자)을 우선적으로 타겟팅
    const korMatch = name.match(/[가-힣]{2,5}/);
    let targetName = korMatch ? korMatch[0] : name.split(' ')[0];
    
    if (targetName.length <= 2) return targetName.charAt(0) + "X";
    return targetName.slice(0, -1) + "X";
}

async function parseCafeVoucherInput() {
    const input = document.getElementById('cafe-voucher-input').value.trim();
    if (!input) return null;
    
    let customerName = "고객";
    let customerMonth = "";
    let realItems = [];

    try {
        const urlObj = new URL(input);
        const id = urlObj.searchParams.get('id');
        if (id) {
            // 🔥 Firestore에서 퀵바우처 원본 데이터 직접 조회
            const docSnap = await getDoc(doc(db, "quick_vouchers", id));
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.customerKorName) {
                    // 한글 단어가 있는지 먼저 탐색
                    const korMatch = data.customerKorName.match(/[가-힣]{2,5}/);
                    if (korMatch) {
                        customerName = korMatch[0];
                    } else {
                        customerName = data.customerKorName.split(',')[0].trim().split(' ')[0];
                    }
                }
                if (data.items && data.items.length > 0) {
                    realItems = data.items.map(it => it.name).filter(name => name.replace(/[^\w가-힣a-zA-Z]/g, '').trim() !== '');
                    
                    // 1순위: DB 안의 date 필드에서 월 파싱
                    const firstDate = data.items[0].date;
                    if (firstDate) {
                        const splitDate = firstDate.split(/[-/.]/); // . 기호도 추가
                        if (splitDate.length >= 2) {
                            let m = splitDate.length === 3 ? splitDate[1] : splitDate[0];
                            m = parseInt(m, 10);
                            if (!isNaN(m)) customerMonth = m + '월 ';
                        }
                    }
                }
            }
        } else {
            // URL에 id가 없는 경우 대비 (단순 파싱)
            if (urlObj.searchParams.has('name')) customerName = urlObj.searchParams.get('name');
            else if (urlObj.searchParams.has('contact')) customerName = urlObj.searchParams.get('contact').split(' ')[0] || "고객";
        }
    } catch(e) {
        // URL이 아닌 텍스트일 경우
        const nameMatch = input.match(/예약자\s*:\s*([가-힣]+)/);
        if (nameMatch) customerName = nameMatch[1];
        
        // 텍스트 내에서 날짜(4/10, 2026-10-15 등) 추론 (이름이 없는 포맷이라도 달은 찾도록)
        if (!customerName || customerName === "고객") {
            const tempNameMatch = input.match(/^([가-힣]{2,4})/);
            if (tempNameMatch) customerName = tempNameMatch[1];
        }
    }

    // 2순위: 여전히 월(month)을 못 찾았다면, 전체 input 텍스트에서 4/10, 10.15, 10월 등의 패턴 찾기
    if (!customerMonth) {
        // 2026-07-28, 2026.07.28
        let mMatch = input.match(/20\d{2}[-./](1[0-2]|0?[1-9])[-./]\d{1,2}/);
        if (mMatch) {
            customerMonth = parseInt(mMatch[1], 10) + '월 ';
        } else {
            // 07/28, 7.28, 7/28
            mMatch = input.match(/(?:^|\s)(1[0-2]|0?[1-9])[-./]\d{1,2}/);
            if (mMatch) {
                customerMonth = parseInt(mMatch[1], 10) + '월 ';
            } else {
                // "10월" 이라는 명시적 단어
                mMatch = input.match(/(1[0-2]|[1-9])월/);
                if (mMatch) customerMonth = parseInt(mMatch[1], 10) + '월 ';
            }
        }
    }

    // DB 조회가 실패했거나 항목이 없는 경우의 백업 로직
    if (realItems.length === 0) {
        const lowerInput = input.toLowerCase();
        const hasWhaleKeyword = lowerInput.includes('shark') || lowerInput.includes('고래');
        const hasMalumKeyword = lowerInput.includes('malum') || lowerInput.includes('말룸');
        if (lowerInput.includes('고말팩') || (hasWhaleKeyword && hasMalumKeyword)) {
            realItems.push('고말팩(고래상어+말룸파티)');
        } else {
            if (hasWhaleKeyword) realItems.push('고래상어');
            if (input.includes('호핑')) realItems.push('프리미엄 요트 호핑투어');
            if (input.includes('말룸') || lowerInput.includes('malum')) realItems.push('시크릿가든 말룸파티');
            if (input.includes('스파') || input.includes('마사지')) realItems.push('프리미엄 마사지');
            if (input.includes('픽업') || input.includes('샌딩')) realItems.push('보라카이 공항 픽업샌딩');
        }
    }

    // 완전 기본값
    if (realItems.length === 0) realItems.push('보라카이션 자유여행 패키지');

    // 추출된 실제 상품명들을 기반으로 CAFE_TOUR_DB와 유연하게 매핑
    const mappedTours = [];
    realItems.forEach(itemName => {
        let dbInfo = { 
            name: itemName, // 🚀 오너 요청 반영: DB에 없는 상품이라도 실제 예약한 상품명이 제목에 노출됨
            emoji: '🌴',
            time: '예약된 바우처 스케줄 참고', 
            program: '선택하신 투어 프로그램에 맞춰 현지 가이드가 안전하게 진행해 드립니다.', 
            tips: '✔️ 투어 전일 안내드리는 미팅 시간과 장소를 꼭 확인해주세요.\n✔️ 편안한 복장을 권장합니다.' 
        };
        
        if (itemName.includes('고말팩')) { dbInfo = { ...CAFE_TOUR_DB['고말팩'], name: itemName }; }
        else if (itemName.includes('고래')) { dbInfo = { ...CAFE_TOUR_DB['고래'], name: itemName }; }
        else if (itemName.includes('호핑')) { dbInfo = { ...CAFE_TOUR_DB['호핑'], name: itemName }; }
        else if (itemName.includes('말룸')) { dbInfo = { ...CAFE_TOUR_DB['말룸'], name: itemName }; }
        else if (itemName.includes('스파') || itemName.includes('마사지') || itemName.includes('보라스파') || itemName.includes('루나') || itemName.includes('헬리오스')) { dbInfo = { ...CAFE_TOUR_DB['스파'], name: itemName }; }
        else if (itemName.includes('픽업')) { dbInfo = { ...CAFE_TOUR_DB['픽업'], name: itemName }; }
        else if (itemName.includes('샌딩')) { dbInfo = { ...CAFE_TOUR_DB['샌딩'], name: itemName }; }
        
        mappedTours.push(dbInfo);
    });

    // 3. 패키지 조합 판별 로직 (홈페이지 /boracay-package 기준으로 정확하게 매핑)
    const hasWhale = realItems.some(it => it.includes('고래') || it.includes('고말팩'));
    const hasHopping = realItems.some(it => it.includes('호핑'));
    const hasMalum = realItems.some(it => it.includes('말룸') || it.includes('고말팩'));
    const hasPickup = realItems.some(it => it.includes('픽업') || it.includes('샌딩') || it.includes('픽샌'));
    const isGomalPack = realItems.some(it => it.includes('고말팩'));

    let packageName = "";
    let isPackage = false;

    // ─── 4종 조합 ───────────────────────────────────────────────────
    if (hasPickup && hasHopping && hasMalum && hasWhale) {
        packageName = "시그니처 패키지"; isPackage = true;
    }
    // ─── 고래팩 E (고래+말룸+픽샌) ─────────────────────────────────
    else if (hasWhale && hasMalum && hasPickup && !hasHopping) {
        packageName = "고래팩 E"; isPackage = true;
    }
    // ─── 고래팩 D (고래+픽샌+호핑) ─────────────────────────────────
    else if (hasWhale && hasPickup && hasHopping && !hasMalum) {
        packageName = "고래팩 D"; isPackage = true;
    }
    // ─── 패키지 A (픽샌+호핑+고래) ─────────────────────────────────
    else if (hasPickup && hasHopping && hasWhale && !hasMalum) {
        packageName = "패키지 A"; isPackage = true;
    }
    // ─── 패키지 B (픽샌+호핑+말룸) ─────────────────────────────────
    else if (hasPickup && hasHopping && hasMalum && !hasWhale) {
        packageName = "패키지 B"; isPackage = true;
    }
    // ─── 패키지 C (픽샌+고래+말룸) ─────────────────────────────────
    else if (hasPickup && hasWhale && hasMalum && !hasHopping) {
        packageName = "패키지 C"; isPackage = true;
    }
    // ─── 고래팩 A (고래+픽샌) ───────────────────────────────────────
    else if (hasWhale && hasPickup && !hasHopping && !hasMalum) {
        packageName = "고래팩 A"; isPackage = true;
    }
    // ─── 고래팩 B (고래+호핑) ───────────────────────────────────────
    else if (hasWhale && hasHopping && !hasPickup && !hasMalum) {
        packageName = "고래팩 B"; isPackage = true;
    }
    // ─── 고말팩 단독 or 고래팩 C (고래+말룸, 픽샌/호핑 없음) ────────
    else if (isGomalPack || (hasWhale && hasMalum && !hasPickup && !hasHopping)) {
        packageName = "고말팩(고래상어+말룸파티)"; isPackage = true;
    }
    // ─── 픽샌팩 A (픽샌+호핑) ──────────────────────────────────────
    else if (hasPickup && hasHopping && !hasWhale && !hasMalum) {
        packageName = "픽샌팩 A"; isPackage = true;
    }
    // ─── 픽샌팩 B (픽샌+고래) ──────────────────────────────────────
    else if (hasPickup && hasWhale && !hasHopping && !hasMalum) {
        packageName = "픽샌팩 B"; isPackage = true;
    }
    // ─── 픽샌팩 C (픽샌+말룸) ──────────────────────────────────────
    else if (hasPickup && hasMalum && !hasHopping && !hasWhale) {
        packageName = "픽샌팩 C"; isPackage = true;
    }
    // ─── 픽업/샌딩 단독 ────────────────────────────────────────────
    else if (hasPickup && !hasHopping && !hasMalum && !hasWhale) {
        packageName = "공항 왕복 픽업샌딩"; isPackage = false;
    }
    // ─── 단품 ──────────────────────────────────────────────────────
    else if (realItems.length > 0) { packageName = realItems[0]; isPackage = false; }
    else { packageName = "상품"; isPackage = false; }


    return { 
        name: customerName, 
        maskedName: maskCustomerName(customerName),
        month: customerMonth,
        packageName: packageName,
        isPackage: isPackage,
        tours: mappedTours 
    };
}

window.copyCafeTitle = async () => {
    try {
        const data = await parseCafeVoucherInput();
        if (!data) return alert('퀵바우처 링크(데이터)를 입력해주세요.');
        // 🚀 패키지명 포함하여 조합 및 '보라카이션' 고정 + 단품/패키지 텍스트 추가
        const resType = data.isPackage ? "패키지 예약" : "예약";
        const title = `[보라카이 자유여행] ${data.maskedName}님의 완벽한 ${data.month}보라카이션 ${data.packageName} ${resType} 확정 !`;
        await navigator.clipboard.writeText(title);
        alert('카페 제목이 복사되었습니다!');
    } catch(err) {
        console.error(err);
        alert('오류가 발생했습니다: ' + err.message);
    }
};

window.copyCafeText = async () => {
    try {
        const data = await parseCafeVoucherInput();
        if (!data) return alert('퀵바우처 링크(데이터)를 입력해주세요.');
        
        const resType = data.isPackage ? "패키지 예약이" : "예약이";
        let text = `안녕하세요! 보라카이션입니다. 🌴\n\n`;
        text += `아름다운 보라카이에서 잊지 못할 추억을 만들어 드릴 준비가 완료되었습니다!\n`;
        text += `${data.maskedName}님의 보라카이션 ${data.packageName} ${resType} 확정되었음을 안내해 드립니다.\n\n`;
        text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        data.tours.forEach((tour, index) => {
            text += `${tour.emoji} [${tour.name}]\n`;
            text += `- 진행 시간: ${tour.time}\n`;
            
            if (tour.program.includes('\n')) {
                text += `- 상세 일정: \n${tour.program}\n\n`;
            } else {
                text += `- 상세 일정: ${tour.program}\n\n`;
            }
            
            if (tour.tips) {
                text += `💡 [보라카이션 꿀팁 & 준비물]\n${tour.tips}\n\n`;
            }
            
            if (index < data.tours.length - 1) text += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n`;
        });
        
        text += `보라카이션을 믿고 선택해 주셔서 진심으로 감사드립니다.\n`;
        text += `보라카이에서 뵙는 그날까지 설레는 마음으로 기다리겠습니다!\n\n`;
        text += `궁금한 점이 있으시면 언제든 카카오톡 채널 '보라카이션'으로 문의해 주세요. 🧡\n\n`;
        text += `카카오톡 채널 바로가기 🧡\nhttps://pf.kakao.com/_zBArM\n`;

        await navigator.clipboard.writeText(text);
        alert('카페 본문 텍스트가 복사되었습니다!');
    } catch(err) {
        console.error(err);
        alert('오류가 발생했습니다: ' + err.message);
    }
};

window.copyCafeImage = async () => {
    try {
        const data = await parseCafeVoucherInput();
        if (!data) return alert('퀵바우처 링크(데이터)를 입력해주세요.');
        
        // DOM 업데이트
        document.getElementById('cafe-voucher-name').innerText = data.maskedName;
        const ul = document.getElementById('cafe-voucher-tour-list');
        ul.innerHTML = '';
        data.tours.forEach(tour => {
            const li = document.createElement('li');
            li.innerText = tour.name;
            ul.appendChild(li);
        });

        const targetDom = document.getElementById('cafe-voucher-capture-area');
        
        html2canvas(targetDom, {
            scale: 2,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            canvas.toBlob(blob => {
                try {
                    window.focus();
                    const item = new ClipboardItem({ 'image/png': blob });
                    navigator.clipboard.write([item]).then(() => {
                        alert('바우처 이미지가 클립보드에 복사되었습니다! (Ctrl+V 로 붙여넣기)');
                    }).catch(err => {
                        console.error(err);
                        alert('복사 실패: 버튼 클릭 후 다른 창을 누르지 말고 잠시 기다려주세요! (오류: ' + err.message + ')');
                    });
                } catch (e) {
                    alert('이미지 복사 중 오류가 발생했습니다: ' + e.message);
                }
            });
        });
    } catch(err) {
        console.error(err);
        alert('오류가 발생했습니다: ' + err.message);
    }
};

/* 🔗 링크 이미지 복사 */
const TOUR_URL_MAP = {
    '고래': { url: 'https://www.boracaysean.com/whale-shark-tour', label: '🐋 리버타드 고래상어 투어 상세보기', img: 'b5.png' },
    '호핑': { url: 'https://www.boracaysean.com/hopping-tour', label: '⛵ 블랙펄 요트호핑 투어 상세보기', img: 'b4.png' },
    '말룸': { url: 'https://www.boracaysean.com/malumpati', label: '🌿 시크릿가든 말룸파티 상세보기', img: 'b6.png' },
    '픽업': { url: 'https://www.boracaysean.com/pickup-sending', label: '🚐 공항 픽업 상세보기', img: 'b3.png' },
    '샌딩': { url: 'https://www.boracaysean.com/pickup-sending', label: '🚐 공항 샌딩 상세보기', img: 'b3.png' },
    '스파':  { url: 'https://www.boracaysean.com/massage', label: '💆 마사지&스파 상세보기', img: 'b7.png' },
    '마사지': { url: 'https://www.boracaysean.com/massage', label: '💆 마사지&스파 상세보기', img: 'b7.png' },
};
const PACKAGE_URL_MAP2 = {
    '시그니처': { url: 'https://www.boracaysean.com/package-signature', label: '⭐ 시그니처 패키지 예약 및 정보 바로가기' },
    '고래팩': { url: 'https://www.boracaysean.com/package-tour', label: '🐋 고래팩 예약 및 정보 바로가기', img: 'b1.png' },
    '고말팩(고래상어+말룸파티)': { url: 'https://www.boracaysean.com/package-tour', label: '🐋 고래상어 패키지 예약 및 정보 바로가기', img: 'b1.png' },
    '픽샌팩': { url: 'https://www.boracaysean.com/boracay-package', label: '🚐 픽샌팩 예약 및 정보 바로가기', img: 'b2.png' },
};
const ACTIVITY_FALLBACK_BTN = { url: 'https://www.boracaysean.com/activities', label: '🎉 액티비티 전체보기', img: 'b8.png', type: 'tour' };
const KAKAO_BTN = { url: 'https://pf.kakao.com/_zBArM', label: '🧡 보라카이션 카카오채널 상담하기', type: 'kakao', img: 'b9.png' };

window.copyLinkImage = async () => {
    try {
        const data = await parseCafeVoucherInput();
        if (!data) return alert('퀵바우처 링크(데이터)를 입력해주세요.');
        const links = [];
        if (data.isPackage) {
            const pkgKey = Object.keys(PACKAGE_URL_MAP2).find(k => data.packageName.includes(k));
            if (pkgKey && PACKAGE_URL_MAP2[pkgKey].img) links.push({ ...PACKAGE_URL_MAP2[pkgKey], type: 'package' });
        }
        const addedUrls = new Set();
        data.tours.forEach(tour => {
            const key = Object.keys(TOUR_URL_MAP).find(k => tour.name && tour.name.includes(k));
            if (key && !addedUrls.has(TOUR_URL_MAP[key].url)) {
                links.push({ ...TOUR_URL_MAP[key], type: 'tour' });
                addedUrls.add(TOUR_URL_MAP[key].url);
            } else if (!key && !addedUrls.has(ACTIVITY_FALLBACK_BTN.url)) {
                links.push({ ...ACTIVITY_FALLBACK_BTN });
                addedUrls.add(ACTIVITY_FALLBACK_BTN.url);
            }
        });
        links.push(KAKAO_BTN);

        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:absolute;left:-9999px;top:0;width:650px;background:#fff;font-family:Pretendard,sans-serif;padding:30px;box-sizing:border-box;';
        const rows = links.map(link =>
            `<img src="${link.img}" alt="${link.label}" style="width:100%;display:block;border-radius:14px;margin-bottom:12px;">`
        ).join('');
        wrap.innerHTML = `<div style="display:flex;flex-direction:column;gap:12px;">${rows}</div>`;
        document.body.appendChild(wrap);

        // 이미지 완전 로딩 대기 (이게 없으면 빈 화면이 캡처됨)
        const images = Array.from(wrap.querySelectorAll('img'));
        await Promise.all(images.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        }));

        const canvas = await html2canvas(wrap, { scale:2, useCORS:true, backgroundColor:'#ffffff' });
        document.body.removeChild(wrap);

        canvas.toBlob(async (pngBlob) => {
            const htmlStr = `<div style="max-width:650px;">${links.map(link=>
                `<a href="${link.url}"><img src="https://www.boracaysean.com/${link.img}" alt="${link.label}" style="width:100%;display:block;border-radius:10px;margin-bottom:10px;border:none;"></a>`
            ).join('')}</div>`;
            try {
                window.focus();
                await navigator.clipboard.write([new ClipboardItem({'image/png':pngBlob,'text/html':new Blob([htmlStr],{type:'text/html'})})]);
                alert('🔗 링크 이미지가 복사되었습니다!\n네이버 카페 에디터에 붙여넣기하면 링크 버튼이 실제로 작동합니다!');
            } catch(e) { alert('복사 실패: 버튼 누르고 잠시 딴 창 누르지 마세요! (오류: '+e.message+')'); }
        }, 'image/png');
    } catch(err) { console.error(err); alert('오류: '+err.message); }
};


// ==========================================
// 🐋 고래상어 관리 시스템 (Whale Shark Admin)
// ==========================================


let wsUnsubscribe = null;
let currentWsAgencies = [];
let yesterdayUsageByAgency = {};
let yesterdayDateStr = '';

// 난수 생성 함수 (보안 토큰용)
function generateWsToken() {
    return 'ws_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// 탭 클릭 시 고래상어 데이터 리스닝 시작
const originalSwitchDashboard = window.switchDashboard;
window.switchDashboard = function(tab) {
    if (originalSwitchDashboard) {
        originalSwitchDashboard(tab);
    } else {
        document.getElementById('dashboard-overlay').style.display = 'block';
        document.querySelectorAll('.db-panel').forEach(p => p.style.display = 'none');
        const target = document.getElementById('db-' + tab);
        if(target) target.style.display = 'block';
    }

    if (tab === 'whale-shark') {
        initWhaleSharkAdmin();
    } else {
        if (wsUnsubscribe) { wsUnsubscribe(); wsUnsubscribe = null; }
    }
};

function initWhaleSharkAdmin() {
    if (wsUnsubscribe) wsUnsubscribe();

    // 어제 날짜 계산 및 어제 사용량 로드
    (async () => {
        const todayD = new Date();
        const yesterday = new Date(todayD);
        yesterday.setDate(yesterday.getDate() - 1);
        // 필리핀 시간(UTC+8) 기준 오늘 날짜의 UTC 범위를 계산
        const phOffset = 8 * 60 * 60 * 1000;
        const phToday = new Date(todayD.getTime() + phOffset);
        const yStr = `${phToday.getUTCFullYear()}-${String(phToday.getUTCMonth()+1).padStart(2,'0')}-${String(phToday.getUTCDate()).padStart(2,'0')}`;
        yesterdayDateStr = `${phToday.getUTCMonth() + 1}월 ${phToday.getUTCDate()}일`;
        try {
            const { query: q2, where, getDocs, collection: col } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
            // type 없이 날짜 범위만 쿼리 (composite index 불필요)
            const yq = q2(col(db, "whale_transactions"), where("createdAt", ">=", yStr + "T00:00:00"), where("createdAt", "<=", yStr + "T23:59:59"));
            const snap = await getDocs(yq);
            yesterdayUsageByAgency = {};
            let totalYesterdayUsed = 0;
            snap.forEach(docSnap => {
                const d = docSnap.data();
                // JS에서 USE 타입만 필터링
                if (d.type === 'USE' && d.agencyId) {
                    yesterdayUsageByAgency[d.agencyId] = (yesterdayUsageByAgency[d.agencyId] || 0) + (d.amount || 0);
                    totalYesterdayUsed += (d.amount || 0);
                }
            });
            // 오늘 정산 카드 업데이트
            const finSettlement = document.getElementById('ws-fin-settlement');
            const finSettlementLabel = document.getElementById('ws-fin-settlement-label');
            if (finSettlement) finSettlement.innerText = (totalYesterdayUsed * 1670).toLocaleString() + ' ₱';
            const lblFinSettlement = document.getElementById('lbl-fin-settlement');
            if (lblFinSettlement) lblFinSettlement.innerText = `${yesterdayDateStr} 정산금액 (오늘)`;
            // 정산 카드 클릭 이벤트 등록
            const settlementCard = document.getElementById('ws-fin-settlement')?.closest('.db-card');
            if (settlementCard) {
                settlementCard.style.cursor = 'pointer';
                settlementCard.onclick = () => openSettlementModal();
            }
            if (finSettlementLabel) finSettlementLabel.innerText = `오늘(${yesterdayDateStr}) 사용 ${totalYesterdayUsed}장 × 1,670`;

            // 오늘 구매(충전)된 티켓 기준 총금액/베네핏/티켓비용 (일별 카운팅)
            const aq = q2(col(db, "whale_transactions"), where("createdAt", ">=", yStr + "T00:00:00"), where("createdAt", "<=", yStr + "T23:59:59"));
            const addSnap = await getDocs(aq);
            let totalTodayBought = 0;
            addSnap.forEach(docSnap => {
                const d = docSnap.data();
                if (d.type === 'ADD') totalTodayBought += (d.amount || 0);
            });
            const todayTotalEl = document.getElementById('ws-fin-total-today');
            const todayBenefitEl = document.getElementById('ws-fin-benefit-today');
            const todayCostEl = document.getElementById('ws-fin-cost-today');
            if (todayTotalEl) todayTotalEl.innerText = `오늘 구매 ${totalTodayBought}장 · ${(totalTodayBought * 1920).toLocaleString()} ₱`;
            if (todayBenefitEl) todayBenefitEl.innerText = `오늘 구매 ${totalTodayBought}장 · ${(totalTodayBought * 250).toLocaleString()} ₱`;
            if (todayCostEl) todayCostEl.innerText = `오늘 구매 ${totalTodayBought}장 · ${(totalTodayBought * 1670).toLocaleString()} ₱`;

            if (currentWsAgencies.length > 0) renderWsAgencies();
        } catch(e) { console.error("어제 트랜잭션 로드 실패:", e); }
    })();

    // 판매처 목록 리스닝
    const q = query(collection(db, "whale_agencies"));
    wsUnsubscribe = onSnapshot(q, (snapshot) => {
        currentWsAgencies = [];
        let totalMonthlyBought = 0;
        let totalMonthlyUsed = 0;
        let totalRemain = 0;

        const tempDocs = [];
        snapshot.forEach(docSnap => tempDocs.push(docSnap));
        tempDocs.sort((a, b) => {
            const dateA = a.data().createdAt || '';
            const dateB = b.data().createdAt || '';
            return dateB.localeCompare(dateA);
        });
        
        const today = new Date();
        const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const currentMonthNum = today.getMonth() + 1;

        tempDocs.forEach(docSnap => {
            const data = docSnap.data();
            data.id = docSnap.id;

            // 리버타드 자체 대시보드에서 등록한 판매처는 보라카이션 admin에 노출하지 않음
            if (data.registeredBy === 'libertad') return;

            // 과거 테스트 데이터 자동 마이그레이션
            if (data.monthlyBought === undefined || data.monthlyUsed === undefined) {
                data.monthlyBought = data.totalBought || 0;
                data.monthlyUsed = data.totalUsed || 0;
                data.currentMonth = currentMonthStr;
                updateDoc(doc(db, "whale_agencies", data.id), {
                    monthlyBought: data.monthlyBought,
                    monthlyUsed: data.monthlyUsed,
                    currentMonth: currentMonthStr
                }).catch(e => console.error("Auto migration failed", e));
            }

            // 테스트 도중 발생한 논리적 오류 강제 보정 (구매량이 사용량보다 적은 경우 수학적으로 수정)
            if ((data.monthlyBought || 0) < (data.monthlyUsed || 0)) {
                const correctedBought = (data.monthlyUsed || 0) + (data.remainCount || 0);
                data.monthlyBought = correctedBought;
                data.totalBought = correctedBought;
                updateDoc(doc(db, "whale_agencies", data.id), {
                    monthlyBought: correctedBought,
                    totalBought: correctedBought
                }).catch(e => console.error("Correction failed", e));
            }

            currentWsAgencies.push(data);
            
            if (data.currentMonth === currentMonthStr) {
                totalMonthlyBought += (data.monthlyBought || 0);
                totalMonthlyUsed += (data.monthlyUsed || 0);
            }
            totalRemain += (data.remainCount || 0);
        });

        const lblBought = document.getElementById('lbl-total-bought');
        const lblUsed = document.getElementById('lbl-total-used');
        const lblRemain = document.getElementById('lbl-total-remain');
        if (lblBought) lblBought.innerText = `${currentMonthNum}월 구매티켓`;
        if (lblUsed) lblUsed.innerText = `${currentMonthNum}월 사용티켓`;
        if (lblRemain) lblRemain.innerText = `총 잔여티켓`;

        document.getElementById('ws-total-bought').innerText = totalMonthlyBought.toLocaleString();
        document.getElementById('ws-total-used').innerText = totalMonthlyUsed.toLocaleString();
        document.getElementById('ws-total-remain').innerText = totalRemain.toLocaleString();

        // 재무 합계 카드 업데이트
        const finTotal = document.getElementById('ws-fin-total');
        const finBenefit = document.getElementById('ws-fin-benefit');
        const finCost = document.getElementById('ws-fin-cost');
        if (finTotal) finTotal.innerText = (totalMonthlyBought * 1920).toLocaleString() + ' ₱';
        if (finBenefit) finBenefit.innerText = (totalMonthlyBought * 250).toLocaleString() + ' ₱';
        if (finCost) finCost.innerText = (totalMonthlyBought * 1670).toLocaleString() + ' ₱';
        // 라벨도 월 이름으로 동적 업데이트
        const lblFinTotal = document.getElementById('lbl-fin-total');
        const lblFinBenefit = document.getElementById('lbl-fin-benefit');
        const lblFinCost = document.getElementById('lbl-fin-cost');
        if (lblFinTotal) lblFinTotal.innerText = `${currentMonthNum}월 구매티켓 총금액`;
        if (lblFinBenefit) lblFinBenefit.innerText = `${currentMonthNum}월 베네핏 금액`;
        if (lblFinCost) lblFinCost.innerText = `${currentMonthNum}월 티켓비용`;

        renderWsAgencies();
    }, (error) => {
        console.error("고래상어 데이터 로드 에러:", error);
        Swal.fire('오류', '데이터를 불러오는 중 문제가 발생했습니다.', 'error');
    });

    // 오늘 리버타드 방문 인원 집계 (whale_daily_counts)
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    
    const todayRef = doc(db, "whale_daily_counts", todayStr);
    onSnapshot(todayRef, (docSnap) => {
        if (docSnap.exists()) {
            document.getElementById('ws-today-count').innerText = (docSnap.data().count || 0).toLocaleString();
        } else {
            document.getElementById('ws-today-count').innerText = "0";
        }
    });
}

function renderWsAgencies() {
    const grid = document.getElementById('ws-agency-grid');
    if (!grid) {
        Swal.fire({
            title: '업데이트 적용 중',
            text: '최신 디자인(카드형)을 불러오기 위해 브라우저 캐시를 초기화합니다.',
            icon: 'info',
            confirmButtonText: '확인'
        }).then(() => {
            window.location.href = window.location.pathname + '?bust=' + new Date().getTime();
        });
        return;
    }
    
    if (!currentWsAgencies.length) {
        grid.innerHTML = '<div style="padding:30px; text-align:center; color:#aaa; grid-column: 1 / -1;">등록된 판매처가 없습니다.</div>';
        return;
    }

    grid.innerHTML = currentWsAgencies.map(a => {
        const isActive = a.status !== 'INACTIVE';
        const agencyColor = '#0f2a4a';
        const statusBadge = isActive 
            ? `<span class="badge badge-active" style="float:right; font-size:11px;">활성</span>`
            : `<span class="badge badge-inactive" style="float:right; font-size:11px;">정지됨</span>`;
        
        const currentMonthNum = new Date().getMonth() + 1;
        const currentMonthStr = `${new Date().getFullYear()}-${String(currentMonthNum).padStart(2,'0')}`;
        const mBought = a.currentMonth === currentMonthStr ? (a.monthlyBought || 0) : 0;
        const mUsed = a.currentMonth === currentMonthStr ? (a.monthlyUsed || 0) : 0;
        const yUsed = yesterdayUsageByAgency[a.id] || 0;

        return `<div class="db-card" style="padding: 20px; position:relative; border-top: 4px solid ${agencyColor};">
            <div style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                ${statusBadge}
                <h3 style="margin:0; font-size: 18px; color:${agencyColor}; font-weight: 800;">${a.name}</h3>
            </div>
            <div style="font-size: 14px; color:#555; margin-bottom: 8px;">
                <strong>${currentMonthNum}월 구매티켓:</strong> <span style="float:right; font-weight:700;">${mBought.toLocaleString()}장</span>
            </div>
            <div style="font-size: 14px; color:#555; margin-bottom: 8px;">
                <strong>${currentMonthNum}월 사용티켓:</strong> <span style="float:right;">${mUsed.toLocaleString()}장</span>
            </div>
            <div style="font-size: 14px; color:#555; margin-bottom: 8px;">
                <strong>오늘 사용 (${yesterdayDateStr}):</strong> <span style="float:right; color:#34c759; font-weight:700;">${yUsed.toLocaleString()}장</span>
            </div>
            <div style="font-size: 15px; color:#111; margin-bottom: 15px; font-weight:800; padding-top:10px; border-top:1px dashed #eee;">
                <strong>총 잔여티켓:</strong> <span style="float:right; color:#007aff; font-size:18px;">${(a.remainCount || 0).toLocaleString()}장</span>
            </div>
            <div style="display:flex; gap:10px; margin-bottom:8px;">
                <button class="btn-sm" style="flex:1;" onclick="showWsQr('${a.id}', '${a.name}', '${a.token}', '${agencyColor}')">QR 보기</button>
            </div>
            <div style="display:flex; gap:10px; margin-bottom:8px;">
                <button class="btn-sm" style="flex:1; color:#007aff; border-color:#007aff; font-weight:900; font-size:14px;" onclick="openAddAgencyModal('${a.id}')">+ 티켓+</button>
                <button class="btn-sm" style="flex:1; color:#ff9500; border-color:#ff9500; font-weight:900; font-size:14px;" onclick="deductWsTickets('${a.id}', '${a.name}')">− 티켓-</button>
            </div>
            <div style="display:flex; gap:10px;">
                <button class="btn-sm" style="flex:1; color:#ff2d55; border-color:#ff2d55;" onclick="deleteWsAgency('${a.id}', '${a.name}')">&#128465; 삭제</button>
            </div>
        </div>`;
    }).join('');
}

window.deductWsTickets = async function(id, name) {
    const agency = currentWsAgencies.find(a => a.id === id);
    if (!agency) return;

    const { value: deductCount } = await Swal.fire({
        title: `${name} - 티켓 차감`,
        input: 'number',
        inputLabel: `현재 잔여: ${agency.remainCount || 0}장 / 차감할 수량을 입력하세요`,
        inputAttributes: { min: 1, max: agency.remainCount || 0 },
        showCancelButton: true,
        confirmButtonText: '차감',
        cancelButtonText: '취소',
        inputValidator: (v) => {
            if (!v || v <= 0) return '수량을 입력하세요';
            if (parseInt(v) > (agency.remainCount || 0)) return `잔여티켓(${agency.remainCount}장)보다 많습니다`;
        }
    });
    if (!deductCount) return;

    try {
        const today = new Date();
        const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const newRemain = (agency.remainCount || 0) - parseInt(deductCount);
        const newTotalUsed = (agency.totalUsed || 0) + parseInt(deductCount);
        let newMonthlyUsed = agency.monthlyUsed || 0;
        if (agency.currentMonth === currentMonthStr) {
            newMonthlyUsed += parseInt(deductCount);
        } else {
            newMonthlyUsed = parseInt(deductCount);
        }
        await updateDoc(doc(db, 'whale_agencies', id), {
            remainCount: newRemain,
            totalUsed: newTotalUsed,
            monthlyUsed: newMonthlyUsed,
            currentMonth: currentMonthStr,
            updatedAt: today.toISOString()
        });
        await addDoc(collection(db, 'whale_transactions'), {
            agencyId: id,
            type: 'USE',
            amount: parseInt(deductCount),
            createdAt: today.toISOString()
        });
        Swal.fire('차감 완료', `${name}에서 ${deductCount}장 차감했습니다.\n잔여: ${newRemain}장`, 'success');
    } catch(e) {
        console.error(e);
        Swal.fire('오류', '차감 중 문제가 발생했습니다.', 'error');
    }
};

window.openAddAgencyModal = function(id = null) {
    document.getElementById('ws-agency-id').value = id || '';
    document.getElementById('ws-agency-name').value = '';
    document.getElementById('ws-agency-add-count').value = '';

    if (id) {
        const agency = currentWsAgencies.find(a => a.id === id);
        if(agency) {
            document.getElementById('ws-modal-title').innerText = '판매처 설정 및 충전';
            document.getElementById('ws-agency-name').value = agency.name;
            document.getElementById('ws-agency-name').readOnly = true;
            document.getElementById('ws-add-ticket-section').style.display = 'block';
        }
    } else {
        document.getElementById('ws-modal-title').innerText = '새 판매처 등록';
        document.getElementById('ws-agency-name').readOnly = false;
        document.getElementById('ws-add-ticket-section').style.display = 'none'; // 처음 등록할 땐 수량 0으로 생성
    }

    document.getElementById('ws-agency-modal').style.display = 'flex';
};

window.closeWsAgencyModal = function() {
    document.getElementById('ws-agency-modal').style.display = 'none';
};

window.saveWsAgency = async function() {
    const id = document.getElementById('ws-agency-id').value;
    const name = document.getElementById('ws-agency-name').value.trim();
    const addCount = parseInt(document.getElementById('ws-agency-add-count').value) || 0;

    if (!name) { Swal.fire('알림', '판매처명을 입력해주세요.', 'warning'); return; }
    
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    try {
        if (id) {
            // 기존 업체 설정/충전
            const agency = currentWsAgencies.find(a => a.id === id);
            if (!agency) return;
            
            if (addCount > 0) {
                const newRemain = (agency.remainCount || 0) + addCount;
                const newTotal = (agency.totalBought || 0) + addCount;
                
                let newMonthlyBought = agency.monthlyBought || 0;
                if (agency.currentMonth === currentMonthStr) {
                    newMonthlyBought += addCount;
                } else {
                    newMonthlyBought = addCount;
                }
                
                await updateDoc(doc(db, "whale_agencies", id), {
                    remainCount: newRemain,
                    totalBought: newTotal,
                    monthlyBought: newMonthlyBought,
                    currentMonth: currentMonthStr,
                    updatedAt: new Date().toISOString()
                });

                await addDoc(collection(db, "whale_transactions"), {
                    agencyId: id,
                    type: 'ADD',
                    amount: addCount,
                    createdAt: new Date().toISOString()
                });
                Swal.fire('성공', `티켓 ${addCount}장이 충전되었습니다.`, 'success');
            } else {
                Swal.fire('알림', '추가할 티켓 수량을 입력해주세요.', 'info');
                return;
            }
        } else {
            // 새 판매처 등록
            const token = generateWsToken();
            await addDoc(collection(db, "whale_agencies"), {
                name: name,
                token: token,
                remainCount: 0,
                totalBought: 0,
                totalUsed: 0,
                monthlyBought: 0,
                monthlyUsed: 0,
                currentMonth: currentMonthStr,
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            Swal.fire('성공', '새 판매처가 등록되었습니다. 이제 티켓을 추가할 수 있습니다.', 'success');
        }
        closeWsAgencyModal();
    } catch(e) {
        console.error(e);
        Swal.fire('오류', '저장 중 오류가 발생했습니다.', 'error');
    }
};

window.toggleWsStatus = async function(id, currentActive) {
    try {
        const newStatus = currentActive ? 'INACTIVE' : 'ACTIVE';
        await updateDoc(doc(db, "whale_agencies", id), {
            status: newStatus,
            updatedAt: new Date().toISOString()
        });
    } catch (e) {
        console.error(e);
        Swal.fire('오류', '상태 변경 중 문제가 발생했습니다.', 'error');
    }
};

window.deleteWsAgency = async function(id, name) {
    Swal.fire({
        title: '판매처 삭제',
        text: `'${name}' 판매처를 정말 삭제하시겠습니까? (복구 불가)`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff2d55',
        cancelButtonColor: '#aaa',
        confirmButtonText: '삭제',
        cancelButtonText: '취소'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await deleteDoc(doc(db, "whale_agencies", id));
                Swal.fire('삭제 완료', '판매처가 삭제되었습니다.', 'success');
            } catch(e) {
                console.error(e);
                Swal.fire('오류', '삭제 중 문제가 발생했습니다.', 'error');
            }
        }
    });
};
// QR 코드 생성 및 표시
let wsQrCodeInstance = null;
window.showWsQr = function(id, name, token, color) {
    const nameEl = document.getElementById('ws-qr-agency-name');
    nameEl.innerText = name;
    nameEl.style.color = color || '#007aff';
    const footerTag = document.getElementById('ws-qr-footer-tag');
    if (footerTag) footerTag.innerText = `${name} × 고래상어`;
    const container = document.getElementById('ws-qrcode-container');
    container.innerHTML = ''; // 초기화
    
    wsQrCodeInstance = new QRCode(container, {
        text: token, // URL 대신 토큰만 담아서 boracaysean 도메인이 안 보이게 함
        width: 200,
        height: 200,
        colorDark : color || "#ff2d55", // 지정된 색상 또는 기본 핑크
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    document.getElementById('ws-qr-modal').style.display = 'flex';

    // QR코드 렌더링 후 캔버스에 로고 덮어쓰기
    setTimeout(() => {
        const canvas = container.querySelector('canvas');
        const imgEl = container.querySelector('img');
        if (canvas && imgEl) {
            const ctx = canvas.getContext('2d');
            const logo = new Image();
            logo.crossOrigin = "Anonymous";
            logo.src = 'libertad.png';
            logo.onload = () => {
                const logoSize = 46;
                const x = (canvas.width - logoSize) / 2;
                const y = (canvas.height - logoSize) / 2;
                
                // 하얀색 배경 사각형 (QR선 가리기)
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8);
                
                // 로고 그리기
                ctx.drawImage(logo, x, y, logoSize, logoSize);
                
                // 덮어쓴 캔버스 결과를 <img> 태그에 반영 (다운로드 버튼 작동 위함)
                imgEl.src = canvas.toDataURL("image/png");
            };
        }
    }, 150);
};

window.closeWsQrModal = function() {
    document.getElementById('ws-qr-modal').style.display = 'none';
};

window.downloadWsQr = async function() {
    const captureArea = document.getElementById('ws-qr-capture-area');
    const name = document.getElementById('ws-qr-agency-name').innerText;
    
    if (!captureArea) return;
    
    // 다운로드 중 버튼 비활성화
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = '저장 중...';
    btn.disabled = true;

    try {
        const canvas = await html2canvas(captureArea, {
            scale: 3, // 고해상도
            useCORS: true,
            backgroundColor: '#ffffff'
        });
        
        const link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = `고래상어_티켓QR_${name}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch(e) {
        console.error('QR 캡처 실패:', e);
        alert('저장에 실패했습니다.');
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
};

// ========== 정산 기록 모달 ==========
window.openSettlementModal = async function() {
    document.getElementById('ws-settlement-modal').style.display = 'flex';
    const listEl = document.getElementById('ws-settlement-list');
    listEl.innerHTML = '<div style="text-align:center; color:#aaa; padding:40px;">불러오는 중...</div>';

    try {
        // 모든 트랜잭션 가져오기 (USE 타입)
        const txSnap = await getDocs(query(collection(db, 'whale_transactions')));
        
        // 날짜별, 업체별 집계
        const dailyMap = {}; // { 'YYYY-MM-DD': { agencyId: count } }
        txSnap.forEach(d => {
            const data = d.data();
            if (data.type !== 'USE') return;
            const date = (data.createdAt || '').substring(0, 10);
            if (!date) return;
            if (!dailyMap[date]) dailyMap[date] = {};
            dailyMap[date][data.agencyId] = (dailyMap[date][data.agencyId] || 0) + (data.amount || 0);
        });

        // 정산 완료 여부 가져오기
        const settlementSnap = await getDocs(collection(db, 'whale_settlements'));
        const paidMap = {}; // { 'YYYY-MM-DD_agencyId': true/false }
        settlementSnap.forEach(d => {
            const data = d.data();
            paidMap[d.id] = { isPaid: data.isPaid, paidAt: data.paidAt, confirmedByLibertad: data.confirmedByLibertad };
        });

        const agencyMap = {};
        currentWsAgencies.forEach(a => { agencyMap[a.id] = a.name; });

        const sortedDates = Object.keys(dailyMap).sort((a, b) => b.localeCompare(a));

        if (sortedDates.length === 0) {
            listEl.innerHTML = '<div style="text-align:center; color:#aaa; padding:40px;">정산 내역이 없습니다.</div>';
            return;
        }

        let html = '';
        sortedDates.forEach(date => {
            const agencies = dailyMap[date];
            const totalUsed = Object.values(agencies).reduce((a, b) => a + b, 0);
            const totalAmount = totalUsed * 1670;

            // 날짜 그룹 헤더
            html += `<div style="background:#f4f7f6; padding:12px 16px; border-radius:10px; margin-bottom:8px; font-weight:800; color:#333;">
                📅 ${date} &nbsp; <span style="color:#007aff;">${totalUsed}장</span> &nbsp; <span style="color:#34c759; font-size:16px;">= ${totalAmount.toLocaleString()} ₱</span>
            </div>`;

            // 각 업체별 행
            Object.entries(agencies).forEach(([agencyId, usedCount]) => {
                const agencyName = agencyMap[agencyId] || '알 수 없는 업체';
                const amount = usedCount * 1670;
                const key = `${date}_${agencyId}`;
                const isPaid = paidMap[key]?.isPaid || false;
                const paidAt = paidMap[key]?.paidAt || '';
                const libertadConfirmed = paidMap[key]?.confirmedByLibertad || false;

                html += `<div style="padding:12px 16px; border:1px solid #eee; border-radius:10px; margin-bottom:6px; background:${isPaid ? '#f0fff4' : '#fff'};">
                    <div style="display:flex; align-items:center;">
                        <input type="checkbox" id="chk_${key}" ${isPaid ? 'checked' : ''}
                            onchange="toggleSettlement('${key}', '${agencyId}', '${agencyName}', '${date}', ${usedCount}, ${amount}, this.checked)"
                            style="width:18px; height:18px; cursor:pointer; margin-right:14px; accent-color:#34c759;">
                        <div style="flex:1;">
                            <div style="font-weight:700; color:#111;">${agencyName}</div>
                            <div style="font-size:12px; color:#888; margin-top:2px;">${usedCount}장 × 1,670 = <strong style="color:#007aff;">${amount.toLocaleString()} ₱</strong>${isPaid ? ` &nbsp;✅ ${paidAt ? paidAt.substring(0,10) + ' 정산완료' : '정산완료'}` : ''}</div>
                        </div>
                        <div style="font-size:13px; font-weight:800; color:${isPaid ? '#34c759' : '#ff9500'};">${isPaid ? '✅ 완료' : '⏳ 미정산'}</div>
                    </div>
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px; padding-top:8px; border-top:1px dashed #eee; margin-left:32px;">
                        <div style="font-size:11px; color:${libertadConfirmed ? '#34c759' : '#aaa'}; font-weight:700;">리버타드 확인 ${libertadConfirmed ? '완료' : '대기'}</div>
                        <span onclick="showTransactionDetail('${agencyId}', '${agencyName}', '${date}')" style="font-size:11px; color:#007aff; font-weight:700; cursor:pointer; text-decoration:underline;">건별 수정</span>
                    </div>
                </div>`;
            });
            html += '<div style="margin-bottom:16px;"></div>';
        });

        listEl.innerHTML = html;
    } catch(e) {
        console.error(e);
        listEl.innerHTML = '<div style="text-align:center; color:#ff2d55; padding:40px;">데이터 로드 실패</div>';
    }
};

window.toggleSettlement = async function(key, agencyId, agencyName, date, usedCount, amount, isPaid) {
    try {
        const { setDoc, doc: firestoreDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        await setDoc(firestoreDoc(db, 'whale_settlements', key), {
            agencyId,
            agencyName,
            date,
            usedCount,
            amount,
            isPaid,
            paidAt: isPaid ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        openSettlementModal();
    } catch(e) {
        console.error(e);
        Swal.fire('오류', '저장 중 문제가 발생했습니다.', 'error');
    }
};

// 특정 판매처의 특정 날짜에 찍힌 QR 체크인 건들을 개별적으로 보여주고 수정/삭제
window.showTransactionDetail = async function(agencyId, agencyName, date) {
    if (!agencyName) {
        const found = currentWsAgencies.find(a => a.id === agencyId);
        agencyName = found ? found.name : '알 수 없는 업체';
    }
    Swal.fire({ title: '불러오는 중...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
        const q = query(
            collection(db, 'whale_transactions'),
            where('agencyId', '==', agencyId),
            where('type', '==', 'USE')
        );
        const snap = await getDocs(q);
        const rows = [];
        snap.forEach(d => {
            const data = d.data();
            if ((data.createdAt || '').substring(0, 10) === date) {
                rows.push({ id: d.id, amount: data.amount || 0, createdAt: data.createdAt || '' });
            }
        });
        rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

        if (rows.length === 0) {
            Swal.fire('건 없음', '이 날짜에 남아있는 개별 체크인 기록이 없습니다 (이미 다 취소/수정됐을 수 있어요).', 'info');
            return;
        }

        const html = `<div style="max-height:360px; overflow-y:auto; text-align:left;">` +
            rows.map(r => `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border:1px solid #eee; border-radius:8px; margin-bottom:6px;">
                    <div>
                        <div style="font-weight:700; color:#111;">${r.amount}명</div>
                        <div style="font-size:11px; color:#888;">${r.createdAt.replace('T', ' ').substring(0, 19)}</div>
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button onclick="correctTransactionAmount('${r.id}', '${agencyId}', '${date}', ${r.amount})" style="padding:6px 10px; font-size:12px; font-weight:700; background:#eef2f7; color:#0f2a4a; border:none; border-radius:6px; cursor:pointer;">수정</button>
                        <button onclick="deleteTransactionEntry('${r.id}', '${agencyId}', '${date}', ${r.amount})" style="padding:6px 10px; font-size:12px; font-weight:700; background:#fdeaea; color:#c62828; border:none; border-radius:6px; cursor:pointer;">삭제</button>
                    </div>
                </div>
            `).join('') + `</div>`;

        Swal.fire({
            title: `${agencyName} · ${date}`,
            html,
            confirmButtonText: '닫기'
        }).then(() => openSettlementModal());
    } catch (e) {
        console.error(e);
        Swal.fire('오류', '불러오는 중 문제가 발생했습니다.', 'error');
    }
};

// 개별 체크인 건의 인원수를 정정 (판매처 잔여/사용량, 해당 날짜 방문자 수를 차액만큼 보정)
window.correctTransactionAmount = async function(transactionId, agencyId, date, oldAmount) {
    const { value: newAmountStr } = await Swal.fire({
        title: '인원수 수정',
        input: 'number',
        inputValue: oldAmount,
        inputAttributes: { min: 0, step: 1 },
        showCancelButton: true,
        confirmButtonText: '저장',
        cancelButtonText: '취소'
    });
    if (newAmountStr === undefined || newAmountStr === '') return;
    const newAmount = parseInt(newAmountStr, 10);
    if (isNaN(newAmount) || newAmount < 0) return;
    const diff = newAmount - oldAmount; // 양수면 더 차감, 음수면 되돌려줌

    try {
        const { runTransaction, doc: fdoc, updateDoc: fupdateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const agencyRef = fdoc(db, 'whale_agencies', agencyId);
        const dailyCountRef = fdoc(db, 'whale_daily_counts', date);
        const txRef = fdoc(db, 'whale_transactions', transactionId);

        await runTransaction(db, async (transaction) => {
            const agencyDoc = await transaction.get(agencyRef);
            if (!agencyDoc.exists()) throw '판매처를 찾을 수 없습니다.';
            const agencyData = agencyDoc.data();
            const dailyDoc = await transaction.get(dailyCountRef);

            const currentMonthStr = date.substring(0, 7);
            const monthlyAdjust = agencyData.currentMonth === currentMonthStr ? diff : 0;

            transaction.update(agencyRef, {
                remainCount: Math.max(0, (agencyData.remainCount || 0) - diff),
                totalUsed: Math.max(0, (agencyData.totalUsed || 0) + diff),
                monthlyUsed: Math.max(0, (agencyData.monthlyUsed || 0) + monthlyAdjust),
                updatedAt: new Date().toISOString()
            });

            if (dailyDoc.exists()) {
                transaction.update(dailyCountRef, { count: Math.max(0, (dailyDoc.data().count || 0) + diff) });
            }

            transaction.update(txRef, { amount: newAmount, correctedAt: new Date().toISOString() });
        });

        Swal.fire('저장됨', '인원수가 수정되었습니다.', 'success').then(() => showTransactionDetail(agencyId, '', date));
    } catch (e) {
        console.error(e);
        Swal.fire('오류', '수정 중 문제가 발생했습니다: ' + e.toString(), 'error');
    }
};

// 개별 체크인 건을 완전히 삭제 (판매처 잔여/사용량, 해당 날짜 방문자 수 원상 복구)
window.deleteTransactionEntry = async function(transactionId, agencyId, date, amount) {
    const confirmResult = await Swal.fire({
        title: '이 건을 삭제할까요?',
        text: `${amount}명 체크인 기록이 완전히 삭제되고, 잔여 티켓/방문자 수가 원상 복구됩니다.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '삭제',
        confirmButtonColor: '#c62828',
        cancelButtonText: '취소'
    });
    if (!confirmResult.isConfirmed) return;

    try {
        const { runTransaction, doc: fdoc, deleteDoc: fdeleteDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const agencyRef = fdoc(db, 'whale_agencies', agencyId);
        const dailyCountRef = fdoc(db, 'whale_daily_counts', date);
        const txRef = fdoc(db, 'whale_transactions', transactionId);

        await runTransaction(db, async (transaction) => {
            const agencyDoc = await transaction.get(agencyRef);
            if (!agencyDoc.exists()) throw '판매처를 찾을 수 없습니다.';
            const agencyData = agencyDoc.data();
            const dailyDoc = await transaction.get(dailyCountRef);

            const currentMonthStr = date.substring(0, 7);
            const monthlyAdjust = agencyData.currentMonth === currentMonthStr ? amount : 0;

            transaction.update(agencyRef, {
                remainCount: (agencyData.remainCount || 0) + amount,
                totalUsed: Math.max(0, (agencyData.totalUsed || 0) - amount),
                monthlyUsed: Math.max(0, (agencyData.monthlyUsed || 0) - monthlyAdjust),
                updatedAt: new Date().toISOString()
            });

            if (dailyDoc.exists()) {
                transaction.update(dailyCountRef, { count: Math.max(0, (dailyDoc.data().count || 0) - amount) });
            }

            transaction.delete(txRef);
        });

        Swal.fire('삭제됨', '기록이 삭제되고 수치가 복구되었습니다.', 'success').then(() => showTransactionDetail(agencyId, '', date));
    } catch (e) {
        console.error(e);
        Swal.fire('오류', '삭제 중 문제가 발생했습니다: ' + e.toString(), 'error');
    }
};

window.closeSettlementModal = function() {
    document.getElementById('ws-settlement-modal').style.display = 'none';
};

// 현장확인용(카운터) 메인 QR코드 생성 및 다운로드
window.downloadMainCounterQr = function() {
    // 임시 컨테이너 생성
    const tempDiv = document.createElement('div');
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);
    
    const baseUrl = window.location.origin;
    const counterUrl = `${baseUrl}/whale-counter.html`;
    
    new QRCode(tempDiv, {
        text: counterUrl,
        width: 300,
        height: 300,
        colorDark : "#ff2d55", // 핑크색
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    setTimeout(() => {
        const canvas = tempDiv.querySelector('canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const logo = new Image();
            logo.crossOrigin = "Anonymous";
            logo.src = 'libertad.png';
            logo.onload = () => {
                const logoSize = 70;
                const x = (canvas.width - logoSize) / 2;
                const y = (canvas.height - logoSize) / 2;
                
                // 하얀색 배경
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
                
                // 로고 그리기
                ctx.drawImage(logo, x, y, logoSize, logoSize);
                
                // 다운로드 트리거
                const link = document.createElement('a');
                link.href = canvas.toDataURL("image/png");
                link.download = `고래상어_현장확인용_QR.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                document.body.removeChild(tempDiv);
            };
        } else {
            document.body.removeChild(tempDiv);
            alert('QR코드 생성 실패');
        }
    }, 200);
};
