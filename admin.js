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
    
    // --- 1. SPA View Switching Logic ---
    const navItems = document.querySelectorAll('.sidebar .nav-item[data-view]');
    const viewPanels = document.querySelectorAll('.view-panel');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));
            viewPanels.forEach(panel => panel.classList.remove('active'));

            // Add active class to clicked nav and target view
            item.classList.add('active');
            const targetViewId = 'view-' + item.getAttribute('data-view');
            const targetPanel = document.getElementById(targetViewId);
            if(targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    // --- 2. Modal Logic (Quick Voucher, Cafe) ---
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) {
            modal.classList.add('active');
        }
    }

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) {
            modal.classList.remove('active');
        }
    }

    // Close modal when clicking outside
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if(e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // --- 3. Expense Input Form Logic (손익 대시보드) ---
    const expenseForm = document.getElementById('expense-form');
    const expenseTableBody = document.getElementById('expense-table-body');
    let expenses = JSON.parse(localStorage.getItem('admin_expenses')) || [];

    function renderExpenses() {
        if(!expenseTableBody) return;
        expenseTableBody.innerHTML = '';
        
        let total = 0;
        
        // 역순(최신순) 렌더링
        const sortedExpenses = [...expenses].reverse();
        
        sortedExpenses.forEach(exp => {
            total += Number(exp.amount);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${exp.date}</td>
                <td><span style="font-weight:600; color:var(--text-main);">${exp.staff}</span></td>
                <td>${exp.pax}명</td>
                <td style="color:var(--theme-pink); font-weight:700;">-₩${Number(exp.amount).toLocaleString()}</td>
            `;
            expenseTableBody.appendChild(tr);
        });

        // Update Total Spending UI
        const totalSpendingEl = document.getElementById('total-expense-amount');
        if(totalSpendingEl) {
            totalSpendingEl.innerText = `₩${total.toLocaleString()}`;
        }
    }

    if(expenseForm) {
        expenseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const date = document.getElementById('exp-date').value;
            const pax = document.getElementById('exp-pax').value;
            const staff = document.getElementById('exp-staff').value;
            const amount = document.getElementById('exp-amount').value;

            if(!date || !pax || !staff || !amount) {
                alert("모든 지출 정보를 입력해주세요.");
                return;
            }

            const newExpense = {
                id: Date.now(),
                date,
                pax,
                staff,
                amount
            };

            expenses.push(newExpense);
            localStorage.setItem('admin_expenses', JSON.stringify(expenses));
            
            // Reset form
            expenseForm.reset();
            
            // Re-render
            renderExpenses();
            alert("지출 내역이 등록되었습니다.");
        });

        // Initial Render
        renderExpenses();
    }

    // --- 4. Google Sheets Fetch Logic (Placeholder) ---
    // 오너님의 결정(Apps Script API 방식) 이후 이 부분에 fetch 로직이 들어갑니다.
    async function fetchGoogleSheetsIncome() {
        try {
            // TODO: 실제 Apps Script 웹 앱 URL이 입력될 곳
            const WEB_APP_URL = "API_URL_HERE"; 
            
            /* 
            const response = await fetch(WEB_APP_URL);
            const data = await response.json();
            
            const totalIncomeEl = document.getElementById('total-income-amount');
            if(totalIncomeEl && data.totalIncome) {
                totalIncomeEl.innerText = `₩${Number(data.totalIncome).toLocaleString()}`;
            }
            */
            
            // 테스트용 가짜 데이터 표기 (API 연결 전)
            const totalIncomeEl = document.getElementById('total-income-amount');
            if(totalIncomeEl) {
                // totalIncomeEl.innerText = `₩12,500,000`; 
            }
        } catch(e) {
            console.error("구글 시트 연동 에러:", e);
        }
    }
    
    fetchGoogleSheetsIncome();

});
