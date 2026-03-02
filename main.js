
document.addEventListener('DOMContentLoaded', () => {
    const sampleTours = [
        {
            image: 'https://images.unsplash.com/photo-1596626530433-28795aa7bdd5?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            title: '[투어] 보라카이 선셋 세일링 보트',
            location: '보라카이',
            price: '25,000'
        },
        {
            image: 'https://images.unsplash.com/photo-1542370285-b8eb8317691c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            title: '[체험] 세부 오슬롭 고래상어 투어',
            location: '세부',
            price: '75,000'
        },
        {
            image: 'https://images.unsplash.com/photo-1581790833158-6a5b463768c8?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            title: '[입장권] 방콕 마하나콘 스카이워크',
            location: '방콕',
            price: '32,000'
        },
        {
            image: 'https://images.unsplash.com/photo-1628793363989-5847a98a5626?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            title: '[투어] 다낭 바나힐 국립공원 투어',
            location: '다낭',
            price: '68,000'
        },
        {
            image: 'https://images.unsplash.com/photo-1574343270903-b0e1b6a47b9c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            title: '코타키나발루 반딧불 투어',
            location: '코타키나발루',
            price: '45,000'
        }
    ];

    const sampleAccommodations = [
        {
            image: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            title: '[리조트] 샹그릴라 보라카이',
            location: '보라카이',
            price: '450,000'
        },
        {
            image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            title: '[리조트] 플랜테이션 베이 리조트 & 스파',
            location: '세부',
            price: '280,000'
        },
        {
            image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            title: '[호텔] 반얀트리 방콕',
            location: '방콕',
            price: '350,000'
        },
        {
            image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1949&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            title: '[리조트] 인터컨티넨탈 다낭 선 페닌슐라',
            location: '다낭',
            price: '550,000'
        },
        {
            image: 'https://images.unsplash.com/flagged/photo-1573842323334-3c7d60f95267?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            title: '샹그릴라 탄중아루, 코타키나발루',
            location: '코타키나발루',
            price: '380,000'
        }
    ];

    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';

        card.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-location">${product.location}</p>
                <p class="product-price"><strong>${product.price}</strong>원~</p>
            </div>
        `;
        return card;
    }

    const toursContainer = document.getElementById('tours-tickets');
    const accommodationsContainer = document.getElementById('accommodations');

    sampleTours.forEach(tour => {
        toursContainer.appendChild(createProductCard(tour));
    });

    sampleAccommodations.forEach(acc => {
        accommodationsContainer.appendChild(createProductCard(acc));
    });
});
