import React, { useState, useEffect, useRef } from "react";
import "../css/ProfilePic.css";

export default function ProfilePic({ changeprofile }) {
  const hiddenFileInput = useRef(null);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
    } else {
      alert("Please select a valid image file.");
    }
  };

  // Upload image to Cloudinary
  const postDetails = async () => {
    setUploading(true);
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "insta-clone");
    data.append("cloud_name", "cantacloud2");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/cantacloud2/image/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.url) {
        await postPic(json.url);
      } else {
        console.error("Cloudinary error:", json);
        alert("Failed to upload image. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading image.");
    } finally {
      setUploading(false);
    }
  };

  // Save image URL to MongoDB
  const postPic = async (imageUrl) => {
    try {
      const res = await fetch("/uploadProfilePic", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
        body: JSON.stringify({ pic: imageUrl }),
      });

      const json = await res.json();

      if (json && !json.error) {
        console.log("Profile updated:", json);
        changeprofile();
        window.location.reload();
      } else {
        console.error("Update error:", json.error);
        alert("Failed to update profile picture.");
      }
    } catch (err) {
      console.error("MongoDB update error:", err);
      alert("Server error while saving image.");
    }
  };

  const handleRemovePhoto = () => {
    const confirmDelete = window.confirm("Are you sure you want to remove your profile photo?");
    if (confirmDelete) {
      postPic(""); // This will set profile picture to empty
    }
  };

  useEffect(() => {
    if (image) {
      postDetails();
    }
  }, [image]);

  return (
    <div className="profilePic darkBg">
      <div className="changePic">
        <h2>Change Profile Photo</h2>

        <div className="option-border">
          <button className="upload-btn primary" onClick={handleClick} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Photo"}
          </button>
          <input
            type="file"
            ref={hiddenFileInput}
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </div>

        <div className="option-border">
          <button className="upload-btn danger" onClick={handleRemovePhoto} disabled={uploading}>
            Remove Current Photo
          </button>
        </div>

        <div className="option-border">
          <button className="upload-btn cancel" onClick={changeprofile} disabled={uploading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}



// import React, { useState, useEffect, useRef } from "react";
// import "../css/ProfilePic.css";

// export default function ProfilePic({ changeprofile }) {
//   const hiddenFileInput = useRef(null);
//   const [image, setImage] = useState("");
//   const [url, setUrl] = useState("");

//   // Upload image to Cloudinary
//   const postDetails = () => {
//     const data = new FormData();
//     data.append("file", image);
//     data.append("upload_preset", "insta-clone");
//     data.append("cloud_name", "cantacloud2");

//     fetch("https://api.cloudinary.com/v1_1/cantacloud2/image/upload", {
//       method: "POST",
//       body: data,
//     })
//       .then((res) => res.json())
//       .then((data) => setUrl(data.url))
//       .catch((err) => console.error("Cloudinary upload error:", err));
//   };

//   // Save image URL to MongoDB
//   const postPic = (imageUrl) => {
//     fetch("/uploadProfilePic", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + localStorage.getItem("jwt"),
//       },
//       body: JSON.stringify({ pic: imageUrl }),
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("Profile updated:", data);
//         changeprofile();
//         window.location.reload();
//       })
//       .catch((err) => console.error("MongoDB update error:", err));
//   };

//   const handleClick = () => {
//     hiddenFileInput.current.click();
//   };

//   useEffect(() => {
//     if (image) {
//       postDetails();
//     }
//   }, [image]);

//   useEffect(() => {
//     if (url) {
//       postPic(url);
//     }
//   }, [url]);

//   return (
//     <div className="profilePic darkBg">
//       <div className="changePic">
//         <h2>Change Profile Photo</h2>

//         <div className="option-border">
//           <button className="upload-btn primary" onClick={handleClick}>
//             Upload Photo
//           </button>
//           <input
//             type="file"
//             ref={hiddenFileInput}
//             accept="image/*"
//             style={{ display: "none" }}
//             onChange={(e) => setImage(e.target.files[0])}
//           />
//         </div>

//         <div className="option-border">
//           <button className="upload-btn danger" onClick={() => postPic("")}>
//             Remove Current Photo
//           </button>
//         </div>

//         <div className="option-border">
//           <button className="upload-btn cancel" onClick={changeprofile}>
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



// import React, { useState, useEffect, useRef } from "react";

// export default function ProfilePic({ changeprofile }) {
//   const hiddenFileInput = useRef(null);
//   const [image, setImage] = useState("");
//   const [url, setUrl] = useState("");

//   // posting image to cloudinary
//   const postDetails = () => {
//     const data = new FormData();
//     data.append("file", image);
//     data.append("upload_preset", "insta-clone");
//     data.append("cloud_name", "cantacloud2");
//     fetch("https://api.cloudinary.com/v1_1/cantacloud2/image/upload", {
//       method: "post",
//       body: data,
//     })
//       .then((res) => res.json())
//       .then((data) => setUrl(data.url))
//       .catch((err) => console.log(err));
//     console.log(url);
//   };

//   const postPic = () => {
//     // saving post to mongodb
//     fetch("/uploadProfilePic", {
//       method: "put",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + localStorage.getItem("jwt"),
//       },
//       body: JSON.stringify({
//         pic: url,
//       }),
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         console.log(data);
//         changeprofile();
//         window.location.reload();
//       })
//       .catch((err) => console.log(err));
//   };

//   const handleClick = () => {
//     hiddenFileInput.current.click();
//   };

//   useEffect(() => {
//     if (image) {
//       postDetails();
//     }
//   }, [image]);
//   useEffect(() => {
//     if (url) {
//       postPic();
//     }
//   }, [url]);
//   return (
//     <div className="profilePic darkBg">
//       <div className="changePic centered">
//         <div>
//           <h2>Change Profile Photo</h2>
//         </div>
//         <div style={{ borderTop: "1px solid #00000030" }}>
//           <button
//             className="upload-btn"
//             style={{ color: "#1EA1F7" }}
//             onClick={handleClick}
//           >
//             Upload Photo
//           </button>
//           <input
//             type="file"
//             ref={hiddenFileInput}
//             accept="image/*"
//             style={{ display: "none" }}
//             onChange={(e) => {
//               setImage(e.target.files[0]);
//             }}
//           />
//         </div>
//         <div style={{ borderTop: "1px solid #00000030" }}>
//           <button
//             className="upload-btn"
//             onClick={() => {
//               setUrl(null);
//               postPic();
//             }}
//             style={{ color: "#ED4956" }}
//           >
//             {" "}
//             Remove Current Photo
//           </button>
//         </div>
//         <div style={{ borderTop: "1px solid #00000030" }}>
//           <button
//             style={{
//               background: "none",
//               border: "none",
//               cursor: "pointer",
//               fontSize: "15px",
//             }}
//             onClick={changeprofile}
//           >
//             cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }