import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [messagesId,setMessagesId]=useState(null)
  const [messages,setMessages]=useState([])
  const [chatUser,setChatUser]=useState(null)
  const [chatVisible,setChatVisible]=useState(false)

  //get user data from users collection after locating user by uid
  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef); //snap is snapshot of document, contains user data
      const userData = userSnap.data();
      setUserData(userData);
      if (userData.avatar && userData.name) {
        navigate("/chat");
      } else {
        navigate("/profile");
      }
      await updateDoc(userRef, {
        lastSeen: Date.now(),
      });
      setInterval(async () => {
        //update last seen every one minute

        if (auth.chatUser) {
          await updateDoc(userRef, {
            lastSeen: Date.now(),
          });
        }
      }, 60000);
    } catch (error) {

    }
  };

  useEffect(()=>{
    if(userData){
      const chatref= doc(db,'chats',userData.id);
      const unSub=onSnapshot(chatref,async (res)=>{
          const chatItems=res.data().chatsData;
          const tempData=[];
          // chatsData is array of chats of our user, we will get all chats of user and will extract receiver of each chat
          for(const item of chatItems){
            const userRef=doc(db,'users',item.rId)
            const userSnap=await getDoc(userRef)
            const userData= userSnap.data()
            tempData.push({...item,userData})
          }
          // sort the chats on the basis of which is more recent
          setChatData(tempData.sort((a,b)=>b.updatedAt- a.updatedAt))

      })
      return ()=>{
        unSub()
      }
    }
  },[userData])

  const value = {
    userData,
    setUserData,
    chatData,
    setChatData,
    loadUserData,
    messages,setMessages,
    messagesId,setMessagesId,
    chatUser,setChatUser,
    chatVisible,setChatVisible
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
