// import React, { useState, useContext } from 'react';
// import '../css/SignIn.css'
// import logo from '../img/logo.png';
// import { Link, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { LoginContext } from '../context/LoginContext';

// export default function SignIn() {
//   const {setUserLogin} = useContext(LoginContext);
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const notifyA = (msg) => toast.error(msg);
//   const notifyB = (msg) => toast.success(msg);

//   const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

//   const postData = (e) => {
//     e.preventDefault(); // Prevent default form submission refresh

//     if (!emailRegex.test(email)) {
//       notifyA("Invalid email");
//       return;
//     }

//     fetch("/signin", {
//       method: "post",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         email: email,
//         password: password
//       })
//     })
//       .then(res => res.json())
//       .then(data => {
//         if (data.error) {
//           notifyA(data.error);
//         } else {
//           notifyB("Signed in Successfully");
//           console.log(data)
//           localStorage.setItem("jwt", data.token)
//           localStorage.setItem("user", JSON.stringify(data.user))
//           setUserLogin(true);
//           navigate('/');
//         }
//         console.log(data);
//       })
//       .catch(err => {
//         console.log(err);
//         notifyA("Something went wrong");
//       });
//   }

//   return (
//     <div className='signIn'>
//       <div>
//         <div className="loginForm">
//           <img className='signUpLogo' src={logo} alt="Logo" />
//           <form onSubmit={postData}>
//             <div>
//               <input
//                 type="email"
//                 name='email'
//                 id='email'
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder='Email'
//                 required
//                 autoComplete='email'
//               />
//             </div>
//             <div>
//               <input
//                 type="password"
//                 name='password'
//                 id='password'
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder='Password'
//                 required
//                 autoComplete='current-password'
//               />
//             </div>
//             <input type="submit" id='login-btn' value="Sign In" />
//           </form>
//         </div>
//         <div className="loginForm2">
//           Don't have an account?
//           <Link to="/signup">
//             <span style={{ color: "blue", cursor: "pointer" }}> Sign Up</span>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState, useContext } from 'react';
import '../css/SignIn.css';
import logo from '../img/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LoginContext } from '../context/LoginContext';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';

export default function SignIn() {
  const { setUserLogin } = useContext(LoginContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);

  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const postData = (e) => {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      notifyA("Invalid email");
      return;
    }

    fetch("/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          notifyA(data.error);
        } else {
          notifyB("Signed in Successfully");
          localStorage.setItem("jwt", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          dispatch(setUser({
            username: data.user.username,
            email: data.user.email,
            _id: data.user._id,
            photo: data.user.photo,
          }));

          setUserLogin(true);
          navigate('/');
        }
      })
      .catch(err => {
        console.log(err);
        notifyA("Something went wrong");
      });
  };

  return (
    <div className='signIn'>
      <div>
        <div className="loginForm">
          <img className='signUpLogo' src={logo} alt="Logo" />
          <form onSubmit={postData}>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Email'
                required
                autoComplete='email'
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Password'
                required
                autoComplete='current-password'
              />
            </div>
            <input type="submit" id='login-btn' value="Sign In" />
          </form>
        </div>
        <div className="loginForm2">
          Don't have an account?
          <Link to="/signup">
            <span style={{ color: "blue", cursor: "pointer" }}> Sign Up</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
