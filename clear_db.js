import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDkDjmGKQDF-0Vu2S_qtI6W5Hf2-j4tKcM",
    authDomain: "boracaysean-69b4a.firebaseapp.com",
    projectId: "boracaysean-69b4a",
    storageBucket: "boracaysean-69b4a.firebasestorage.app",
    messagingSenderId: "806585874771",
    appId: "1:806585874771:web:64a094d241730ca38109a6"
};

async function clearReservations() {
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const querySnapshot = await getDocs(collection(db, "reservations"));
        
        console.log(`Found ${querySnapshot.size} reservations to delete.`);
        
        const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, "reservations", d.id)));
        await Promise.all(deletePromises);
        
        console.log("All reservations cleared successfully.");
    } catch (e) {
        console.error("Error clearing reservations:", e);
    }
}

clearReservations();
