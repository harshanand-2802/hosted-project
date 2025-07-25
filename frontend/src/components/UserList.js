import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';
import styles from '../css/UserList.module.css';

const UserList = () => {
  const user = useSelector(state => state.user);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const navigate = useNavigate();

  // Fetch followed users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/followed-users', {
          headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
        });
        const data = await res.json();
        const filteredUsers = data.filter(u => u.username !== user.username);
        setAllUsers(filteredUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.username) fetchUsers();
  }, [user]);



    useEffect(() => {
    // Fetch unread message counts
    const fetchUnreadCounts = async () => {
      try {
        const res = await fetch(`/unread-messages/${user._id}`, {
          headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
        });
        const data = await res.json();
        const counts = {};
        data.forEach(item => counts[item.userId] = item.count);
        setUnreadCounts(counts);
      } catch (err) {
        console.error("Failed to fetch unread counts:", err);
      }
    };

    if (user?._id) fetchUnreadCounts();
  }, [user]);

  // Update unread counts when new message arrives
  useEffect(() => {
    if (!user?._id) return;

    socket.on("receive_message", (msg) => {
      if (msg.receiver._id === user._id) {
        setUnreadCounts(prev => ({
          ...prev,
          [msg.sender._id]: (prev[msg.sender._id] || 0) + 1
        }));
      }
    });

    return () => socket.off("receive_message");
  }, [user]);

  const handleUserClick = (u) => {
    // Reset unread count for this user
    setUnreadCounts(prev => ({ ...prev, [u._id]: 0 }));
    localStorage.setItem("selectedChatUser", JSON.stringify(u));
    navigate("/chat/window");
  };

  return (
    <div className={styles.chatContainer}>
      <h2>💬 Chat</h2>
      <h3 className={styles.user}>Select a user to chat with:</h3>

      {loading ? (
        <p>Loading users...</p>
      ) : allUsers.length === 0 ? (
        <p>No followed users found.</p>
      ) : (
        <div className={styles.userListContainer}>
          <ul className={styles.userList}>
            {allUsers.map(u => (
              <li
                key={u._id}
                onClick={() => handleUserClick(u)}
                className={styles.userListItem}
                tabIndex={0}
              >
                <img
                  src={u.photo || "https://via.placeholder.com/40"}
                  alt={`${u.name}'s profile`}
                  className={styles.userProfilePic}
                />
                <div className={styles.userInfo}>
                  <div className={styles.userName}>
                    {u.name}
                    {unreadCounts[u._id] > 0 && (
                      <span className={styles.unreadBadge}>{unreadCounts[u._id]}</span>
                    )}
                  </div>
                  <div className={styles.userUsername}>@{u.username}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserList;



// import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import '../css/UserList.css';

// const UserList = () => {
//   const user = useSelector(state => state.user);
//   const [allUsers, setAllUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await fetch('/followed-users', {
//           headers: {
//             Authorization: "Bearer " + localStorage.getItem("jwt"),
//           },
//         });
//         const data = await res.json();
//         const filteredUsers = data.filter(u => u.username !== user.username);
//         setAllUsers(filteredUsers);
//       } catch (err) {
//         console.error("Failed to fetch users:", err);
//         setAllUsers([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (user?.username) fetchUsers();
//   }, [user]);

//   const handleUserClick = (u) => {
//     localStorage.setItem("selectedChatUser", JSON.stringify(u));
//     navigate("/chat/window");
//   };

//   return (
//     <div className="chat-container">
//       <h2>💬 Chat</h2>

//       <h3 className="user">Select a user to chat with:</h3>

//       {loading ? (
//         <p>Loading users...</p>
//       ) : allUsers.length === 0 ? (
//         <p>No followed users found.</p>
//       ) : (
//         <div className="user-list-container">
//           <ul className="user-list">
//             {allUsers.map(u => (
//               <li key={u._id} onClick={() => handleUserClick(u)} className="user-list-item" tabIndex={0}>
//                 <img
//                   src={u.photo || "https://via.placeholder.com/40"}
//                   alt={`${u.name}'s profile`}
//                   className="user-profile-pic"
//                 />
//                 <div className="user-info">
//                   <div className="user-name">{u.name}</div>
//                   <div className="user-username">@{u.username}</div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserList;



// import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import '../css/UserList.css';

// const UserList = () => {
//   const user = useSelector(state => state.user);
//   const [allUsers, setAllUsers] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchUsers = async () => {
//       const res = await fetch('/followed-users', {
//         headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
//       });
//       const data = await res.json();
//       setAllUsers(data.filter(u => u.username !== user.username));
//     };
//     if (user?.username) fetchUsers();
//   }, [user]);

//   return (
//     <div className="chat-container">
//       <h3 className='user'>Select a user to chat with:</h3>
//       <div className='user-list-container'>
//         <ul className="user-list">
//           {allUsers.map(u => (
//             <li key={u._id} onClick={() => {
//               localStorage.setItem("selectedChatUser", JSON.stringify(u));
//               navigate("/chat/window");
//             }} className="user-list-item">
//               <img src={u.photo || "https://via.placeholder.com/40"} alt={`${u.name}`} className="user-profile-pic" />
//               <div className="user-info">
//                 <div className="user-name">{u.name}</div>
//                 <div className="user-username">@{u.username}</div>
//               </div>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default UserList;
