import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Configuración de Firebase con variables de entorno de Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app = null;
let db: any = null;
let storage: any = null;
let auth: any = null;
let googleProvider: any = null;

const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

if (isFirebaseConfigured) {
  try {
    // Inicializar Firebase
    app = initializeApp(firebaseConfig);

    // Inicializar y exportar Base de Datos (Firestore)
    db = getFirestore(app);

    // Inicializar y exportar Storage
    storage = getStorage(app);

    // Inicializar y exportar Autenticación
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    app = null;
    db = null;
    storage = null;
    auth = null;
    googleProvider = null;
  }
} else {
  console.warn(
    "Firebase environment variables are missing (VITE_FIREBASE_API_KEY / VITE_FIREBASE_PROJECT_ID). " +
    "Running in offline mode using local storage fallbacks."
  );
}

export { app, db, storage, auth, googleProvider };
