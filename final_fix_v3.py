import os

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
    
    # Check if used in updateTotalPrice
    if 'updateTotalPrice()' in content:
        if 'childCount' in content and 'let childCount' not in content:
            content = content.replace('let adultCount', 'let adultCount = 1;\n    let childCount = 0')
            content = content.replace('let adultCount = 1;\n    let childCount = 0 = 1', 'let adultCount = 1;\n    let childCount = 0')
        
        if 'CHILD_PRICE' in content and 'const CHILD_PRICE' not in content:
             content = content.replace('const ADULT_PRICE', 'const ADULT_PRICE = 0;\n    const CHILD_PRICE = 0;\n    const TEMP_ADULT_PRICE') # placeholder to help
             # This is getting messy. Let's be more precise.
             
    # Simpler approach for child variables
    if 'childCount' in content and 'let childCount' not in content:
        content = content.replace('let adultCount', 'let adultCount = 1; let childCount = 0;')
    if 'CHILD_PRICE' in content and 'const CHILD_PRICE' not in content:
        content = content.replace('const ADULT_PRICE', 'const ADULT_PRICE = 0; const CHILD_PRICE = 0;')

    # Fix the mess I might have made above
    content = content.replace('const ADULT_PRICE = 0; const CHILD_PRICE = 0; = ', 'const ADULT_PRICE = ')
    content = content.replace('let adultCount = 1; let childCount = 0; = 1', 'let adultCount = 1; let childCount = 0;')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
