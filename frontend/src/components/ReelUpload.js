import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ReelUpload = () => {
  const [video, setVideo] = useState(null);
  const [caption, setCaption] = useState('');
  const navigate = useNavigate();

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!video) return alert("Please select a video");

    // Upload to Cloudinary
    const formData = new FormData();
    formData.append("file", video);
    formData.append("upload_preset", "insta-clone");
    formData.append("cloud_name", "harshcloud2802");
    formData.append("resource_type", "video");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/harshcloud2802/video/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("Uploaded video URL:", data.secure_url);

      // Post to backend
      const reelRes = await fetch("/reels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
        body: JSON.stringify({
          videoUrl: data.secure_url,
          caption,
        }),
      });

      const reelData = await reelRes.json();
      console.log("Reel created:", reelData);
      navigate('/reels');
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Upload a Reel</h2>
      <input type="file" accept="video/*" onChange={handleVideoChange} />
      {video && (
        <video
          src={URL.createObjectURL(video)}
          controls
          style={styles.preview}
        />
      )}
      <input
        type="text"
        placeholder="Write a caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        style={styles.captionInput}
      />
      <button onClick={handleUpload} style={styles.uploadButton}>Upload Reel</button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "500px",
    margin: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  preview: {
    width: "100%",
    maxHeight: "400px",
    objectFit: "cover",
  },
  captionInput: {
    padding: "8px",
    fontSize: "14px",
  },
  uploadButton: {
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "#4a90e2",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};

export default ReelUpload;
