import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import socket from '../socket';
import '../css/Chat.css';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

const Chat = () => {
  const user = useSelector(state => state.user);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [targetUser, setTargetUser] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const emojiRef = useRef();

  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  const toggleDark = () => document.body.classList.toggle("dark-mode");

  // Load saved message input
  useEffect(() => {
    const savedMessage = localStorage.getItem("chatMessageInput");
    if (savedMessage) setMessage(savedMessage);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessageInput", message);
  }, [message]);

  // Load saved uploaded image on refresh
  useEffect(() => {
    const savedImageUrl = localStorage.getItem("chatUploadedImageUrl");
    if (savedImageUrl) setUploadedImageUrl(savedImageUrl);
  }, []);

  const sendMessage = () => {
    const finalMessage = message.trim();

    // If no text and no photo, do not send
    if (!finalMessage && !uploadedImageUrl) return;
    if (!targetUser) return;

    const messageData = {
      text: finalMessage || "",
      sender: user._id,
      receiver: targetUser._id,
      photo: uploadedImageUrl || null,
    };

    socket.emit('send_message', messageData);

    // Reset inputs
    setMessage("");
    setUploadedImageUrl("");
    localStorage.removeItem("chatMessageInput");
    localStorage.removeItem("chatUploadedImageUrl");
    setShowEmojiPicker(false);
  };

  const deleteMessage = async (msgId) => {
    try {
      await fetch(`/message/${msgId}`, {
        method: 'DELETE',
        headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
      });
      setChatHistory(prev => prev.filter(msg => msg._id !== msgId));

      socket.emit('delete_message', { msgId, sender: user._id, receiver: targetUser._id });
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "insta-clone");
    formData.append("cloud_name", "harshcloud2802");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/harshcloud2802/image/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (result.secure_url) {
        setUploadedImageUrl(result.secure_url);
        localStorage.setItem("chatUploadedImageUrl", result.secure_url);
      } else {
        alert("Image upload failed.");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Upload failed. Check console.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const savedTarget = localStorage.getItem("selectedChatUser");
    if (savedTarget) {
      try {
        setTargetUser(JSON.parse(savedTarget));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const chatBox = document.querySelector(".chat-box");
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
  }, [chatHistory]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/followed-users', {
          headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
        });
        const data = await res.json();
        setAllUsers(data.filter(u => u.username !== user.username));
      } catch {}
    };
    if (user?.username) fetchUsers();
  }, [user]);

  useEffect(() => {
    if (!user?._id || !targetUser?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/messages/${user._id}/${targetUser._id}`);
        const data = await res.json();
        setChatHistory(Array.isArray(data) ? data : []);
      } catch {
        setChatHistory([]);
      }
    };

    fetchMessages();
    socket.emit('join', user._id);

    const handleReceiveMessage = (data) => {
      if (
        (data.sender._id === user._id && data.receiver._id === targetUser._id) ||
        (data.sender._id === targetUser._id && data.receiver._id === user._id)
      ) {
        setChatHistory(prev => [...prev, data]);
      }
    };

    const handleDeleteMessage = ({ msgId }) => {
      setChatHistory(prev => prev.filter(msg => msg._id !== msgId));
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_deleted', handleDeleteMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_deleted', handleDeleteMessage);
    };
  }, [user, targetUser]);

  if (!user?.username) return <div>Loading user data...</div>;

  return (
    <div className="chat-container">
      <h2>💬 Chat</h2>
      <button onClick={toggleDark} className="send-button" style={{ float: 'right', marginBottom: '10px' }}>Toggle 🌙</button>

      {!targetUser ? (
        <>
          <h3>Select a user to chat with:</h3>
          <div className='user-list-container'>
            <ul className="user-list">
              {allUsers.map(u => (
                <li key={u._id} onClick={() => {
                  setTargetUser(u);
                  localStorage.setItem("selectedChatUser", JSON.stringify(u));
                }} className="user-list-item">
                  <img src={u.photo || "https://placehold.co/40"} alt={`${u.name}'s profile`} className="user-profile-pic" />
                  <div className="user-info">
                    <div className="user-name">{u.name}</div>
                    <div className="user-username">@{u.username}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <>
          <h3>Chatting with {targetUser.name}</h3>

          <div className="chat-box">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender._id === user._id ? 'own-message' : 'other-message'}`}>
                <div className='message-header'>
                  <div className="sender-info">
                    <img className='message-profile-pic' src={msg.sender.photo || "https://placehold.co/30"} alt={`${msg.sender.name}'s profile`} />
                    <span className="sender">{msg.sender.name}</span>
                  </div>
                  {msg.sender._id === user._id && (
                    <button className="delete-button" onClick={() => deleteMessage(msg._id)}>🗑️</button>
                  )}
                </div>
                <div className='message-text'>
                 
                  {msg.photo && (
                    <img src={msg.photo} alt="Chat media content" className="chat-image" onClick={() => setPreviewImage(msg.photo)} />
                  )}
                  {msg.text && <p className='message-text-content'>{msg.text}</p>}
                  </div>
                
              </div>
            ))}
          </div>

          {previewImage && (
            <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
              <img src={previewImage} alt="full preview" className="modal-image" />
            </div>
          )}

          <div className="chat-input-area">
            <label htmlFor="image-upload" className="send-button">📷</label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleImageUpload(file);
              }}
            />

            {uploadedImageUrl && (
              <div className="image-preview-container">
                <img src={uploadedImageUrl} alt="preview" className="image-preview" />
                <button onClick={() => {
                  setUploadedImageUrl("");
                  localStorage.removeItem("chatUploadedImageUrl");
                }} className="cancel-preview">🗑️</button>
              </div>
            )}

            <input
              type="text"
              value={message}
              placeholder="Type a message..."
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
              className="chat-input"
            />

            <div ref={emojiRef} style={{ position: "relative" }}>
              <button onClick={() => setShowEmojiPicker(prev => !prev)} className="send-button">😊</button>
              {showEmojiPicker && (
                <div className='emoji-picker-container'>
                  <button className='close-emoji-button' onClick={() => setShowEmojiPicker(false)}>❌</button>
                  <Picker data={data} onEmojiSelect={(e) => setMessage(prev => prev + e.native)} />
                </div>
              )}
            </div>

            <button onClick={sendMessage} className="send-button">Send</button>
          </div>

          <button onClick={() => {
            setTargetUser(null);
            localStorage.removeItem("selectedChatUser");
          }} className="back-button">⬅️ Back to user list</button>
        </>
      )}
    </div>
  );
};

export default Chat;










// import React, { useEffect, useState, useRef } from 'react';
// import { useSelector } from 'react-redux';
// import socket from '../socket';
// import '../css/Chat.css';
// import Picker from '@emoji-mart/react';
// import data from '@emoji-mart/data';

// const Chat = () => {
//   const user = useSelector(state => state.user);
//   const [message, setMessage] = useState("");
//   const [chatHistory, setChatHistory] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [targetUser, setTargetUser] = useState(null);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [previewImage, setPreviewImage] = useState(null);
//   const emojiRef = useRef();

//   const toggleDark = () => document.body.classList.toggle("dark-mode");

//   const sendMessage = () => {
//     const finalMessage = message.trim();
//     if (!finalMessage || !targetUser) return;

//     socket.emit('send_message', {
//       text: finalMessage,
//       sender: user._id,
//       receiver: targetUser._id,
//     });

//     setMessage("");
//     setShowEmojiPicker(false);
//   };

//   const deleteMessage = async (msgId) => {
//     try {
//       await fetch(`/message/${msgId}`, {
//         method: 'DELETE',
//         headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
//       });
//       setChatHistory(prev => prev.filter(msg => msg._id !== msgId));

//       // Emit socket event to notify other user
//       socket.emit('delete_message', { msgId, sender: user._id, receiver: targetUser._id });
//     } catch (err) {
//       console.error("Failed to delete message:", err);
//     }
//   };

//   const handleImageUpload = async (file) => {
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("upload_preset", "insta-clone");
//     formData.append("cloud_name", "harshcloud2802");

//     try {
//       const res = await fetch("https://api.cloudinary.com/v1_1/harshcloud2802/image/upload", {
//         method: "POST",
//         body: formData,
//       });

//       const result = await res.json();
//       if (result.secure_url) {
//         setMessage(result.secure_url);
//       } else {
//         alert("Image upload failed.");
//       }
//     } catch (err) {
//       console.error("Image upload error:", err);
//       alert("Upload failed. Check console.");
//     }
//   };

//   const isImageUrl = (text) => /\.(jpeg|jpg|gif|png|webp|svg|bmp|tiff|ico)$/i.test(text) || text.includes("cloudinary");

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (emojiRef.current && !emojiRef.current.contains(e.target)) {
//         setShowEmojiPicker(false);
//       }
//     };
//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     const savedTarget = localStorage.getItem("selectedChatUser");
//     if (savedTarget) {
//       try {
//         setTargetUser(JSON.parse(savedTarget));
//       } catch {}
//     }
//   }, []);

//   useEffect(() => {
//     const chatBox = document.querySelector(".chat-box");
//     if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
//   }, [chatHistory]);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await fetch('/followed-users', {
//           headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
//         });
//         const data = await res.json();
//         setAllUsers(data.filter(u => u.username !== user.username));
//       } catch {}
//     };
//     if (user?.username) fetchUsers();
//   }, [user]);

//   useEffect(() => {
//     if (!user?._id || !targetUser?._id) return;

//     const fetchMessages = async () => {
//       try {
//         const res = await fetch(`/messages/${user._id}/${targetUser._id}`);
//         const data = await res.json();
//         setChatHistory(Array.isArray(data) ? data : []);
//       } catch {
//         setChatHistory([]);
//       }
//     };

//     fetchMessages();
//     socket.emit('join', user._id);

//     const handleReceiveMessage = (data) => {
//       if (
//         (data.sender._id === user._id && data.receiver._id === targetUser._id) ||
//         (data.sender._id === targetUser._id && data.receiver._id === user._id)
//       ) {
//         setChatHistory(prev => [...prev, data]);
//       }
//     };

//     const handleDeleteMessage = ({ msgId }) => {
//       setChatHistory(prev => prev.filter(msg => msg._id !== msgId));
//     };

//     socket.on('receive_message', handleReceiveMessage);
//     socket.on('message_deleted', handleDeleteMessage);

//     return () => {
//       socket.off('receive_message', handleReceiveMessage);
//       socket.off('message_deleted', handleDeleteMessage);
//     };
//   }, [user, targetUser]);

//   if (!user?.username) return <div>Loading user data...</div>;

//   return (
//     <div className="chat-container">
//       <h2>💬 Chat</h2>
//       <button onClick={toggleDark} className="send-button" style={{ float: 'right', marginBottom: '10px' }}>Toggle 🌙</button>

//       {!targetUser ? (
//         <>
//           <h3>Select a user to chat with:</h3>
//           <div className='user-list-container'>
//             <ul className="user-list">
//               {allUsers.map(u => (
//                 <li key={u._id} onClick={() => {
//                   setTargetUser(u);
//                   localStorage.setItem("selectedChatUser", JSON.stringify(u));
//                 }} className="user-list-item">
//                   <img src={u.photo || "https://placehold.co/40"} alt={`${u.name}'s profile`} className="user-profile-pic" />
//                   <div className="user-info">
//                     <div className="user-name">{u.name}</div>
//                     <div className="user-username">@{u.username}</div>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </>
//       ) : (
//         <>
//           <h3>Chatting with {targetUser.name}</h3>

//           <div className="chat-box">
//             {chatHistory.map((msg, index) => (
//               <div key={index} className={`chat-message ${msg.sender._id === user._id ? 'own-message' : 'other-message'}`}>
//                 <div className='message-header'>
//                   <div className="sender-info">
//                     <img className='message-profile-pic' src={msg.sender.photo || "https://placehold.co/30"} alt={`${msg.sender.name}'s profile`} />
//                     <span className="sender">{msg.sender.name}</span>
//                   </div>
//                   {msg.sender._id === user._id && (
//                     <button className="delete-button" onClick={() => deleteMessage(msg._id)}>🗑️</button>
//                   )}
//                 </div>
//                 <div className='message-text'>
//                   {isImageUrl(msg.text) ? (
//                     <img src={msg.text} alt="Chat media content" className="chat-image" onClick={() => setPreviewImage(msg.text)} />
//                   ) : (
//                     <span>{msg.text}</span>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {previewImage && (
//             <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
//               <img src={previewImage} alt="full preview" className="modal-image" />
//             </div>
//           )}

//           <div className="chat-input-area">
//             <label htmlFor="image-upload" className="send-button">📷</label>
//             <input
//               type="file"
//               id="image-upload"
//               accept="image/*"
//               style={{ display: "none" }}
//               onChange={(e) => {
//                 const file = e.target.files[0];
//                 if (file) handleImageUpload(file);
//               }}
//             />

//             <div className="chat-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
//               <input
//                 type="text"
//                 value={message}
//                 placeholder="Type message..."
//                 onChange={(e) => setMessage(e.target.value)}
//                 onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
//                 className="chat-input"
//               />
//               {message.includes("cloudinary") && (
//                 <button onClick={() => setMessage("")} className="cancel-preview">🗑️</button>
//               )}
//             </div>

//             <div ref={emojiRef} style={{ position: "relative" }}>
//               <button onClick={() => setShowEmojiPicker(prev => !prev)} className="send-button">😊</button>
//               {showEmojiPicker && (
//                 <div className='emoji-picker-container'>
//                   <button className='close-emoji-button' onClick={() => setShowEmojiPicker(false)}>❌</button>
//                   <Picker data={data} onEmojiSelect={(e) => setMessage(prev => prev + e.native)} />
//                 </div>
//               )}
//             </div>

//             <button onClick={sendMessage} className="send-button">Send</button>
//           </div>

//           <button onClick={() => {
//             setTargetUser(null);
//             localStorage.removeItem("selectedChatUser");
//           }} className="back-button">⬅️ Back to user list</button>
//         </>
//       )}
//     </div>
//   );
// };

// export default Chat;










// import React, { useEffect, useState, useRef } from 'react';
// import { useSelector } from 'react-redux';
// import socket from '../socket';
// import '../css/Chat.css';
// import Picker from '@emoji-mart/react';
// import data from '@emoji-mart/data';

// const Chat = () => {
//   const user = useSelector(state => state.user);
//   const [message, setMessage] = useState("");
//   const [chatHistory, setChatHistory] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [targetUser, setTargetUser] = useState(null);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const emojiRef = useRef();

//   // Close emoji picker on outside click
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (emojiRef.current && !emojiRef.current.contains(e.target)) {
//         setShowEmojiPicker(false);
//       }
//     };
//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, []);

//   // Load selected chat user from localStorage
//   useEffect(() => {
//     const savedTarget = localStorage.getItem("selectedChatUser");
//     if (savedTarget) {
//       try {
//         const parsed = JSON.parse(savedTarget);
//         setTargetUser(parsed);
//       } catch (err) {
//         console.error("Failed to parse saved chat user", err);
//       }
//     }
//   }, []);

//   // Auto-scroll to bottom on new messages
//   useEffect(() => {
//     const chatBox = document.querySelector(".chat-box");
//     if (chatBox) {
//       chatBox.scrollTop = chatBox.scrollHeight;
//     }
//   }, [chatHistory]);

//   const toggleDark = () => {
//     document.body.classList.toggle("dark-mode");
//   };

//   // Fetch users followed or following
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await fetch('/followed-users', {
//           headers: {
//             Authorization: "Bearer " + localStorage.getItem("jwt"),
//           },
//         });
//         const data = await res.json();
//         setAllUsers(data.filter(u => u.username !== user.username));
//       } catch (err) {
//         console.error("Failed to fetch users:", err);
//       }
//     };
//     if (user?.username) fetchUsers();
//   }, [user]);

//   // Fetch messages and handle socket.io
//   useEffect(() => {
//     if (!user?._id || !targetUser?._id) return;

//     const fetchMessages = async () => {
//       try {
//         const res = await fetch(`/messages/${user._id}/${targetUser._id}`);
//         const data = await res.json();
//         setChatHistory(Array.isArray(data) ? data : []);
//       } catch (err) {
//         console.error("Failed to fetch messages:", err);
//         setChatHistory([]);
//       }
//     };

//     fetchMessages();
//     socket.emit('join', user._id);

//     const handleReceiveMessage = (data) => {
//       if (
//         (data.sender._id === user._id && data.receiver._id === targetUser._id) ||
//         (data.sender._id === targetUser._id && data.receiver._id === user._id)
//       ) {
//         setChatHistory(prev => [...prev, data]);
//       }
//     };

//     socket.on('receive_message', handleReceiveMessage);
//     return () => socket.off('receive_message', handleReceiveMessage);
//   }, [user, targetUser]);

//   const sendMessage = () => {
//     if (!message.trim() || !targetUser) return;

//     const newMessage = {
//       text: message,
//       sender: user._id,
//       receiver: targetUser._id,
//     };

//     socket.emit('send_message', newMessage);
//     setMessage("");
//     setShowEmojiPicker(false);
//   };

//   const deleteMessage = async (msgId) => {
//     try {
//       await fetch(`/message/${msgId}`, {
//         method: 'DELETE',
//         headers: {
//           Authorization: "Bearer " + localStorage.getItem("jwt"),
//         },
//       });
//       setChatHistory(prev => prev.filter(msg => msg._id !== msgId));
//     } catch (err) {
//       console.error("Failed to delete message:", err);
//     }
//   };

//   if (!user?.username) return <div>Loading user data...</div>;

//   return (
//     <div className="chat-container">
//       <h2>💬 Chat</h2>
//       <button onClick={toggleDark} className="send-button" style={{ float: 'right', marginBottom: '10px' }}>
//         Toggle 🌙
//       </button>

//       {!targetUser ? (
//         <>
//           <h3>Select a user to chat with:</h3>
//           <div className='user-list-container'>
//             <ul className="user-list">
//               {allUsers.map(u => (
//                 <li
//                   key={u._id}
//                   onClick={() => {
//                     setTargetUser(u);
//                     localStorage.setItem("selectedChatUser", JSON.stringify(u));
//                   }}
//                   className="user-list-item"
//                 >
//                   <img
//                     src={u.photo || "https://placehold.co/40"}
//                     alt={`${u.name}'s profile`}
//                     className="user-profile-pic"
//                   />
//                   <div className="user-info">
//                     <div className="user-name">{u.name}</div>
//                     <div className="user-username">@{u.username}</div>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </>
//       ) : (
//         <>
//           <h3>Chatting with {targetUser.name}</h3>

//           <div className="chat-box">
//             {Array.isArray(chatHistory) && chatHistory.map((msg, index) => (
//               <div
//                 key={index}
//                 className={`chat-message ${msg.sender._id === user._id ? 'own-message' : 'other-message'}`}
//               >
//               <div className='message-header'>
//                 <div className="sender-info">
//                   <img
//                     className='message-profile-pic'
//                     src={msg.sender.photo || "https://placehold.co/30"}
//                     alt={`${msg.sender.name}'s profile`}
//                   />
//                   <span className="sender">{msg.sender.name}</span>
//                 </div>

//                 {msg.sender._id === user._id && (
//                   <div className="delete-container">
//                     <button
//                       className="delete-button"
//                       onClick={() => deleteMessage(msg._id)}
//                       title="Delete message"
//                     >
//                       🗑️
//                     </button>
//                   </div>
//                 )}
//               </div>

//                 <div className='message-text'>{msg.text}</div>
//               </div>
//             ))}
//           </div>

//           <div className="chat-input-area">
//             <input
//               type="text"
//               value={message}
//               placeholder="Type message..."
//               onChange={(e) => setMessage(e.target.value)}
//               onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
//               className="chat-input"
//             />
//             <div ref={emojiRef} style={{ position: "relative", display: "inline-block" }}>
//               <button onClick={() => setShowEmojiPicker(prev => !prev)} className="send-button">
//                 😊
//               </button>
//               {showEmojiPicker && (
//                 <div className='emoji-picker-container'>
//                   <button
//                     className='close-emoji-button'
//                     onClick={() => setShowEmojiPicker(false)}
//                   >
//                     ❌
//                   </button>
//                   <Picker
//                     data={data}
//                     onEmojiSelect={(e) => setMessage(prev => prev + e.native)}
//                   />
//                 </div>
//               )}
//             </div>
//             <button onClick={sendMessage} className="send-button">Send</button>
//           </div>

//           <button
//             onClick={() => {
//               setTargetUser(null);
//               localStorage.removeItem("selectedChatUser");
//             }}
//             className="back-button"
//           >
//             ⬅️ Back to user list
//           </button>
//         </>
//       )}
//     </div>
//   );
// };

// export default Chat;



