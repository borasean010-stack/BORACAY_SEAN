document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const adminContainer = document.getElementById('admin-container');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const reservationsBody = document.getElementById('reservations-body');
    const searchInput = document.getElementById('reservation-search');
    const statusFilter = document.getElementById('status-filter');

    const correctPassword = 'password123';

    // Mock Data Store
    let reservations = [
        { id: 101, created: '2024-03-08 10:30', name: '김태형', email: 'kim@naver.com', contact: '010-1111-2222', tour: '보라카이 호핑투어', date: '2024-03-15', status: '신규' },
        { id: 102, created: '2024-03-08 09:15', name: '이민지', email: 'lee@gmail.com', contact: '010-3333-4444', tour: '체험 다이빙', date: '2024-03-16', status: '대기' },
        { id: 103, created: '2024-03-07 18:20', name: '박준호', email: 'park@kakao.com', contact: '010-5555-6666', tour: '파라세일링', date: '2024-03-12', status: '확정' },
        { id: 104, created: '2024-03-07 14:00', name: '최유진', email: 'choi@daum.net', contact: '010-7777-8888', tour: '말룸파티 투어', date: '2024-03-20', status: '취소' },
        { id: 105, created: '2024-03-06 11:11', name: '정수빈', email: 'jung@naver.com', contact: '010-9999-0000', tour: '선셋 세일링', date: '2024-03-10', status: '완료' },
        { id: 106, created: '2024-03-06 08:45', name: '강동원', email: 'kang@gmail.com', contact: '010-1234-5678', tour: '보라카이 호핑투어', date: '2024-03-18', status: '신규' }
    ];

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
        renderReservations(reservations);
        updateDashboardStats();
        initChart();
    }

    function updateDashboardStats() {
        document.getElementById('count-new').textContent = reservations.filter(r => r.status === '신규').length;
        document.getElementById('count-pending').textContent = reservations.filter(r => r.status === '대기').length;
        document.getElementById('count-confirmed').textContent = reservations.filter(r => r.status === '확정').length;
        document.getElementById('count-completed').textContent = reservations.filter(r => r.status === '완료').length;
        document.getElementById('count-cancelled').textContent = reservations.filter(r => r.status === '취소').length;
    }

    function getStatusBadgeClass(status) {
        switch(status) {
            case '신규': return 'badge-new-res';
            case '대기': return 'badge-pending';
            case '확정': return 'badge-confirmed';
            case '취소': return 'badge-cancelled';
            case '완료': return 'badge-pending'; // using pending style for completion for now
            default: return 'badge-pending';
        }
    }

    function renderReservations(data) {
        reservationsBody.innerHTML = '';
        data.forEach(res => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${res.created.split(' ')[0]}<br><small style="color:#999">${res.created.split(' ')[1]}</small></td>
                <td>
                    <div class="res-name">${res.name}</div>
                    <div class="res-contact">${res.contact}</div>
                </td>
                <td><strong>${res.tour}</strong></td>
                <td>${res.date}</td>
                <td><span class="status-badge ${getStatusBadgeClass(res.status)}">${res.status}</span></td>
                <td>
                    <button class="btn-sm" onclick="updateStatus(${res.id}, '확정')">확정</button>
                    <button class="btn-sm" onclick="updateStatus(${res.id}, '취소')">취소</button>
                </td>
            `;
            reservationsBody.appendChild(row);
        });
    }

    // Global function for inline buttons
    window.updateStatus = (id, newStatus) => {
        const index = reservations.findIndex(r => r.id === id);
        if (index !== -1) {
            if (confirm(`예약자 '${reservations[index].name}'의 상태를 '${newStatus}'(으)로 변경하시겠습니까?`)) {
                reservations[index].status = newStatus;
                filterAndSearch();
                updateDashboardStats();
            }
        }
    };

    function filterAndSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;

        const filtered = reservations.filter(res => {
            const matchesSearch = res.name.toLowerCase().includes(searchTerm) || 
                                res.contact.toLowerCase().includes(searchTerm);
            const matchesStatus = statusValue === 'all' || res.status === statusValue;
            return matchesSearch && matchesStatus;
        });

        renderReservations(filtered);
    }

    if(searchInput) searchInput.addEventListener('input', filterAndSearch);
    if(statusFilter) statusFilter.addEventListener('change', filterAndSearch);

    // Chart.js Initialization
    let chartInstance = null;
    function initChart() {
        const ctx = document.getElementById('weeklyChart');
        if (!ctx) return;
        
        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['월', '화', '수', '목', '금', '토', '일'],
                datasets: [{
                    label: '예약 건수',
                    data: [12, 19, 15, 22, 28, 35, 30],
                    backgroundColor: '#00c73c',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, grid: { borderDash: [2, 4] } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
});
