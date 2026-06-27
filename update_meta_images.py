import os

# List of files and their corresponding images
updates = [
    ('hopping-tour.html', '블랙펄 1.jpg'),
    ('aspa.html', 'aspa1.jpg'),
    ('spa.html', 'spa1.jpg'),
    ('poseidon.html', 'poseidon1.jpg'),
    ('maris.html', 'maris1.jpg'),
    ('kabayan.html', 'kabayan1.jpg'),
    ('luna.html', 'luna1.jpg'),
    ('boraspa.html', 'boraspa1.jpg'),
    ('helios.html', 'helios1.jpg'),
    ('freediving.html', 'free1.jpg'),
    ('land-tour.html', 'beach1.jpg'),
    ('jl-snap.html', 'jl1.jpg'),
    ('bora-ajae-hopping.html', 'bora1.jpg'),
    ('parasailing.html', 'para1.jpg'),
    ('scuba-diving.html', 'diving1.jpg'),
    ('helmet-diving.html', 'he1.jpg'),
    ('jetski.html', 'ze1.jpg'),
    ('golf.html', 'Golf1.jpg'),
    ('crimson-resort.html', 'Crimson1.png'),
    ('henann-garden-resort.html', 'henann_garden1.png'),
    ('henann-lagoon-resort.html', 'henann_lagoon_1.png'),
    ('henann-crystal-sands.html', 'henann_sands1.png'),
    ('henann-palm-beach.html', 'henann_palm_1.png'),
    ('henann-park.html', 'henann_park1.png'),
    ('henann-prime-beach.html', 'henann_prime1.png'),
    ('henann-regency-resort.html', 'henann_regency_1.png'),
    ('shangrila-resort.html', 'shangrila1.png')
]

old_url = 'https://www.boracaysean.com/og-image.png'

for filename, image in updates:
    filepath = f'/home/user/boracaysean/{filename}'
    if not os.path.exists(filepath):
        print(f'File not found: {filepath}')
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the old URL with the new URL, including the filename
    new_url = f'https://www.boracaysean.com/{image}'
    new_content = content.replace(old_url, new_url)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'Updated {filename} to use {new_url}')
