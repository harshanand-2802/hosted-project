import React, { useState, useContext} from 'react'
import logo from '../img/logo.png'
import '../css/Signup.css'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { LoginContext } from '../context/LoginContext';

export default function Signup() {
    const {setUserLogin} = useContext(LoginContext);
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // toast function
    const notifyA = (msg)=> toast.error(msg)
    const notifyB = (msg)=> toast.success(msg)


    const emailRegex =  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    const postData = (e)=>{
        e.preventDefault(); // Prevent form refresh
        //checking email
        if(!emailRegex.test(email)){
            notifyA("Invalid email")
            return
        }else if(!passRegex.test(password)){
            notifyA("Password must be at least 8 characters, include a number, uppercase and lowercase letters, and a special character (e.g., @, #, ?, !")
            return
        }
        // Sending daata to the server 
        fetch("/signup",{
            method: "post",
            headers:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                name:name,
                email:email,
                username:username,
                password:password
            })
        }).then(res=>res.json())
        .then(data => {
            if(data.error){
                notifyA(data.error)
            }
            else{
                notifyB(data.message)
                navigate('/signin')
            }
            console.log(data)
        })
    }

    const continueWithGoogle = (credentialResponse) => {
        
    console.log(credentialResponse);
    const jwtDetail = jwtDecode(credentialResponse.credential);
    console.log(jwtDetail);

    fetch("/googleLogin", { // fixed URL
        
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: jwtDetail.name,
            email: jwtDetail.email,
            email_verified: jwtDetail.email_verified,
            username: jwtDetail.email.split("@")[0], // derive username from email
            clientId: jwtDetail.sub, // unique Google user ID
            photo: jwtDetail.picture
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            notifyA(data.error);
        } else {
            notifyB("Signed in Successfully");
            console.log(data);
            localStorage.setItem("jwt", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            setUserLogin(true);
            navigate('/');
        }
    })
    .catch(err => {
        console.error("Google login error:", err);
        notifyA("Google login failed");
    });
}

  return (
    <div className='signUp'>
        <div className="form-container">
            <div className="form">
                 <img className='signUpLogo' src={logo} alt="" />
            <p className='loginPara'>
                Sign up to see photos and videos <br /> from your friend
            </p>
            <form onSubmit={postData}>
            <div>
                <input type="email" name='email' id='email' value={email} onChange={(e)=>{setEmail(e.target.value)}} placeholder='Email' required  autoComplete="email"/>
            </div>
            <div>
                <input type="text" name='name' id='name' value={name} onChange={(e)=>{setName(e.target.value)}} placeholder='Full Name' required  autoComplete="name"/>
            </div>
            <div>
                <input type="text" name='username' id='username' value={username} onChange={(e)=>{setUsername(e.target.value)}} placeholder='username' required autoComplete="username"/>
            </div>
            
            <div>
                <input type="password" name='password' id='password' value={password} onChange={(e)=>{setPassword(e.target.value)}} placeholder='password' required autoComplete='new-password'/>
            </div>
            <p className='loginPara' style={{fontSize:"12px", margin:"3px 0px"}}>
                By signing up, you agree to out Terms, <br /> privacy policy and cookies policy.
            </p>
            <input type="submit" id ="submit-btn" value="Sign Up" />
            <hr />
            <GoogleLogin
                onSuccess={credentialResponse => {
                    continueWithGoogle(credentialResponse);
                }}
                onError={() => {
                    console.log('Login Failed');
                 }}
            />
            </form>
            </div>
           <div className="form2">
            Already have an account ?
            <Link to="/signin">
            <span style={{color: "blue", cursor: "pointer"}}>Sign In</span>
            </Link>
           </div>
        </div>
    </div>
  )
}
