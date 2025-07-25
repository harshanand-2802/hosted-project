import React, { useContext, useEffect, useState, useCallback } from 'react';
import logo from '../img/logo.png';
import '../css/Navbar.css';
import { Link } from 'react-router-dom';
import { LoginContext } from '../context/LoginContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import socket from '../socket';
import reelIcon from '../img/icon-1.png'

export default function Navbar({ login }) {
  const navigate = useNavigate();
  const { setModalOpen } = useContext(LoginContext);
  const user = useSelector(state => state.user);
  const [unreadTotal, setUnreadTotal] = useState(0);

  // Fetch total unread messages
  const fetchUnreadTotal = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(`/unread-messages/${user._id}`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("jwt") },
      });
      const data = await res.json();
      const total = data.reduce((acc, item) => acc + item.count, 0);
      setUnreadTotal(total);
    } catch (err) {
      console.error("Failed to fetch unread total:", err);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchUnreadTotal();
  }, [fetchUnreadTotal]);

  // Real-time update when receiving or sending new messages
  useEffect(() => {
    const handleNewMessage = () => fetchUnreadTotal();
    socket.on("receive_message", handleNewMessage);
    socket.on("new_message", handleNewMessage); // Listen for new message events

    return () => {
      socket.off("receive_message", handleNewMessage);
      socket.off("new_message", handleNewMessage);
    };
  }, [fetchUnreadTotal]);

  const loginStatus = () => {
    const token = localStorage.getItem("jwt");

    if (login || token) {
      return [
        <Link to="/profile" key="profile"><li>Profile</li></Link>,
        <Link to="/upload-reel" key="upload-reel"><li>upload-reel</li></Link>,
        <Link to="/reels" key="reel"><li>Reels</li></Link>,
        <Link to="/chat1" key="chat1">
          <li style={{ position: "relative" }}>
            Chat
            {unreadTotal > 0 && (
              <span className="unread-badge">{unreadTotal}</span>
            )}
          </li>
        </Link>,
        <Link to="/createpost" key="createpost"><li>Create Post</li></Link>,
        <Link style={{ marginLeft: "20px" }} to="/followingpost" key="followingpost">
          My Following Post
        </Link>,
        <button
          className="primaryBtn"
          key="logout"
          onClick={() => setModalOpen(true)}
        >
          Log Out
        </button>
      ];
    } else {
      return [
        <Link to="/signup" key="signup"><li>SignUp</li></Link>,
        <Link to="/signin" key="signin"><li>SignIn</li></Link>
      ];
    }
  };

  const loginstatusMobile = () => {
    const token = localStorage.getItem("jwt");

    if (login || token) {
      return [
        <Link to="/" key="home"><li><span className="material-symbols-outlined">home</span></li></Link>,
        <Link to="/chat1" key="chat1">
          <li style={{ position: "relative" }}>
            <span className="material-symbols-outlined">chat</span>
            {unreadTotal > 0 && (
              <span className="unread-badge-mobile">{unreadTotal}</span>
            )}
          </li>
        </Link>,
        <Link to="/profile" key="profile"><li><span className="material-symbols-outlined">account_circle</span></li></Link>,
        <Link to="/upload-reel" key="upload-reel"><li><span className="material-symbols-outlined">video_call</span></li></Link>,
        <Link to="/reels" key="reel"><li className='nav-icon'><img className='reel-icon' src={reelIcon} alt="reel" /></li></Link>,
        <Link to="/createpost" key="createpost"><li><span className="material-symbols-outlined">add_box</span></li></Link>,
        <Link to="/followingpost" key="followingpost">
          <li><span className="material-symbols-outlined">explore</span></li>
        </Link>,
        <li key="logout" onClick={() => setModalOpen(true)}>
          <span className="material-symbols-outlined">logout</span>
        </li>
      ];
    } else {
      return [
        <Link to="/signup" key="signup"><li>SignUp</li></Link>,
        <Link to="/signin" key="signin"><li>SignIn</li></Link>
      ];
    }
  };

  return (
    <div className="navbar">
      <img id='insta-logo' src={logo} alt="logo" onClick={() => { navigate("/") }} />
      <ul className="nav-menu">
        {loginStatus()}
      </ul>
      <ul className="nav-mobile">
        {loginstatusMobile()}
      </ul>
    </div>
  );
}


// import React, { useContext } from 'react';
// import logo from '../img/logo.png';
// import '../css/Navbar.css'
// import { Link } from 'react-router-dom';
// import { LoginContext } from '../context/LoginContext';
// import { useNavigate } from 'react-router-dom';

// export default function Navbar({ login }) {
//   const navigate = useNavigate();
//   const { setModalOpen } = useContext(LoginContext);

//   const loginStatus = () => {
//     const token = localStorage.getItem("jwt");

//     if (login || token) {
//       return [
//         <Link to="/profile" key="profile"><li>Profile</li></Link>,
//         <Link to="/upload-reel" key="upload-reel"><li>upload-reel</li></Link>,
//         <Link to="/reels" key="reel"><li>Reels</li></Link>,
//         // <Link to="/chat" key="chat"><li>Chat</li></Link>,
//         <Link to="/chat1" key="chat1"><li>Chat</li></Link>,
//         <Link to="/createpost" key="createpost"><li>Create Post</li></Link>,
//         <Link style={{marginLeft:"20px"}} to="/followingpost" key="followingpost">My Following Post</Link>,
//         <button
//           className="primaryBtn"
//           key="logout"
//           onClick={() => setModalOpen(true)}
//         >
//           Log Out
//         </button>
//       ];
//     } else {
//       return [
//         <Link to="/signup" key="signup"><li>SignUp</li></Link>,
//         <Link to="/signin" key="signin"><li>SignIn</li></Link>
//       ];
//     }
//   };


//   const loginstatusMobile = ()=>{
     
//     const token = localStorage.getItem("jwt");

//     if (login || token) {
//       return [
//         <Link to="/" key="home"><li><span className="material-symbols-outlined">home</span></li></Link>,
//         // <Link to="/chat" key="chat"><li><span className="material-symbols-outlined">chat</span></li></Link>,
//         <Link to="/chat1" key="chat1"><li><span className="material-symbols-outlined">chat</span></li></Link>,
//         <Link to="/profile" key="profile"><li><span className="material-symbols-outlined">account_circle</span></li></Link>,
//         <Link to="/createpost" key="createpost"><li><span className="material-symbols-outlined">add_box</span></li></Link>,
//         <Link style={{marginLeft:"20px"}} to="/followingpost" key="followingpost"><li><span className="material-symbols-outlined">explore</span></li></Link>,
//         <li
          
//           key="logout"
//           onClick={() => setModalOpen(true)}
//         >
//           <span className="material-symbols-outlined">logout</span>
//         </li>
//       ];
//     } else {
//       return [
//         <Link to="/signup" key="signup"><li>SignUp</li></Link>,
//         <Link to="/signin" key="signin"><li>SignIn</li></Link>
//       ];
//     }
//   };
  


//   return (
//     <div className="navbar">
//       <img id='insta-logo' src={logo} alt="logo" onClick={()=>{navigate("/")}}/>
//       <ul className="nav-menu">
//         {loginStatus()}
//       </ul>
//       <ul className="nav-mobile">
//         {loginstatusMobile()}
//       </ul>
//     </div>
//   );
// }
