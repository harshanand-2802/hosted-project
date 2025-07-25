import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './screen/Home';
import SignIn from './components/SignIn';
import Profile from './screen/Profile';
import Signup from './components/Signup';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Createpost from './screen/Createpost';
import { LoginContext } from './context/LoginContext';
import Modal from './components/Modal';
import UserProfile from './components/UserProfile';
import MyFollowingPost from './screen/MyFollowingPost';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Chat from './components/Chat';
import { useDispatch } from 'react-redux';
import { setUser } from './redux/userSlice';
import UserList from './components/UserList';
import ChatWindow from './components/ChatWindow';
import Reels from './components/Reel';
import ReelUpload  from './components/ReelUpload';
import { useLocation } from 'react-router-dom';

function AppContent({ userLogin, setUserLogin, modalOpen, setModalOpen }) {
  const location = useLocation();
  const hideNavbarRoutes = ['/chat/window'];

  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && (
        <Navbar login={userLogin} />
      )}

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/signin' element={<SignIn />} />
        <Route exact path='/profile' element={<Profile />} />
        <Route path='/createpost' element={<Createpost />} />
        <Route path='/profile/:userid' element={<UserProfile />} />
        <Route path='/followingpost' element={<MyFollowingPost />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/chat1' element={<UserList />} />
        <Route path='/chat/window' element={<ChatWindow />} />
        <Route path="/reels" element={<Reels />} />
        <Route path="/upload-reel" element={<ReelUpload />} />
      </Routes>

      <ToastContainer theme='dark' />
      {modalOpen && <Modal setModalOpen={setModalOpen} />}
    </>
  );
}

function App() {
  const [userLogin, setUserLogin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        dispatch(setUser({
          username: userData.username,
          email: userData.email,
          photo: userData.photo || null,
          _id: userData._id,
        }));
      }
    } catch (error) {
      console.error("Invalid user data in localStorage:", error);
      localStorage.removeItem('user');
      localStorage.removeItem('jwt');
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="App">
        <GoogleOAuthProvider clientId="521900406917-0en57r2aqpd4qa57fgs7k0ro2jk08tnc.apps.googleusercontent.com">
          <LoginContext.Provider value={{ setUserLogin, setModalOpen }}>
            <AppContent
              userLogin={userLogin}
              setUserLogin={setUserLogin}
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
            />
          </LoginContext.Provider>
        </GoogleOAuthProvider>
      </div>
    </BrowserRouter>
  );
}

export default App;


// import React, { useState, useEffect } from 'react';
// import './App.css';
// import Navbar from './components/Navbar';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Home from './screen/Home';
// import SignIn from './components/SignIn';
// import Profile from './screen/Profile';
// import Signup from './components/Signup';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Createpost from './screen/Createpost';
// import { LoginContext } from './context/LoginContext';
// import Modal from './components/Modal';
// import UserProfile from './components/UserProfile';
// import MyFollowingPost from './screen/MyFollowingPost';
// import { GoogleOAuthProvider } from '@react-oauth/google';
// import Chat from './components/Chat';
// import { useDispatch } from 'react-redux';
// import { setUser } from './redux/userSlice';
// import UserList from './components/UserList';
// import ChatWindow from './components/ChatWindow';

// function App() {
//   const [userLogin, setUserLogin] = useState(false);
//   const [modalOpen, setModalOpen] = useState(false);
//   const dispatch = useDispatch();


//   // useEffect(() => {
//   //   const userData = JSON.parse(localStorage.getItem('user'));
//   //   if (userData) {
//   //     dispatch(setUser({
//   //       username: userData.username,
//   //       email: userData.email,
//   //       photo: userData.photo || null,
//   //       _id: userData._id,
//   //     }));
//   //   }
//   // }, [dispatch]);
//   useEffect(() => {
//   try {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       const userData = JSON.parse(storedUser);
//       dispatch(setUser({
//         username: userData.username,
//         email: userData.email,
//         photo: userData.photo || null,
//         _id: userData._id,
//       }));
//     }
//   } catch (error) {
//     console.error("Invalid user data in localStorage:", error);
//     // Optional: Clear corrupted data
//     localStorage.removeItem('user');
//     localStorage.removeItem('jwt');
//   }
// }, [dispatch]);



//   return (
//     <BrowserRouter>
//       <div className="App">
//         <GoogleOAuthProvider clientId="521900406917-0en57r2aqpd4qa57fgs7k0ro2jk08tnc.apps.googleusercontent.com">
//           <LoginContext.Provider value={{ setUserLogin, setModalOpen }}>
            
//             <Navbar login={userLogin} />
//             <Routes>
//               <Route path='/' element={<Home />} />
//               <Route path='/signup' element={<Signup />} />
//               <Route path='/signin' element={<SignIn />} />
//               <Route exact path='/profile' element={<Profile />} />
//               <Route path='/createpost' element={<Createpost />} />
//               <Route path='/profile/:userid' element={<UserProfile />} />
//               <Route path='/followingpost' element={<MyFollowingPost />} />
//               <Route path='/chat' element={<Chat />} />
//               <Route path="/chat1" element={<UserList/>} />
//               <Route path="/chat/window" element={<ChatWindow/>} />
//             </Routes>
//             <ToastContainer theme='dark' />
//             {modalOpen && <Modal setModalOpen={setModalOpen} />}
//           </LoginContext.Provider>
//         </GoogleOAuthProvider>
//       </div>
//     </BrowserRouter>
//   );
// }

// export default App;
