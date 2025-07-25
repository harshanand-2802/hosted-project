import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import socket from '../socket';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useNavigate } from 'react-router-dom';
import styles from '../css/ChatWindow.module.css';

const ChatWindow = () => {
  const user = useSelector(state => state.user);
  const [targetUser, setTargetUser] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const chatEndRef = useRef(null);
  const emojiRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, []);


  useEffect(() => {
    const savedUser = localStorage.getItem("selectedChatUser");
    if (savedUser) {
      try {
        setTargetUser(JSON.parse(savedUser));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("chatMessageInput");
    if (saved) setMessage(saved);
    const savedImg = localStorage.getItem("chatUploadedImageUrl");
    if (savedImg) setUploadedImageUrl(savedImg);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessageInput", message);
  }, [message]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?._id || !targetUser?._id) return;
      try {
        const res = await fetch(`/messages/${user._id}/${targetUser._id}`);
        const data = await res.json();
        setChatHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    fetchMessages();
  }, [user, targetUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    const closeEmojiPicker = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('click', closeEmojiPicker);
    return () => document.removeEventListener('click', closeEmojiPicker);
  }, []);

  useEffect(() => {
    if (!user?._id || !targetUser?._id) return;
    socket.emit("join", user._id);

    const receiveMessage = (msg) => {
      if (
        (msg.sender._id === user._id && msg.receiver._id === targetUser._id) ||
        (msg.sender._id === targetUser._id && msg.receiver._id === user._id)
      ) {
        setChatHistory(prev => [...prev, msg]);
      }
    };

    const handleDelete = ({ msgId }) => {
      setChatHistory(prev => prev.filter(msg => msg._id !== msgId));
    };

    socket.on("receive_message", receiveMessage);
    socket.on("message_deleted", handleDelete);

    return () => {
      socket.off("receive_message", receiveMessage);
      socket.off("message_deleted", handleDelete);
    };
  }, [user, targetUser]);

  const handleSend = () => {
    const finalMsg = message.trim();
    if (!finalMsg && !uploadedImageUrl) return;
    if (!targetUser) return;

    const msgData = {
      text: finalMsg || "",
      sender: user._id,
      receiver: targetUser._id,
      photo: uploadedImageUrl || null,
    };

    socket.emit("send_message", msgData);
    setMessage('');
    setUploadedImageUrl('');
    localStorage.removeItem("chatMessageInput");
    localStorage.removeItem("chatUploadedImageUrl");
    setShowEmojiPicker(false);
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await fetch(`/message/${msgId}`, {
        method: 'DELETE',
        headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
      });
      setChatHistory(prev => prev.filter(msg => msg._id !== msgId));
      socket.emit('delete_message', { msgId, sender: user._id, receiver: targetUser._id });
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
        alert("Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji.native);
  };

  if (!targetUser) return <div>Loading...</div>;

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <button onClick={() => {
          localStorage.removeItem("selectedChatUser");
          navigate("/chat1");
        }} className={styles.backButton}>⬅️ Back</button>

        <h3>Chatting with {targetUser.name}</h3>
        {/* <button onClick={() => document.body.classList.toggle("dark-mode")} className={styles.sendButton}>
          Toggle 🌙
        </button> */}
        <button
          onClick={() => {
            document.body.classList.toggle("dark-mode");
            // Save current mode to localStorage
            const isDark = document.body.classList.contains("dark-mode");
            localStorage.setItem("theme", isDark ? "dark" : "light");
          }}
          className={styles.sendButton}
        >
          Toggle 🌙
        </button>

      </div>

      <div className={styles.chatBox}>
        {chatHistory.map((msg, i) => (
          <div key={i} className={`${styles.chatMessage} ${msg.sender._id === user._id ? styles.ownMessage : styles.otherMessage}`}>
            <div className={styles.messageHeader}>
              <div className={styles.senderInfo}>
                <img src={msg.sender.photo || "https://placehold.co/30"} alt={msg.sender.name} className={styles.messageProfilePic} />
                <span>{msg.sender.name}</span>
              </div>
              {msg.sender._id === user._id && (
                <button className={styles.deleteButton} onClick={() => handleDeleteMessage(msg._id)}>🗑️</button>
              )}
            </div>
            <div className={styles.messageText}>
              {msg.photo && (
                <img src={msg.photo} className={styles.chatImage} onClick={() => setPreviewImage(msg.photo)} alt="uploaded" />
              )}
              {msg.text && <p className={styles.messageTextContent}>{msg.text}</p>}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {previewImage && (
        <div className={styles.modalOverlay} onClick={() => setPreviewImage(null)}>
          <img src={previewImage} className={styles.modalImage} alt="preview" />
        </div>
      )}

      <div className={styles.chatInputArea}>
        <label htmlFor="image-upload" className={styles.sendButton}>📷</label>
        <input type="file" id="image-upload" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />

        {uploadedImageUrl && (
          <div className={styles.imagePreviewContainer}>
            <img src={uploadedImageUrl} className={styles.imagePreview} alt="preview" />
            <button onClick={() => {
              setUploadedImageUrl("");
              localStorage.removeItem("chatUploadedImageUrl");
            }} className={styles.cancelPreview}>🗑️</button>
          </div>
        )}

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className={styles.chatInput}
        />

        <div ref={emojiRef} style={{ position: "relative" }}>
          <button onClick={() => setShowEmojiPicker(prev => !prev)} className={styles.sendButton}>😊</button>
          {showEmojiPicker && (
            <div className={styles.emojiPickerContainer}>
              <button className={styles.closeEmojiButton} onClick={() => setShowEmojiPicker(false)}>❌</button>
              <Picker data={data} onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
        </div>

        <button onClick={handleSend} className={styles.sendButton}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;



// import React, { useEffect, useRef, useState } from 'react';
// import { useSelector } from 'react-redux';
// import socket from '../socket';
// import Picker from '@emoji-mart/react';
// import data from '@emoji-mart/data';
// import { useNavigate } from 'react-router-dom';
// import '../css/ChatWindow.css';

// const ChatWindow = () => {
//   const user = useSelector(state => state.user);
//   const [targetUser, setTargetUser] = useState(null);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [message, setMessage] = useState('');
//   const [uploadedImageUrl, setUploadedImageUrl] = useState('');
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [previewImage, setPreviewImage] = useState(null);
//   const chatEndRef = useRef(null);
//   const emojiRef = useRef(null);
//   const navigate = useNavigate();

//   // Load target user
//   useEffect(() => {
//     const savedUser = localStorage.getItem("selectedChatUser");
//     if (savedUser) {
//       try {
//         setTargetUser(JSON.parse(savedUser));
//       } catch {}
//     }
//   }, []);

//   // Load saved message & image
//   useEffect(() => {
//     const saved = localStorage.getItem("chatMessageInput");
//     if (saved) setMessage(saved);
//     const savedImg = localStorage.getItem("chatUploadedImageUrl");
//     if (savedImg) setUploadedImageUrl(savedImg);
//   }, []);

//   // Save message to localStorage
//   useEffect(() => {
//     localStorage.setItem("chatMessageInput", message);
//   }, [message]);

//   // Fetch chat history
//   useEffect(() => {
//     const fetchMessages = async () => {
//       if (!user?._id || !targetUser?._id) return;
//       try {
//         const res = await fetch(`/messages/${user._id}/${targetUser._id}`);
//         const data = await res.json();
//         setChatHistory(Array.isArray(data) ? data : []);
//       } catch (err) {
//         console.error("Failed to load chat history:", err);
//       }
//     };
//     fetchMessages();
//   }, [user, targetUser]);

//   // Scroll to bottom
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [chatHistory]);

//   // Handle click outside emoji
//   useEffect(() => {
//     const closeEmojiPicker = (e) => {
//       if (emojiRef.current && !emojiRef.current.contains(e.target)) {
//         setShowEmojiPicker(false);
//       }
//     };
//     document.addEventListener('click', closeEmojiPicker);
//     return () => document.removeEventListener('click', closeEmojiPicker);
//   }, []);

//   // Socket events
//   useEffect(() => {
//     if (!user?._id || !targetUser?._id) return;
//     socket.emit("join", user._id);

//     const receiveMessage = (msg) => {
//       if (
//         (msg.sender._id === user._id && msg.receiver._id === targetUser._id) ||
//         (msg.sender._id === targetUser._id && msg.receiver._id === user._id)
//       ) {
//         setChatHistory(prev => [...prev, msg]);
//       }
//     };

//     const handleDelete = ({ msgId }) => {
//       setChatHistory(prev => prev.filter(msg => msg._id !== msgId));
//     };

//     socket.on("receive_message", receiveMessage);
//     socket.on("message_deleted", handleDelete);

//     return () => {
//       socket.off("receive_message", receiveMessage);
//       socket.off("message_deleted", handleDelete);
//     };
//   }, [user, targetUser]);

//   const handleSend = () => {
//     const finalMsg = message.trim();
//     if (!finalMsg && !uploadedImageUrl) return;
//     if (!targetUser) return;

//     const msgData = {
//       text: finalMsg || "",
//       sender: user._id,
//       receiver: targetUser._id,
//       photo: uploadedImageUrl || null,
//     };

//     socket.emit("send_message", msgData);
//     setMessage('');
//     setUploadedImageUrl('');
//     localStorage.removeItem("chatMessageInput");
//     localStorage.removeItem("chatUploadedImageUrl");
//     setShowEmojiPicker(false);
//   };

//   const handleDeleteMessage = async (msgId) => {
//     try {
//       await fetch(`/message/${msgId}`, {
//         method: 'DELETE',
//         headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
//       });
//       setChatHistory(prev => prev.filter(msg => msg._id !== msgId));
//       socket.emit('delete_message', { msgId, sender: user._id, receiver: targetUser._id });
//     } catch (err) {
//       console.error("Delete failed:", err);
//     }
//   };

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

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
//         setUploadedImageUrl(result.secure_url);
//         localStorage.setItem("chatUploadedImageUrl", result.secure_url);
//       } else {
//         alert("Upload failed");
//       }
//     } catch (err) {
//       console.error("Upload error:", err);
//     }
//   };

//   const handleEmojiSelect = (emoji) => {
//     setMessage(prev => prev + emoji.native);
//   };

//   if (!targetUser) return <div>Loading...</div>;

//   return (
//     <div className="chat-container">
//       <div className="chat-header">
//         <button onClick={() => {
//           localStorage.removeItem("selectedChatUser");
//           navigate("/chat1");
//         }} className="back-button">⬅️ Back</button>

//         <h3>Chatting with {targetUser.name}</h3>
//         <button onClick={() => document.body.classList.toggle("dark-mode")} className="send-button">
//           Toggle 🌙
//         </button>
//       </div>

//       <div className="chat-box">
//         {chatHistory.map((msg, i) => (
//           <div key={i} className={`chat-message ${msg.sender._id === user._id ? "own-message" : "other-message"}`}>
//             <div className="message-header">
//               <div className="sender-info">
//                 <img src={msg.sender.photo || "https://placehold.co/30"} alt={msg.sender.name} className="message-profile-pic" />
//                 <span>{msg.sender.name}</span>
//               </div>
//               {msg.sender._id === user._id && (
//                 <button className="delete-button" onClick={() => handleDeleteMessage(msg._id)}>🗑️</button>
//               )}
//             </div>
//             <div className="message-text">
//               {msg.photo && (
//                 <img src={msg.photo} className="chat-image" onClick={() => setPreviewImage(msg.photo)} alt="uploaded" />
//               )}
//               {msg.text && <p className="message-text-content">{msg.text}</p>}
//             </div>
//           </div>
//         ))}
//         <div ref={chatEndRef} />
//       </div>

//       {previewImage && (
//         <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
//           <img src={previewImage} className="modal-image" alt="preview" />
//         </div>
//       )}

//       <div className="chat-input-area">
//         <label htmlFor="image-upload" className="send-button">📷</label>
//         <input type="file" id="image-upload" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />

//         {uploadedImageUrl && (
//           <div className="image-preview-container">
//             <img src={uploadedImageUrl} className="image-preview" alt="preview" />
//             <button onClick={() => {
//               setUploadedImageUrl("");
//               localStorage.removeItem("chatUploadedImageUrl");
//             }} className="cancel-preview">🗑️</button>
//           </div>
//         )}

//         <input
//           type="text"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//           placeholder="Type a message..."
//           className="chat-input"
//         />

//         <div ref={emojiRef} style={{ position: "relative" }}>
//           <button onClick={() => setShowEmojiPicker(prev => !prev)} className="send-button">😊</button>
//           {showEmojiPicker && (
//             <div className="emoji-picker-container">
//               <button className="close-emoji-button" onClick={() => setShowEmojiPicker(false)}>❌</button>
//               <Picker data={data} onEmojiSelect={handleEmojiSelect} />
//             </div>
//           )}
//         </div>

//         <button onClick={handleSend} className="send-button">Send</button>
//       </div>
//     </div>
//   );
// };

// export default ChatWindow;
