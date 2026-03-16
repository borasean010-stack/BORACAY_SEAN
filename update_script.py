import os
import re

files = [
    "scuba-diving.html", "freediving.html", "hopping-tour.html", "land-tour.html",
    "jl-snap.html", "bora-ajae-hopping.html", "parasailing.html", "helmet-diving.html",
    "jetski.html", "golf.html", "pickup-sending.html", "malumpati.html",
    "aspa.html", "boraspa.html", "helios.html", "spa.html",
    "poseidon.html", "maris.html", "kabayan.html", "luna.html"
]

def update_file(file_path):
    if not os.path.exists(file_path):
        print(f"File {file_path} not found.")
        return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update style consistency
    style_pattern = re.compile(r'<style>(.*?)</style>', re.DOTALL)
    new_style = """
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
    content = style_pattern.sub(f"<style>{new_style}</style>", content)

    # 2. Extract price and update reservation-box
    price_val = "₩ 0"
    price_match = re.search(r'ADULT_PRICE\s*=\s*(\d+)', content)
    if not price_match:
        # For massage pages, it might be in massageOptions
        price_match = re.search(r'"price":\s*(\d+)', content)
    
    if price_match:
        price_val = f"₩ {int(price_match.group(1)):,}"
    
    # Update reservation-box content
    res_box_pattern = re.compile(r'<div class="reservation-box">.*?</div>\s*</div>', re.DOTALL)
    # This is tricky because reservation-box might contain nested divs.
    # Better to find <div class="reservation-box"> and then find its matching closing </div>
    
    start_tag = '<div class="reservation-box">'
    start_idx = content.find(start_tag)
    if start_idx != -1:
        # Find matching closing div
        balance = 0
        end_idx = -1
        for i in range(start_idx, len(content)):
            if content[i:i+4] == '<div':
                balance += 1
            elif content[i:i+6] == '</div' or content[i:i+7] == '</div>':
                # Careful with </div vs </div>
                if content[i:i+6] == '</div>':
                    balance -= 1
                    if balance == 0:
                        end_idx = i + 6
                        break
                elif content[i:i+7] == '</div>':
                    balance -= 1
                    if balance == 0:
                        end_idx = i + 7
                        break
        
        if end_idx != -1:
            old_res_box = content[start_idx:end_idx]
            
            # Keep specific parts based on file type
            is_massage = any(x in file_path for x in ["aspa.html", "boraspa.html", "helios.html", "spa.html", "poseidon.html", "maris.html", "kabayan.html", "luna.html"])
            is_pickup = "pickup-sending.html" in file_path
            
            new_res_box = f'<div class="reservation-box">\n'
            new_res_box += f'        <div class="price-header">\n'
            new_res_box += f'            <span class="price-label">1인 기준</span>\n'
            new_res_box += f'            <div class="price-value" id="display-price">{price_val}</div>\n'
            new_res_box += f'        </div>\n'
            
            # Date Tabs
            if is_pickup:
                new_res_box += """
        <div class="date-tabs" id="pc-date-tabs">
            <div class="date-tab active" onclick="setMode('pickup')">픽업 날짜<span id="pc-pickup-display" class="date-display">선택 안함</span></div>
            <div class="date-tab" onclick="setMode('sending')">샌딩 날짜<span id="pc-sending-display" class="date-display" style="color:#00c4ff;">선택 안함</span></div>
        </div>
"""
            else:
                new_res_box += """
        <div class="date-tabs">
            <div class="date-tab active">예약 날짜 선택<span id="pc-date-display" class="date-display">2026-03-02</span></div>
        </div>
"""
            
            # Calendar
            new_res_box += """
        <div class="calendar-wrap" style="margin-bottom: 20px; border: 1px solid #eee; border-radius: 16px; padding: 10px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <button onclick="changeMonth(-1)" style="border:none; background:none; color:#ff6a00; font-weight:800; cursor:pointer;">&lt;</button>
                <strong id="pc-month">2026년 3월</strong>
                <button onclick="changeMonth(1)" style="border:none; background:none; color:#ff6a00; font-weight:800; cursor:pointer;">&gt;</button>
            </div>
            <div class="calendar-grid" id="pc-days" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center;"></div>
        </div>
"""
            
            # Specific Selectors
            if is_massage:
                new_res_box += """
        <div class="selection-container">
            <span class="selection-label" style="font-weight:800; font-size:14px; margin-bottom:10px; display:block;">마사지 종류 및 인원 선택</span>
            <div id="type-selectors" style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                <!-- JS will render individual counters here -->
            </div>
        </div>

        <div class="selection-container" style="margin-top:20px;">
            <span class="selection-label" style="font-weight:800; font-size:14px; margin-bottom:10px; display:block;">이용 가능 시간 선택</span>
            <div class="selection-tabs" id="time-tabs">
                <!-- JS will render time tabs -->
            </div>
        </div>
"""
            elif "hopping-tour.html" in file_path or "malumpati.html" in file_path:
                 new_res_box += """
        <div style="margin-bottom:12px; padding:15px; background:#fff5eb; border-radius:15px; border:1px solid #ffe0d1;">
            <label style="font-weight:800; font-size:14px; color:#d35400; display:block; margin-bottom:10px;">추가 옵션 (현장지불)</label>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:15px; font-weight:700;">점보크랩 런치 (1인 $30)</span>
                <div class="counter">
                    <button class="count-btn" onclick="updateJumboCount(-1)">-</button>
                    <strong id="pc-jumbo-count">0</strong>
                    <button class="count-btn" onclick="updateJumboCount(1)">+</button>
                </div>
            </div>
        </div>
"""
            
            # Person Selector (common for activity)
            if not is_massage:
                if is_pickup or "hopping-tour.html" in file_path or "malumpati.html" in file_path or "pickup-sending.html" in file_path:
                     new_res_box += """
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
                    <span id="adult-price-text"></span> × <span id="adult-count-text">1</span> = <b id="adult-subtotal">₩ 0</b>
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
                    <span id="child-price-text"></span> × <span id="child-count-text">0</span> = <b id="child-subtotal">₩ 0</b>
                </div>
            </div>
        </div>
"""
                else:
                    new_res_box += """
        <div class="person-selector">
            <div class="person-row">
                <div class="person-info">
                    <span style="font-weight:800; font-size:15px;">예약 인원</span>
                    <div class="counter">
                        <button class="count-btn" onclick="updateAdultCount(-1)">-</button>
                        <strong id="pc-count">1</strong>
                        <button class="count-btn" onclick="updateAdultCount(1)">+</button>
                    </div>
                </div>
                <div class="person-price-calc">
                    <span id="adult-price-text"></span> × <span id="adult-count-text">1</span> = <b id="adult-subtotal">₩ 0</b>
                </div>
            </div>
        </div>
"""

            # Total Summary
            new_res_box += """
        <div class="total-summary">
            <span>총 합계 금액</span>
            <b id="display-total-price">₩ 0</b>
        </div>

        <button class="btn-buy" onclick="handleBuy()" id="buy-btn">구매하기</button>
        <button class="btn-cart" onclick="addToCart()" style="margin-top:6px; width:100%;">장바구니 담기</button>
    </div>"""
            content = content.replace(old_res_box, new_res_box)

    # 3. Fix script errors and ensure BSUtils usage
    # Remove extra closing braces in handleBuy/addToCart
    content = re.sub(r'}\s*\}\s*function addToCart', r'}\n    function addToCart', content)
    content = re.sub(r'\}\s*\}\s*window\.onload', r'}\n    window.onload', content)
    
    # 4. Mobile Responsiveness: ensure openBookingDrawer()
    content = re.sub(r'onclick="[^"]*handleBuy\(\)[^"]*"', 'onclick="openBookingDrawer()"', content, count=1, flags=re.DOTALL)
    # Wait, that would change the PC button too. 
    # Only change it in mobile-bottom-bar
    m_bar_pattern = re.compile(r'<div class="mobile-bottom-bar">.*?</div>', re.DOTALL)
    m_bar_match = m_bar_pattern.search(content)
    if m_bar_match:
        old_m_bar = m_bar_match.group(0)
        new_m_bar = '<div class="mobile-bottom-bar">\n    <button class="m-btn-buy" onclick="openBookingDrawer()">구매하기</button>\n</div>'
        content = content.replace(old_m_bar, new_m_bar)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for f in files:
    update_file(f)
