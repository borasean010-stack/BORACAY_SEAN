const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();

// 보내주신 키를 Firebase 설정에서 가져오도록 세팅 (Gemini 전용)
const genAI = new GoogleGenerativeAI(functions.config().gemini.key);

const BORACAY_PRODUCTS = [
  { id: "hopping", name: "블랙펄 요트 호핑투어", price: 65000, category: "tour", desc: "보라카이 최고급 요트 스노클링 및 선셋 파티", url: "/hopping-tour.html" },
  { id: "malumpati", name: "시크릿가든 말룸파티", price: 70000, category: "tour", desc: "에메랄드빛 계곡 물놀이 및 닭백숙 식사", url: "/malumpati.html" },
  { id: "pickup", name: "공항 왕복 픽업샌딩", price: 40000, category: "essential", desc: "공항에서 리조트까지 안전한 단독/조인 이동", url: "/pickup-sending.html" },
  { id: "poseidon", name: "포세이돈 스파", price: 80000, category: "massage", desc: "보라카이 최고의 럭셔리 스파 시설", url: "/poseidon.html" },
  { id: "aspa", name: "아유르베다 스파", price: 55000, category: "massage", desc: "태반 마사지로 유명한 가성비 최고의 스파", url: "/aspa.html" }
];

exports.chatWithAI = functions.https.onCall(async (data, context) => {
  const userMessage = data.message;
  const history = data.history || [];

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemPrompt = `
    당신은 '보라카이션(Boracay Sean)'의 수석 여행 상담원 '션'입니다.
    보라카이 15년 경력 전문가로서 고객에게 친절하고 전문적으로 답변하세요.

    [상담 지침]
    1. 말투: 친절한 한국어 사용 (예: "~하세요 😊", "~입니다!")
    2. 질문 유도: 여행 날짜, 인원, 여행 목적(가족/커플)을 꼭 물어보세요.
    3. 상품 추천: 아래 상품 데이터를 바탕으로 2~3개를 추천하세요. 상품명을 정확히 언급해야 합니다.
    4. 예약 유도: 마지막엔 항상 "예약을 도와드릴까요?"라고 물으세요.

    [상품 정보]
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

    // 추천된 상품 버튼 추출
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
