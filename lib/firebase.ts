import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCCh4yCWXOtnfNYPb_wrecgZybDtL5bn9s',
  authDomain: 'pocket-heist-website-tjm.firebaseapp.com',
  projectId: 'pocket-heist-website-tjm',
  storageBucket: 'pocket-heist-website-tjm.firebasestorage.app',
  messagingSenderId: '815106244491',
  appId: '1:815106244491:web:8642a9944e10c4d83bb98e',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
