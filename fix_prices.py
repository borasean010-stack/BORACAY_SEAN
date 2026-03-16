import os
import re

files = [
    "scuba-diving.html", "freediving.html", "hopping-tour.html", "land-tour.html",
    "jl-snap.html", "bora-ajae-hopping.html", "parasailing.html", "helmet-diving.html",
    "jetski.html", "golf.html", "pickup-sending.html", "malumpati.html",
    "aspa.html", "boraspa.html", "helios.html", "spa.html",
    "poseidon.html", "maris.html", "kabayan.html", "luna.html"
]

for file_path in files:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Try to find the correct price from the price-value div
    price_match = re.search(r'<div class="price-value" id="display-price">₩ ([\d,]+)</div>', content)
    if price_match:
        price_str = price_match.group(1).replace(',', '')
        correct_price = int(price_str)
        
        # Restore ADULT_PRICE
        content = re.sub(r'const ADULT_PRICE = 0;', f'const ADULT_PRICE = {correct_price};', content)
        # Remove TEMP_ADULT_PRICE if it exists
        content = re.sub(r'const TEMP_ADULT_PRICE = \d+;', '', content)

    # For massage pages, restore the massageOptions if I messed them up (I shouldn't have)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
