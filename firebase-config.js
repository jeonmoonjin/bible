// Firebase 초기화 - 새로남교회 다락방 성경 통독
// projectId: saeronam-bible
// groupId: tanbang5

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, doc,
  onSnapshot, setDoc, updateDoc, deleteField, deleteDoc, addDoc, getDoc, getDocs,
  query, where, orderBy, limit, serverTimestamp, writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth, signInAnonymously, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyARnV669WYQJc3qaUiGrmDIsET8fqlF0To",
  authDomain: "saeronam-bible.firebaseapp.com",
  projectId: "saeronam-bible",
  storageBucket: "saeronam-bible.firebasestorage.app",
  messagingSenderId: "777523382925",
  appId: "1:777523382925:web:06526e93ac12bf6b1430c4",
  measurementId: "G-PLLFM7LPLV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 다락방 ID는 URL ?g=... 로 받고, 없으면 기본값 tanbang5
const params = new URLSearchParams(location.search);
const GROUP_ID = params.get('g') || 'tanbang5';

// 익명 로그인 (Firestore 보안 규칙용)
let authReady = signInAnonymously(auth).catch(err => {
  console.error('익명 로그인 실패:', err);
});

// PIN 해시 (SHA-256 + 그룹별 salt)
async function hashPin(pin) {
  const data = new TextEncoder().encode(pin + ':saeronam:' + GROUP_ID);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

// 컬렉션/문서 경로 헬퍼
const groupRef     = () => doc(db, 'groups', GROUP_ID);
const membersRef   = () => collection(db, 'groups', GROUP_ID, 'members');
const memberRef    = (id) => doc(db, 'groups', GROUP_ID, 'members', id);
const progressRef  = () => collection(db, 'groups', GROUP_ID, 'progress');
const progressDocRef = (id) => doc(db, 'groups', GROUP_ID, 'progress', id);
const cheersRef    = () => collection(db, 'groups', GROUP_ID, 'cheers');

// 전역으로 노출 (앱에서 사용)
window.FB = {
  GROUP_ID,
  authReady,
  hashPin,
  db, doc, collection,
  onSnapshot, setDoc, updateDoc, deleteField, deleteDoc, addDoc, getDoc, getDocs,
  query, where, orderBy, limit, serverTimestamp, writeBatch,
  groupRef, membersRef, memberRef, progressRef, progressDocRef, cheersRef,
};

// 디스패치 이벤트로 알림
window.dispatchEvent(new Event('firebase-ready'));
