const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { OpenAI } = require("openai");

admin.initializeApp();

const openai = new OpenAI({
  apiKey: functions.config().openai.key, // Firebase config에서 키를 가져옴
});

// 보라카이션 상품 데이터 (AI 학습용)
const BORACAY_PRODUCTS = [
  { id: "hopping", name: "블랙펄 요트 호핑투어", price: 65000, category: "tour", desc: "보라카이 최고급 요트 스노클링 및 선셋 파티", url: "/hopping-tour.html" },
  { id: "malumpati", name: "시크릿가든 말룸파티", price: 70000, category: "tour", desc: "에메랄드빛 계곡 물놀이 및 닭백숙 식사", url: "/malumpati.html" },
  { id: "pickup", name: "공항 왕복 픽업샌딩", price: 40000, category: "essential", desc: "공항에서 리조트까지 안전한 단독/조인 이동", url: "/pickup-sending.html" },
  { id: "poseidon", name: "포세이돈 스파", price: 80000, category: "massage", desc: "보라카이 최고의 럭셔리 스파 시설", url: "/poseidon.html" },
  { id: "aspa", name: "아유르베다 스파", price: 55000, category: "massage", desc: "태반 마사지로 유명한 가성비 최고의 스파", url: "/aspa.html" }
];

exports.chatWithAI = functions.https.onCall(async (data, context) => {
  const userMessage = data.message;
  const chatHistory = data.history || [];

  const systemPrompt = `
    당신은 '보라카이션(Boracay Sean)'의 수석 여행 상담원 '션'입니다.
    당신의 목표는 고객에게 친절하게 답변하고, 상황에 맞는 보라카이 여행 상품을 추천하여 예약을 유도하는 것입니다.

    [상담 지침]
    1. 말투: 친절하고 전문적인 한국어 사용 (예: "~하세요 😊", "~입니다!")
    2. 파악: 여행 날짜, 인원, 누구와 가는지(커플, 가족 등)를 자연스럽게 물어보세요.
    3. 추천: 보라카이션의 상품 데이터를 기반으로 2~3개를 추천하세요.
    4. 연동: 추천 시 상품명을 정확히 언급하세요. (시스템이 버튼을 생성할 수 있도록)
    5. 유도: 마지막에는 항상 "상세 일정을 짜드릴까요?" 또는 "예약을 도와드릴까요?"라고 물으세요.

    [상품 정보]
    ${JSON.stringify(BORACAY_PRODUCTS)}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // 또는 gpt-4
      messages: [
        { role: "system", content: systemPrompt },
        ...chatHistory,
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
    });

    const aiResponse = response.choices[0].message.content;

    // 추천된 상품을 분석하여 버튼 정보 추출 (간이 로직)
    const recommendedButtons = BORACAY_PRODUCTS.filter(p => aiResponse.includes(p.name));

    return {
      text: aiResponse,
      buttons: recommendedButtons
    };
  } catch (error) {
    console.error("OpenAI Error:", error);
    return { text: "죄송합니다. 잠시 상담이 어렵습니다. 카톡 상담을 이용해 주세요!" };
  }
});
