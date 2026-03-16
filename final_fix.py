import os

files = [
    "scuba-diving.html", "freediving.html", "hopping-tour.html", "land-tour.html",
    "jl-snap.html", "bora-ajae-hopping.html", "parasailing.html", "helmet-diving.html",
    "jetski.html", "golf.html", "pickup-sending.html", "malumpati.html",
    "aspa.html", "boraspa.html", "helios.html", "spa.html",
    "poseidon.html", "maris.html", "kabayan.html", "luna.html"
]

def fix_syntax_errors(content):
    # Fix the missing brace in addToCart if it exists
    if 'if(confirm(\'장바구니에 담겼습니다. 이동하시겠습니까?\')) { window.location.assign(\'cart.html\'); }' in content and 'window.onload' in content:
        if 'window.location.assign(\'cart.html\'); }\n    window.onload' in content:
            content = content.replace('window.location.assign(\'cart.html\'); }\n    window.onload', 'window.location.assign(\'cart.html\'); }\n    }\n    window.onload')
    
    # Fix extra braces
    content = content.replace('}; BSUtils.buyNow(item); }\n    }', '}; BSUtils.buyNow(item); }\n')
    content = content.replace('}; BSUtils.saveToCart(item); }\n    }', '}; BSUtils.saveToCart(item); }\n')
    
    return content

def fix_time_tabs(content):
    # Fix the broken time-tabs in aspa.html and others
    if '<div class="selection-tabs" id="time-tabs">\n                <div class="selection-tab active" onclick="selectTime(\'12:30\', this)">12:30</div>\n        </div>' in content:
         content = content.replace('<div class="selection-tabs" id="time-tabs">\n                <div class="selection-tab active" onclick="selectTime(\'12:30\', this)">12:30</div>\n        </div>', 
                                   '<div class="selection-tabs" id="time-tabs">\n                <div class="selection-tab active" onclick="selectTime(\'12:30\', this)">12:30</div>\n                <div class="selection-tab" onclick="selectTime(\'14:30\', this)">14:30</div>\n                <div class="selection-tab" onclick="selectTime(\'16:30\', this)">16:30</div>\n                <div class="selection-tab" onclick="selectTime(\'18:30\', this)">18:30</div>\n                <div class="selection-tab" onclick="selectTime(\'19:30\', this)">19:30</div>\n            </div>')
    return content

for file_path in files:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = fix_syntax_errors(content)
    content = fix_time_tabs(content)
    
    # Ensure adult-price-text and child-price-text are updated
    if 'updateTotalPrice()' in content and 'ADULT_PRICE' in content:
        if 'if(document.getElementById(\'adult-price-text\'))' not in content:
             content = content.replace('function updateTotalPrice() {', 
                                      'function updateTotalPrice() {\n        if(document.getElementById(\'adult-price-text\')) document.getElementById(\'adult-price-text\').innerText = ADULT_PRICE.toLocaleString();\n        if(document.getElementById(\'child-price-text\')) document.getElementById(\'child-price-text\').innerText = typeof CHILD_PRICE !== \'undefined\' ? CHILD_PRICE.toLocaleString() : \'0\';')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
