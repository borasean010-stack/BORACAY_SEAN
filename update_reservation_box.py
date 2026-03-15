import re
import os

files = [
    'aspa.html', 'bora-ajae-hopping.html', 'boraspa.html', 'freediving.html',
    'golf.html', 'helios.html', 'helmet-diving.html', 'hopping-tour.html',
    'island-tour.html', 'jetski.html', 'jl-snap.html', 'kabayan.html',
    'land-tour.html', 'luna.html', 'malumpati.html', 'maris.html',
    'parasailing.html', 'pickup-sending.html', 'poseidon.html',
    'scuba-diving.html', 'spa.html'
]

def update_file(file_path):
    if not os.path.exists(file_path):
        print(f"File {file_path} not found.")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # CSS Changes
    content = re.sub(r'(\.reservation-box\s*\{[^}]*?padding:\s*)30px', r'\g<1>20px', content)
    content = re.sub(r'(\.date-tabs\s*\{[^}]*?margin-bottom:\s*)15px', r'\g<1>10px', content)
    content = re.sub(r'(\.date-tab\s*\{[^}]*?padding:\s*)12px\s*5px', r'\g<1>8px 5px', content)
    content = re.sub(r'(\.date-tab\s*\{[^}]*?font-size:\s*)13px', r'\g<1>12px', content)
    content = re.sub(r'(\.calendar-wrap\s*\{[^}]*?margin-bottom:\s*)20px', r'\g<1>12px', content)
    content = re.sub(r'(\.calendar-wrap\s*\{[^}]*?padding:\s*)15px', r'\g<1>10px', content)
    content = re.sub(r'(\.btn-buy\s*\{[^}]*?padding:\s*)(?:20px|15px)', r'\g<1>16px', content)
    content = re.sub(r'(\.btn-buy\s*\{[^}]*?font-size:\s*)17px', r'\g<1>16px', content)
    content = re.sub(r'(\.btn-cart\s*\{[^}]*?padding:\s*)18px', r'\g<1>14px', content)
    content = re.sub(r'(\.btn-cart\s*\{[^}]*?margin-top:\s*)10px', r'\g<1>6px', content)
    content = re.sub(r'(\.btn-cart\s*\{[^}]*?font-size:\s*)16px', r'\g<1>15px', content)

    # Inline Body Changes
    content = re.sub(r'(class="calendar-wrap"[^>]*?margin-bottom:\s*)20px', r'\g<1>12px', content)
    content = re.sub(r'(class="calendar-wrap"[^>]*?padding:\s*)15px', r'\g<1>10px', content)
    
    # Inline Price
    content = re.sub(r'(style="[^"]*?font-size:\s*)28px([^"]*?margin-bottom:\s*)20px', r'\g<1>24px\g<2>15px', content)
    content = re.sub(r'(style="[^"]*?margin-bottom:\s*)20px([^"]*?font-size:\s*)28px', r'\g<1>15px\g<2>24px', content)

    # Inline Counter
    content = re.sub(r'(style="[^"]*?margin-bottom:\s*)20px([^"]*?padding:\s*)15px', r'\g<1>12px\g<2>10px', content)
    content = re.sub(r'(style="[^"]*?padding:\s*)15px([^"]*?margin-bottom:\s*)20px', r'\g<1>10px\g<2>12px', content)
    
    # Inline btn-cart margin-top
    content = re.sub(r'(class="btn-cart"[^>]*?style="[^"]*?margin-top:\s*)10px', r'\g<1>6px', content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for f in files:
    update_file(f)
    print(f"Updated {f}")
