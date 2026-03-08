// Firebase SDK (using ES modules from CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// FIXME: Replace this with your actual Firebase config from the Firebase Console
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "boracay-sean.firebaseapp.com",
    projectId: "boracay-sean",
    storageBucket: "boracay-sean.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const adminContainer = document.getElementById('admin-container');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const reservationsBody = document.getElementById('reservations-body');
    const searchInput = document.getElementById('reservation-search');
    const statusFilter = document.getElementById('status-filter');

    const correctPassword = 'password123';
    let allReservations = [];

    // Check if logged in
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        showAdminPanel();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        if (password === correctPassword) {
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            showAdminPanel();
        } else {
            alert('비밀번호가 일치하지 않습니다.');
        }
    });

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        loginContainer.style.display = 'flex';
        adminContainer.style.display = 'none';
        document.getElementById('password').value = '';
    });

    function showAdminPanel() {
        loginContainer.style.display = 'none';
        adminContainer.style.display = 'flex';
        fetchReservations();
    }

    function fetchReservations() {
        const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
        
        // Real-time listener
        onSnapshot(q, (snapshot) => {
            allReservations = [];
            snapshot.forEach((doc) => {
                allReservations.push({ id: doc.id, ...doc.data() });
            });
            filterAndSearch();
            updateDashboardStats();
            initChart(allReservations);
        });
    }

    function updateDashboardStats() {
        document.getElementById('count-new').textContent = allReservations.filter(r => r.status === '신규').length;
        document.getElementById('count-pending').textContent = allReservations.filter(r => r.status === '대기').length;
        document.getElementById('count-confirmed').textContent = allReservations.filter(r => r.status === '확정').length;
        document.getElementById('count-completed').textContent = allReservations.filter(r => r.status === '완료').length;
        document.getElementById('count-cancelled').textContent = allReservations.filter(r => r.status === '취소').length;
    }

    function getStatusBadgeClass(status) {
        switch(status) {
            case '신규': return 'badge-new-res';
            case '대기': return 'badge-pending';
            case '확정': return 'badge-confirmed';
            case '취소': return 'badge-cancelled';
            case '완료': return 'badge-pending'; 
            default: return 'badge-pending';
        }
    }

    function renderReservations(data) {
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
                    <button class="btn-sm text-danger" onclick="deleteReservation('${res.id}')">삭제</button>
                </td>
            `;
            reservationsBody.appendChild(row);
        });
    }

    window.updateStatus = async (id, newStatus) => {
        if (confirm(`상태를 '${newStatus}'(으)로 변경하시겠습니까?`)) {
            try {
                const docRef = doc(db, "reservations", id);
                await updateDoc(docRef, { status: newStatus });
            } catch (error) {
                console.error("Error updating document: ", error);
                alert('상태 변경 중 오류가 발생했습니다.');
            }
        }
    };

    window.deleteReservation = async (id) => {
        if (confirm('정말 이 예약을 삭제하시겠습니까? 데이터가 완전히 사라집니다.')) {
            try {
                await deleteDoc(doc(db, "reservations", id));
            } catch (error) {
                console.error("Error deleting document: ", error);
                alert('삭제 중 오류가 발생했습니다.');
            }
        }
    };

    function filterAndSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;

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

    let chartInstance = null;
    function initChart(data) {
        const ctx = document.getElementById('weeklyChart');
        if (!ctx) return;
        
        if (chartInstance) chartInstance.destroy();

        // Simple day counting logic
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const counts = [0, 0, 0, 0, 0, 0, 0];
        
        data.forEach(res => {
            if (res.createdAt) {
                const dayIdx = new Date(res.createdAt.seconds * 1000).getDay();
                counts[dayIdx]++;
            }
        });

        // Reorder to Mon-Sun
        const reorderedLabels = ['월', '화', '수', '목', '금', '토', '일'];
        const reorderedCounts = [counts[1], counts[2], counts[3], counts[4], counts[5], counts[6], counts[0]];

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: reorderedLabels,
                datasets: [{
                    label: '예약 건수',
                    data: reorderedCounts,
                    backgroundColor: '#00c73c',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { borderDash: [2, 4] } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
});
