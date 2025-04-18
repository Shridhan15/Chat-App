import React, { useContext, useState } from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const {
    userData,
    chatData,
    messagesId,
    setMessagesId,
    chatUser,
    setChatUser,
  } = useContext(AppContext);

  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    try {
      // get the input from search box and all user from users collection and run a query to match username in collection with input value

      const input = e.target.value;
      if (input) {
        setShowSearch(true);

        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          //set the user if he is not in frind list
          //if the query user is already present in chatData of current user dont show it
          let userExist = false;
          chatData.map((user) => {
            if (user.rid === querySnap.docs[0].data().id) {
              userExist = true;
            }
          });
          if (!userExist) {
            setUser(querySnap.docs[0].data());
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {}
  };

  // Creates a new empty message thread in messages/ collection. Adds a chatsData entry in both users' chats/ documents with the new message ID. Ensures chat starts from both sides.
  const addChat = async () => {
    const messagesRef = collection(db, "messages"); //create new collection
    const chatRef = collection(db, "chats");
    try {
      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        messages: [],
      });
      // add chat for receiver
      await updateDoc(doc(chatRef, user.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          updataAt: Date.now(),
          messageSeen: true,
        }),
      });

      //add chat of current user
      await updateDoc(doc(chatRef, userData.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updataAt: Date.now(),
          messageSeen: true,
        }),
      });
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const setChat = async (item) => {
    try {
      setMessagesId(item.messageId);
      setChatUser(item);

      // below is for mark message as seen after chap opened
      const userChatsRef = doc(db, "chats", userData.id);
      const userChatsSnaphot = await getDoc(userChatsRef);
      const userChatsData = userChatsSnaphot.data();
      const chatIndex = userChatsData.chatsData.findIndex(
        (c) => c.messageId === item.messageId
      );
      userChatsData.chatsData[chatIndex].messageSeen = true;
      await updateDoc(userChatsRef, {
        chatsData: userChatsData.chatsData,
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="ls">
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} alt="" className="logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input
            onChange={inputHandler}
            type="text"
            placeholder="search here"
          />
        </div>
      </div>

      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar} alt="" />
            <p>{user.name}</p>
          </div>
        ) : (
          chatData &&
          chatData.map((item, index) => (
            <div
              onClick={() => setChat(item)}
              key={index}
              className={`friends ${
                item.messageSeen || item.messageId === messagesId
                  ? ""
                  : "border"
              }`}
            >
              <img src={item.userData.avatar} alt="" />
              <div>
                <p>{item.userData.name}</p>
                <span>{item.lastMessage}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
