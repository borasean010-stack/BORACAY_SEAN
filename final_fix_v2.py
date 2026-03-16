import os

files = [
    "scuba-diving.html", "freediving.html", "hopping-tour.html", "land-tour.html",
    "jl-snap.html", "bora-ajae-hopping.html", "parasailing.html", "helmet-diving.html",
    "jetski.html", "golf.html", "pickup-sending.html", "malumpati.html",
    "aspa.html", "boraspa.html", "helios.html", "spa.html",
    "poseidon.html", "maris.html", "kabayan.html", "luna.html"
]

def fix_div_balance(content):
    # Fix the missing </div> for selection-container
    if '<div class="selection-tabs" id="time-tabs">' in content:
        # Find where the selection-tabs ends
        tabs_end = content.find('</div>', content.find('id="time-tabs"'))
        if tabs_end != -1:
            next_div = content.find('<div', tabs_end)
            if next_div != -1 and 'selection-container' not in content[tabs_end:next_div]:
                 # Check if there is already a closing div for the container
                 # If the next div starts shortly after, we might be missing the container's closing div
                 if '</div>' not in content[tabs_end+6:next_div]:
                     content = content[:tabs_end+6] + '\n        </div>' + content[tabs_end+6:]
    return content

for file_path in files:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = fix_div_balance(content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
