import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDkDjmGKQDF-0Vu2S_qtI6W5Hf2-j4tKcM",
    authDomain: "boracaysean-69b4a.firebaseapp.com",
    projectId: "boracaysean-69b4a",
    storageBucket: "boracaysean-69b4a.firebasestorage.app",
    messagingSenderId: "806585874771",
    appId: "1:806585874771:web:64a094d241730ca38109a6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PRODUCTS = [
    { name: "선택하세요", price: 0 },
    { name: "보라카이 왕복 픽업샌딩", price: 54900 },
    { name: "블랙펄 요트호핑투어", price: 85000 },
    { name: "시크릿가든 말룸파티", price: 99000 },
    { name: "프리다이빙 체험", price: 112500 },
    { name: "보라카이 랜드투어", price: 45000 },
    { name: "JL 스냅사진 촬영", price: 300000 },
    { name: "보라아재 호핑투어", price: 180000 },
    { name: "파라세일링", price: 55000 },
    { name: "체험 다이빙", price: 55000 },
    { name: "헬멧 다이빙", price: 44000 },
    { name: "제트스키", price: 55000 },
    { name: "페어웨이 골프클럽", price: 192000 },
    { name: "아유르베다 스파", price: 55000 },
    { name: "에스파 (S-SPA)", price: 55000 },
    { name: "포세이돈 스파", price: 105000 },
    { name: "마리스 스파", price: 91000 },
    { name: "카바얀 스파", price: 49000 },
    { name: "루나 스파", price: 55000 },
    { name: "보라스파", price: 55000 },
    { name: "헬리오스 스파", price: 91000 },
    { name: "기타(수동입력)", price: 0 }
];

window.addItemRow = () => {
    const tbody = document.getElementById('item-tbody');
    const row = document.createElement('tr');
    row.className = 'item-row';
    
    const options = PRODUCTS.map(p => `<option value="${p.name}" data-price="${p.price}">${p.name}</option>`).join('');
    
    row.innerHTML = `
        <td><input type="date" class="item-date"></td>
        <td><select class="item-select" onchange="onProductChange(this)">${options}</select></td>
        <td><input type="number" class="item-count" value="1" min="1" oninput="calculateRow(this)"></td>
        <td><input type="number" class="item-price" value="0" oninput="calculateRow(this)"></td>
        <td><input type="text" class="item-subtotal" value="₩ 0" readonly></td>
        <td><button class="btn-remove" onclick="removeRow(this)">✕</button></td>
    `;
    tbody.appendChild(row);
};

window.onProductChange = (select) => {
    const row = select.closest('tr');
    const priceInput = row.querySelector('.item-price');
    const selectedOption = select.options[select.selectedIndex];
    priceInput.value = selectedOption.dataset.price;
    calculateRow(select);
};

window.calculateRow = (el) => {
    const row = el.closest('tr');
    const count = parseInt(row.querySelector('.item-count').value) || 0;
    const price = parseInt(row.querySelector('.item-price').value) || 0;
    const subtotal = count * price;
    row.querySelector('.item-subtotal').value = '₩ ' + subtotal.toLocaleString();
    updateTotal();
};

window.removeRow = (btn) => {
    btn.closest('tr').remove();
    updateTotal();
};

function updateTotal() {
    let total = 0;
    document.querySelectorAll('.item-row').forEach(row => {
        const count = parseInt(row.querySelector('.item-count').value) || 0;
        const price = parseInt(row.querySelector('.item-price').value) || 0;
        total += (count * price);
    });
    document.getElementById('total-amount').innerText = '₩ ' + total.toLocaleString();
}

window.submitQuote = async () => {
    const name = document.getElementById('customer-name').value.trim();
    const contact = document.getElementById('customer-contact').value.trim();
    const rows = document.querySelectorAll('.item-row');
    
    if (!name || rows.length === 0) {
        alert('고객명과 최소 하나의 상품 항목이 필요합니다.');
        return;
    }

    const items = [];
    let totalPrice = 0;

    rows.forEach(row => {
        const productName = row.querySelector('.item-select').value;
        const date = row.querySelector('.item-date').value;
        const count = parseInt(row.querySelector('.item-count').value) || 0;
        const price = parseInt(row.querySelector('.item-price').value) || 0;
        
        if (productName !== '선택하세요') {
            items.push({ name: productName, date, count, price });
            totalPrice += (count * price);
        }
    });

    try {
        const docRef = await addDoc(collection(db, "reservations"), {
            customerKorName: name,
            contact: contact,
            items: items,
            totalPrice: totalPrice,
            status: '견적발송',
            createdAt: new Date()
        });

        const url = `${window.location.origin}/quote.html?id=${docRef.id}`;
        await navigator.clipboard.writeText(url);
        alert('견적서가 저장되었습니다!\n링크가 클립보드에 복사되었습니다.');
        window.close();
    } catch (e) {
        console.error(e);
        alert('저장 중 오류가 발생했습니다.');
    }
};

// 초기 행 하나 추가
addItemRow();
