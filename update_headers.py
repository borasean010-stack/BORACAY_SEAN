import os
import re

def update_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update .header-right
    # Target structure:
    # <div class="header-right ...">
    #     <a href="mypage.html" class="mypage-btn">...</a>
    #     <a href="https://business.kakao.com/_zBArM/chats" target="_blank" class="kakao-btn">카카오톡 상담</a>
    #     <a href="https://cafe.naver.com/f-e/cafes/17953658/menus/0?t=1772441375461" target="_blank" class="naver-btn">카페 바로가기</a>
    # </div>

    kakao_btn = '<a href="https://business.kakao.com/_zBArM/chats" target="_blank" class="kakao-btn">카카오톡 상담</a>'
    
    # Check if .header-right exists
    header_right_match = re.search(r'(<div class="header-right[^>]*>)(.*?)(</div>)', content, re.DOTALL)
    if header_right_match:
        full_header_right = header_right_match.group(0)
        start_tag = header_right_match.group(1)
        inner_content = header_right_match.group(2)
        end_tag = header_right_match.group(3)

        # Remove any existing kakao-btn first to avoid duplicates or misplacements
        inner_content = re.sub(r'<a[^>]*class="kakao-btn"[^>]*>.*?</a>', '', inner_content, flags=re.DOTALL)
        
        # We want it between mypage-btn and naver-btn
        # If mypage-btn and naver-btn exist, insert between them
        if 'mypage-btn' in inner_content and 'naver-btn' in inner_content:
            inner_content = re.sub(r'(class="mypage-btn">.*?</a>)', r'\1\n        ' + kakao_btn, inner_content, flags=re.DOTALL)
        elif 'mypage-btn' in inner_content:
            inner_content = re.sub(r'(class="mypage-btn">.*?</a>)', r'\1\n        ' + kakao_btn, inner_content, flags=re.DOTALL)
        elif 'naver-btn' in inner_content:
             inner_content = re.sub(r'(<a[^>]*class="naver-btn")', kakao_btn + r'\n        \1', inner_content, flags=re.DOTALL)
        else:
            # Just append if neither found but div exists
            inner_content += "\n        " + kakao_btn
            
        new_header_right = start_tag + inner_content + end_tag
        content = content.replace(full_header_right, new_header_right)
    else:
        # If .header-right doesn't exist, we might need to add it to .top-bar
        # Usually it's after .menu
        if '<div class="top-bar">' in content:
            header_right_template = f'''
    <div class="header-right pc-only">
        <a href="mypage.html" class="mypage-btn">마이페이지</a>
        {kakao_btn}
        <a href="https://cafe.naver.com/f-e/cafes/17953658/menus/0?t=1772441375461" target="_blank" class="naver-btn">카페 바로가기</a>
    </div>'''
            # Insert before the end of .top-bar
            # Find the last </div> before the next major section or end of file
            # Simple approach: insert before </div> of top-bar
            # But top-bar contains other divs.
            # Let's find the .menu div and insert after it.
            if 'class="menu"' in content:
                content = re.sub(r'(<div class="menu">.*?</div>)', r'\1' + header_right_template, content, flags=re.DOTALL)
            else:
                # Fallback: insert before closing tag of top-bar
                # This is tricky with regex. Let's try to find the structure.
                pass

    # 2. Ensure .menu-toggle exists in .header-left
    menu_toggle = '<div class="menu-toggle" id="menuToggle"><span></span><span></span><span></span></div>'
    
    header_left_match = re.search(r'(<div class="header-left">)(.*?)(</div>)', content, re.DOTALL)
    if header_left_match:
        full_header_left = header_left_match.group(0)
        start_tag = header_left_match.group(1)
        inner_content = header_left_match.group(2)
        end_tag = header_left_match.group(3)
        
        if 'menu-toggle' not in inner_content:
            inner_content = "\n        " + menu_toggle + inner_content
            new_header_left = start_tag + inner_content + end_tag
            content = content.replace(full_header_left, new_header_left)
    
    # 3. Special handling for resort-quote.html
    if 'resort-quote.html' in file_path:
        # Remove redundant CSS
        css_to_remove = [
            r'/\* 상단 바 스타일 보정 \*/',
            r'\.top-bar \{.*?\}',
            r'\.header-left \{ display: flex; align-items: center; \}',
            r'\.logo a \{.*?\}',
            r'\.logo-img \{ height: 32px; \}',
            r'\.menu \{.*?\}',
            r'\.tab-link \{.*?\}',
            r'\.tab-link:hover, \.tab-link\.active \{ color: #ff6a00; \}'
        ]
        for pattern in css_to_remove:
            content = re.sub(pattern, '', content, flags=re.DOTALL)

    # Clean up whitespace/empty lines in CSS if any
    if 'resort-quote.html' in file_path:
        content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
for html_file in html_files:
    print(f"Updating {html_file}...")
    update_html(html_file)
