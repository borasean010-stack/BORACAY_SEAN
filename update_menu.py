import os
import re

files_to_update = [
    'index.html', 'essential-tours.html', 'activities.html', 'massage.html', 'island-tour.html',
    'bora-ajae-hopping.html', 'freediving.html', 'jetski.html', 'helmet-diving.html', 'scuba-diving.html',
    'parasailing.html', 'land-tour.html', 'hopping-tour.html', 'pickup-sending.html', 'malumpati.html',
    'spa.html', 'poseidon.html', 'maris.html', 'kabayan.html', 'luna.html', 'boraspa.html',
    'helios.html', 'aspa.html', 'about-us.html', 'booking-complete.html', 'booking-form.html',
    'cart.html', 'login.html', 'mypage.html', 'price-list.html', 'golf.html', 'jl-snap.html'
]

mapping = {
    'essential': ['essential-tours.html', 'pickup-sending.html', 'hopping-tour.html', 'malumpati.html'],
    'activity': ['activities.html', 'freediving.html', 'land-tour.html', 'jl-snap.html', 'bora-ajae-hopping.html', 'parasailing.html', 'scuba-diving.html', 'helmet-diving.html', 'jetski.html', 'island-tour.html', 'golf.html'],
    'massage': ['massage.html', 'aspa.html', 'spa.html', 'poseidon.html', 'maris.html', 'kabayan.html', 'luna.html', 'boraspa.html', 'helios.html'],
    'price-list': ['price-list.html'],
    'resort-quote': [], # Placeholder for resort-quote.html if it exists later
    'cart': ['cart.html']
}

def get_new_menu(filename):
    active_cat = None
    for cat, files in mapping.items():
        if filename in files:
            active_cat = cat
            break
    
    menu_html = '<div class="menu">\n'
    
    # 보라카이 필수투어
    essential_active = ' active' if active_cat == 'essential' else ''
    menu_html += f'        <a href="essential-tours.html" class="tab-link{essential_active}" data-category="essential">보라카이 필수투어</a>\n'
    
    # 액티비티
    activity_active = ' active' if active_cat == 'activity' else ''
    menu_html += f'        <a href="activities.html" class="tab-link{activity_active}" data-category="activity">액티비티</a>\n'
    
    # 마사지
    massage_active = ' active' if active_cat == 'massage' else ''
    menu_html += f'        <a href="massage.html" class="tab-link{massage_active}" data-category="massage">마사지</a>\n'
    
    # 한눈에 요금표
    price_active = ' active' if active_cat == 'price-list' else ''
    menu_html += f'        <a href="price-list.html" class="tab-link{price_active}">한눈에 요금표</a>\n'
    
    # 리조트 견적 (New)
    resort_active = ' active' if active_cat == 'resort-quote' else ''
    menu_html += f'        <a href="#" class="tab-link{resort_active}">리조트 견적</a>\n'
    
    # 장바구니
    cart_active = ' active' if active_cat == 'cart' else ''
    menu_html += f'        <a href="cart.html" class="tab-link{cart_active}">장바구니</a>\n'
    
    menu_html += '    </div>'
    return menu_html

def get_new_side_menu(filename):
    side_menu_html = '<div class="side-menu" id="sideMenu">\n'
    side_menu_html += '    <a href="index.html">홈으로</a>\n'
    side_menu_html += '    <a href="mypage.html">마이페이지 (예약확인)</a>\n'
    side_menu_html += '    <a href="essential-tours.html">보라카이 필수투어</a>\n'
    side_menu_html += '    <a href="activities.html">액티비티</a>\n'
    side_menu_html += '    <a href="massage.html">마사지</a>\n'
    side_menu_html += '    <a href="price-list.html">한눈에 요금표</a>\n'
    side_menu_html += '    <a href="#">리조트 견적</a>\n'
    side_menu_html += '    <a href="cart.html">장바구니 확인</a>\n'
    side_menu_html += '</div>'
    return side_menu_html

for filename in files_to_update:
    path = f'/home/user/boracaysean/{filename}'
    if not os.path.exists(path):
        # Check if it might be in root without the full path provided in files_to_update
        path = filename
        if not os.path.exists(path):
            print(f"File not found: {filename}")
            continue
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace top menu
    new_menu = get_new_menu(filename)
    content = re.sub(r'<div class="menu">.*?</div>', new_menu, content, flags=re.DOTALL)
    
    # Replace side menu
    new_side_menu = get_new_side_menu(filename)
    content = re.sub(r'<div class="side-menu" id="sideMenu">.*?</div>', new_side_menu, content, flags=re.DOTALL)
    
    # Standardize header-right if needed (optional, keeping previous logic)
    standard_header_right = '''
        <a href="mypage.html" class="mypage-btn">마이페이지</a>
        <a href="https://cafe.naver.com/f-e/cafes/17953658/menus/0?t=1772441375461" target="_blank" class="naver-btn">카페 바로가기</a>
        <a href="https://business.kakao.com/_zBArM/chats" target="_blank" class="kakao-btn">카톡 바로가기</a>
    '''
    # content = re.sub(r'<div class="header-right">.*?</div>', f'<div class="header-right">{standard_header_right}</div>', content, flags=re.DOTALL)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filename}")
