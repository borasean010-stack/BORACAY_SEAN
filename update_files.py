import os
import re

files_to_update = [
    'maris.html', 'helios.html', 'kabayan.html', 'boraspa.html', 'spa.html', 'luna.html',
    'malumpati.html', 'freediving.html', 'golf.html', 'hopping-tour.html',
    'helmet-diving.html', 'jetski.html', 'scuba-diving.html'
]

spa_files = ['maris.html', 'helios.html', 'kabayan.html', 'boraspa.html', 'spa.html', 'luna.html']

def update_spa_file(content, filename):
    # Update initSelectors to use BSUtils.formatPrice
    content = re.sub(
        r'₩ \${opt\.price\.toLocaleString\(\)}',
        r'${BSUtils.formatPrice(opt.price)}',
        content
    )
    
    # Update updateTotal
    update_total_pattern = r'function updateTotal\(\) \{.*?priceDisplays\.forEach\(d => d\.innerText = \'₩ \' \+ totalPrice\.toLocaleString\(\)\);'
    new_update_total = """function updateTotal() {
        let totalCount = 0; let totalPrice = 0;
        for (const name in selectedQuantities) {
            const qty = selectedQuantities[name];
            const opt = massageOptions.find(o => o.name === name);
            totalCount += qty; totalPrice += (opt.price * qty);
        }
        const tcDisp = document.getElementById('total-count-display');
        if(tcDisp) tcDisp.innerText = totalCount;
        const mtcDisp = document.getElementById('m-total-count-display');
        if(mtcDisp) mtcDisp.innerText = totalCount;
        
        const totalStr = BSUtils.formatPrice(totalPrice);
        const priceDisplays = document.querySelectorAll('#display-price');
        priceDisplays.forEach(d => d.innerText = totalStr);
        
        const buyBtns = document.querySelectorAll('.btn-buy, .m-btn-buy');
        buyBtns.forEach(btn => {
            if (btn.tagName === 'BUTTON') {
                btn.innerText = totalStr + ' 구매하기';
            }
        });"""
    content = re.sub(update_total_pattern, new_update_total, content, flags=re.DOTALL)

    # Update getSelectedItems to include totalPrice
    get_items_pattern = r'items\.push\(\{(.*?)\}\);'
    def add_total_price(match):
        props = match.group(1)
        if 'totalPrice' not in props:
            return f'items.push({{{props}, totalPrice: opt.price * qty}});'
        return match.group(0)
    content = re.sub(get_items_pattern, add_total_price, content, flags=re.DOTALL)

    # Update handleBuy and addToCart
    content = re.sub(r'sessionStorage\.setItem\(\'directBuyItem\', JSON\.stringify\(items\)\);\s+window\.open\(\'booking-form\.html\', \'_blank\'\);', r'BSUtils.buyNow(items);', content)
    content = re.sub(r'let cart = JSON\.parse\(localStorage\.getItem\(\'cart\'\) \|\| \'\[\]\'\);\s+items\.forEach\(item => cart\.push\(item\)\);\s+localStorage\.setItem\(\'cart\', JSON\.stringify\(cart\)\);\s+if\(confirm\(\'장바구니에 담겼습니다\. 이동하시겠습니까\?\'\)\) \{ window\.location\.assign\(\'cart\.html\'\); \}', r'items.forEach(item => BSUtils.saveToCart(item));', content)
    
    return content

def update_tour_file(content, filename):
    # Find prices
    adult_price_match = re.search(r'const ADULT_PRICE = (\d+);', content)
    child_price_match = re.search(r'const CHILD_PRICE = (\d+);', content)
    
    if not adult_price_match:
        return content # Skip if not a standard tour file
    
    # Update person-selector UI
    # We want: ₩ Price × Count = ₩ Subtotal
    content = re.sub(
        r'(\d+,?\d*) × <span id="adult-count-text">(\d+)</span> = <b id="adult-subtotal">.*?</b>',
        r'₩ \1 × <span id="adult-count-text">\2</span> = <b id="adult-subtotal">₩ \1</b>', # Placeholder, will be updated by JS
        content
    )
    
    # Update updateTotalPrice
    update_total_price_pattern = r'function updateTotalPrice\(\) \{.*?\}'
    new_update_total_price = r"""function updateTotalPrice() {
        const adultSubtotal = adultCount * ADULT_PRICE;
        const childSubtotal = childCount * CHILD_PRICE;
        const total = BSUtils.calculateTotal(adultCount, ADULT_PRICE, childCount, CHILD_PRICE);

        document.getElementById('pc-adult-count').innerText = adultCount;
        document.getElementById('adult-count-text').innerText = adultCount;
        document.getElementById('adult-subtotal').innerText = BSUtils.formatPrice(adultSubtotal);

        if (document.getElementById('pc-child-count')) {
            document.getElementById('pc-child-count').innerText = childCount;
            document.getElementById('child-count-text').innerText = childCount;
            document.getElementById('child-subtotal').innerText = BSUtils.formatPrice(childSubtotal);
        }

        const totalStr = BSUtils.formatPrice(total);
        document.getElementById('display-total-price').innerText = totalStr;
        document.getElementById('buy-btn').innerText = totalStr + ' 구매하기';
        if (document.getElementById('m-buy-btn')) {
            document.getElementById('m-buy-btn').innerText = totalStr + ' 구매하기';
        }
    }"""
    content = re.sub(update_total_price_pattern, new_update_total_price, content, flags=re.DOTALL)
    
    # Update handleBuy and addToCart
    content = re.sub(
        r'function handleBuy\(\) \{.*?BSUtils\.buyNow\(item\);',
        r'function handleBuy() { const total = BSUtils.calculateTotal(adultCount, ADULT_PRICE, childCount, CHILD_PRICE); const item = { name: document.querySelector("h1").innerText, price: total / (adultCount + childCount || 1), count: adultCount + childCount, totalPrice: total, date: selectedDate, details: `성인 ${adultCount}, 소인 ${childCount}` }; BSUtils.buyNow(item); }',
        content, flags=re.DOTALL
    )
    
    # If handleBuy doesn't use BSUtils yet
    if 'BSUtils.buyNow(item)' not in content:
         content = re.sub(
            r'function handleBuy\(\) \{.*?window\.open\(\'booking-form\.html\', \'_blank\'\);',
            r'function handleBuy() { const total = BSUtils.calculateTotal(adultCount, ADULT_PRICE, childCount, CHILD_PRICE); const item = { name: document.querySelector("h1").innerText, price: total / (adultCount + childCount || 1), count: adultCount + childCount, totalPrice: total, date: selectedDate, details: `성인 ${adultCount}, 소인 ${childCount}` }; BSUtils.buyNow(item); }',
            content, flags=re.DOTALL
        )

    content = re.sub(
        r'function addToCart\(\) \{.*?BSUtils\.saveToCart\(item\);',
        r'function addToCart() { const total = BSUtils.calculateTotal(adultCount, ADULT_PRICE, childCount, CHILD_PRICE); const item = { name: document.querySelector("h1").innerText, price: total / (adultCount + childCount || 1), count: adultCount + childCount, totalPrice: total, date: selectedDate, details: `성인 ${adultCount}, 소인 ${childCount}` }; BSUtils.saveToCart(item); }',
        content, flags=re.DOTALL
    )
    
    # If addToCart doesn't use BSUtils yet
    if 'BSUtils.saveToCart(item)' not in content:
        content = re.sub(
            r'function addToCart\(\) \{.*?window\.location\.assign\(\'cart\.html\'\);.*?\}',
            r'function addToCart() { const total = BSUtils.calculateTotal(adultCount, ADULT_PRICE, childCount, CHILD_PRICE); const item = { name: document.querySelector("h1").innerText, price: total / (adultCount + childCount || 1), count: adultCount + childCount, totalPrice: total, date: selectedDate, details: `성인 ${adultCount}, 소인 ${childCount}` }; BSUtils.saveToCart(item); }',
            content, flags=re.DOTALL
        )

    return content

for filename in files_to_update:
    filepath = f'/home/user/boracaysean/{filename}'
    if not os.path.exists(filepath):
        print(f'File not found: {filepath}')
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if filename in spa_files:
        new_content = update_spa_file(content, filename)
    else:
        new_content = update_tour_file(content, filename)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'Updated {filename}')
