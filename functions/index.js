const { onCall } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();

// API 키를 보안 Secret으로 정의 (경고 메시지 해결)
const geminiKey = defineSecret("GEMINI_KEY");

const BORACAY_PRODUCTS = [
  { id: "hopping", name: "블랙펄 요트 호핑투어", price: 65000, category: "tour", desc: "보라카이 최고급 요트 스노클링 및 선셋 파티", url: "/hopping-tour.html" },
  { id: "malumpati", name: "시크릿가든 말룸파티", price: 70000, category: "tour", desc: "에메랄드빛 계곡 물놀이 및 닭백숙 식사", url: "/malumpati.html" },
  { id: "pickup", name: "공항 왕복 픽업샌딩", price: 40000, category: "essential", desc: "공항에서 리조트까지 안전한 단독/조인 이동", url: "/pickup-sending.html" },
  { id: "poseidon", name: "포세이돈 스파", price: 80000, category: "massage", desc: "보라카이 최고의 럭셔리 스파 시설", url: "/poseidon.html" },
  { id: "aspa", name: "아유르베다 스파", price: 55000, category: "massage", desc: "태반 마사지로 유명한 가성비 최고의 스파", url: "/aspa.html" }
];

// 최신 v2 onCall 방식 적용
exports.chatWithAI = onCall({ secrets: [geminiKey] }, async (request) => {
  const userMessage = request.data.message;
  const history = request.data.history || [];

  // Secret 값 읽기
  const genAI = new GoogleGenerativeAI(geminiKey.value());
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemPrompt = `
    당신은 '보라카이션(Boracay Sean)'의 수석 여행 상담원 '션'입니다.
    당신은 반드시 아래 제공된 [보라카이션 공식 상품 정보]만을 바탕으로 답변해야 합니다.

    [절대 규칙]
    1. 타사 상품 언급 금지: 데이터에 없는 외부 투어나 서비스는 절대 추천하거나 언급하지 마세요.
    2. 보라카이션 전용: 고객이 "뭐가 좋아?" 혹은 추천을 요청하면 반드시 보라카이션의 '블랙펄 호핑', '말룸파티', '마사지' 상품으로 연결하세요.
    3. 전문성: 15년 경력의 보라카이 전문가답게 우리 상품의 장점을 강조하세요.
    4. 질문 유도: 대화 중에 여행 날짜, 인원, 누구와 가는지(커플/가족)를 물어보고 맞춤형으로 우리 상품을 제안하세요.
    5. 예약 유도: 모든 답변의 끝은 구체적인 예약 의사를 묻거나 장바구니 유도로 마무리하세요.
    6. 모르는 내용: 보라카이션 상품과 관련 없는 질문이나 모르는 내용은 답변을 지어내지 말고 "자세한 사항은 실시간 카톡 상담을 통해 보라카이션 전문가가 직접 안내해 드릴게요!"라고 안내하세요.

    [보라카이션 공식 상품 정보]
    ${JSON.stringify(BORACAY_PRODUCTS)}
  `;

  try {
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "알겠습니다. 보라카이션 상담원 '션'으로서 최고의 상담을 시작합니다!" }] },
        ...history.map(h => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }]
        }))
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const aiResponse = result.response.text();

    const recommendedButtons = BORACAY_PRODUCTS.filter(p => aiResponse.includes(p.name));

    return {
      text: aiResponse,
      buttons: recommendedButtons
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "죄송합니다. 션이 잠시 자리를 비웠습니다. 카톡 상담으로 바로 연결해 드릴까요?" };
  }
});
