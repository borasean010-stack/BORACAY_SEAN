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
                        status: res.status
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

        container.innerHTML = todayItems.map(item => `
            <div class="schedule-card">
                <div class="sc-time"><span class="material-icons">access_time</span> ${item.time}</div>
                <div class="sc-item">${item.name}</div>
                <div class="sc-customer"><b>${item.customer}</b> (${item.count}명)</div>
                <div style="margin-top:5px; font-size:10px; color:${item.status==='예약확정'?'#03c75a':'#ff8c00'}; font-weight:800;">● ${item.status}</div>
            </div>
        `).join('');
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
            dataViewSection.style.display = 'none';
            systemSection.style.display = 'block';
            document.getElementById('current-view-title').innerText = '시스템 설정';
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

        if (activeTab === 'system') return; // 시스템 탭에서는 테이블 안그림

        const searchTerm = document.getElementById('header-global-search').value.toLowerCase();

        let filtered = allReservations.filter(r => {
            const name = (r.customerKorName || '').toLowerCase();
            const resNo = (r.reservationNumber || '').toLowerCase();
            const matchesSearch = name.includes(searchTerm) || resNo.includes(searchTerm);
            
            let matchesTab = false;
            if (activeTab === 'new') matchesTab = (r.status === '입금대기' || r.status === '예약접수');
            else if (activeTab === 'confirmed') matchesTab = (r.status === '예약확정');
            else if (activeTab === 'resorts') matchesTab = (r.status === '견적');
            
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
                    <div style="display:flex; gap:5px;">
                        ${status !== '예약확정' ? `<button class="btn-action-received" onclick="handleAutoConfirm('${res.id}')">입금확인</button>` : ''}
                        <button class="btn-action-outline" onclick="showDetail('${res.id}')">상세</button>
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
        // ... (Modal logic same as previous)
        alert(JSON.stringify(res, null, 2)); // 임시 상세 보기
    };
});
