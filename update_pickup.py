import json

file_path = '/Users/dongdobng/.gemini/antigravity/scratch/BORACAY_SEAN/api/content/pickup-sending.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

data['summary'] = "칼리보공항 및 까띠끌란공항에서 리조트까지 전 과정을 밀착 케어하는 프리미엄 픽업샌딩 서비스"
data['description'] = "단순한 이동 수단이 아닙니다. 공항 미팅, 차량 이동, 선착장 안내, 보트 탑승, 호텔 도착까지 여행의 시작과 끝을 보라카이션 전담 직원이 완벽하게 함께하는 통합 케어 서비스입니다."
data['included'] = [
    "보험 가입 차량 및 항구 배값, 환경세, 터미널피",
    "보라카이션 현지 스텝 밀착 케어",
    "항구 내 짐꾼(포터) 서비스 무료",
    "1인 30달러 상당 아일랜드투어 무료 제공",
    "칼리보공항 미팅 시 시원한 생수 무료 제공",
    "귀국 샌딩 시 칼리보공항 인근 '원카페 라운지' 무료 이용",
    "보라카이 지도 및 멤버십 할인카드"
]
data['benefits'] = [
    "1인 30달러 상당 아일랜드투어 무료 제공 (여행 일정 풍성)",
    "귀국 시 원카페 라운지 무료 이용 (출국 전 쾌적한 휴식)",
    "복잡한 항구 프리패스 서비스 (직원 동행 안내)",
    "칼리보 공항 미팅 시 시원한 생수 즉시 제공",
    "무거운 캐리어 포터 서비스 전면 무료"
]

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

html_path = '/Users/dongdobng/.gemini/antigravity/scratch/BORACAY_SEAN/api/content/pickup-sending.html'
with open(html_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
