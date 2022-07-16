import { initializeApp } from "firebase/app";
const firebaseConfig = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CREDENTIALS);
const app = initializeApp(firebaseConfig);

export default app;
