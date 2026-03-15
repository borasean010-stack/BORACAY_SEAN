
import os
import re

massage_files = [
    ('aspa.html', '아유르베다', [
        {'name': '태반 마사지', 'price': 55000},
        {'name': '아로마 마사지', 'price': 55000},
        {'name': '스톤 마사지', 'price': 55000},
        {'name': '성장 마사지 (1시간)', 'price': 42000},
        {'name': '성장 마사지 (2시간)', 'price': 55000}
    ]),
    ('boraspa.html', '보라스파', [
        {'name': '꿀 마사지', 'price': 55000},
        {'name': '태반 마사지', 'price': 55000},
        {'name': '진주 마사지', 'price': 55000},
        {'name': '성장 마사지 (1시간)', 'price': 42000},
        {'name': '성장 마사지 (2시간)', 'price': 55000}
    ]),
    ('helios.html', '헬리오스', [
        {'name': '허니 스톤', 'price': 91000},
        {'name': '코코 스파', 'price': 105000},
        {'name': '허니 스톤 + 코코 스파', 'price': 119000},
        {'name': '성장 마사지 (1시간)', 'price': 42000},
        {'name': '성장 마사지 (2시간)', 'price': 55000}
    ]),
    ('spa.html', '에스파', [
        {'name': '퓨어오일 마사지', 'price': 55000},
        {'name': '태반 마사지', 'price': 55000},
        {'name': '스톤 마사지', 'price': 55000},
        {'name': '힐롯 마사지', 'price': 55000},
        {'name': '포핸드 마사지', 'price': 85000},
        {'name': '성장 마사지 (1시간)', 'price': 42000},
        {'name': '성장 마사지 (2시간)', 'price': 55000}
    ]),
    ('maris.html', '마리스', [
        {'name': '스톤 마사지', 'price': 91000},
        {'name': '성장 마사지 (1시간)', 'price': 42000},
        {'name': '성장 마사지 (2시간)', 'price': 55000}
    ]),
    ('kabayan.html', '카바얀', [
        {'name': '해피아워 마사지', 'price': 49000},
        {'name': '태반 마사지', 'price': 55000},
        {'name': '스톤 마사지', 'price': 55000},
        {'name': '성장 마사지 (1시간)', 'price': 42000},
        {'name': '성장 마사지 (2시간)', 'price': 55000}
    ]),
    ('poseidon.html', '포세이돈', [
        {'name': '포세이돈 스파', 'price': 105000},
        {'name': '성장 마사지 (1시간)', 'price': 42000},
        {'name': '성장 마사지 (2시간)', 'price': 55000}
    ]),
    ('luna.html', '루나스파', [
        {'name': '태반 마사지', 'price': 55000},
        {'name': '스톤 마사지', 'price': 55000},
        {'name': '노니씨드 오일 마사지', 'price': 70000},
        {'name': '타이거 오일 마사지', 'price': 77000},
        {'name': '성장 마사지 (1시간)', 'price': 42000},
        {'name': '성장 마사지 (2시간)', 'price': 55000}
    ])
]

def get_time_slots(filename):
    if filename == 'boraspa.html': return ['12:30', '14:30', '17:00', '19:30']
    if filename in ['spa.html', 'aspa.html']: return ['12:30', '14:30', '16:30', '18:30', '19:30']
    if filename == 'helios.html': return ['09:30', '13:00', '16:30', '19:30']
    return ['12:30', '14:30', '16:30', '19:30']

for filename, spa_name, options in massage_files:
    if not os.path.exists(filename): continue
    with open(filename, 'r', encoding='utf-8') as f: content = f.read()
    
    time_slots = get_time_slots(filename)
    time_tabs_html = '\n'.join([f'                <div class="selection-tab{" active" if i==0 else ""}" onclick="selectTime(\'{t}\', this)">{t}</div>' for i, t in enumerate(time_slots)])
    m_time_tabs_html = '\n'.join([f'            <div class="selection-tab{" active" if i==0 else ""}" onclick="selectTime(\'{t}\', this)">{t}</div>' for i, t in enumerate(time_slots)])

    options_js = str(options).replace("'", '"')
    script_part = f'''<script>
    const massageOptions = {options_js};
    let selectedQuantities = {{}}; 
    let currentDate = new Date(2026, 2, 1);
    let selectedDate = '2026-03-02';
    let selectedTime = '{time_slots[0]}';

    function initSelectors() {{
        const containers = [document.getElementById('type-selectors'), document.getElementById('m-type-selectors')];
        containers.forEach(container => {{
            if (!container) return;
            container.innerHTML = '';
            massageOptions.forEach(opt => {{
                const row = document.createElement('div');
                row.style.cssText = 'display:grid; grid-template-columns: 1fr auto; gap: 2px 8px; padding:6px 10px; background:#fcfcfc; border-radius:10px; border:1px solid #f0f0f0; align-items:center;';
                row.innerHTML = `
                    <div style="font-size:12px; font-weight:700; color:#333; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${{opt.name}}</div>
                    <div style="font-size:10px; color:#999; text-align:center; font-weight:600; line-height:1;">수량</div>
                    <div style="font-size:11px; color:#ff6a00; font-weight:800;">₩ ${{opt.price.toLocaleString()}}</div>
                    <div class="counter" style="gap:4px; border:none; background:none; padding:0;">
                        <button class="count-btn" style="width:22px; height:22px; font-size:12px;" onclick="updateQty('${{opt.name}}', -1)">-</button>
                        <strong class="qty-display" style="font-size:13px; width:18px;" data-name="${{opt.name}}">0</strong>
                        <button class="count-btn" style="width:22px; height:22px; font-size:12px;" onclick="updateQty('${{opt.name}}', 1)">+</button>
                    </div>
                `;
                container.appendChild(row);
            }});
        }});
        updateQty(massageOptions[0].name, 1);
    }}

    function updateQty(name, delta) {{
        const current = selectedQuantities[name] || 0;
        const next = Math.max(0, current + delta);
        if (next === 0) delete selectedQuantities[name];
        else selectedQuantities[name] = next;
        document.querySelectorAll(`.qty-display[data-name="${{name}}"]`).forEach(el => {{
            el.innerText = next;
            el.style.color = next > 0 ? '#ff6a00' : '#bbb';
        }});
        updateTotal();
    }}

    function updateTotal() {{
        let totalCount = 0; let totalPrice = 0;
        for (const name in selectedQuantities) {{
            const qty = selectedQuantities[name];
            const opt = massageOptions.find(o => o.name === name);
            totalCount += qty; totalPrice += (opt.price * qty);
        }}
        const tcDisp = document.getElementById('total-count-display');
        if(tcDisp) tcDisp.innerText = totalCount;
        const mtcDisp = document.getElementById('m-total-count-display');
        if(mtcDisp) mtcDisp.innerText = totalCount;
        const priceDisplays = document.querySelectorAll('#display-price');
        priceDisplays.forEach(d => d.innerText = '₩ ' + totalPrice.toLocaleString());
    }}

    function openOptionSheet() {{ 
        document.getElementById('sheetOverlay')?.classList.add('active'); 
        document.getElementById('optionSheet')?.classList.add('active'); 
    }}
    function closeOptionSheet() {{ 
        document.getElementById('sheetOverlay')?.classList.remove('active'); 
        document.getElementById('optionSheet')?.classList.remove('active'); 
    }}

    function selectTime(time, el) {{
        selectedTime = time;
        document.querySelectorAll('.selection-tab').forEach(tab => {{
            if (tab.innerText === time) tab.classList.add('active');
            else if (tab.parentElement.id === 'time-tabs' || tab.parentElement.id === 'm-time-tabs') tab.classList.remove('active');
        }});
    }}

    function changeMonth(delta) {{
        currentDate.setMonth(currentDate.getMonth() + delta);
        renderCalendar('pc-days', 'pc-month');
        renderCalendar('m-days', 'm-month');
    }}

    function renderCalendar(cid, tid) {{
        const container = document.getElementById(cid);
        const title = document.getElementById(tid);
        if(!container || !title) return;
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        title.innerText = `${{year}}년 ${{month + 1}}월`;
        container.innerHTML = '';
        ['일','월','화','수','목','금','토'].forEach(d => container.innerHTML += `<div style="color:#bbb; font-weight:800; font-size:12px;">${{d}}</div>`);
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const today = new Date(); today.setHours(0, 0, 0, 0);
        for (let i = 0; i < firstDay; i++) container.appendChild(document.createElement('div'));
        for (let i = 1; i <= lastDate; i++) {{
            const dateStr = `${{year}}-${{(month+1).toString().padStart(2,'0')}}-${{i.toString().padStart(2,'0')}}`;
            const targetDate = new Date(year, month, i);
            const div = document.createElement('div');
            if (targetDate < today) {{ div.className = 'day disabled'; }}
            else {{
                div.className = 'day' + (dateStr === selectedDate ? ' selected' : '');
                div.onclick = function() {{
                    selectedDate = dateStr;
                    const pcDisp = document.getElementById('pc-date-display');
                    if(pcDisp) pcDisp.innerText = dateStr;
                    renderCalendar('pc-days', 'pc-month');
                    renderCalendar('m-days', 'm-month');
                }};
            }}
            div.innerText = i;
            container.appendChild(div);
        }}
    }}

    function getSelectedItems() {{
        const items = [];
        for (const name in selectedQuantities) {{
            const qty = selectedQuantities[name];
            const opt = massageOptions.find(o => o.name === name);
            items.push({{
                name: "{spa_name} - " + name,
                price: opt.price,
                count: qty,
                date: selectedDate,
                time: selectedTime
            }});
        }}
        return items;
    }}

    function handleBuy() {{
        const items = getSelectedItems();
        if (items.length === 0) {{ alert('최소 1명 이상의 마사지를 선택해주세요.'); return; }}
        sessionStorage.setItem('directBuyItem', JSON.stringify(items));
        window.open('booking-form.html', '_blank');
    }}

    function addToCart() {{
        const items = getSelectedItems();
        if (items.length === 0) {{ alert('최소 1명 이상의 마사지를 선택해주세요.'); return; }}
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        items.forEach(item => cart.push(item));
        localStorage.setItem('cart', JSON.stringify(cart));
        if(confirm('장바구니에 담겼습니다. 이동하시겠습니까?')) {{ window.location.assign('cart.html'); }}
    }}

    window.onload = () => {{ 
        initSelectors();
        renderCalendar('pc-days', 'pc-month'); 
        renderCalendar('m-days', 'm-month'); 
    }};
</script>'''

    content = re.sub(r'<script>.*?const massageOptions =.*?</script>', script_part, content, flags=re.DOTALL)
    
    # Extra shrinkage
    content = content.replace('font-size:24px; font-weight:900; color:#ff6a00; margin-bottom:15px;', 'font-size:24px; font-weight:900; color:#ff6a00; margin-bottom:10px;')
    content = content.replace('margin-bottom: 12px; border: 1px solid #eee; border-radius: 16px; padding: 10px;', 'margin-bottom: 8px; border: 1px solid #eee; border-radius: 16px; padding: 10px;')
    content = content.replace('.selection-container {\n    margin-bottom: 8px;', '.selection-container {\n    margin-bottom: 6px;')

    with open(filename, 'w', encoding='utf-8') as f: f.write(content)
