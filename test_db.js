import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDkDjmGKQDF-0Vu2S_qtI6W5Hf2-j4tKcM",
    authDomain: "boracaysean-69b4a.firebaseapp.com",
    projectId: "boracaysean-69b4a",
    storageBucket: "boracaysean-69b4a.firebasestorage.app",
    messagingSenderId: "806585874771",
    appId: "1:806585874771:web:64a094d241730ca38109a6"
};

async function test() {
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const docRef = await addDoc(collection(db, "reservations"), {
            customerKorName: "시스템 점검 테스트",
            status: "입금대기",
            totalPrice: 0,
            createdAt: serverTimestamp(),
            items: [{name: "데이터 복구 확인용"}]
        });
        console.log("Test doc added:", docRef.id);
    } catch (e) {
        console.error("Test error:", e);
    }
}
test();
