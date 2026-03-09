import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDkDjmGKQDF-0Vu2S_qtI6W5Hf2-j4tKcM",
    authDomain: "boracaysean-69b4a.firebaseapp.com",
    projectId: "boracaysean-69b4a",
    storageBucket: "boracaysean-69b4a.firebasestorage.app",
    messagingSenderId: "806585874771",
    appId: "1:806585874771:web:64a094d241730ca38109a6"
};

let db = null;
try { const app = initializeApp(firebaseConfig); db = getFirestore(app); } catch (e) {}

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const adminContainer = document.getElementById('admin-container');
    const loginForm = document.getElementById('login-form');
    
    const tableBody = document.getElementById('admin-table-body');
    const settleTableBody = document.getElementById('settlement-table-body');
    const scheduleList = document.getElementById('today-schedule-list');
    
    const salesView = document.getElementById('sales-view');
    const settlementView = document.getElementById('settlement-view');

    let allReservations = [];
    let currentMode = 'sales'; 
    let currentTab = 'all'; // Always show 'all' by default for the main table

    // --- Authentication ---
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') { showAdminPanel(); }
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (document.getElementById('username').value === 'luca' && document.getElementById('password').value === 'luca1') {
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                showAdminPanel();
            } else { alert('인증 실패'); }
        });
    }

    document.getElementById('logout-btn').onclick = () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        location.reload();
    };

    function showAdminPanel() {
        if (loginContainer) loginContainer.style.display = 'none';
        if (adminContainer) adminContainer.style.display = 'flex';
        initNavigation();
        fetchReservations();
        const dateLabel = document.getElementById('today-date-label');
        if (dateLabel) dateLabel.textContent = getTodayStr().replace(/-/g, '.');
    }

    // --- Navigation ---
    function initNavigation() {
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            if (btn.classList.contains('logout-trigger')) return;
            if (btn.id === 'logout-btn') return;
            if (btn.onclick && btn.innerText.includes('새로고침')) return;

            btn.onclick = () => {
                document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                currentMode = btn.dataset.mode;
                currentTab = btn.dataset.tab || 'all';
                
                if (salesView) salesView.style.display = (currentMode === 'sales') ? 'block' : 'none';
                if (settlementView) settlementView.style.display = (currentMode === 'settlement') ? 'block' : 'none';
                
                const viewTitle = document.getElementById('view-title');
                if (viewTitle) viewTitle.textContent = btn.textContent.trim();
                
                const subTitle = document.getElementById('table-sub-title');
                if (subTitle) {
                    if (currentTab === 'all') subTitle.textContent = '전체 예약 내역';
                    else subTitle.textContent = `${currentTab} 내역`;
                }

                renderAll();
            };
        });

        const searchInput = document.getElementById('res-search');
        if (searchInput) {
            searchInput.oninput = (e) => renderMainTable(e.target.value.toLowerCase());
        }
    }

    // --- Data Fetching ---
    function fetchReservations() {
        if (!db) { 
            console.error("Firebase DB 객체가 없습니다.");
            useFallback(); 
            return; 
        }
        const q = query(collection(db, "reservations")); 
        onSnapshot(q, (snapshot) => {
            allReservations = [];
            snapshot.forEach((doc) => {
                allReservations.push({ id: doc.id, ...doc.data() });
            });
            allReservations.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            renderAll();
        }, (error) => {
            console.error("데이터 로드 중 오류 발생:", error);
            useFallback();
        });
    }

    function useFallback() {
        allReservations = [];
        renderAll();
    }

    // --- Rendering ---
    function renderAll() {
        updateCounters();
        renderMainTable();
        renderDailySchedule();
        renderSettlementTable();
        updateAlerts();
    }

    function updateCounters() {
        const counts = {
            신규: allReservations.filter(r => r.status === '신규').length,
            예약완료: allReservations.filter(r => r.status === '예약완료').length,
            확정: allReservations.filter(r => r.status === '확정').length
        };
        const cntNew = document.getElementById('cnt-new');
        const cntComp = document.getElementById('cnt-completed');
        const cntConf = document.getElementById('cnt-confirmed');
        
        if (cntNew) cntNew.textContent = counts.신규;
        if (cntComp) cntComp.textContent = counts.예약완료;
        if (cntConf) cntConf.textContent = counts.확정;
        
        const totalSettle = allReservations.filter(r => r.status === '확정').reduce((acc, c) => acc + (c.totalPrice || 0), 0);
        const settleAmt = document.getElementById('total-settle-amount');
        if (settleAmt) settleAmt.textContent = `₩ ${totalSettle.toLocaleString()}`;
    }

    function renderMainTable(searchTerm = '') {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        
        let filtered = allReservations;
        if (currentTab !== 'all') {
            filtered = allReservations.filter(r => r.status === currentTab);
        }

        if (searchTerm) {
            filtered = filtered.filter(r => r.customerKorName.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="empty-msg-v2">조회된 내역이 없습니다.</td></tr>';
            return;
        }

        filtered.forEach(res => {
            const row = document.createElement('tr');
            const item = res.items?.[0] || {};
            // 이용일 처리 (item.date가 없으면 res.pickupDate 또는 res.date 시도)
            const usageDate = item.date || res.pickupDate || res.date || '-';
            const pickupDisplayDate = res.pickupDate || '-';
            
            row.innerHTML = `
                <td>${res.id.slice(-6)}</td>
                <td><b>${res.customerKorName}</b></td>
                <td>${item.name}${res.items?.length > 1 ? ` 외 ${res.items.length-1}` : ''}</td>
                <td>${usageDate}</td>
                <td>${pickupDisplayDate}</td>
                <td>₩ ${res.totalPrice?.toLocaleString()}</td>
                <td><span class="ss-badge ss-badge-${res.status}">${res.status === '신규' ? '신규주문' : res.status}</span></td>
                <td>
                    <div style="display:flex; gap:5px; justify-content:center;">
                        <button class="ss-btn-action" onclick="showDetail('${res.id}')">상세</button>
                        ${res.status === '신규' ? `<button class="ss-btn-action" style="background:var(--ss-blue); color:white; border:none;" onclick="updateStatus('${res.id}', '예약완료')">완료</button>` : ''}
                        ${res.status === '예약완료' ? `<button class="ss-btn-action" style="background:var(--ss-green); color:white; border:none;" onclick="confirmPurchase('${res.id}')">확정</button>` : ''}
                        ${res.status === '확정' ? `<button class="ss-btn-action" style="color:red" onclick="updateStatus('${res.id}', '취소')">취소</button>` : ''}
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function renderDailySchedule() {
        if (!scheduleList) return;
        const today = getTodayStr();
        const todays = allReservations.filter(res => (res.items?.some(i => i.date === today) || res.pickupDate === today || res.sendingDate === today) && res.status !== '취소');
        
        if (!todays.length) {
            scheduleList.innerHTML = '<p class="empty-msg-v2">오늘 예정된 스케줄이 없습니다.</p>';
            return;
        }

        const categories = {
            "픽업/샌딩": todays.filter(r => r.items?.some(i => i.name.includes('픽업')) || r.pickupDate === today || r.sendingDate === today),
            "호핑투어": todays.filter(r => r.items?.some(i => i.name.includes('호핑'))),
            "말룸파티": todays.filter(r => r.items?.some(i => i.name.includes('말룸'))),
            "액티비티/기타": todays.filter(r => r.items?.some(i => !i.name.includes('픽업') && !i.name.includes('호핑') && !i.name.includes('말룸')))
        };

        scheduleList.innerHTML = '';
        for (const [cat, list] of Object.entries(categories)) {
            if (list.length === 0) continue;
            const group = document.createElement('div');
            group.className = 'schedule-group';
            group.innerHTML = `<div class="schedule-group-title">${cat} (${list.length})</div>`;
            list.forEach(res => {
                const item = document.createElement('div');
                item.className = 'schedule-item-v2';
                const statusColor = res.status === '확정' ? '#888' : 'var(--ss-text-main)';
                const resItem = res.items?.find(i => i.date === today) || res.items?.[0] || { name: '예약상품', time: '종일' };
                item.innerHTML = `
                    <div class="time-tag">${resItem.time || '종일'}</div>
                    <div class="info" style="color:${statusColor}">
                        <b>${res.customerKorName}</b> | ${resItem.name}
                        ${res.status === '확정' ? ' <small>(확정)</small>' : ''}
                    </div>
                `;
                group.appendChild(item);
            });
            scheduleList.appendChild(group);
        }
    }

    function renderSettlementTable() {
        if (!settleTableBody) return;
        settleTableBody.innerHTML = '';
        const confirmed = allReservations.filter(r => r.status === '확정');
        const groupedByDate = {};
        confirmed.forEach(r => {
            const date = r.items?.[0]?.date || r.pickupDate || '미정';
            if (!groupedByDate[date]) groupedByDate[date] = { count: 0, amount: 0 };
            groupedByDate[date].count++;
            groupedByDate[date].amount += (r.totalPrice || 0);
        });
        const dates = Object.keys(groupedByDate).sort().reverse();
        if (dates.length === 0) {
            settleTableBody.innerHTML = '<tr><td colspan="4" class="empty-msg-v2">정산 데이터가 없습니다.</td></tr>';
            return;
        }
        dates.forEach(date => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><b>${date}</b></td>
                <td>${groupedByDate[date].count}건</td>
                <td style="color:var(--ss-green); font-weight:800;">₩ ${groupedByDate[date].amount.toLocaleString()}</td>
                <td><span class="ss-badge ss-badge-신규">정산 대기</span></td>
            `;
            settleTableBody.appendChild(row);
        });
    }

    function updateAlerts() {
        const newCount = allReservations.filter(r => r.status === '신규').length;
        const alertBox = document.getElementById('new-order-alert');
        const noAlert = document.getElementById('no-alert-msg');
        if (newCount > 0) {
            if (alertBox) alertBox.style.display = 'block';
            if (noAlert) noAlert.style.display = 'none';
        } else {
            if (alertBox) alertBox.style.display = 'none';
            if (noAlert) noAlert.style.display = 'block';
        }
    }

    // --- Global Functions ---
    window.updateStatus = async (id, newStatus) => {
        if (!confirm(`[${newStatus}] 상태로 변경하시겠습니까?`)) return;
        if (db && !id.startsWith('BK-')) {
            await updateDoc(doc(db, "reservations", id), { status: newStatus });
        } else {
            const idx = allReservations.findIndex(r => r.id === id);
            if (idx !== -1) { 
                allReservations[idx].status = newStatus; 
                localStorage.setItem('admin_reservations_cache', JSON.stringify(allReservations));
                renderAll(); 
            }
        }
    };

    window.confirmPurchase = async (id) => {
        if (!confirm('구매확정 처리하시겠습니까?')) return;
        await window.updateStatus(id, '확정');
    };

    window.showDetail = (id) => {
        const res = allReservations.find(r => r.id === id);
        if (!res) return;
        const modal = document.getElementById('res-detail-modal');
        const body = document.getElementById('modal-body');
        const itemsHtml = res.items?.map(item => `
            <div style="background:#f8f9fa; padding:15px; border-radius:12px; margin-bottom:10px; border:1px solid #eee;">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <b style="color:#ff6a00; font-size:16px;">${item.name}</b>
                    <span style="font-weight:800;">${item.count}명</span>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:14px; color:#666;">
                    <div>📅 이용일: <b>${item.date || '-'}</b></div>
                    <div>⏰ 시간: <b>${item.time || '정보없음'}</b></div>
                    ${item.type ? `<div style="grid-column: span 2; margin-top:5px; padding-top:5px; border-top:1px dashed #ddd;">✨ 선택종류: <b style="color:#333;">${item.type}</b></div>` : ''}
                </div>
            </div>
        `).join('') || '예약 상품 정보가 없습니다.';

        body.innerHTML = `
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:25px;">
                <div>
                    <h4 style="margin-bottom:15px; border-left:4px solid #ff6a00; padding-left:10px; color:#333;">👤 예약자 정보</h4>
                    <div class="detail-row"><span class="label">한글 성함</span><span class="val">${res.customerKorName}</span></div>
                    <div class="detail-row"><span class="label">영문 성함</span><span class="val">${res.engName || '-'}</span></div>
                    <div class="detail-row"><span class="label">연락처/ID</span><span class="val">${res.contact || '-'}</span></div>
                    <div class="detail-row"><span class="label">결제수단</span><span class="val">${res.paymentMethod || '-'}</span></div>
                    <div class="detail-row"><span class="label">총 결제금액</span><span class="val" style="color:#ff6a00; font-weight:900; font-size:18px;">₩ ${res.totalPrice?.toLocaleString()}</span></div>
                </div>
                <div>
                    <h4 style="margin-bottom:15px; border-left:4px solid #ff6a00; padding-left:10px; color:#333;">✈️ 픽업/샌딩 상세</h4>
                    <div style="background:#fffcf5; padding:15px; border-radius:12px; border:1px solid #ffedcc;">
                        <div class="detail-row"><span class="label">픽업날짜</span><span class="val" style="color:#ff6a00;">${res.pickupDate || '-'}</span></div>
                        <div class="detail-row"><span class="label">픽업항공</span><span class="val">${res.pickupFlight || '-'}</span></div>
                        <div class="detail-row"><span class="label">픽업호텔</span><span class="val">${res.pickupResort || '-'}</span></div>
                        <hr style="margin:10px 0; border:none; border-top:1px dashed #ddd;">
                        <div class="detail-row"><span class="label">샌딩날짜</span><span class="val" style="color:#007aff;">${res.sendingDate || '-'}</span></div>
                        <div class="detail-row"><span class="label">샌딩항공</span><span class="val">${res.sendingFlight || '-'}</span></div>
                        <div class="detail-row"><span class="label">샌딩호텔</span><span class="val">${res.sendingResort || '-'}</span></div>
                    </div>
                </div>
            </div>
            <div style="margin-top:30px;">
                <h4 style="margin-bottom:15px; border-left:4px solid #ff6a00; padding-left:10px; color:#333;">🛒 예약 상품 상세</h4>
                <div style="display:grid; grid-template-columns: 1fr; gap:10px;">
                    ${itemsHtml}
                </div>
            </div>
            <div style="margin-top:20px; padding-top:15px; border-top:1px solid #eee; font-size:12px; color:#bbb; display:flex; justify-content:space-between;">
                <span>예약 ID: ${res.id}</span>
                <span>접수일시: ${res.createdAt?.toDate ? res.createdAt.toDate().toLocaleString() : (res.createdAt || '-')}</span>
            </div>
        `;
        if (modal) modal.style.display = 'flex';
    };

    window.closeModal = () => {
        const modal = document.getElementById('res-detail-modal');
        if (modal) modal.style.display = 'none';
    };

    window.goToNewOrders = () => {
        const searchInput = document.getElementById('res-search');
        if (searchInput) {
            searchInput.value = '';
            renderMainTable();
        }
    };

    function getTodayStr() { return new Date().toISOString().split('T')[0]; }
});
