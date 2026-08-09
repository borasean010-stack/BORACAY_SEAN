import re

with open('admin.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if "<!-- Chart.js 추가 -->" in line:
        continue
    if "https://cdn.jsdelivr.net/npm/chart.js" in line:
        continue
    if "<!-- 구글 시트 V4 데이터 연동 스크립트 -->" in line:
        skip = True
    
    if not skip:
        new_lines.append(line)
        
    if skip and "</script>" in line and i > 900: # heuristic to find the end of the script
        skip = False

with open('admin.html', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
