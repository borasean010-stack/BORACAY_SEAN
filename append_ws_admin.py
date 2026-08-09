import os

with open('admin.js', 'a', encoding='utf-8') as f:
    f.write('''

// ==========================================
// 🐋 고래상어 관리 시스템 (Whale Shark Admin)
// ==========================================
import { collection, doc, addDoc, updateDoc, onSnapshot, getDocs, query, where, orderBy, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let wsUnsubscribe = null;
let currentWsAgencies = [];

// 난수 생성 함수 (보안 토큰용)
function generateWsToken() {
    return 'ws_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// 탭 클릭 시 고래상어 데이터 리스닝 시작
window.switchDashboard = window.switchDashboard || function(tab) {
    document.getElementById('dashboard-overlay').style.display = 'block';
    document.querySelectorAll('.db-panel').forEach(p => p.style.display = 'none');
    const target = document.getElementById('db-' + tab);
    if(target) target.style.display = 'block';

    if (tab === 'whale-shark') {
        initWhaleSharkAdmin();
    } else {
        if (wsUnsubscribe) { wsUnsubscribe(); wsUnsubscribe = null; }
    }
};

function initWhaleSharkAdmin() {
    if (wsUnsubscribe) wsUnsubscribe();
    
    // 판매처 목록 리스닝
    const q = query(collection(window.db, "whale_agencies"), orderBy("createdAt", "desc"));
    wsUnsubscribe = onSnapshot(q, (snapshot) => {
        currentWsAgencies = [];
        let totalBought = 0;
        let totalUsed = 0;
        let totalRemain = 0;

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            data.id = docSnap.id;
            currentWsAgencies.push(data);
            
            totalBought += (data.totalBought || 0);
            totalUsed += (data.totalUsed || 0);
            totalRemain += (data.remainCount || 0);
        });

        document.getElementById('ws-total-bought').innerText = totalBought.toLocaleString();
        document.getElementById('ws-total-used').innerText = totalUsed.toLocaleString();
        document.getElementById('ws-total-remain').innerText = totalRemain.toLocaleString();

        renderWsAgencies();
    }, (error) => {
        console.error("고래상어 데이터 로드 에러:", error);
        Swal.fire('오류', '데이터를 불러오는 중 문제가 발생했습니다.', 'error');
    });

    // 오늘 리버타드 방문 인원 집계 (whale_daily_counts)
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    
    const todayRef = doc(window.db, "whale_daily_counts", todayStr);
    onSnapshot(todayRef, (docSnap) => {
        if (docSnap.exists()) {
            document.getElementById('ws-today-count').innerText = (docSnap.data().count || 0).toLocaleString();
        } else {
            document.getElementById('ws-today-count').innerText = "0";
        }
    });
}

function renderWsAgencies() {
    const tbody = document.getElementById('ws-agency-list');
    if (!currentWsAgencies.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="padding:30px; text-align:center; color:#aaa;">등록된 판매처가 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = currentWsAgencies.map(a => {
        const isActive = a.status !== 'INACTIVE';
        const statusBadge = isActive 
            ? `<span class="badge badge-active">활성</span>`
            : `<span class="badge badge-inactive">정지됨</span>`;
        
        return `<tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:12px; font-weight:bold; color:#333;">${a.name}</td>
            <td style="padding:12px; text-align:center;">${a.totalBought || 0}</td>
            <td style="padding:12px; text-align:center;">${a.totalUsed || 0}</td>
            <td style="padding:12px; text-align:center; font-weight:900; color:#007aff; font-size:16px;">${a.remainCount || 0}</td>
            <td style="padding:12px; text-align:center;">${statusBadge}</td>
            <td style="padding:12px; text-align:center;">
                <button class="btn-sm" onclick="showWsQr('${a.id}', '${a.name}', '${a.token}')">QR 보기</button>
            </td>
            <td style="padding:12px; text-align:right;">
                <button class="btn-sm" style="color:#007aff; border-color:#007aff;" onclick="openAddAgencyModal('${a.id}')">티켓 추가</button>
                <button class="btn-sm" onclick="toggleWsStatus('${a.id}', ${isActive})">${isActive ? '정지' : '활성화'}</button>
            </td>
        </tr>`;
    }).join('');
}

window.openAddAgencyModal = function(id = null) {
    document.getElementById('ws-agency-id').value = id || '';
    document.getElementById('ws-agency-name').value = '';
    document.getElementById('ws-agency-add-count').value = '';

    if (id) {
        const agency = currentWsAgencies.find(a => a.id === id);
        if(agency) {
            document.getElementById('ws-modal-title').innerText = '티켓 추가 충전';
            document.getElementById('ws-agency-name').value = agency.name;
            document.getElementById('ws-agency-name').readOnly = true;
            document.getElementById('ws-add-ticket-section').style.display = 'block';
        }
    } else {
        document.getElementById('ws-modal-title').innerText = '새 판매처 등록';
        document.getElementById('ws-agency-name').readOnly = false;
        document.getElementById('ws-add-ticket-section').style.display = 'none'; // 처음 등록할 땐 수량 0으로 생성
    }

    document.getElementById('ws-agency-modal').style.display = 'flex';
};

window.closeWsAgencyModal = function() {
    document.getElementById('ws-agency-modal').style.display = 'none';
};

window.saveWsAgency = async function() {
    const id = document.getElementById('ws-agency-id').value;
    const name = document.getElementById('ws-agency-name').value.trim();
    const addCount = parseInt(document.getElementById('ws-agency-add-count').value) || 0;

    if (!name) { Swal.fire('알림', '판매처명을 입력해주세요.', 'warning'); return; }
    
    try {
        if (id) {
            // 기존 업체 티켓 충전
            const agency = currentWsAgencies.find(a => a.id === id);
            if (!agency) return;
            
            if (addCount > 0) {
                const newRemain = (agency.remainCount || 0) + addCount;
                const newTotal = (agency.totalBought || 0) + addCount;
                
                await updateDoc(doc(window.db, "whale_agencies", id), {
                    remainCount: newRemain,
                    totalBought: newTotal,
                    updatedAt: new Date().toISOString()
                });

                // 트랜잭션 로그 기록
                await addDoc(collection(window.db, "whale_transactions"), {
                    agencyId: id,
                    type: 'ADD',
                    amount: addCount,
                    createdAt: new Date().toISOString()
                });
                Swal.fire('성공', `티켓 ${addCount}장이 충전되었습니다.`, 'success');
            } else {
                Swal.fire('알림', '추가할 수량을 입력해주세요.', 'warning');
                return;
            }
        } else {
            // 새 판매처 등록
            const token = generateWsToken();
            await addDoc(collection(window.db, "whale_agencies"), {
                name: name,
                totalBought: 0,
                totalUsed: 0,
                remainCount: 0,
                token: token,
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            Swal.fire('성공', '새 판매처가 등록되었습니다. 이제 티켓을 추가할 수 있습니다.', 'success');
        }
        closeWsAgencyModal();
    } catch(e) {
        console.error(e);
        Swal.fire('오류', '저장 중 오류가 발생했습니다.', 'error');
    }
};

window.toggleWsStatus = async function(id, currentActive) {
    const newStatus = currentActive ? 'INACTIVE' : 'ACTIVE';
    const confirmMsg = currentActive ? '이 판매처의 QR을 정지하시겠습니까?' : '이 판매처를 다시 활성화하시겠습니까?';
    
    if (!confirm(confirmMsg)) return;

    try {
        await updateDoc(doc(window.db, "whale_agencies", id), {
            status: newStatus,
            updatedAt: new Date().toISOString()
        });
    } catch(e) {
        console.error(e);
        alert('상태 변경 실패');
    }
};

// QR 코드 생성 및 표시
let wsQrCodeInstance = null;
window.showWsQr = function(id, name, token) {
    document.getElementById('ws-qr-agency-name').innerText = name;
    const container = document.getElementById('ws-qrcode-container');
    container.innerHTML = ''; // 초기화
    
    // 리버타드 전용 카운터 URL + 토큰
    const baseUrl = window.location.origin; // 현재 도메인
    const qrUrl = `${baseUrl}/whale-counter.html?token=${token}`;
    
    wsQrCodeInstance = new QRCode(container, {
        text: qrUrl,
        width: 200,
        height: 200,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    document.getElementById('ws-qr-modal').style.display = 'flex';
};

window.closeWsQrModal = function() {
    document.getElementById('ws-qr-modal').style.display = 'none';
};

window.downloadWsQr = function() {
    const container = document.getElementById('ws-qrcode-container');
    const img = container.querySelector('img');
    if (!img || !img.src) {
        alert('QR 코드가 아직 생성되지 않았습니다.');
        return;
    }
    
    const name = document.getElementById('ws-qr-agency-name').innerText;
    const link = document.createElement('a');
    link.href = img.src;
    link.download = `고래상어_QR_${name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
''')
print("Whale Shark Admin appended to admin.js")
