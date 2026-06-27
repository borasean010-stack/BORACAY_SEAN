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

const PRODUCT_DATA = {
    "보라카이션 패키지": [
        { name: "시그니처 (성인)", price: 320000 },
        { name: "시그니처 (소인)", price: 310000 },
        { name: "패키지 A (성인)", price: 270000 },
        { name: "패키지 A (소인)", price: 260000 },
        { name: "패키지 B (성인/소인)", price: 230000 },
        { name: "패키지 C (성인)", price: 195000 },
        { name: "패키지 C (소인)", price: 185000 },
        { name: "픽샌팩 A (성인/소인)", price: 100000 },
        { name: "픽샌팩 B (성인/소인)", price: 175000 },
        { name: "픽샌팩 C (성인)", price: 150000 },
        { name: "픽샌팩 C (소인)", price: 141000 }
    ],
    "보라카이션 투어 콤보팩": [
        { name: "콤보팩 A (호핑+고래상어+말룸) (성인)", price: 270000 },
        { name: "콤보팩 A (호핑+고래상어+말룸) (소인)", price: 260000 },
        { name: "콤보팩 B (호핑+고래상어) (성인/소인)", price: 175000 },
        { name: "콤보팩 C (호핑+말룸) (성인)", price: 150000 },
        { name: "콤보팩 C (호핑+말룸) (소인)", price: 141000 },
        { name: "콤보팩 D (말룸+고래상어) (성인)", price: 220000 },
        { name: "콤보팩 D (말룸+고래상어) (소인)", price: 210000 }
    ],
    "리버타드 고래상어 투어": [
        { name: "성인 투어", price: 128000 }
    ],
    "보라카이 왕복 픽업샌딩": [
        { name: "조인 픽업샌딩", price: 54900 }
    ],
    "블랙펄 요트호핑투어": [
        { name: "성인 투어", price: 55000 }
    ],
    "시크릿 가든 말룸파티": [
        { name: "일반 투어", price: 99000 }
    ],
    "해양스포츠": [
        { name: "제트스키 (2인)", price: 55000 },
        { name: "파라세일링 (1인)", price: 55000 },
        { name: "체험 다이빙 (1인)", price: 55000 }
    ],
    "마사지(샵별)": [
        { name: "에스파", price: 55000 },
        { name: "루나스파", price: 55000 },
        { name: "보라스파", price: 55000 },
        { name: "포세이돈 스파", price: 105000 },
        { name: "마리스 스파", price: 91000 },
        { name: "헬리오스 스파", price: 91000 },
        { name: "카바얀 스파", price: 49000 },
        { name: "아유르베다 스파", price: 55000 }
    ]
};

window.addItemRow = () => {
    const tbody = document.getElementById('item-tbody');
    const row = document.createElement('tr');
    row.className = 'item-row';
    const productOptions = Object.keys(PRODUCT_DATA).map(name => `<option value="${name}">${name}</option>`).join('');
    
    row.innerHTML = `
        <td><select class="item-select" onchange="onProductChange(this)" style="font-weight:700;">
            <option value="">상품 선택</option>
            ${productOptions}
        </select></td>
        <td><input type="number" class="item-count" value="1" min="1" oninput="calculateRow(this)" style="text-align:center;"></td>
        <td><select class="item-type" onchange="onTypeChange(this)" style="color:#007aff; font-weight:600;">
            <option value="">종류/옵션 선택</option>
        </select></td>
        <td><input type="text" class="item-subtotal" value="₩ 0" readonly style="background:#f9fafb; border:none; text-align:right; font-weight:800; color:#ff6a00;"></td>
        <td><button class="btn-remove" onclick="removeRow(this)">✕</button></td>
        <input type="hidden" class="item-price" value="0">
    `;
    tbody.appendChild(row);
};

window.onProductChange = (select) => {
    const row = select.closest('tr');
    const typeSelect = row.querySelector('.item-type');
    const productName = select.value;
    
    if (!productName) {
        typeSelect.innerHTML = '<option value="">종류 선택</option>';
        return;
    }

    const types = PRODUCT_DATA[productName];
    typeSelect.innerHTML = types.map(t => `<option value="${t.name}" data-price="${t.price}">${t.name} (₩${t.price.toLocaleString()})</option>`).join('');
    
    onTypeChange(typeSelect);
};

window.onTypeChange = (select) => {
    const row = select.closest('tr');
    const priceInput = row.querySelector('.item-price');
    const selectedOption = select.options[select.selectedIndex];
    
    priceInput.value = selectedOption.dataset.price || 0;
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
    const btn = document.querySelector('.btn-submit');
    if (btn.disabled) return;

    const rows = document.querySelectorAll('.item-row');
    if (rows.length === 0) { alert('상품을 추가해 주세요.'); return; }

    const items = [];
    let totalPrice = 0;

    rows.forEach(row => {
        const productName = row.querySelector('.item-select').value;
        const typeName = row.querySelector('.item-type').value;
        const count = parseInt(row.querySelector('.item-count').value) || 0;
        const price = parseInt(row.querySelector('.item-price').value) || 0;
        
        if (productName && typeName) {
            items.push({ 
                name: `${productName} - ${typeName}`, 
                date: "-", 
                count: count, 
                price: price 
            });
            totalPrice += (count * price);
        }
    });

    if (items.length === 0) { alert('상품 구성을 완료해 주세요.'); return; }

    try {
        btn.disabled = true;
        btn.innerText = "생성 중...";

        const docRef = await addDoc(collection(db, "reservations"), {
            customerKorName: "(고객 입력 대기)",
            contact: "-",
            items: items,
            totalPrice: totalPrice,
            status: '견적발송',
            createdAt: new Date()
        });

        const url = `${window.location.origin}/quote.html?id=${docRef.id}`;
        await navigator.clipboard.writeText(url);
        alert('견적 링크가 생성되어 복사되었습니다!\n[신규예약] 탭에서 확인 가능합니다.');
        window.close();
    } catch (e) { 
        console.error(e); 
        btn.disabled = false;
        btn.innerText = "견적서 생성 및 링크 복사";
    }
};

addItemRow();
