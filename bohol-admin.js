// bohol-admin.js - Simplified & Dedicated Admin for BOHOL SEAN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, where, getDocs, addDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
} catch (e) { console.error("Bohol Firebase Init Error", e); }

// 🏝️ 보홀 리조트 매핑 데이터 (주신 목록 기준)
const BOHOL_RESORT_MAP = {
    'H.ALONA': '헤난 알로나',
    'H.TAWALA': '헤난 타왈라',
    'H.PMR': '헤난 프리미어',
    'BE GRAND': '비그랜드',
    'MITHI': '미티',
    'MGH': '미티 가든',
    'BBC': '보홀 비치 클럽',
    'MODALA': '모달라',
    'BS': 'BS 리조트',
    'BS RESORT': 'BS 리조트',
    'AMIHAN': '아미한',
    'RAMEDE': '라메디',
    'DANBI': '단비',
    'BLUEWATER': '블루워터',
    'SOUTH PALMS': '사우스팜',
    'JOLIBEE': '졸리비',
    'BATHALA': '바탈라',
    'TAMARIND': '타마린드',
    'ALONA NORTHLAND': '알로나 노스랜드',
    'LUXU HOTEL': '럭스 호텔',
    'COCO TREE': '코코 트리',
    'ALONA DE TROPICANA': '알로나 데 트로피카나',
    'CLIFFSIDE': '클리프사이드',
    'OHANA': '오하나',
    'MOLLY RESORT': '몰리 리조트',
    'HOLABAY': '홀라베이',
    'ADELA': '아델라'
};

function translateBoholResort(name) {
    if (!name || name === '-') return '-';
    let cleanName = name.toUpperCase().replace('DROP :', '').trim();
    if (cleanName.includes('/')) {
        return cleanName.split('/').map(part => translateBoholResort(part.trim())).join(' / ');
    }
    for (const [key, val] of Object.entries(BOHOL_RESORT_MAP)) {
        if (cleanName.includes(key)) return val;
    }
    return cleanName;
}

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const adminContainer = document.getElementById('admin-container');

    let allSchedules = [];
    let currentScheduleDay = 'today';

    function showAdminPanel() {
        loginContainer.style.display = 'none';
        adminContainer.style.display = 'flex';
        fetchData();
    }

    if (sessionStorage.getItem('isBoholAdminLoggedIn') === 'true') { showAdminPanel(); }

    document.getElementById('login-form').onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('username').value.trim();
        const pw = document.getElementById('password').value.trim();
        // 보홀 전용 로그인 계정
        if ((id === 'admin' || id === 'bohol') && pw === 'bohol1234!') {
            sessionStorage.setItem('isBoholAdminLoggedIn', 'true');
            sessionStorage.setItem('adminId', id);
            showAdminPanel();
        } else { alert('아이디 또는 비밀번호가 올바르지 않습니다.'); }
    };

    document.getElementById('logout-btn').onclick = () => { sessionStorage.removeItem('isBoholAdminLoggedIn'); location.reload(); };

    function fetchData() {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        // 보홀 전용 스케줄 컬렉션 사용
        onSnapshot(query(collection(db, "bohol_schedules"), orderBy("date", "asc")), (snap) => {
            allSchedules = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderAll();
        });
    }

    function renderAll() {
        updateDates();
        renderSchedule();
    }

    function updateDates() {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const tomorrow = new Date(now.getTime() + 86400000);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        document.getElementById('box-date-today').innerText = todayStr;
        document.getElementById('box-date-tomorrow').innerText = tomorrowStr;
    }

    window.switchScheduleDay = (day) => { 
        currentScheduleDay = day; 
        document.getElementById('tool-box-today').classList.toggle('active', day === 'today');
        document.getElementById('tool-box-tomorrow').classList.toggle('active', day === 'tomorrow');
        renderSchedule(); 
    };

    function renderSchedule() {
        const container = document.getElementById('active-timeline');
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().split('T')[0];
        const targetDate = (currentScheduleDay === 'tomorrow') ? tomorrowStr : todayStr;
        document.getElementById('schedule-title-date').innerText = targetDate;

        const items = allSchedules.filter(s => s.date === targetDate);
        if (items.length === 0) {
            container.innerHTML = `<div class="sc-empty" style="width:100%; text-align:center; padding:40px; color:#999;">등록된 일정이 없습니다. (${targetDate})</div>`;
            return;
        }

        container.innerHTML = items.map(it => `
            <div class="schedule-group-card" style="min-width:280px; background:#fff; border-radius:12px; padding:15px; box-shadow:0 4px 10px rgba(0,0,0,0.05); border-left:5px solid #ff6a00;">
                <div class="sg-header" style="margin-bottom:10px; border-bottom:1px solid #f0f0f0; padding-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                    <div class="sg-time" style="font-weight:900; color:#ff6a00; font-size:16px;">${it.time}</div>
                    <div style="font-size:12px; color:#888;">${it.count}인</div>
                </div>
                <div class="sg-body">
                    <div style="font-weight:800; font-size:15px; margin-bottom:5px;">${it.customerName}</div>
                    <div style="font-size:13px; color:#333; margin-bottom:8px;">${it.name}</div>
                    <div style="font-size:12px; color:#666; background:#f8f9fa; padding:8px; border-radius:6px;">
                        📍 ${it.resort || '-'} / ✈️ ${it.flight || '-'}
                    </div>
                </div>
            </div>
        `).join('');
    }

    window.showInputArea = (type) => { 
        window.hideInputArea();
        document.getElementById(`input-area-${type}`).style.display = 'block'; 
    };
    window.hideInputArea = () => { 
        document.querySelectorAll('.input-area-card').forEach(el => el.style.display = 'none'); 
    };

    // 🎫 보홀 퀵바우처 생성 로직
    window.makeQuickVoucher = async () => {
        const inputVal = document.getElementById('quick-voucher-input').value.trim();
        if (!inputVal) return;
        
        const rows = inputVal.split('\n').map(r => r.split('\t'));
        const currentYear = new Date().getFullYear();

        try {
            for (const row of rows) {
                if (row.length < 10) continue;
                const korName = row[15] || row[10];
                const contact = row[14] || '-';
                const resortRaw = row[9] || '-';
                const remark = row[16] || '';
                const pax = parseInt(row[11]) || 1;

                const items = [];
                // 보홀 투어 자동 인식 로직
                if (remark.toUpperCase().includes('HOPPING') || remark.includes('호핑')) {
                    let time = "07:30";
                    if (remark.includes('07:00')) time = "07:00";
                    let name = remark.toUpperCase().includes('P.HOPPING') ? "보홀션 단독 호핑투어" : "보홀션 샤인 호핑투어";
                    items.push({ name, date: row[0] ? `${currentYear}-${row[0].replace('/', '-').padStart(5, '0')}` : '-', time, count: pax });
                }

                const resData = {
                    customerKorName: korName,
                    contact: contact,
                    pickupResort: translateBoholResort(resortRaw),
                    items: items,
                    status: '예약확정',
                    createdAt: new Date(),
                    region: 'bohol'
                };

                const docRef = await addDoc(collection(db, "bohol_quick_vouchers"), resData);
                const url = `${window.location.origin}/bohol-voucher.html?id=${docRef.id}`;
                
                // 클립보드 복사 및 알림
                navigator.clipboard.writeText(url);
                alert(`보홀션 바우처 링크 생성 완료!\n대상: ${korName}님\n링크가 클립보드에 복사되었습니다.`);
            }
            document.getElementById('quick-voucher-input').value = '';
            window.hideInputArea();
        } catch (e) {
            console.error(e);
            alert("바우처 생성 중 오류가 발생했습니다.");
        }
    };

    // 📤 보홀 스케줄 일괄 등록 로직
    window.registerBulkSchedule = async () => {
        const input = document.getElementById('schedule-reg-input').value.trim();
        if (!input) return;
        
        const rows = input.split('\n').map(r => r.split('\t'));
        const currentYear = new Date().getFullYear();
        const batch = writeBatch(db);
        let count = 0;

        try {
            for (const row of rows) {
                if (row.length < 10) continue;
                const korName = row[15] || row[10];
                const pax = parseInt(row[11]) || 1;
                const resortRaw = row[9] || '-';
                const remark = row[16] || '';
                
                if (remark.toUpperCase().includes('HOPPING') || remark.includes('호핑')) {
                    const docRef = doc(collection(db, "bohol_schedules"));
                    let time = "07:30";
                    if (remark.includes('07:00')) time = "07:00";
                    
                    batch.set(docRef, {
                        date: row[0] ? `${currentYear}-${row[0].replace('/', '-').padStart(5, '0')}` : '-',
                        time: time,
                        name: remark.toUpperCase().includes('P.HOPPING') ? "단독 호핑" : "조인 호핑",
                        customerName: korName,
                        count: pax,
                        resort: translateBoholResort(resortRaw),
                        createdAt: new Date()
                    });
                    count++;
                }
            }
            await batch.commit();
            alert(`${count}건의 보홀 스케줄이 성공적으로 업데이트되었습니다.`);
            document.getElementById('schedule-reg-input').value = '';
            window.hideInputArea();
        } catch (e) {
            console.error(e);
            alert("스케줄 등록 중 오류가 발생했습니다.");
        }
    };

    window.handleClearSchedules = async () => {
        if (!confirm("현재 등록된 보홀 모든 스케줄을 초기화하시겠습니까?")) return;
        try {
            const snap = await getDocs(collection(db, "bohol_schedules"));
            const batch = writeBatch(db);
            snap.docs.forEach(d => batch.delete(d.ref));
            await batch.commit();
            alert("보홀 일정이 초기화되었습니다.");
        } catch (e) { alert("초기화 실패"); }
    };

    window.closeModal = () => { document.getElementById('res-detail-modal').style.display = 'none'; };
});
