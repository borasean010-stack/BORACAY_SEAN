// admin.js - Naver SmartStore Style + Luxury Schedule & System Logic
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
    let activeTab = 'new'; 
    let currentScheduleFilter = 'all';
    let currentScheduleDay = 'today'; // 'today' or 'tomorrow'

    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') { showAdminPanel(); }
    
    document.getElementById('login-form').onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('username').value;
        const pw = document.getElementById('password').value;
        const admins = { 'admin': 'sean1234!', 'luca': 'luca1', 'daemit': 'nimo@dori0902', 'windy': 'windy1', 'sean': 'sean1' };
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
            resorts: allReservations.filter(r => r.status === '견적' || r.status === '견적완료').length,
            resortConfirmed: allReservations.filter(r => r.status === '리조트확정').length
        };
        document.getElementById('count-new').innerText = counts.new;
        document.getElementById('count-confirmed').innerText = counts.confirmed;
        document.getElementById('count-resorts').innerText = counts.resorts;
        const rcCount = document.getElementById('count-resort-confirmed');
        if (rcCount) rcCount.innerText = counts.resortConfirmed;
    }

    function getCategory(name) {
        if (!name) return '말룸파티';
        const n = name.toLowerCase().trim();
        if (n.includes('공항 픽업') || n === '픽업') return '픽업';
        if (n.includes('공항 샌딩') || n === '샌딩') return '샌딩';
        if (n.includes('픽업') && !n.includes('샌딩')) return '픽업';
        if (n.includes('샌딩')) return '샌딩';
        if (n.includes('호핑')) return '호핑';
        if (n.includes('말룸파티') || n.includes('마사지') || n.includes('스파') || n.includes('spa') || n.includes('에스파') || n.includes('액티비티')) return '말룸파티';
        return '말룸파티';
    }

    function renderSchedule() {
        const container = document.getElementById('active-timeline');
        if (!container) return;

        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const todayStr = new Date(now.getTime() - offset).toISOString().split('T')[0];
        const tomorrowStr = new Date(now.getTime() - offset + 86400000).toISOString().split('T')[0];

        // 날짜 레이블 업데이트
        const tLabel = document.getElementById('today-tab-date');
        const tmLabel = document.getElementById('tomorrow-tab-date');
        if (tLabel) tLabel.innerText = `(${todayStr})`;
        if (tmLabel) tmLabel.innerText = `(${tomorrowStr})`;

        const targetDate = currentScheduleDay === 'today' ? todayStr : tomorrowStr;

        let items = [];
        allReservations.forEach(res => {
            if (res.items) {
                res.items.forEach(item => {
                    const itemCat = getCategory(item.name);
                    const isMatch = currentScheduleFilter === 'all' || itemCat === currentScheduleFilter;
                    
                    if (item.date === targetDate && !item.name.includes('픽업') && !item.name.includes('샌딩') && isMatch) {
                        items.push({ 
                            time: item.time || "09:00", 
                            displayTime: item.time || "09:00",
                            name: item.name, 
                            customer: res.customerKorName, 
                            count: item.count, 
                            status: res.status, 
                            id: res.id,
                            resort: res.activityPickupResort || res.pickupResort || "-",
                            flight: "-"
                        });
                    }
                });
            }
            
            const isPickupMatch = currentScheduleFilter === 'all' || currentScheduleFilter === '픽업';
            if (res.pickupDate === targetDate && isPickupMatch) {
                if (!items.find(i => i.id === res.id && i.name.includes('픽업'))) {
                    items.push({ 
                        time: res.pickupTime || "00:00", 
                        displayTime: res.pickupFlight || "편명미정",
                        name: `✈️ 공항 픽업`, 
                        customer: res.customerKorName, 
                        count: res.items && res.items[0] ? res.items[0].count : "-", 
                        status: res.status, 
                        id: res.id,
                        flight: res.pickupFlight || "-",
                        resort: res.pickupResort || "-"
                    });
                }
            }
            
            const isSendingMatch = currentScheduleFilter === 'all' || currentScheduleFilter === '샌딩';
            if (res.sendingDate === targetDate && isSendingMatch) {
                if (!items.find(i => i.id === res.id && i.name.includes('샌딩'))) {
                    items.push({ 
                        time: res.sendingTime || "23:59", 
                        displayTime: res.sendingTime || "23:59",
                        name: `✈️ 공항 샌딩`, 
                        customer: res.customerKorName, 
                        count: res.items && res.items[0] ? res.items[0].count : "-", 
                        status: res.status, 
                        id: res.id,
                        flight: res.sendingFlight || "-",
                        resort: res.sendingResort || "-"
                    });
                }
            }
        });

        items.sort((a, b) => a.time.localeCompare(b.time));

        if (items.length === 0) {
            container.innerHTML = `<div class="sc-empty">${currentScheduleDay === 'today' ? '오늘' : '내일'} 해당하는 일정이 없습니다.</div>`;
            return;
        }

        container.innerHTML = items.map(item => {
            const isConfirmed = item.status === '예약확정' || item.status === '리조트확정';
            const timeVal = item.displayTime || item.time;
            return `<div class="schedule-card" onclick="showDetail('${item.id}')" style="cursor:pointer; border-top-color: ${isConfirmed ? '#ff6a00' : '#ff8c00'}">
                <div class="sc-status ${isConfirmed ? 'confirmed' : 'pending'}">${item.status}</div>
                <div class="sc-time"><span class="material-icons">${item.name.includes('픽업') ? 'flight_land' : 'access_time'}</span> ${timeVal}</div>
                <div class="sc-item">${item.name}</div>
                <div class="sc-info">
                    <div class="sc-customer"><b>${item.customer}</b> ${item.count}명</div>
                    ${item.flight !== '-' && !item.name.includes('픽업') ? `<div class="sc-flight"><span class="material-icons">flight</span> ${item.flight}</div>` : ''}
                    ${item.resort !== '-' ? `<div class="sc-resort"><span class="material-icons">hotel</span> ${item.resort}</div>` : ''}
                </div>
            </div>`;
        }).join('');
    }

    window.switchScheduleDay = (day) => {
        currentScheduleDay = day;
        document.querySelectorAll('.d-tab').forEach(btn => {
            if (btn.getAttribute('onclick').includes(day)) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        renderSchedule();
    };

    window.filterSchedule = (category) => {
        currentScheduleFilter = category;
        document.querySelectorAll('.s-tab').forEach(btn => {
            const onClickAttr = btn.getAttribute('onclick');
            if ((category === 'all' && onClickAttr.includes('all')) || onClickAttr.includes(`'${category}'`)) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        renderSchedule();
    };

    window.switchAdminTab = (tab) => {
        activeTab = tab;
        document.querySelectorAll('.ss-nav-item').forEach(el => el.classList.remove('active'));
        const sideMenu = document.getElementById(`menu-${tab}`);
        if(sideMenu) sideMenu.classList.add('active');
        const scheduleSection = document.getElementById('schedule-section');
        const statusLayer = document.getElementById('status-layer');
        const dataViewSection = document.getElementById('data-view-section');
        const systemSection = document.getElementById('system-setup-section');
        if (tab === 'system') { scheduleSection.style.display = 'none'; statusLayer.style.display = 'none'; dataViewSection.style.display = 'block'; systemSection.style.display = 'block'; }
        else { scheduleSection.style.display = 'block'; statusLayer.style.display = 'flex'; dataViewSection.style.display = 'block'; systemSection.style.display = 'none'; document.querySelectorAll('.ss-status-card').forEach(el => el.classList.remove('active')); const statusCard = document.getElementById(`tab-${tab}`); if(statusCard) statusCard.classList.add('active'); }
        renderTable();
    };

    function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        const searchTerm = document.getElementById('header-global-search').value.toLowerCase();
        const now = new Date();
        const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

        let filtered = allReservations.filter(r => {
            const name = (r.customerKorName || '').toLowerCase();
            const resNo = (r.reservationNumber || '').toLowerCase();
            const matchesSearch = name.includes(searchTerm) || resNo.includes(searchTerm);
            let matchesTab = false;
            
            if (activeTab === 'new') matchesTab = (r.status === '입금대기' || r.status === '예약접수');
            else if (activeTab === 'confirmed') {
                matchesTab = (r.status === '예약확정');
                if (matchesTab) {
                    let maxDate = '';
                    if (r.items) {
                        r.items.forEach(item => {
                            let d = item.date;
                            if (item.name.includes('리조트') && item.details && item.details.checkout) d = item.details.checkout;
                            if (d && d > maxDate) maxDate = d;
                        });
                    }
                    if (r.sendingDate && r.sendingDate > maxDate) maxDate = r.sendingDate;
                    if (r.resortCheckout && r.resortCheckout > maxDate) maxDate = r.resortCheckout;
                    if (maxDate && maxDate < todayStr) matchesTab = false;
                }
            }
            else if (activeTab === 'resorts') matchesTab = (r.status === '견적' || r.status === '견적완료');
            else if (activeTab === 'resort-confirmed') matchesTab = (r.status === '리조트확정');
            else if (activeTab === 'system') matchesTab = true;
            return matchesSearch && matchesTab;
        });
        if (filtered.length === 0) { tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:100px;">데이터가 없습니다.</td></tr>'; return; }
        filtered.forEach((res, index) => {
            const tr = document.createElement('tr');
            const status = res.status || '대기';
            const firstItem = res.items && res.items.length > 0 ? res.items[0] : null;
            let itemsText = '-';
            if (firstItem) {
                itemsText = firstItem.name;
                if (firstItem.name.includes('리조트') && firstItem.details && typeof firstItem.details === 'object' && firstItem.details.checkin) {
                    itemsText = `🏨 ${firstItem.name} (${firstItem.details.checkin} ~ ${firstItem.details.checkout})`;
                }
                if (res.items.length > 1) itemsText += ` 외 ${res.items.length - 1}건`;
            }

            let actionButtons = '';
            if (activeTab === 'resorts') {
                actionButtons = `
                    <button class="btn-action-received" onclick="handleResortQuoteComplete('${res.id}')"><span class="material-icons">task_alt</span>견적완료</button>
                    <button class="btn-action-outline" onclick="showDetail('${res.id}')"><span class="material-icons">visibility</span>상세</button>
                    <button class="btn-action-received" style="background:#00c73c; border-color:#00c73c; box-shadow: 0 4px 10px rgba(0, 199, 60, 0.2);" onclick="handleResortConfirm('${res.id}')"><span class="material-icons">check_circle</span>예약 확정</button>
                `;
            } else if (activeTab === 'system') {
                actionButtons = `<button class="btn-action-danger" onclick="handleDeleteReservation('${res.id}')"><span class="material-icons">delete_forever</span>취소/삭제</button>`;
            } else {
                actionButtons = `
                    ${status !== '예약확정' && status !== '리조트확정' ? `<button class="btn-action-received" onclick="handleAutoConfirm('${res.id}')"><span class="material-icons">payments</span>입금확인</button>` : ''}
                    <button class="btn-action-outline" onclick="showDetail('${res.id}')"><span class="material-icons">visibility</span>상세</button>
                `;
            }

            tr.innerHTML = `<td><input type="checkbox"></td><td style="color:#bbb;">${filtered.length - index}</td><td style="font-weight:700;">${res.reservationNumber || '-'}</td><td><div style="font-size:14px; font-weight:800; white-space:nowrap;">${res.customerKorName || '미입력'} ${res.engName || '-'}</div></td><td style="font-weight:600;">${itemsText}</td><td style="font-weight:800;">₩ ${(res.totalPrice || 0).toLocaleString()}</td><td style="color:#888;">${res.createdAt?.toDate ? res.createdAt.toDate().toLocaleDateString() : '-'}</td><td style="text-align:center;"><span class="n-badge ${status === '예약확정' || status === '리조트확정' ? 'badge-green' : (status === '견적' || status === '견적완료' ? 'badge-blue' : 'badge-yellow')}">${status}</span></td><td><div style="display:flex; gap:5px;">${actionButtons}</div></td>`;
            tableBody.appendChild(tr);
        });
    }
    document.getElementById('header-global-search').oninput = renderTable;

    window.handleAutoConfirm = async (id) => { if (confirm("예약확정 처리를 진행합니까?")) await updateDoc(doc(db, "reservations", id), { status: "예약확정" }); };
    window.handleResortQuoteComplete = async (id) => { if (confirm("견적완료 처리를 진행합니까?")) await updateDoc(doc(db, "reservations", id), { status: "견적완료" }); };
    window.handleResortConfirm = async (id) => {
        const amount = prompt("입금 금액을 입력해 주세요 (숫자만)");
        if (amount !== null) {
            const price = parseInt(amount.replace(/[^0-9]/g, '')) || 0;
            if (confirm(`입금 금액 ₩ ${price.toLocaleString()}으로 예약 확정 처리하시겠습니까?`)) {
                await updateDoc(doc(db, "reservations", id), { 
                    status: "리조트확정",
                    totalPrice: price
                });
                alert("리조트 예약이 확정되었습니다.");
            }
        }
    };
    window.handleDeleteReservation = async (id) => { if (confirm("영구 삭제하시겠습니까?")) await deleteDoc(doc(db, "reservations", id)); };

    window.showDetail = (id) => {
        const res = allReservations.find(r => r.id === id);
        if (!res) return;
        const modal = document.getElementById('res-detail-modal');
        const body = document.getElementById('modal-body');
        const isQuote = res.status === '견적' || res.status === '견적완료';
        const totalVoucherBtn = isQuote ? '' : `<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;"><button onclick="copyCombinedVoucherLink('${res.contact}')" style="padding:12px; background:#00c73c; color:white; border:none; border-radius:8px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;"><span class="material-icons" style="font-size:18px;">people</span> 고객 통합 링크 복사</button><button onclick="copyVoucherLink('${res.id}', null)" style="padding:12px; background:#ff6a00; color:white; border:none; border-radius:8px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;"><span class="material-icons" style="font-size:18px;">share</span> 주문 일정 링크 복사</button></div><p style="font-size:11px; color:#888; margin-top:-10px; margin-bottom:15px; text-align:center;">* 통합 링크는 해당 연락처의 <b>현재/미래의 모든 '확정' 예약</b>을 합쳐서 보여줍니다.</p>`;
        const itemsHtml = res.items.map((item, idx) => {
            let dateStr = item.date || '-';
            if (item.name.includes('리조트') && item.details && typeof item.details === 'object' && item.details.checkin) {
                dateStr = `${item.details.checkin} ~ ${item.details.checkout}`;
            }
            return `<div style="padding:12px; background:#f8f9fa; border:1px solid #eee; border-radius:8px; margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between;">
                    <div style="font-size:15px; font-weight:800;">${item.name}</div>
                    <div style="font-size:14px; font-weight:800; color:#ff6a00;">${item.count}명</div>
                </div>
                <div style="margin-top:6px; font-size:13px; color:#666;">📅 ${dateStr} ${item.time || ''} ${item.details && typeof item.details === 'string' ? `<br>옵션: ${item.details}` : ''}</div>
                ${!isQuote ? `<div style="margin-top:10px; display:flex; gap:5px;"><a href="reservation-schedule.html?id=${res.id}&itemIndex=${idx}" target="_blank" style="flex:1; text-align:center; padding:6px; background:#fff; border:1px solid #ddd; border-radius:4px; font-size:11px; text-decoration:none; color:#333;">개별 바우처</a><button onclick="copyVoucherLink('${res.id}', ${idx})" style="flex:1; padding:6px; background:#ff6a00; color:white; border:none; border-radius:4px; font-size:11px;">링크복사</button></div>` : ''}
            </div>`;
        }).join('');
        
        const hasPickupOrSending = res.pickupDate || res.sendingDate || res.exchangeAmount;
        
        body.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid #eee;"><h3 style="margin:0;">${isQuote ? '견적 신청 상세' : '예약 상세 정보'}</h3>${!isQuote ? `<button onclick="copyGuidance('${res.id}')" style="background:#ff6a00; color:white; border:none; padding:8px 14px; border-radius:6px; font-weight:bold;">👉 안내문 복사</button>` : ''}</div>
            <div id="modal-scroll-area" style="max-height: 60vh; overflow-y: auto;">
                <div style="margin-bottom:25px;">${totalVoucherBtn}${itemsHtml}</div>
                <div style="background:#fcfcfc; padding:15px; border-radius:10px; border:1px solid #f0f0f0; margin-bottom:20px;">
                    <p style="margin:0;">이름(한글) | <b>${res.customerKorName}</b></p>
                    <p style="margin:0;">이름(영문) | <b>${res.engName || '-'}</b></p>
                    <p style="margin:5px 0 0 0;">연락처 | <b>${res.contact}</b></p>
                </div>
                ${!isQuote && hasPickupOrSending ? `
                <div style="background:#fff5eb; padding:15px; border-radius:10px; border:1px solid #ffe8cc; margin-bottom:20px;">
                    <div style="font-weight:bold; margin-bottom:10px; color:#ff6a00;">✈️ 공항 픽업/샌딩 및 환전 정보</div>
                    ${res.pickupDate ? `<p>픽업: ${res.pickupDate} / ${res.pickupFlight || '-'} / ${res.pickupResort || '-'}</p>` : ''}
                    ${res.sendingDate ? `<p>샌딩: ${res.sendingDate} / ${res.sendingFlight || '-'} / ${res.sendingResort || '-'}</p>` : ''}
                    ${res.exchangeAmount ? `<p style="margin-top:10px; padding-top:10px; border-top:1px dashed #ffd8a8;"><b>💰 환전 요청 금액:</b> <span style="font-size:16px; color:#e67e22;">${res.exchangeAmount}</span></p>` : ''}
                </div>
                ` : ''}
                <div style="padding:10px; background:#f8f9fa; border-radius:6px; font-size:13px; white-space:pre-wrap;"><b>[요청사항]</b>\n${res.requests || '요청사항 없음'}</div>
            </div>
            <div style="display:flex; gap:10px; margin-top:20px; padding-top:15px; border-top:1px solid #eee;">
                <button id="edit-btn" onclick="toggleEditMode('${res.id}')" style="flex:1; padding:12px; background:#ff6a00; color:white; border:none; border-radius:8px; font-weight:bold;">수정하기</button>
                <button onclick="closeModal()" style="flex:1; padding:12px; background:#333; color:white; border:none; border-radius:8px; font-weight:bold;">창 닫기</button>
            </div>`;
        modal.style.display = 'flex';
    };

    window.toggleEditMode = (id) => {
        const res = allReservations.find(r => r.id === id);
        if (!res) return;
        const scrollArea = document.getElementById('modal-scroll-area');
        const editBtn = document.getElementById('edit-btn');
        if (editBtn.innerText === '수정하기') {
            editBtn.innerText = '저장하기';
            window.currentEditingItems = JSON.parse(JSON.stringify(res.items));
            window.updateItemsUI = () => {
                const container = document.getElementById('edit-items-container');
                container.innerHTML = window.currentEditingItems.map((item, idx) => `<div class="edit-item-row" style="padding:15px; background:#fff; border:1px solid #eee; border-radius:12px; margin-bottom:12px; position:relative;"><button onclick="deleteEditItem(${idx})" style="position:absolute; top:10px; right:10px; color:#ff4d4f; background:none; border:none; cursor:pointer;"><span class="material-icons" style="font-size:20px;">delete</span></button><div style="margin-bottom:10px;"><label style="font-size:11px; color:#999; display:block;">상품명</label><input type="text" class="edit-item-name" value="${item.name}" style="width:80%; padding:8px; font-weight:bold; border:1px solid #ddd; border-radius:6px;"></div><div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:10px;"><div><label style="font-size:11px; color:#999;">날짜</label><input type="text" class="edit-item-date" value="${item.date || ''}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; font-size:12px;"></div><div><label style="font-size:11px; color:#999;">시간</label><input type="text" class="edit-item-time" value="${item.time || ''}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; font-size:12px;"></div><div><label style="font-size:11px; color:#999;">인원</label><input type="number" class="edit-item-count" value="${item.count || 0}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; font-size:12px;"></div></div><div><label style="font-size:11px; color:#999;">옵션/상세정보</label><input type="text" class="edit-item-details" value="${item.details || ''}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; font-size:12px;"></div><div style="margin-top:12px; text-align:right;"><button onclick="addEditOption(${idx})" style="padding:6px 12px; background:#e6f9ed; color:#00c73c; border:1px solid #00c73c; border-radius:6px; font-size:11px; font-weight:bold; cursor:pointer;">+ 이 상품의 옵션 추가</button></div></div>`).join('');
            };
            window.deleteEditItem = (idx) => { if (confirm('삭제하시겠습니까?')) { window.currentEditingItems.splice(idx, 1); window.updateItemsUI(); } };
            window.addEditOption = (idx) => { const p = window.currentEditingItems[idx]; window.currentEditingItems.splice(idx + 1, 0, { name: p.name, date: p.date, time: p.time, count: 1, details: '(추가)' }); window.updateItemsUI(); };
            scrollArea.innerHTML = `<div style="margin-bottom:20px;"><label style="font-size:12px; font-weight:bold; color:#ff6a00; display:block; margin-bottom:10px;">🛒 예약 상품 및 옵션 관리</label><div id="edit-items-container"></div></div>
                <div style="background:#f8f9fa; padding:15px; border-radius:12px;">
                    <label style="font-size:12px; font-weight:bold; color:#333; display:block; margin-bottom:10px;">👤 기본 정보 및 환전/항공</label>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;"><input type="text" id="edit-name" value="${res.customerKorName}"><input type="text" id="edit-eng-name" value="${res.engName || ''}"></div>
                    <div style="margin-bottom:10px;"><label style="font-size:11px; color:#999;">연락처</label><input type="text" id="edit-contact" value="${res.contact}"></div>
                    <div style="margin-bottom:10px;"><label style="font-size:11px; color:#999; font-weight:bold; color:#ff6a00;">💰 환전 요청 금액</label><input type="text" id="edit-exchange" value="${res.exchangeAmount || ''}" placeholder="예: $200" style="background:#fff5eb; border-color:#ffd8a8;"></div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
                        <div><label style="font-size:11px; color:#999;">픽업일/시간/항공</label>
                            <input type="text" id="edit-p-date" value="${res.pickupDate || ''}">
                            <input type="text" id="edit-p-time" value="${res.pickupTime || ''}" placeholder="시간 (예: 08:30)">
                            <input type="text" id="edit-p-flight" value="${res.pickupFlight || ''}">
                        </div>
                        <div><label style="font-size:11px; color:#999;">샌딩일/시간/항공</label>
                            <input type="text" id="edit-s-date" value="${res.sendingDate || ''}">
                            <input type="text" id="edit-s-time" value="${res.sendingTime || ''}" placeholder="시간 (예: 20:00)">
                            <input type="text" id="edit-s-flight" value="${res.sendingFlight || ''}">
                        </div>
                    </div>
                    <div style="margin-bottom:10px;"><label style="font-size:11px; color:#999;">리조트 (픽업/샌딩)</label><input type="text" id="edit-resort" value="${res.pickupResort || ''}"><input type="text" id="edit-sending-resort" value="${res.sendingResort || ''}"></div>
                    <div style="margin-bottom:10px;"><label style="font-size:11px; color:#999;">총 결제 금액 (원)</label><input type="number" id="edit-total" value="${res.totalPrice}"></div>
                    <label style="font-size:11px; color:#999;">요청사항</label><textarea id="edit-requests" style="width:100%; height:60px; padding:10px; border:1px solid #ddd; border-radius:6px;">${res.requests || ''}</textarea>
                </div>`;
            scrollArea.querySelectorAll('input').forEach(el => { if(!el.className) el.style.cssText = "width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; margin-top:2px; font-size:13px;"; });
            window.updateItemsUI();
        } else { handleSaveEdit(id); }
    };

    async function handleSaveEdit(id) {
        const itemRows = document.querySelectorAll('.edit-item-row');
        const updatedItems = Array.from(itemRows).map(row => ({ name: row.querySelector('.edit-item-name').value, date: row.querySelector('.edit-item-date').value, time: row.querySelector('.edit-item-time').value, count: parseInt(row.querySelector('.edit-item-count').value) || 0, details: row.querySelector('.edit-item-details').value }));
        const newData = { 
            items: updatedItems, 
            customerKorName: document.getElementById('edit-name').value, 
            engName: document.getElementById('edit-eng-name').value, 
            contact: document.getElementById('edit-contact').value, 
            exchangeAmount: document.getElementById('edit-exchange').value, 
            pickupDate: document.getElementById('edit-p-date').value, 
            pickupTime: document.getElementById('edit-p-time').value,
            pickupFlight: document.getElementById('edit-p-flight').value, 
            sendingDate: document.getElementById('edit-s-date').value, 
            sendingTime: document.getElementById('edit-s-time').value,
            sendingFlight: document.getElementById('edit-s-flight').value, 
            pickupResort: document.getElementById('edit-resort').value, 
            sendingResort: document.getElementById('edit-sending-resort').value, 
            totalPrice: parseInt(document.getElementById('edit-total').value) || 0, 
            requests: document.getElementById('edit-requests').value 
        };
        if (confirm("저장하시겠습니까?")) { await updateDoc(doc(db, "reservations", id), newData); alert("저장되었습니다."); closeModal(); }
    }

    window.copyCombinedVoucherLink = (contact) => { const url = `${window.location.origin}/reservation-schedule.html?contact=${encodeURIComponent(contact)}`; navigator.clipboard.writeText(url).then(() => alert('고객 통합 바우처 링크가 복사되었습니다. (현재/미래 일정만 포함)')); };
    window.copyVoucherLink = (id, idx) => { const url = `${window.location.origin}/reservation-schedule.html?id=${id}${idx !== null ? `&itemIndex=${idx}` : ''}`; navigator.clipboard.writeText(url).then(() => alert('바우처 링크가 복사되었습니다.')); };
    window.copyGuidance = (id) => { const res = allReservations.find(r => r.id === id); if (!res) return; let messages = res.items.map(item => `[${item.name}]\n이용일: ${item.date} ${item.time || ''}\n인원: ${item.count}명\n안내: 미팅 10분 전까지 약속 장소에 도착해 주세요.`); navigator.clipboard.writeText(messages.join('\n\n---\n\n')).then(() => alert('안내문이 복사되었습니다.')); };
    window.closeModal = () => document.getElementById('res-detail-modal').style.display = 'none';
});
