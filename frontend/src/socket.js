// import { io } from "socket.io-client";

// // Connect to your backend server
// const socket = io("http://localhost:8000");

// export default socket;


// import { io } from "socket.io-client";

// const socket = io("http://localhost:8000", { autoConnect: true });

// export default socket;

import { io } from "socket.io-client";

const URL = window.location.hostname === "localhost" 
  ? "http://localhost:10000" 
  : "https://hosted-project-1.onrender.com";

const socket = io(URL, { autoConnect: true });

export default socket;
