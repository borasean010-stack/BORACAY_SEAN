import os
import re

files = [
    "aspa.html", "boraspa.html", "golf.html", "helios.html", "helmet-diving.html",
    "hopping-tour.html", "jetski.html", "kabayan.html", "luna.html", "maris.html",
    "parasailing.html", "poseidon.html", "scuba-diving.html", "spa.html",
    "bora-ajae-hopping.html", "freediving.html", "malumpati.html", "land-tour.html",
    "jl-snap.html", "pickup-sending.html"
]

def update_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove price-header or display-price at the top of reservation-box
    # Match <div class="price-header">...</div> or <div id="display-price"...>...</div>
    # only if it's near the start of reservation-box
    res_box_start = content.find('class="reservation-box"')
    if res_box_start != -1:
        # Look for the first <div> inside reservation-box that looks like a price display
        box_content = content[res_box_start:res_box_start+500]
        
        # Remove price-header
        content = re.sub(r'(<div class="reservation-box">.*?)\s*<div class="price-header">.*?</div>', r'\1', content, count=1, flags=re.DOTALL)
        # Remove display-price div if it's at the top
        content = re.sub(r'(<div class="reservation-box">.*?)\s*<div id="display-price".*?>.*?</div>', r'\1', content, count=1, flags=re.DOTALL)

    # 2. Ensure total-summary exists
    if 'class="total-summary"' not in content:
        summary_html = '''
        <div class="total-summary">
            <span>총 합계 금액</span>
            <b id="display-total-price">₩ 0</b>
        </div>
'''
        # Insert before the first button in reservation-box
        content = re.sub(r'(<button class="(?:btn-buy|m-btn-buy)")', summary_html + r'        \1', content, count=1)

    # 3. Update JS functions
    # Identify the update function (updateTotal or updateTotalPrice)
    
    # Common block to inject:
    inject_js = """
        const totalStr = BSUtils.formatPrice(total);
        const totalDisp = document.getElementById('display-total-price');
        if (totalDisp) totalDisp.innerText = totalStr;
        document.querySelectorAll('.btn-buy, .m-btn-buy').forEach(btn => {
            if (btn.tagName === 'BUTTON') btn.innerText = totalStr + ' 구매하기';
        });
"""
    # For files using 'totalPrice' variable
    inject_js_totalPrice = """
        const totalStr = BSUtils.formatPrice(totalPrice);
        const totalDisp = document.getElementById('display-total-price');
        if (totalDisp) totalDisp.innerText = totalStr;
        document.querySelectorAll('.btn-buy, .m-btn-buy').forEach(btn => {
            if (btn.tagName === 'BUTTON') btn.innerText = totalStr + ' 구매하기';
        });
"""

    # If it's a Massage/Spa file (usually has updateTotal)
    if 'function updateTotal()' in content:
        # Find where it calculates total and update it
        # We'll just replace the existing display-price update logic
        content = re.sub(r'const totalStr = BSUtils\.formatPrice\(totalPrice\);.*?buyBtns\.forEach\(btn => \{.*?\}\);', inject_js_totalPrice, content, flags=re.DOTALL)
        # Also handle cases where it might be slightly different
        if 'const totalStr = BSUtils.formatPrice(totalPrice);' not in content:
             content = re.sub(r'function updateTotal\(\) \{', 'function updateTotal() {\n' + inject_js_totalPrice, content)

    elif 'function updateTotalPrice()' in content:
        # Find where it updates display-price and buy-btn
        # We'll try to replace the end of updateTotalPrice
        content = re.sub(r'const totalStr = .*?document\.getElementById\(\'buy-btn\'\)\.innerText = totalStr \+ \' 구매하기\';', inject_js, content, flags=re.DOTALL)
        # In case m-buy-btn check exists
        content = re.sub(r'if \(document\.getElementById\(\'m-buy-btn\'\)\) \{.*?\}', '', content, flags=re.DOTALL)
        
        # If the above replacement failed to find the pattern, try a simpler one
        if 'const totalStr = BSUtils.formatPrice(total);' not in content:
             # Just inject at the end of the function before }
             # This is risky but let's try to find the last line of the function
             pass

    # Special case: land-tour.html (no update function)
    if filepath == "land-tour.html":
        # It has updateCount(delta)
        # I should add updateTotalPrice() and call it from updateCount
        if 'function updateTotalPrice()' not in content:
            new_js = """
    function updateTotalPrice() {
        const total = adultCount * 45000;
        const totalStr = BSUtils.formatPrice(total);
        const totalDisp = document.getElementById('display-total-price');
        if (totalDisp) totalDisp.innerText = totalStr;
        document.querySelectorAll('.btn-buy, .m-btn-buy').forEach(btn => {
            if (btn.tagName === 'BUTTON') btn.innerText = totalStr + ' 구매하기';
        });
    }
"""
            content = content.replace('function updateCount(delta) {', new_js + '\n    function updateCount(delta) {')
            content = content.replace('adultCount = Math.max(1, adultCount + delta);', 'adultCount = Math.max(1, adultCount + delta);\n        updateTotalPrice();')
            content = content.replace('window.onload = () => {', 'window.onload = () => {\n        updateTotalPrice();')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath}")

for f in files:
    update_file(f)
