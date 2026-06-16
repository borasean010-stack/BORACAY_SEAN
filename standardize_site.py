import os
import re

# List of public-facing files to update
files_to_update = [
    'index.html', 'essential-tours.html', 'activities.html', 'massage.html',
    'boracay-package.html', 'price-list.html', 'resort-quote.html', 'cart.html',
    'about-us.html', 'bora-ajae-hopping.html', 'catipickipsending.html',
    'crimson-resort.html', 'freediving.html', 'golf.html', 'helios.html',
    'helmet-diving.html', 'henann-crystal-sands.html', 'henann-garden-resort.html',
    'henann-lagoon-resort.html', 'henann-palm-beach.html', 'henann-park.html',
    'henann-prime-beach.html', 'henann-regency-resort.html', 'hopping-tour.html',
    'island-tour.html', 'jetski.html', 'jl-snap.html', 'kabayan.html',
    'land-tour.html', 'luna.html', 'malumpati.html', 'maris.html',
    'parasailing.html', 'pickup-sending.html', 'poseidon.html',
    'scuba-diving.html', 'shangrila-resort.html', 'spa.html', 'aspa.html', 'boraspa.html'
]

# Mapping for active state in the top menu
mapping = {
    'essential': ['essential-tours.html', 'pickup-sending.html', 'hopping-tour.html', 'malumpati.html', 'boracay-package.html'],
    'activity': ['activities.html', 'freediving.html', 'land-tour.html', 'jl-snap.html', 'bora-ajae-hopping.html', 'parasailing.html', 'scuba-diving.html', 'helmet-diving.html', 'jetski.html', 'island-tour.html', 'golf.html'],
    'massage': ['massage.html', 'aspa.html', 'spa.html', 'poseidon.html', 'maris.html', 'kabayan.html', 'luna.html', 'boraspa.html', 'helios.html', 'boraspa.html'],
    'package': ['boracay-package.html'],
    'price-list': ['price-list.html'],
    'resort-quote': ['resort-quote.html', 'shangrila-resort.html', 'crimson-resort.html', 'henann-crystal-sands.html', 'henann-garden-resort.html', 'henann-lagoon-resort.html', 'henann-palm-beach.html', 'henann-park.html', 'henann-prime-beach.html', 'henann-regency-resort.html'],
    'cart': ['cart.html']
}

def get_new_side_menu(filename):
    menu_html = '    <div class="side-menu-list">\n'
    menu_html += '        <a href="/essential-tours">보라카이 필수투어</a>\n'
    menu_html += '        <a href="/activities">액티비티</a>\n'
    menu_html += '        <a href="/massage">마사지</a>\n'
    menu_html += '        <a href="/boracay-package">보라카이 패키지</a>\n'
    menu_html += '        <a href="/price-list">한눈에 요금표</a>\n'
    menu_html += '        <a href="/resort-quote">리조트 견적</a>\n'
    menu_html += '        <a href="/cart">장바구니</a>\n'
    menu_html += '        <a href="/mypage" style="margin-top:20px; font-size:14px; opacity:0.6;">마이페이지 (예약확인)</a>\n'
    menu_html += '    </div>'
    return menu_html

def get_new_top_menu(filename):
    active_cat = None
    for cat, files in mapping.items():
        if filename in files:
            active_cat = cat
            break
    
    menu_html = '    <div class="menu pc-only">\n'
    
    # Essential
    cls = 'tab-link' + (' active' if active_cat == 'essential' else '')
    menu_html += f'        <a href="/essential-tours" class="{cls}" data-category="essential">보라카이 필수투어</a>\n'
    
    # Activity
    cls = 'tab-link' + (' active' if active_cat == 'activity' else '')
    menu_html += f'        <a href="/activities" class="{cls}" data-category="activity">액티비티</a>\n'
    
    # Massage
    cls = 'tab-link' + (' active' if active_cat == 'massage' else '')
    menu_html += f'        <a href="/massage" class="{cls}" data-category="massage">마사지</a>\n'
    
    # Package
    cls = 'tab-link' + (' active' if active_cat == 'package' else '')
    menu_html += f'        <a href="/boracay-package" class="{cls}">보라카이 패키지</a>\n'
    
    # Price List
    cls = 'tab-link' + (' active' if active_cat == 'price-list' else '')
    menu_html += f'        <a href="/price-list" class="{cls}">한눈에 요금표</a>\n'
    
    # Resort Quote
    cls = 'tab-link' + (' active' if active_cat == 'resort-quote' else '')
    menu_html += f'        <a href="/resort-quote" class="{cls}">리조트 견적</a>\n'
    
    # Cart
    cls = 'tab-link' + (' active' if active_cat == 'cart' else '')
    menu_html += f'        <a href="/cart" class="{cls}">장바구니</a>\n'
    
    menu_html += '    </div>'
    return menu_html

for filename in files_to_update:
    if not os.path.exists(filename):
        print(f"File not found: {filename}")
        continue
        
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update Side Menu
    new_side = get_new_side_menu(filename)
    content = re.sub(r'<div class="side-menu-list">.*?</div>', new_side, content, flags=re.DOTALL)
    
    # Update Top Menu
    new_top = get_new_top_menu(filename)
    content = re.sub(r'<div class="menu pc-only">.*?</div>', new_top, content, flags=re.DOTALL)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Standardized {filename}")
