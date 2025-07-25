import React, { useState, useEffect } from 'react';
import styles from '../css/Createpost.module.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function Createpost() {
  const [body, setBody] = useState("");
  const [image, setImage] = useState(() => {
    return localStorage.getItem("selectedImage") || "";
  });
  const [url, setUrl] = useState("");
  const picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      toast.error("Please login again");
      navigate("/signin");
    }
  }, [user, navigate]);


  // Toast notifications
  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);

  useEffect(() => {
    const output = document.getElementById('output');
    if (image && output) {
      output.src = image;
    }
  }, [image]);

  useEffect(() => {
    if (url) {
      fetch("/createpost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
        body: JSON.stringify({
          body,
          pic: url,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            notifyA(data.error);
          } else {
            notifyB("Successfully Posted");
            localStorage.removeItem("selectedImage");
            navigate('/');
          }
        })
        .catch((err) => console.log(err));
    }
  }, [url, body, navigate]);

  const postDetails = () => {
    if (!image) return notifyA("Please select an image first!");

    const data = new FormData();
    const file = document.getElementById("fileInput").files[0];

    if (!file) {
      return notifyA("Image not found. Please re-select.");
    }

    data.append("file", file);
    data.append("upload_preset", "insta-clone");
    data.append("cloud_name", "harshcloud2802");

    fetch("https://api.cloudinary.com/v1_1/harshcloud2802/image/upload", {
      method: "POST",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => setUrl(data.url))
      .catch((err) => console.log(err));
  };

  const loadfile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const imgUrl = URL.createObjectURL(file);
    setImage(imgUrl);
    localStorage.setItem("selectedImage", imgUrl);
  };

  const discardImage = () => {
    setImage("");
    localStorage.removeItem("selectedImage");
    const output = document.getElementById('output');
    if (output) {
      output.src = "https://cdn-icons-png.flaticon.com/128/6499/6499530.png";
    }
    document.getElementById("fileInput").value = null;
  };

  return (
    <div className={styles.createPost}>
      {/* Header */}
      <div className={styles.postHeader}>
        <h4 style={{ margin: "3px auto" }}>Create New Post</h4>
        <button className={styles.postBtn} onClick={postDetails}>Share</button>
      </div>

      {/* Image Preview */}
      <div className={styles.mainDiv}>
        <img
          id="output"
          className={styles.output}
          src={image || "https://cdn-icons-png.flaticon.com/128/6499/6499530.png"}
          alt="Preview"
        />
        <input
          type="file"
          accept="image/*"
          id="fileInput"
          className={styles.fileInput}
          onChange={loadfile}
        />
        {image && (
          <button className={styles.discardBtn} onClick={discardImage}>
            Discard
          </button>
        )}
      </div>

      {/* Post Details */}
      <div className={styles.details}>
        {/* <div className={styles.cardHeader}>
          <div className={styles.cardPic}>
            <img
              src="https://images.unsplash.com/photo-1751139443669-7d0d8127476e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyMnx8fGVufDB8fHx8fA%3D%3D"
              alt="User"
            />
          </div>
          <h5>Harsh</h5>
        </div> */}
        <div className={styles.cardHeader}>
          <div className={styles.cardPic}>
            <img
              src={user?.photo || picLink}
              alt="User"
            />
          </div>
          <h5>{user?.name || "User"}</h5>
        </div>

        <textarea
          className={styles.textarea}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a Caption..."
        />
      </div>
    </div>
  );
}





// import React, { useState, useEffect } from 'react';
// import styles from '../css/Createpost.module.css';
// import { toast } from 'react-toastify';
// import { useNavigate } from 'react-router-dom';

// export default function Createpost() {
//   const [body, setBody] = useState("");
//   const [image, setImage] = useState("");
//   const [url, setUrl] = useState("");
//   const navigate = useNavigate();

//   // Toast notifications
//   const notifyA = (msg) => toast.error(msg);
//   const notifyB = (msg) => toast.success(msg);

//   useEffect(() => {
//     if (url) {
//       fetch("/createpost", {
//         method: "post",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": "Bearer " + localStorage.getItem("jwt")
//         },
//         body: JSON.stringify({
//           body,
//           pic: url
//         })
//       })
//         .then(res => res.json())
//         .then(data => {
//           if (data.error) {
//             notifyA(data.error);
//           } else {
//             notifyB("Successfully Posted");
//             navigate('/');
//           }
//         })
//         .catch(err => console.log(err));
//     }
//   }, [url, body, navigate]);

//   // Posting image to Cloudinary
//   const postDetails = () => {
//     const data = new FormData();
//     data.append("file", image);
//     data.append("upload_preset", "insta-clone");
//     data.append("cloud_name", "harshcloud2802");

//     fetch("https://api.cloudinary.com/v1_1/harshcloud2802/image/upload", {
//       method: "post",
//       body: data
//     })
//       .then(res => res.json())
//       .then(data => setUrl(data.url))
//       .catch(err => console.log(err));
//   };

//   const loadfile = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const output = document.getElementById('output');
//     output.src = URL.createObjectURL(file);
//     output.onload = () => {
//       URL.revokeObjectURL(output.src);
//     };
//   };

//   return (
//     <div className={styles.createPost}>
//       {/* Header */}
//       <div className={styles.postHeader}>
//         <h4 style={{ margin: "3px auto" }}>Create New Post</h4>
//         <button className={styles.postBtn} onClick={postDetails}>Share</button>
//       </div>

//       {/* Image Preview */}
//       <div className={styles.mainDiv}>
//         <img
//           id="output"
//           className={styles.output}
//           // src="https://cdn-icons-png.flaticon.com/128/6499/6499530.png"
//           src={image ? URL.createObjectURL(image) : "https://cdn-icons-png.flaticon.com/128/6499/6499530.png"}
//           alt="Preview"
//         />
//         <input
//           type="file"
//           accept="image/*"
//           className={styles.fileInput}
//           onChange={(event) => {
//             loadfile(event);
//             setImage(event.target.files[0]);
//           }}
//         />
//       </div>

//       {/* Post Details */}
//       <div className={styles.details}>
//         <div className={styles.cardHeader}>
//           <div className={styles.cardPic}>
//             <img
//               src="https://images.unsplash.com/photo-1751139443669-7d0d8127476e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyMnx8fGVufDB8fHx8fA%3D%3D"
//               alt="User"
//             />
//           </div>
//           <h5>Harsh</h5>
//         </div>
//         <textarea
//           className={styles.textarea}
//           value={body}
//           onChange={(e) => setBody(e.target.value)}
//           placeholder="Write a Caption..."
//         />
//       </div>
//     </div>
//   );
// }
