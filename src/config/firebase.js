// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, setDoc, doc, collection, query, where, getDoc, getDocs } from "firebase/firestore"; // <- added doc here
import { toast } from "react-toastify";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDNPyDwfIzdYxGs_00fltTC6IHYamUDqVc",
  authDomain: "chat-app-gs-2bb02.firebaseapp.com",
  projectId: "chat-app-gs-2bb02",
  storageBucket: "chat-app-gs-2bb02.firebasestorage.app",
  messagingSenderId: "228745868025",
  appId: "1:228745868025:web:e5cf17a1220c0c63296828"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app)

//we are using firebase methods to  sighn in and login
const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password)
    const user = res.user;
    //store user data in users collection
    //for every  user two collection are ceated user, to store user info and chat info
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey there I am using chat app",//default bio
      lastSeen: Date.now()
    })

    await setDoc(doc(db, "chats", user.uid), {
      chatsData: []
    })
  } catch (error) {
    console.error(error)
    toast.error(error.code.split('/')[1].split('-').join(" "))

  }
}

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password)

  } catch (error) {
    console.error(error)
    toast.error(error.code.split('/')[1].split('-').join(" "))
  }

}


const logout = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    toast.error(error.code.split('/')[1].split('-').join(" "))
  }
}

const resetPass = async (email) => {
  if (!email) {
    toast.error("Enter your email")
    return null;
  }
  try {
    const userRef = collection(db, 'user');
    const q = query(userRef, where("email", '==', email))
    const querySnap = await getDocs(q)
    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth, email)
      toast.success("Reset email sent")
    } else {
      toast.error("Email does not exist")
    }
  } catch (error) {
    console.error(error)
    toast.error(error.message)
  }
}

export { signup, login, logout, auth, db, resetPass }