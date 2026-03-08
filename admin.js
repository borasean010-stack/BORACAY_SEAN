// Firebase SDK (using ES modules from CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// FIXME: Replace this with your actual Firebase config from the Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyD-fake-key-for-now", 
    authDomain: "boracay-sean.firebaseapp.com",
    projectId: "boracay-sean",
    storageBucket: "boracay-sean.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// Initialize Firebase with error handling to prevent login failure
let db;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (e) {
    console.error("Firebase Initialization Error:", e);
}

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const adminContainer = document.getElementById('admin-container');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const reservationsBody = document.getElementById('reservations-body');
    const searchInput = document.getElementById('reservation-search');
    const statusFilter = document.getElementById('status-filter');

    // 계정 정보
    const correctUsername = 'luca';
    const correctPassword = 'luca1';

    let allReservations = [];

    // Check if logged in
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        showAdminPanel();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        console.log("Login attempt:", username, password); // Debugging

        if (username === correctUsername && password === correctPassword) {
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            console.log("Login successful, switching view...");
            showAdminPanel();
        } else {
            alert('아이디 또는 비밀번호가 일치하지 않습니다.');
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isAdminLoggedIn');
            loginContainer.style.display = 'flex';
            adminContainer.style.display = 'none';
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        });
    }

    function showAdminPanel() {
        if (loginContainer && adminContainer) {
            loginContainer.style.display = 'none';
            adminContainer.style.display = 'flex';
            if (db) {
                fetchReservations();
            } else {
                console.warn("Firebase not initialized, showing mock data instead.");
                renderReservations(mockData);
            }
        }
    }

    const mockData = [
        { id: '1', customerKorName: '테스트유저', contact: '010-0000-0000', items: [{name: '블랙펄 요트호핑'}], totalPrice: 50000, status: '신규', createdAt: {seconds: Date.now()/1000} }
    ];

    function fetchReservations() {
        const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
        
        onSnapshot(q, (snapshot) => {
            allReservations = [];
            snapshot.forEach((doc) => {
                allReservations.push({ id: doc.id, ...doc.data() });
            });
            filterAndSearch();
            updateDashboardStats();
            initChart(allReservations);
        }, (error) => {
            console.error("Firestore Listen Error:", error);
            renderReservations(mockData); // Fallback to mock data if Firestore fails
        });
    }

    function updateDashboardStats() {
        const counts = {
            신규: allReservations.filter(r => r.status === '신규').length,
            대기: allReservations.filter(r => r.status === '대기').length,
            확정: allReservations.filter(r => r.status === '확정').length,
            완료: allReservations.filter(r => r.status === '완료').length,
            취소: allReservations.filter(r => r.status === '취소').length
        };
        if(document.getElementById('count-new')) document.getElementById('count-new').textContent = counts.신규;
        if(document.getElementById('count-pending')) document.getElementById('count-pending').textContent = counts.대기;
        if(document.getElementById('count-confirmed')) document.getElementById('count-confirmed').textContent = counts.확정;
        if(document.getElementById('count-completed')) document.getElementById('count-completed').textContent = counts.완료;
        if(document.getElementById('count-cancelled')) document.getElementById('count-cancelled').textContent = counts.취소;
    }

    function getStatusBadgeClass(status) {
        switch(status) {
            case '신규': return 'badge-new-res';
            case '대기': return 'badge-pending';
            case '확정': return 'badge-confirmed';
            case '취소': return 'badge-cancelled';
            default: return 'badge-pending';
        }
    }

    function renderReservations(data) {
        if (!reservationsBody) return;
        reservationsBody.innerHTML = '';
        if (data.length === 0) {
            reservationsBody.innerHTML = '<tr><td colspan="6" style="padding:40px; color:#999;">표시할 예약 내역이 없습니다.</td></tr>';
            return;
        }

        data.forEach(res => {
            const dateStr = res.createdAt ? new Date(res.createdAt.seconds * 1000).toLocaleString() : '진행중';
            const itemsSummary = res.items ? res.items.map(i => i.name).join(', ') : '정보 없음';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dateStr.split('. ')[0] + '.' + dateStr.split('. ')[1] + '.' + dateStr.split('. ')[2]}<br><small style="color:#999">${dateStr.split(' ')[4] || ''}</small></td>
                <td>
                    <div class="res-name">${res.customerKorName}</div>
                    <div class="res-contact">${res.contact}</div>
                </td>
                <td><strong>${itemsSummary}</strong><br><small>₩ ${res.totalPrice?.toLocaleString()}</small></td>
                <td>${res.items?.[0]?.date || '-'}</td>
                <td><span class="status-badge ${getStatusBadgeClass(res.status)}">${res.status}</span></td>
                <td>
                    <button class="btn-sm" onclick="updateStatus('${res.id}', '확정')">확정</button>
                    <button class="btn-sm" onclick="updateStatus('${res.id}', '취소')">취소</button>
                </td>
            `;
            reservationsBody.appendChild(row);
        });
    }

    window.updateStatus = async (id, newStatus) => {
        if (!db) { alert("Firebase가 연결되지 않았습니다."); return; }
        if (confirm(`상태를 '${newStatus}'(으)로 변경하시겠습니까?`)) {
            try {
                const docRef = doc(db, "reservations", id);
                await updateDoc(docRef, { status: newStatus });
            } catch (error) {
                console.error("Error updating document: ", error);
            }
        }
    };

    function filterAndSearch() {
        const searchTerm = searchInput?.value.toLowerCase() || "";
        const statusValue = statusFilter?.value || "all";

        const filtered = allReservations.filter(res => {
            const name = res.customerKorName || "";
            const contact = res.contact || "";
            const matchesSearch = name.toLowerCase().includes(searchTerm) || 
                                contact.toLowerCase().includes(searchTerm);
            const matchesStatus = statusValue === 'all' || res.status === statusValue;
            return matchesSearch && matchesStatus;
        });

        renderReservations(filtered);
    }

    if(searchInput) searchInput.addEventListener('input', filterAndSearch);
    if(statusFilter) statusFilter.addEventListener('change', filterAndSearch);

    function initChart(data) {
        const ctx = document.getElementById('weeklyChart');
        if (!ctx || typeof Chart === 'undefined') return;
        
        // Basic chart implementation logic...
    }
});
