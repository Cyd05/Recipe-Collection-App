import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBBQOnjPzwtG_lBFkOYAK61gv42dWVWl1Y",
  authDomain: "recipe-collection-app-a61f6.firebaseapp.com",
  projectId: "recipe-collection-app-a61f6",
  storageBucket: "recipe-collection-app-a61f6.firebasestorage.app",
  messagingSenderId: "770108304039",
  appId: "1:770108304039:web:7318dcf6ca4d6f2056c982",
  measurementId: "G-E5XLE9L22J"
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)