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

    // --- 1. Authentication ---
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
        
        // 🔐 권한 제어: 'luca' 아이디만 시스템 설정(데이터 삭제) 메뉴 노출
        const systemMenu = document.getElementById('menu-system');
        if (systemMenu) {
            systemMenu.style.display = (adminId === 'luca') ? 'flex' : 'none';
        }

        fetchData();
    }

    // --- 2. Data Handlers ---
    function fetchData() {
        if (!db) return;
        const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
            allReservations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            updateSummaryCounts();
            renderTodaySchedule();
            renderTable();
        });
    }

    function updateSummaryCounts() {
        const counts = {
            new: allReservations.filter(r => r.status === '입금대기' || r.status === '예약접수').length,
            confirmed: allReservations.filter(r => r.status === '예약확정').length,
            resorts: allReservations.filter(r => r.status === '견적').length
        };
        document.getElementById('count-new').innerText = counts.new;
        document.getElementById('count-confirmed').innerText = counts.confirmed;
        document.getElementById('count-resorts').innerText = counts.resorts;
    }

    // --- 📅 3. Today's Schedule Timeline (시간대별 정렬) ---
    function renderTodaySchedule() {
        const container = document.getElementById('schedule-timeline');
        if (!container) return;

        const today = new Date().toISOString().split('T')[0];
        
        // 오늘 날짜 예약 추출 및 시간대별 정렬
        let todayItems = [];
        allReservations.forEach(res => {
            if (!res.items) return;
            res.items.forEach(item => {
                // 예약 날짜가 오늘이거나, 픽업일이 오늘인 경우
                if (item.date === today || res.pickupDate === today) {
                    todayItems.push({
                        time: item.time || "00:00",
                        name: item.name,
                        customer: res.customerKorName,
                        count: item.count,
                        resNo: res.reservationNumber,
                        status: res.status,
                        id: res.id
                    });
                }
            });
        });

        // 시간순 정렬
        todayItems.sort((a, b) => a.time.localeCompare(b.time));

        if (todayItems.length === 0) {
            container.innerHTML = '<div class="sc-empty">오늘 예정된 투어나 마사지 일정이 없습니다.</div>';
            return;
        }

        container.innerHTML = todayItems.map(item => {
            const isConfirmed = item.status === '예약확정';
            const statusClass = isConfirmed ? 'confirmed' : 'pending';
            const statusText = isConfirmed ? '확정' : '입금대기';
            
            return `
                <div class="schedule-card" onclick="showDetail('${item.id}')" style="cursor:pointer; border-top-color: ${isConfirmed ? '#03c75a' : '#ff8c00'}">
                    <div class="sc-status ${statusClass}">${statusText}</div>
                    <div class="sc-time"><span class="material-icons">access_time</span> ${item.time}</div>
                    <div class="sc-item">${item.name}</div>
                    <div class="sc-customer">
                        <b>${item.customer}</b> <span style="color:#999; margin-left:4px;">${item.count}명</span>
                    </div>
                    <div class="sc-status-tag" style="color:${isConfirmed ? '#03c75a' : '#ff8c00'}">
                        <span class="material-icons" style="font-size:12px;">circle</span> ${item.status}
                    </div>
                </div>
            `;
        }).join('');
    }

    // --- 4. Sidebar & Tab 연동 ---
    window.switchAdminTab = (tab) => {
        activeTab = tab;
        
        // UI Sync: Sidebar
        document.querySelectorAll('.ss-nav-item').forEach(el => el.classList.remove('active'));
        const sideMenu = document.getElementById(`menu-${tab}`);
        if(sideMenu) sideMenu.classList.add('active');

        // UI Sync: Sections
        const scheduleSection = document.getElementById('schedule-section');
        const statusLayer = document.getElementById('status-layer');
        const dataViewSection = document.getElementById('data-view-section');
        const systemSection = document.getElementById('system-setup-section');

        if (tab === 'system') {
            scheduleSection.style.display = 'none';
            statusLayer.style.display = 'none';
            dataViewSection.style.display = 'block'; // 시스템 탭에서도 테이블 보임
            systemSection.style.display = 'block';
            document.getElementById('current-view-title').innerText = '데이터 관리 (삭제)';
            document.getElementById('breadcrumb-active').innerText = '설정';
        } else {
            scheduleSection.style.display = 'block';
            statusLayer.style.display = 'flex';
            dataViewSection.style.display = 'block';
            systemSection.style.display = 'none';

            document.querySelectorAll('.ss-status-card').forEach(el => el.classList.remove('active'));
            const statusCard = document.getElementById(`tab-${tab}`);
            if(statusCard) statusCard.classList.add('active');

            const titles = { 'new': '신규예약 관리', 'confirmed': '예약확정 내역', 'resorts': '리조트 견적 신청' };
            document.getElementById('current-view-title').innerText = titles[tab] || '관리';
            document.getElementById('breadcrumb-active').innerText = tab;
        }

        renderTable();
        };

        // --- 5. Main Rendering ---
        function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        const searchTerm = document.getElementById('header-global-search').value.toLowerCase();

        let filtered = allReservations.filter(r => {
            const name = (r.customerKorName || '').toLowerCase();
            const resNo = (r.reservationNumber || '').toLowerCase();
            const matchesSearch = name.includes(searchTerm) || resNo.includes(searchTerm);

            let matchesTab = false;
            if (activeTab === 'new') matchesTab = (r.status === '입금대기' || r.status === '예약접수');
            else if (activeTab === 'confirmed') matchesTab = (r.status === '예약확정');
            else if (activeTab === 'resorts') matchesTab = (r.status === '견적');
            else if (activeTab === 'system') matchesTab = true; // 시스템 탭에서는 모든 데이터 표시

            return matchesSearch && matchesTab;
        });

        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:100px; color:#ccc; font-size:14px;">데이터가 없습니다.</td></tr>';
            return;
        }

        filtered.forEach((res, index) => {
            const tr = document.createElement('tr');
            const status = res.status || '대기';
            let badgeClass = status === '예약확정' ? 'badge-green' : (status === '견적' ? 'badge-blue' : 'badge-yellow');

            const firstItemName = res.items && res.items.length > 0 ? res.items[0].name : '-';
            const itemsText = res.items && res.items.length > 1 ? `${firstItemName} 외 ${res.items.length - 1}건` : firstItemName;
            const dateStr = res.createdAt?.toDate ? res.createdAt.toDate().toLocaleDateString() : '-';

            // 시스템 탭(삭제 관리)에서만 '취소/삭제' 버튼 노출
            const deleteBtn = (activeTab === 'system') ? `<button class="btn-action-danger" onclick="handleDeleteReservation('${res.id}')">취소/삭제</button>` : '';
            const actionButtons = (activeTab === 'system') ? deleteBtn : `
                ${status !== '예약확정' ? `<button class="btn-action-received" onclick="handleAutoConfirm('${res.id}')">입금확인</button>` : ''}
                <button class="btn-action-outline" onclick="showDetail('${res.id}')">상세</button>
            `;

            tr.innerHTML = `
                <td><input type="checkbox"></td>
                <td style="color:#bbb;">${filtered.length - index}</td>
                <td style="font-weight:700;">${res.reservationNumber || '-'}</td>
                <td><b>${res.customerKorName || '미입력'}</b></td>
                <td style="font-weight:600; color:#555;">${itemsText}</td>
                <td style="font-weight:800; color:#111;">₩ ${(res.totalPrice || 0).toLocaleString()}</td>
                <td style="color:#888;">${dateStr}</td>
                <td style="text-align:center;"><span class="n-badge ${badgeClass}">${status}</span></td>
                <td>
                    <div style="display:flex; gap:5px; flex-wrap:wrap;">
                        ${actionButtons}
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
        }
    document.getElementById('header-global-search').oninput = renderTable;

    window.handleAutoConfirm = async (id) => {
        if (confirm("입금을 확인하셨습니까? 예약확정 처리를 진행합니다.")) {
            await updateDoc(doc(db, "reservations", id), { status: "예약확정" });
        }
    };

    window.handleDeleteReservation = async (id) => {
        if (confirm("이 예약을 삭제(취소)하시겠습니까? 데이터가 영구적으로 제거됩니다.")) {
            try {
                await deleteDoc(doc(db, "reservations", id));
                alert("삭제되었습니다.");
            } catch (err) {
                console.error("Delete Error", err);
                alert("삭제 중 오류가 발생했습니다.");
            }
        }
    };

    window.handleClearAllData = async () => {
        if (!confirm("⚠️ [경고] 모든 예약 데이터를 영구 삭제하시겠습니까?")) return;
        const snap = await getDocs(collection(db, "reservations"));
        const promises = snap.docs.map(d => deleteDoc(doc(db, "reservations", d.id)));
        await Promise.all(promises);
        alert("모든 데이터가 초기화되었습니다.");
    };

    window.showDetail = (id) => {
        const res = allReservations.find(r => r.id === id);
        if (!res) return;

        const modal = document.getElementById('res-detail-modal');
        const body = document.getElementById('modal-body');

        // 예약 상품 렌더링
        // 예약 상품 렌더링 시작 부분에 전체 일정표 버튼 추가
        const totalVoucherBtn = `
            <div style="margin-bottom:15px;">
                <button onclick="copyVoucherLink('${res.id}', null)" style="width:100%; padding:12px; background:#03c75a; color:white; border:none; border-radius:8px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                    <span class="material-icons" style="font-size:18px;">share</span> 전체 일정표(바우처) 링크 복사
                </button>
                <p style="font-size:11px; color:#888; margin-top:5px; text-align:center;">* 장바구니 구매 고객용 통합 일정표 링크입니다.</p>
            </div>
        `;

        const itemsHtml = res.items.map((item, idx) => `
            <div style="padding:12px; background:#f8f9fa; border:1px solid #eee; border-radius:8px; margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div style="font-size:15px; font-weight:800; color:#333;">${item.name}</div>
                    <div style="font-size:14px; font-weight:800; color:#ff6a00;">${item.count}명</div>
                </div>
                <div style="margin-top:6px; font-size:13px; color:#666; line-height:1.5;">
                    <span style="background:#eee; padding:2px 6px; border-radius:4px; margin-right:5px; font-weight:700;">일정</span> ${item.date || ''} ${item.time || ''}
                    ${item.details ? `<br><span style="background:#eee; padding:2px 6px; border-radius:4px; margin-right:5px; font-weight:700;">옵션</span> ${item.details}` : ''}
                </div>
                <div style="margin-top:10px; display:flex; gap:5px;">
                    <a href="reservation-schedule.html?id=${res.id}&itemIndex=${idx}" target="_blank" style="flex:1; text-align:center; padding:6px; background:#fff; border:1px solid #ddd; border-radius:4px; font-size:11px; font-weight:700; color:#555; text-decoration:none;">바우처 보기</a>
                    <button onclick="copyVoucherLink('${res.id}', ${idx})" style="flex:1; padding:6px; background:#03c75a; border:none; border-radius:4px; font-size:11px; font-weight:700; color:white; cursor:pointer;">링크 복사</button>
                </div>
            </div>
        `).join('');

        // 항공/호텔 정보 존재 여부 확인
        const hasFlightInfo = res.pickupDate || res.pickupFlight || res.sendingDate || res.sendingFlight || res.pickupResort;
        
        body.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:15px; border-bottom:1px solid #eee;">
                <h3 style="margin:0; font-size:18px; color:#111;">예약 상세 정보</h3>
                <button onclick="copyGuidance('${res.id}')" style="background:#ff6a00; color:white; border:none; padding:8px 14px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:13px;">👉 안내문 복사</button>
            </div>
body.innerHTML = `
    <!-- 1. 예약 상품 -->
    <div style="margin-bottom:25px;">
        <div style="font-size:14px; font-weight:700; color:#888; margin-bottom:10px; display:flex; align-items:center; gap:5px;">
            <span class="material-icons" style="font-size:16px;">shopping_cart</span> 예약 상품
        </div>
        ${totalVoucherBtn}
        ${itemsHtml}

                ${res.status !== '견적' ? `
                <div style="text-align:right; margin-top:10px; padding:10px; background:#fff5eb; border-radius:8px;">
                    <span style="font-size:14px; color:#666;">총 합계 금액</span>
                    <div style="font-size:20px; font-weight:900; color:#ff6a00;">₩ ${res.totalPrice.toLocaleString()}</div>
                </div>` : ''}
            </div>

            <!-- 2. 예약자 정보 -->
            <div style="margin-bottom:20px; background:#fcfcfc; padding:15px; border-radius:10px; border:1px solid #f0f0f0;">
                <div style="font-size:13px; font-weight:700; color:#888; margin-bottom:8px;">👤 예약자 정보</div>
                <div style="font-size:14px; line-height:1.6; display:grid; grid-template-columns:1fr 1fr;">
                    <p style="margin:0;"><b>성함:</b> ${res.customerKorName} <span style="font-size:12px; color:#999;">(${res.engName || '-'})</span></p>
                    <p style="margin:0;"><b>연락처:</b> ${res.contact}</p>
                </div>
            </div>

            <div style="margin-bottom:20px; background:#fcfcfc; padding:15px; border-radius:10px; border:1px solid #f0f0f0;">
                <div style="font-size:13px; font-weight:700; color:#888; margin-bottom:8px;">✈️ 항공 및 호텔 정보</div>
                <div style="font-size:13px; line-height:1.6; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    ${res.pickupDate ? `<p style="margin:0;"><b>픽업일:</b> ${res.pickupDate}</p>` : ''}
                    ${res.pickupFlight ? `<p style="margin:0;"><b>픽업편:</b> ${res.pickupFlight}</p>` : ''}
                    ${res.sendingDate ? `<p style="margin:0;"><b>샌딩일:</b> ${res.sendingDate}</p>` : ''}
                    ${res.sendingFlight ? `<p style="margin:0;"><b>샌딩편:</b> ${res.sendingFlight}</p>` : ''}
                    ${res.pickupResort ? `<p style="margin:0; grid-column:span 2;"><b>리조트:</b> ${res.pickupResort}</p>` : ''}
                    ${res.sendingResort ? `<p style="margin:0; grid-column:span 2;"><b>샌딩리조트:</b> ${res.sendingResort}</p>` : ''}
                </div>
            </div>

            <!-- 4. 추가 정보 및 요청 -->
            <div style="margin-bottom:25px; background:#fcfcfc; padding:15px; border-radius:10px; border:1px solid #f0f0f0;">
                <div style="font-size:13px; font-weight:700; color:#888; margin-bottom:8px;">📝 추가 요청사항</div>
                <div style="font-size:13px; line-height:1.6;">
                    ${res.hasPrivateTransfer ? `<p style="margin:0 0 10px 0;"><b>단독 차량:</b> <span style="color:#ff6a00; font-weight:bold;">사용 (현지 $40 지불)</span></p>` : ''}
                    ${res.exchangeAmount ? `<p style="margin:0 0 10px 0;"><b>환전 요청:</b> ${res.exchangeAmount}</p>` : ''}
                    ${res.activityPickupResort ? `<p style="margin:0 0 10px 0;"><b>투어 픽업 장소:</b> ${res.activityPickupResort}</p>` : ''}
                    <div style="padding:10px; background:white; border:1px dashed #ddd; border-radius:6px; font-size:13px; color:#555;">
                        ${res.requests || '특별한 요청사항이 없습니다.'}
                    </div>
                </div>
            </div>

            <div style="text-align:center; display:flex; gap:10px;">
                <button id="edit-btn" onclick="toggleEditMode('${res.id}')" style="flex:1; padding:12px; background:#ff6a00; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">수정하기</button>
                <button onclick="closeModal()" style="flex:1; padding:12px; background:#333; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">창 닫기</button>
            </div>
        `;

        modal.style.display = 'flex';
    };

    window.toggleEditMode = (id) => {
        const res = allReservations.find(r => r.id === id);
        if (!res) return;

        const body = document.getElementById('modal-body');
        const editBtn = document.getElementById('edit-btn');

        if (editBtn.innerText === '수정하기') {
            // 수정 모드로 전환
            editBtn.innerText = '저장하기';
            editBtn.style.background = '#03c75a';

            body.innerHTML = `
                <div style="font-size:14px; padding:10px; border:1px solid #ff6a00; border-radius:10px; background:#fff9f5; margin-bottom:20px;">
                    ⚠️ 필드값을 수정한 후 [저장하기] 버튼을 눌러주세요.
                </div>
                <div class="edit-group" style="margin-bottom:15px;">
                    <label style="font-size:12px; color:#888;">대표자 성함</label>
                    <input type="text" id="edit-name" value="${res.customerKorName}" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px; margin-top:5px;">
                </div>
                <div class="edit-group" style="margin-bottom:15px;">
                    <label style="font-size:12px; color:#888;">연락처</label>
                    <input type="text" id="edit-contact" value="${res.contact}" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px; margin-top:5px;">
                </div>
                <div class="edit-group" style="margin-bottom:15px;">
                    <label style="font-size:12px; color:#888;">항공/픽업 정보 (픽업일 | 픽업편 | 샌딩일 | 샌딩편)</label>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px; margin-top:5px;">
                        <input type="text" id="edit-p-date" value="${res.pickupDate || ''}" placeholder="픽업일">
                        <input type="text" id="edit-p-flight" value="${res.pickupFlight || ''}" placeholder="픽업편">
                        <input type="text" id="edit-s-date" value="${res.sendingDate || ''}" placeholder="샌딩일">
                        <input type="text" id="edit-s-flight" value="${res.sendingFlight || ''}" placeholder="샌딩편">
                    </div>
                </div>
                <div class="edit-group" style="margin-bottom:15px;">
                    <label style="font-size:12px; color:#888;">리조트 / 투어 픽업 장소</label>
                    <input type="text" id="edit-resort" value="${res.pickupResort || ''}" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px; margin-top:5px;" placeholder="픽업 리조트">
                    <input type="text" id="edit-act-pickup" value="${res.activityPickupResort || ''}" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px; margin-top:5px;" placeholder="투어 개별 픽업지">
                </div>
                <div class="edit-group" style="margin-bottom:15px;">
                    <label style="font-size:12px; color:#888;">총 합계 금액 (숫자만 입력)</label>
                    <input type="number" id="edit-total" value="${res.totalPrice}" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px; margin-top:5px;">
                </div>
                <div class="edit-group">
                    <label style="font-size:12px; color:#888;">요청사항</label>
                    <textarea id="edit-requests" style="width:100%; height:100px; padding:10px; border:1px solid #ddd; border-radius:6px; margin-top:5px;">${res.requests || ''}</textarea>
                </div>
            `;
            // input 스타일 간소화 적용
            body.querySelectorAll('input').forEach(el => {
                if(!el.style.width) el.style.cssText = "width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;";
            });
        } else {
            // 저장 로직 수행
            handleSaveEdit(id);
        }
    };

    async function handleSaveEdit(id) {
        const newData = {
            customerKorName: document.getElementById('edit-name').value,
            contact: document.getElementById('edit-contact').value,
            pickupDate: document.getElementById('edit-p-date').value,
            pickupFlight: document.getElementById('edit-p-flight').value,
            sendingDate: document.getElementById('edit-s-date').value,
            sendingFlight: document.getElementById('edit-s-flight').value,
            pickupResort: document.getElementById('edit-resort').value,
            activityPickupResort: document.getElementById('edit-act-pickup').value,
            totalPrice: parseInt(document.getElementById('edit-total').value) || 0,
            requests: document.getElementById('edit-requests').value
        };

        if (confirm("변경 사항을 저장하시겠습니까?")) {
            try {
                await updateDoc(doc(db, "reservations", id), newData);
                alert("성공적으로 저장되었습니다.");
                closeModal();
            } catch (err) {
                console.error("Update Error", err);
                alert("저장 중 오류가 발생했습니다.");
            }
        }
    }
    // --- 📱 자동 안내문 생성 로직 ---
    window.copyGuidance = (id) => {
        const res = allReservations.find(r => r.id === id);
        if (!res) return;

        let messages = [];

        res.items.forEach(item => {
            let msg = "";
            const name = item.name;
            const isSending = name.includes('샌딩') || (item.details && item.details.includes('샌딩'));
            
            // 건기/우기 판단 (11-5월 건기, 6-10월 우기)
            const tourMonth = item.date ? parseInt(item.date.split('-')[1]) : new Date().getMonth() + 1;
            const isDrySeason = tourMonth <= 5 || tourMonth >= 11;

            if (name.includes('블랙펄')) {
                const meetingPlace = isDrySeason ? "8 Eight by the Beach" : "블라복 비치 목샤";
                const mapLink = isDrySeason ? "https://maps.app.goo.gl/Wa491bdTXuKZ2BtB8" : "https://www.google.co.kr/maps/place/Moksha+Cafe/@11.9676741,121.9274171,21z";
                msg = `블랙펄 호핑투어 예약 확정 안내 문자\n\n대표자 성함 : ${res.customerKorName}\n인원 : ${item.count}\n투어 : ${name}\n투어날짜 : ${item.date}\n\n투어 미팅 시간 / 장소 : 13:30 / ${meetingPlace}\n${mapLink}\n\n-트라이씨클로 미팅장소 이동 시-\n트라이씨클 기사에게 “${meetingPlace}" 라고 꼭 말해주세요!\n내리신 후 비치로 이동하셔서 좌측편으로 미팅장소 확인 가능합니다.\n\n★★ 주의 사항 및 준비물 ★★\n\n*주의 사항 - 미팅시간에서 10분이상 늦으시면 노쇼처리되며, 별도 연락없이 출항합니다. 이 경우 환불 및 일정 변경 불가하오니 꼭 미팅시간을 지켜주세요\n\n편한 물놀이 복장, 비치타올1인 1장\n스노클 마스크(보유시)\n보트맨팁 1인 100페소 (성인, 소인 동일)\n그외 개인적으로 필요한 물품\n\n🎉 블랙펄 기념일 이벤트 안내\n호핑투어 중 생일, 결혼기념일, 프로포즈, 기념일 축하가 있으시면 저희 블랙펄에서 작게 축하 이벤트를 진행해드립니다!\n👉 해당되는 경우 미팅 전까지 카카오톡으로 알려주세요! 사전 요청 필수 / 무료 서비스`;
            } 
            else if (name.includes('말룸파티')) {
                if (isSending) {
                    msg = `말룸파티 시크릿가든(샌딩) 예약 확정 안내 문자\n\n대표자 성함 : ${res.customerKorName}\n인원 : ${item.count}\n투어 : ${name}\n투어날짜 : ${item.date}\n투어 미팅 시간 / 장소 : 09:00 / ${res.activityPickupResort || res.pickupResort || '리조트 로비'}\n\n★★ 주의 사항 및 준비물 ★★\n\n*주의 사항 - 미팅시간에서 10분이상 늦으시면 노쇼처리되며, 별도 연락 없이 출발합니다. 이 경우 환불 및 일정 변경 불가하오니 꼭 미리 체크아웃과 룸체크를 진행하고 기다려주세요\n\n편한 물놀이 복장\n매너팁 1인 100페소 (성인, 소인 동일)\n튜빙 진행시 1인 350페소 준비해 주세요\n여권 정보면과 호텔 바우쳐 사진으로 폰에 저장(선택)\n그외 개인적으로 필요한 물품\n\n칼리보 공항 공항세 1인 900페소(공항 현지불 / 필수사항)\nBK라운지 샤워실 이용비용 1인 100페소(라운지 현지불)`;
                } else {
                    msg = `말룸파티 시크릿가든(데이) 예약 확정 안내 문자\n\n대표자 성함 : ${res.customerKorName}\n인원 : ${item.count}\n투어 : ${name}\n투어날짜 : ${item.date}\n시간 / 장소 : 09:40 / 보라카이션 사무실\nhttps://goo.gl/maps/pQkmCErHLjmQGRYM9\n\n★★ 주의 사항 및 준비물 ★★\n\n*주의 사항 - 미팅시간에서 10분이상 늦으시면 노쇼처리되며, 별도 연락없이 출발합니다. 이 경우 환불 및 일정 변경 불가하오니 꼭 미팅시간을 지켜주세요\n\n편한 물놀이 복장, 비치타올1인 1장\n매너팁 1인 100페소 (성인, 소인 동일)\n튜빙 진행시 1인 350페소 준비해 주세요\n여권 정보면과 호텔 바우쳐 사진으로 폰에 저장(선택)\n그외 개인적으로 필요한 물품`;
                }
            }
            else if (name.includes('픽업샌딩')) {
                msg = `보라카이션 왕복픽업샌딩 예약 확정 안내 문자\n\n대표자 성함 : ${res.customerKorName}\n인원 : ${item.count}\n투어 : 왕복픽업샌딩\n픽업시 환전 요청 금액 : ${res.exchangeAmount || '$'}\n\n픽업항공 : ${res.pickupDate} ${res.pickupFlight}\n픽업시 리조트 : ${res.pickupResort}\n★공항 밖에서 보라카이션 픽업 직원이 보라카이션 피켓을 들고 대기 하고 있습니다.\n픽업 직원과 대표자 성함 확인 후 안내에 따라 주시기 바랍니다. 항공이 딜레이가 되도 기다립니다.\n\n샌딩항공 : ${res.sendingDate} ${res.sendingFlight}\n샌딩 시간/장소 : 09:00 ${res.sendingResort}\n*교통상황에 따라 샌딩 미팅 시간과 장소가 변경될 수있습니다\n\n★지정된 장소와 시간전에 먼저 도착 하셔서 대기 해주셔야 합니다.\n리조트 체크아웃을 완료하고 샌딩 출발 하는 시간 입니다.\n늦어서 별도로 이동을 해야 하는 경우 추가 요금이 발생 합니다.`;
            }
            else if (['에스파', '포세이돈', '아유르베다', '마리스', '힐롯', '루나', '보라스파', '헬리오스', '카바얀'].some(s => name.includes(s))) {
                const shuttleShops = ['포세이돈', '아유르베다', '마리스', '헬리오스'];
                const hasShuttle = shuttleShops.some(s => name.includes(s));
                const meetingPlace = hasShuttle ? `${res.activityPickupResort || '리조트 로비'} (셔틀 픽업)` : `${name} 개별이동`;
                msg = `마사지 예약 확정 안내 문자\n\n대표자 성함 : ${res.customerKorName}\n인원 : ${item.count}\n투어 : ${name}\n투어날짜 : ${item.date} ${item.time || ''}\n투어 미팅 시간 / 장소 : ${item.time || ''} ${meetingPlace}\n\n★ 준비물\n편한 복장\n매너팁 1인 100페소 (성인, 소인 동일)\n그외 개인적으로 필요한 물품`;
            }
            else if (name.includes('VIP라운지') || name.includes('라운지')) {
                msg = `VIP라운지 예약 확인 안내 문자\n\n이용 날짜 : ${item.date}\n항공편명 : ${res.sendingFlight || '-'}\n예약자 성함 : ${res.customerKorName}\n인원 : ${item.count}PAX\n\nCONFIRMED BY ZOHAN\n\nVIP 라운지 (공항 내부)\nVIP 라운지는 공항 내부에 있는 라운지 입니다.\n라운지에 입장 하기 위해서는 공항 입장 후 모든 출국절차를 끝내시고 마지막 이민국까지 통과를 하시고 이용 하실 수 있습니다.\n출국절차 완료 후 2층 라운지 가셔서 성함말씀 혹은 이 예약문자 보여주시고 이용하시면 됩니다\n*선착순 예약 특성상 예약과 동시에 자리가 배정이 됩니다. 출국수속이 지체되어 라운지 도착 후 이용시간이 예상했던 시간보다 부족하여도 또는 이용을 못하신다 하더라도 당일 취소 및 환불은 불가 합니다.`;
            }
            else if (name.includes('골프')) {
                msg = `페어웨이 골프 예약 확정 안내 문자\n\n대표자 성함 : ${res.customerKorName}\n인원 : ${item.count}\n투어날짜 : ${item.date}\n투어 미팅 시간 / 장소 : ${item.time || '07:40'} / ${res.activityPickupResort || '리조트 로비'}\n점심 포함 : 점보크랩\n\n★ 준비물\n→ 불포함사항\n- 골프채, 골프공, 골프슈즈, 골프글로브\n- 개인음료(그늘집 있음)\n- 캐디팁 - 1인 100페소(18홀기준, 캐디에게 직접 페이)\n- 복귀 트라이시클비용(편도 약 150페소)`;
            }
            else {
                // 일반 액티비티 (리조트 픽업)
                msg = `액티비티 예약 확정 안내 문자\n\n대표자 성함 : ${res.customerKorName}\n인원 : ${item.count}\n투어 : ${name}\n투어날짜 : ${item.date}\n투어 미팅 시간 / 장소 : ${item.time || ''} ${res.activityPickupResort || '리조트 로비'}\n\n★ 준비물\n편한 물놀이 복장\n매너팁 1인 100페소 (성인, 소인 동일)\n그외 개인적으로 필요한 물품`;
            }

            if (msg) messages.push(msg);
        });

        const finalMsg = messages.join('\n\n--------------------------------------\n\n');
        
        // 클립보드 복사
        navigator.clipboard.writeText(finalMsg).then(() => {
            alert('안내문이 클립보드에 복사되었습니다. 카카오톡에 붙여넣기 하세요.');
        }).catch(err => {
            console.error('복사 실패:', err);
            alert('복사에 실패했습니다. 상세 정보에서 수동으로 복사해주세요.');
        });
    };

    window.copyVoucherLink = (id, idx) => {
        const itemParam = (idx !== null) ? `&itemIndex=${idx}` : '';
        const url = `${window.location.origin}/reservation-schedule.html?id=${id}${itemParam}`;
        navigator.clipboard.writeText(url).then(() => {
            const type = (idx !== null) ? '개별 상품' : '전체 일정';
            alert(`${type} 바우처 링크가 복사되었습니다. 고객님께 전달해주세요.`);
        }).catch(err => {
            console.error('링크 복사 실패:', err);
            alert('링크 복사에 실패했습니다.');
        });
    };

    window.closeModal = () => {
        document.getElementById('res-detail-modal').style.display = 'none';
    };
});
