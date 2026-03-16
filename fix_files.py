import os
import re

files = [
    "scuba-diving.html", "freediving.html", "hopping-tour.html", "land-tour.html",
    "jl-snap.html", "bora-ajae-hopping.html", "parasailing.html", "helmet-diving.html",
    "jetski.html", "golf.html", "pickup-sending.html", "malumpati.html",
    "aspa.html", "boraspa.html", "helios.html", "spa.html",
    "poseidon.html", "maris.html", "kabayan.html", "luna.html"
]

common_css = """
    body { background: #fdfdfd; padding-bottom: 100px; }
    .tour-detail-container { 
        max-width: 1100px; 
        margin: 120px auto 50px; 
        display: grid; 
        grid-template-columns: 1fr 360px; 
        gap: 40px; 
        padding: 0 20px; 
    }
    .tour-content { 
        background: white; 
        padding: 40px; 
        border-radius: 28px; 
        box-shadow: 0 15px 40px rgba(0,0,0,0.03); 
        border: 1px solid #f5f5f5;
    }
    .tour-content h1 { font-size: 32px; font-weight: 900; margin-bottom: 30px; letter-spacing: -1.5px; }
    .section-title { 
        font-size: 20px; 
        font-weight: 800; 
        margin: 40px 0 20px; 
        padding-bottom: 12px; 
        border-bottom: 2px solid #fff5eb; 
        color: #ff6a00; 
    }
    .itinerary-img { width: 100%; margin-bottom: 30px; }
    .itinerary-img img { width: 100%; border-radius: 20px; display: block; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
    
    .date-tabs { display: flex; gap: 5px; margin-bottom: 10px; background: #f8f9fa; padding: 5px; border-radius: 12px; }
    .date-tab { flex: 1; padding: 8px 5px; text-align: center; font-size: 12px; font-weight: 700; cursor: pointer; border-radius: 10px; transition: 0.2s; color: #888; border: 1px solid transparent; }
    .date-tab.active { background: white; color: #ff6a00; border-color: #eee; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .date-display { font-size: 12px; display: block; margin-top: 4px; color: #ff6a00; font-weight: 800; }

    .reservation-box { 
        background: white; 
        border-radius: 28px; 
        padding: 24px; 
        box-shadow: 0 20px 50px rgba(0,0,0,0.08); 
        position: sticky; 
        top: 100px; 
        border: 1px solid #f0f0f0; 
        height: fit-content;
    }
    
    .price-header { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #f8f8f8; }
    .price-label { font-size: 14px; color: #888; font-weight: 700; margin-bottom: 4px; display: block; }
    .price-value { font-size: 28px; font-weight: 900; color: #ff6a00; letter-spacing: -1px; }

    .day { padding: 10px 0; cursor: pointer; border-radius: 8px; font-size: 13px; font-weight: 600; }
    .day:hover { background: #fff1e6; }
    .day.selected { background: #ff6a00 !important; color: white !important; font-weight: 800; }
    .day.selected-pickup { background: #ff6a00 !important; color: white !important; font-weight: 800; position: relative; }
    .day.selected-pickup::after { content: '픽업'; position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); font-size: 8px; }
    .day.selected-sending { background: #00c4ff !important; color: white !important; font-weight: 800; position: relative; }
    .day.selected-sending::after { content: '샌딩'; position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); font-size: 8px; }

    .btn-buy { width: 100%; padding: 18px; background: #111; color: white; border: none; border-radius: 18px; font-size: 17px; font-weight: 800; cursor: pointer; transition: 0.3s; }
    .btn-cart { width: 100%; padding: 16px; background: white; color: #ff6a00; border: 2px solid #ff6a00; border-radius: 18px; font-size: 16px; font-weight: 800; cursor: pointer; transition: 0.3s; }
    .btn-buy:hover { background: #ff6a00; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(255,106,0,0.2); }
    .btn-cart:hover { background: #fff5eb; }

    .person-selector { background:#fcfcfc; border-radius:24px; border:1px solid #f0f0f0; padding:20px; margin-bottom:20px; }
    .person-row { margin-bottom: 15px; }
    .person-row:last-child { margin-bottom: 0; }
    .person-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .person-price-calc { text-align: right; font-size: 13px; color: #888; font-weight: 600; }
    .person-price-calc b { color: #333; }

    .total-summary { 
        padding-top: 20px; 
        border-top: 2px solid #f8f8f8; 
        margin-top: 20px; 
        display: flex; 
        justify-content: space-between; 
        align-items: center;
        margin-bottom: 20px;
    }
    .total-summary span { font-size: 16px; font-weight: 800; color: #111; }
    .total-summary b { font-size: 28px; font-weight: 900; color: #ff6a00; letter-spacing: -1px; }

    @media (max-device-width: 1024px) {
        .tour-detail-container { grid-template-columns: 1fr; margin-top: 90px; }
        .reservation-box { display: none; }
        .mobile-bottom-bar { 
            display: flex; position: fixed; bottom: 0; left: 0; width: 100%; 
            background: white; padding: 12px 20px; box-shadow: 0 -10px 30px rgba(0,0,0,0.08); 
            z-index: 9000; align-items: center;
        }
        .m-btn-buy { flex: 1; height: 55px; background: #ff6a00; color: white; border: none; border-radius: 15px; font-size: 17px; font-weight: 800; }
    }
"""

def fix_file(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update CSS
    content = re.sub(r'<style>.*?</style>', f'<style>{common_css}</style>', content, flags=re.DOTALL)

    # 2. Extract Base Price
    price_val = "₩ 0"
    price_match = re.search(r'ADULT_PRICE\s*=\s*(\d+)', content)
    if not price_match:
        price_match = re.search(r'"price":\s*(\d+)', content)
    if price_match:
        price_val = f"₩ {int(price_match.group(1)):,}"

    # 3. Update Reservation Box surgically
    start_tag = '<div class="reservation-box">'
    start_idx = content.find(start_tag)
    if start_idx != -1:
        # Find the end of reservation-box by counting divs
        balance = 0
        end_idx = -1
        for i in range(start_idx, len(content)):
            if content[i:i+4] == '<div':
                balance += 1
            elif content[i:i+6] == '</div>':
                balance -= 1
                if balance == 0:
                    end_idx = i + 6
                    break
        
        if end_idx != -1:
            old_box = content[start_idx:end_idx]
            
            # Determine features to keep
            is_massage = any(x in file_path for x in ["aspa.html", "boraspa.html", "helios.html", "spa.html", "poseidon.html", "maris.html", "kabayan.html", "luna.html"])
            is_pickup = "pickup-sending.html" in file_path
            
            new_box = f'<div class="reservation-box">\n'
            new_box += f'        <div class="price-header">\n'
            new_box += f'            <span class="price-label">1인 기준</span>\n'
            new_box += f'            <div class="price-value" id="display-price">{price_val}</div>\n'
            new_box += f'        </div>\n'
            
            if is_pickup:
                new_box += """
        <div class="date-tabs" id="pc-date-tabs">
            <div class="date-tab active" onclick="setMode('pickup')">픽업 날짜<span id="pc-pickup-display" class="date-display">선택 안함</span></div>
            <div class="date-tab" onclick="setMode('sending')">샌딩 날짜<span id="pc-sending-display" class="date-display" style="color:#00c4ff;">선택 안함</span></div>
        </div>
"""
            else:
                new_box += """
        <div class="date-tabs">
            <div class="date-tab active">예약 날짜 선택<span id="pc-date-display" class="date-display">2026-03-02</span></div>
        </div>
"""
            
            new_box += """
        <div class="calendar-wrap" style="margin-bottom: 20px; border: 1px solid #eee; border-radius: 16px; padding: 10px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <button onclick="changeMonth(-1)" style="border:none; background:none; color:#ff6a00; font-weight:800; cursor:pointer;">&lt;</button>
                <strong id="pc-month">2026년 3월</strong>
                <button onclick="changeMonth(1)" style="border:none; background:none; color:#ff6a00; font-weight:800; cursor:pointer;">&gt;</button>
            </div>
            <div class="calendar-grid" id="pc-days" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center;"></div>
        </div>
"""

            # Keep specific parts
            if is_massage:
                # Extract time-tabs if present
                time_tabs_match = re.search(r'<div class="selection-tabs" id="(?:pc-)?time-tabs">.*?</div>', old_box, re.DOTALL)
                time_tabs_html = time_tabs_match.group(0) if time_tabs_match else '<div class="selection-tabs" id="time-tabs"></div>'
                new_box += f"""
        <div class="selection-container">
            <span class="selection-label" style="font-weight:800; font-size:14px; margin-bottom:10px; display:block;">마사지 종류 및 인원 선택</span>
            <div id="type-selectors" style="display: grid; grid-template-columns: 1fr; gap: 8px;"></div>
        </div>
        <div class="selection-container" style="margin-top:20px;">
            <span class="selection-label" style="font-weight:800; font-size:14px; margin-bottom:10px; display:block;">이용 가능 시간 선택</span>
            {time_tabs_html}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding:10px; background:#f8f9fa; border-radius:12px; border:1px solid #eee; margin-top:20px;">
            <span style="font-weight:800; font-size:14px; color:#111;">총 예약 인원</span>
            <div style="font-size:16px; font-weight:900; color:#ff6a00;"><span id="total-count-display">0</span>명</div>
        </div>
"""
            else:
                # Time selection for activities if present
                time_tabs_match = re.search(r'<div class="selection-container".*?id="(?:pc-)?time-tabs".*?</div>\s*</div>', old_box, re.DOTALL)
                if time_tabs_match:
                    new_box += time_tabs_match.group(0) + "\n"
                
                # Additional options like Jumbo Crab
                if "hopping-tour.html" in file_path or "malumpati.html" in file_path:
                    jumbo_match = re.search(r'<div style="margin-bottom:12px;.*?updateJumboCount.*?</div>\s*</div>', old_box, re.DOTALL)
                    if jumbo_match:
                        new_box += jumbo_match.group(0) + "\n"
                
                # Person selector
                if is_pickup or "hopping-tour.html" in file_path or "malumpati.html" in file_path:
                     new_box += """
        <div class="person-selector">
            <div class="person-row">
                <div class="person-info">
                    <span style="font-weight:800; font-size:15px;">성인 인원</span>
                    <div class="counter">
                        <button class="count-btn" onclick="updateAdultCount(-1)">-</button>
                        <strong id="pc-adult-count">1</strong>
                        <button class="count-btn" onclick="updateAdultCount(1)">+</button>
                    </div>
                </div>
                <div class="person-price-calc">
                    ₩ <span id="adult-price-text"></span> × <span id="adult-count-text">1</span> = <b id="adult-subtotal">₩ 0</b>
                </div>
            </div>
            <div class="person-row" style="margin-top:15px; padding-top:15px; border-top:1px dashed #eee;">
                <div class="person-info">
                    <span style="font-weight:800; font-size:15px;">소인 인원</span>
                    <div class="counter">
                        <button class="count-btn" onclick="updateChildCount(-1)">-</button>
                        <strong id="pc-child-count">0</strong>
                        <button class="count-btn" onclick="updateChildCount(1)">+</button>
                    </div>
                </div>
                <div class="person-price-calc">
                    ₩ <span id="child-price-text"></span> × <span id="child-count-text">0</span> = <b id="child-subtotal">₩ 0</b>
                </div>
            </div>
        </div>
"""
                else:
                    new_box += """
        <div class="person-selector">
            <div class="person-row">
                <div class="person-info">
                    <span style="font-weight:800; font-size:15px;">인원 선택</span>
                    <div class="counter">
                        <button class="count-btn" onclick="updateAdultCount(-1)">-</button>
                        <strong id="pc-count">1</strong>
                        <button class="count-btn" onclick="updateAdultCount(1)">+</button>
                    </div>
                </div>
                <div class="person-price-calc">
                    ₩ <span id="adult-price-text"></span> × <span id="adult-count-text">1</span> = <b id="adult-subtotal">₩ 0</b>
                </div>
            </div>
        </div>
"""

            new_box += """
        <div class="total-summary">
            <span>총 합계 금액</span>
            <b id="display-total-price">₩ 0</b>
        </div>

        <button class="btn-buy" onclick="handleBuy()" id="buy-btn">구매하기</button>
        <button class="btn-cart" onclick="addToCart()" style="margin-top:6px; width:100%;">장바구니 담기</button>
    </div>"""
            content = content.replace(old_box, new_box)

    # 4. Fix Script and Mobile Bar
    content = re.sub(r'<div class="mobile-bottom-bar">.*?</div>', 
                     '<div class="mobile-bottom-bar">\n    <button class="m-btn-buy" onclick="openBookingDrawer()">구매하기</button>\n</div>', 
                     content, flags=re.DOTALL)
    
    # Clean up JS syntax
    content = re.sub(r'}\s*\}\s*function addToCart', r'}\n    function addToCart', content)
    content = re.sub(r'\}\s*\}\s*window\.onload', r'}\n    window.onload', content)
    
    # Ensure updateTotalPrice handles price display correctly
    if not is_massage:
        content = content.replace("document.getElementById('adult-price-text').innerText = ADULT_PRICE;", "") # Remove if exists
        # Inject price setup in updateTotalPrice or window.onload
        if "updateTotalPrice()" in content:
            content = content.replace("function updateTotalPrice() {", 
                                      f"function updateTotalPrice() {{\n        if(document.getElementById('adult-price-text')) document.getElementById('adult-price-text').innerText = ADULT_PRICE.toLocaleString();\n        if(document.getElementById('child-price-text')) document.getElementById('child-price-text').innerText = CHILD_PRICE.toLocaleString();")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for f in files:
    fix_file(f)
