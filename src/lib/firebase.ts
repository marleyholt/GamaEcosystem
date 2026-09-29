import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updatePassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Teste de conexão seguro com tratamento resiliente de modo offline
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    // Usamos getDocFromServer apenas quando houver conectividade online
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    // Código 'unavailable' ou mensagem 'offline' indicam operação offline normal do Firestore
    if (
      error?.code === 'unavailable' ||
      (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('unavailable') || error.message.includes('Could not reach Cloud Firestore')))
    ) {
      // Modo offline transparente do Firestore sem poluir o console ou quebrar a UI
      return false;
    }
    return false;
  }
}

// Inicializar teste em background
testFirebaseConnection();

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updatePassword,
  signOut,
  onAuthStateChanged,
  type FirebaseUser
};
