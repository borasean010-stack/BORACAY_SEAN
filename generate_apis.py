import os

api_dir = '/Users/dongdobng/.gemini/antigravity/scratch/BORACAY_SEAN/api/content'
os.makedirs(api_dir, exist_ok=True)

apis = {
    'hopping-tour.html': """<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>블랙펄 요트호핑투어 API 데이터</title></head>
<body>
    <h1>보라카이션 블랙펄 요트호핑투어</h1>
    <p>기존의 방카가 아닌 럭셔리 대형 요트에서 진행되는 선상 파티 호핑투어. 1인 55,000원.</p>
    <h2>진행 일정</h2>
    <ol>
        <li>개별 미팅(화이트/블라복 비치)</li>
        <li>요트 승선 및 스노클링 (고프로 수중촬영)</li>
        <li>선상 파티 및 간식 (K팝 댄스 파티)</li>
        <li>선셋 감상 및 개별 해산</li>
    </ol>
    <h2>포함 사항</h2>
    <ul>
        <li>블랙펄 요트 탑승 (화장실 있음), 스노클장비 + 오리발 + 구명조끼</li>
        <li>라면, 주먹밥, 김치, 과일, 핑거푸드 (칵테일, 음료 무제한)</li>
        <li>고프로 수중 촬영 지원, 멀미약, 현지 스텝 동행</li>
    </ul>
    <h2>불포함 사항</h2>
    <ul>
        <li>환경세 100페소 필수 (현지 지불)</li>
        <li>점보크랩밀 추가 옵션(1인 $30)</li>
        <li>여행자 보험, 아쿠아슈즈</li>
    </ul>
    <h2>셀링 포인트</h2>
    <p>흔들림이 적어 멀미가 없고, 쾌적하고 깔끔하여 부모님과 아이를 동반한 가족 여행객에게 최고의 선택입니다.</p>
</body>
</html>""",

    'malumpati.html': """<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>시크릿가든 말룸파티 투어 API 데이터</title></head>
<body>
    <h1>시크릿가든 말룸파티 투어</h1>
    <p>보라카이 내륙 블루라군에서 다이빙과 튜빙을 즐기는 계곡 투어. 1인 99,000원.</p>
    <h2>진행 일정</h2>
    <ol>
        <li>숙소 로비 픽업 및 이동</li>
        <li>블루라군 자유 수영, 다이빙, 카약 (촬영 서비스)</li>
        <li>시크릿가든 전용 베이스캠프에서 한방백숙 식사</li>
        <li>숙소 샌딩 복귀</li>
    </ol>
    <h2>포함 사항</h2>
    <ul>
        <li>왕복 차량, 시크릿가든 입장료, 배값/터미널피/환경세</li>
        <li>구명조끼, 카약 대여, 촬영 서비스</li>
        <li>한방백숙 한상, 라면, 김치, 과일 (맥주, 음료 무제한)</li>
    </ul>
    <h2>불포함 사항</h2>
    <ul>
        <li>튜빙 비용 1인 350페소 (현지 지불)</li>
        <li>가이드 매너팁 1인 100페소 필수</li>
        <li>닥터피쉬 체험, 여행자 보험</li>
    </ul>
    <h2>셀링 포인트</h2>
    <p>우리끼리 프라이빗하게 쉴 수 있는 전용 베이스캠프와 든든한 한방백숙 무제한 제공이 특징입니다.</p>
</body>
</html>""",

    'whale-shark-tour.html': """<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>리버타드 고래상어 투어 API 데이터</title></head>
<body>
    <h1>리버타드 고래상어 투어</h1>
    <p>보라카이 인근에서 즐기는 야생 고래상어 수중 감상 투어. 1인 97,500원.</p>
    <h2>특징 및 장점</h2>
    <ul>
        <li>세부처럼 새벽부터 차를 오래 탈 필요 없이, 아침에 출발해 반나절이면 투어 완료</li>
        <li>수영을 못해도 현지 가이드가 1:1로 밀착 케어하여 구명조끼를 입고 안전하게 감상</li>
        <li>고프로를 이용해 고래상어와 함께 인생샷 수중 촬영 무료 제공</li>
    </ul>
    <h2>셀링 포인트</h2>
    <p>세부 오슬롭까지 가지 않아도 보라카이에서 편안하게 고래상어를 볼 수 있어 시간과 체력이 절약됩니다.</p>
</body>
</html>""",

    'package-signature.html': """<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>시그니처 패키지 API 데이터</title></head>
<body>
    <h1>⭐ 시그니처 패키지</h1>
    <p>보라카이션의 모든 인기 필수 투어를 하나로 모은 궁극의 가성비 올인원 패키지.</p>
    <h2>포함 투어 목록</h2>
    <ol>
        <li>공항 왕복 픽업샌딩</li>
        <li>리버타드 고래상어 투어</li>
        <li>보라카이션 블랙펄 요트호핑투어</li>
        <li>시크릿가든 말룸파티</li>
    </ol>
    <h2>셀링 포인트</h2>
    <p>단품으로 하나씩 예약하는 것보다 가장 높은 할인이 적용되어 비용을 크게 아낄 수 있습니다. 일정 고민 없이 이 패키지 하나면 보라카이 여행 준비가 끝납니다!</p>
</body>
</html>""",
    
    'package-tour.html': """<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>고래팩 시리즈 API 데이터</title></head>
<body>
    <h1>고래팩 시리즈 패키지</h1>
    <p>최신 트렌드인 리버타드 고래상어 투어와 픽업샌딩, 호핑 등을 결합해 할인해주는 가성비 패키지입니다.</p>
    <h2>고래팩 종류</h2>
    <ul>
        <li><strong>고래팩 A:</strong> 고래상어 + 공항 왕복 픽업샌딩</li>
        <li><strong>고래팩 B:</strong> 고래상어 + 블랙펄 요트호핑투어</li>
        <li><strong>고래팩 C:</strong> 고래상어 + 시크릿가든 말룸파티</li>
        <li><strong>고래팩 D:</strong> 고래상어 + 픽업샌딩 + 블랙펄 요트호핑투어</li>
        <li><strong>고래팩 E:</strong> 고래상어 + 픽업샌딩 + 시크릿가든 말룸파티</li>
    </ul>
</body>
</html>""",

    'tour-combo-pack.html': """<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>픽샌팩 및 일반 패키지 API 데이터</title></head>
<body>
    <h1>픽샌팩 & 일반 패키지</h1>
    <p>공항 왕복 픽업샌딩을 기본으로 하여 원하는 투어를 추가해 할인받는 패키지 시리즈입니다.</p>
    <h2>픽샌팩 시리즈 (픽업샌딩 + 단일 투어)</h2>
    <ul>
        <li><strong>픽샌팩 A:</strong> 픽업샌딩 + 블랙펄 요트호핑투어</li>
        <li><strong>픽샌팩 B:</strong> 픽업샌딩 + 리버타드 고래상어 투어</li>
        <li><strong>픽샌팩 C:</strong> 픽업샌딩 + 시크릿가든 말룸파티</li>
    </ul>
    <h2>일반 패키지 시리즈 (픽업샌딩 + 투어 2종)</h2>
    <ul>
        <li><strong>패키지 A:</strong> 픽업샌딩 + 블랙펄 요트호핑투어 + 고래상어</li>
        <li><strong>패키지 B:</strong> 픽업샌딩 + 블랙펄 요트호핑투어 + 시크릿가든 말룸파티</li>
        <li><strong>패키지 C:</strong> 픽업샌딩 + 고래상어 + 시크릿가든 말룸파티</li>
    </ul>
</body>
</html>"""
}

for filename, html_content in apis.items():
    with open(os.path.join(api_dir, filename), 'w', encoding='utf-8') as f:
        f.write(html_content)

print("SUCCESS")
