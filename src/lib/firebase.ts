// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // <--- 1. ADICIONE ESSA LINHA

const firebaseConfig = {
  apiKey: "AIzaSyCrfQIFoDj_inSMPC-EO_VxbpWYpuwKc_Q",
  authDomain: "agendafacil-rm.firebaseapp.com",
  projectId: "agendafacil-rm",
  storageBucket: "agendafacil-rm.firebasestorage.app", // O bucket já estava certo aqui!
  messagingSenderId: "708549247541",
  appId: "1:708549247541:web:d5e430c0526f2e856ea77c",
  measurementId: "G-QD1BD9L7SC"
};

// Verifica se já iniciou para não dar erro de "dupla conexão"
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exporta as ferramentas
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // <--- INICIALIZA O STORAGE

export { app, auth, db, storage }; // <--- EXPORTA O STORAGE