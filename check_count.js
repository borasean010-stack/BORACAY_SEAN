import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDkDjmGKQDF-0Vu2S_qtI6W5Hf2-j4tKcM",
    authDomain: "boracaysean-69b4a.firebaseapp.com",
    projectId: "boracaysean-69b4a",
    storageBucket: "boracaysean-69b4a.firebasestorage.app",
    messagingSenderId: "806585874771",
    appId: "1:806585874771:web:64a094d241730ca38109a6"
};

async function check() {
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const snap = await getDocs(collection(db, "reservations"));
        console.log("------------------------------");
        console.log("현재 총 예약 개수:", snap.size);
        snap.forEach(d => {
            const data = d.data();
            console.log("- 고객명:", data.customerKorName, "| 상태:", data.status);
        });
        console.log("------------------------------");
    } catch (e) {
        console.error("확인 오류:", e);
    }
}
check();
