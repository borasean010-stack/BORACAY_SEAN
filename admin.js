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
    let currentTab = '신규'; 

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
        // Main Mode Switch (Sales vs Settlement) - FIXED
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            if (btn.classList.contains('logout-trigger')) return;
            if (btn.id === 'logout-btn') return;
            if (btn.onclick && btn.innerText.includes('새로고침')) return;

            btn.onclick = () => {
                document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                currentMode = btn.dataset.mode;
                if (btn.dataset.tab) {
                    currentTab = btn.dataset.tab;
                }
                
                if (salesView) salesView.style.display = (currentMode === 'sales') ? 'block' : 'none';
                if (settlementView) settlementView.style.display = (currentMode === 'settlement') ? 'block' : 'none';
                
                const viewTitle = document.getElementById('view-title');
                if (viewTitle) viewTitle.textContent = (currentMode === 'sales' && currentTab === 'all') ? '주문 통합검색' : btn.textContent.trim();
                
                const subTitle = document.getElementById('table-sub-title');
                if (subTitle) {
                    if (currentTab === 'all') subTitle.textContent = '전체 주문 내역';
                    else subTitle.textContent = `${currentTab} 내역`;
                }

                renderAll();
            };
        });

        // Sales Sub-tabs (Top Counters)
        document.querySelectorAll('.summary-card').forEach(card => {
            if (!card.dataset.tab) return;
            card.onclick = () => {
                document.querySelectorAll('.summary-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                currentTab = card.dataset.tab;
                const subTitle = document.getElementById('table-sub-title');
                if (subTitle) subTitle.textContent = `${currentTab} 내역`;
                
                // Sidebar also sync
                document.querySelectorAll('.sidebar-btn').forEach(b => {
                    b.classList.remove('active');
                    if (b.dataset.mode === 'sales' && b.dataset.tab === (currentTab === '확정' ? '확정' : 'all')) {
                        b.classList.add('active');
                    }
                });

                renderMainTable();
            };
        });

        // Search
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
        
        // 정렬(orderBy)을 제거하여 인덱스 생성 전에도 데이터가 보이도록 함
        const q = query(collection(db, "reservations")); 
        
        onSnapshot(q, (snapshot) => {
            console.log("실시간 데이터 수신:", snapshot.size, "건");
            allReservations = [];
            snapshot.forEach((doc) => {
                allReservations.push({ id: doc.id, ...doc.data() });
            });
            
            // 데이터 수신 후 클라이언트 측에서 정렬
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
            tableBody.innerHTML = '<tr><td colspan="7" class="empty-msg-v2">조회된 내역이 없습니다.</td></tr>';
            return;
        }

        filtered.forEach(res => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${res.id}</td>
                <td>${res.items?.[0]?.date || '-'}</td>
                <td><b>${res.customerKorName}</b></td>
                <td>${res.items?.[0]?.name}</td>
                <td>₩ ${res.totalPrice?.toLocaleString()}</td>
                <td><span class="ss-badge ss-badge-${res.status}">${res.status}</span></td>
                <td>
                    <div style="display:flex; gap:5px; justify-content:center;">
                        ${res.status === '신규' ? `<button class="ss-btn-action" onclick="updateStatus('${res.id}', '예약완료')">예약완료 처리</button>` : ''}
                        ${(res.status === '예약완료' || res.status === '확정') ? `<button class="ss-btn-action" onclick="showDetail('${res.id}')">상세 정보</button>` : ''}
                        ${res.status === '예약완료' ? `<button class="ss-btn-action" onclick="confirmPurchase('${res.id}')">구매확정</button>` : ''}
                        ${res.status === '확정' ? `<button class="ss-btn-action" style="color:red" onclick="updateStatus('${res.id}', '취소')">취소/환불</button>` : ''}
                        ${res.status === '취소' ? `<button class="ss-btn-action" onclick="updateStatus('${res.id}', '신규')">재주문 처리</button>` : ''}
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function renderDailySchedule() {
        if (!scheduleList) return;
        const today = getTodayStr();
        
        // FIXED: 구매 확정(확정) 상태도 포함하여 필터링 (취소만 제외)
        const todays = allReservations.filter(res => (res.items?.[0]?.date === today) && res.status !== '취소');
        
        if (!todays.length) {
            scheduleList.innerHTML = '<p class="empty-msg-v2">오늘 예정된 스케줄이 없습니다.</p>';
            return;
        }

        const categories = {
            "픽업/샌딩": todays.filter(r => r.items[0].name.includes('픽업')),
            "호핑투어": todays.filter(r => r.items[0].name.includes('호핑')),
            "말룸파티": todays.filter(r => r.items[0].name.includes('말룸')),
            "액티비티/기타": todays.filter(r => !r.items[0].name.includes('픽업') && !r.items[0].name.includes('호핑') && !r.items[0].name.includes('말룸'))
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
                // 상태 표시 추가하여 확정된 건인지 구분 가능하게 함
                const statusColor = res.status === '확정' ? '#888' : 'var(--ss-text-main)';
                item.innerHTML = `
                    <div class="time-tag">${res.items[0].time || '종일'}</div>
                    <div class="info" style="color:${statusColor}">
                        <b>${res.customerKorName}</b> | ${res.items[0].name}
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
            const date = r.items?.[0]?.date || '미정';
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
                // 캐시 업데이트
                localStorage.setItem('admin_reservations_cache', JSON.stringify(allReservations));
                renderAll(); 
            }
        }
    };

    window.confirmPurchase = async (id) => {
        await window.updateStatus(id, '확정');
        // 새로운 탭으로 예약 일정(바우처) 보기
        window.open(`reservation-schedule.html?id=${id}`, '_blank');
    };

    window.showDetail = (id) => {
        const res = allReservations.find(r => r.id === id);
        if (!res) return;
        const modal = document.getElementById('res-detail-modal');
        const body = document.getElementById('modal-body');
        
        body.innerHTML = `
            <div class="detail-row"><span class="label">예약자명</span><span class="val">${res.customerKorName}</span></div>
            <div class="detail-row"><span class="label">연락처</span><span class="val">${res.contact || '-'}</span></div>
            <div class="detail-row"><span class="label">상품명</span><span class="val">${res.items[0].name}</span></div>
            <div class="detail-row"><span class="label">이용 일자</span><span class="val">${res.items[0].date}</span></div>
            <div class="detail-row"><span class="label">이용 시간</span><span class="val">${res.items[0].time || '정보 없음'}</span></div>
            <div class="detail-row"><span class="label">결제 금액</span><span class="val">₩ ${res.totalPrice.toLocaleString()}</span></div>
            <div class="detail-row"><span class="label">상태</span><span class="val">${res.status}</span></div>
            <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
            <p style="font-size:12px; color:#888;">* 세부 픽업 정보 및 요청 사항은 Firebase 실시간 데이터에서 로드됩니다.</p>
        `;
        if (modal) modal.style.display = 'flex';
    };

    window.closeModal = () => {
        const modal = document.getElementById('res-detail-modal');
        if (modal) modal.style.display = 'none';
    };

    window.goToNewOrders = () => {
        // Find '신규' summary card and click it
        const newCard = document.querySelector('.summary-card[data-tab="신규"]');
        if (newCard) newCard.click();
    };

    function getTodayStr() { return new Date().toISOString().split('T')[0]; }
});
