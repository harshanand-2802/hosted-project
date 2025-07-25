import React, { useState, useEffect } from 'react';
import '../css/PostView.css';
import { Link } from "react-router-dom";


export default function PostView({ item, close }) {
  const [commentText, setCommentText] = useState("");
  const [post, setPost] = useState(item);
  const picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";

  useEffect(() => {
    fetch(`/post/${item._id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => setPost(result))
      .catch((err) => console.error("Failed to fetch post details", err));
  }, [item._id]);

  const addComment = () => {
    if (!commentText.trim()) return;

    fetch("/comment", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        postId: post._id,
        text: commentText,
      }),
    })
      .then((res) => res.json())
      .then((updatedPost) => {
        setPost(updatedPost);
        setCommentText("");
      })
      .catch((err) => console.error("Comment error:", err));
  };

  if (!post) return null;

  return (
    <div className="post-detail">
      <div className="post-detail-container">
        <button className="close-btn" onClick={close}>×</button>

        <div className="post-detail-content">
          <div className="post-detail-img-container">
            <img src={post.photo} alt="post" className="post-detail-img" />
          </div>

          <div className="post-detail-comments">
            {/* Card Header (outside scroll) */}
            {/* <div className="card-header">
              <div className="card-pic">
                <img
                  src={post.postedBy?.photo || picLink}
                  alt="Profile"
                />
              </div>
              <h5>{post.postedBy?.name || "User"}</h5>
            </div> */}
            <Link
              to={`/profile/${post.postedBy?._id}`}
              className="card-header"
              onClick={close} // Close modal on navigation
            >
              <div className="card-pic">
                <img
                  src={post.postedBy?.photo || picLink}
                  alt="Profile"
                />
              </div>
              <h5>{post.postedBy?.name || "User"}</h5>
            </Link>
            {/* Comment Scroll */}
            <div className="comment-scroll">
              {post.comments.length === 0 ? (
                <p className="no-comments">No comments yet.</p>
              ) : (
                // post.comments.map((c) => (
                //   <div key={c._id} className="comment-block">
                //     <strong className="comment-name">{c.postedBy?.name || "User"}</strong>
                //     <p className="comment-text">{c.text || c.comment}</p>
                //   </div>
                // ))
                post.comments.map((c) => (
                  <div key={c._id} className="comm">
                    <div className="comment-header">
                      {/* <div className="commenter-info">
                        <img
                          src={c.postedBy?.photo || picLink}
                          alt="profile"
                          className="commenter-pic"
                        />
                        <span className="commenter">{c.postedBy?.name}</span>
                      </div> */}
                      <Link
                        to={`/profile/${c.postedBy?._id}`}
                        className="commenter-info"
                        onClick={close}
                      >
                        <img
                          src={c.postedBy?.photo || picLink}
                          alt="profile"
                          className="commenter-pic"
                        />
                        <span className="commenter">{c.postedBy?.name}</span>
                      </Link>

                    </div>
                    <div className="commentText">{c.text || c.comment}</div>
                  </div>
                ))
              )}
            </div>

            {/* Likes & Caption */}
            <div className="post-caption-likes">
              <div className="likes-block">
                <span className="likes-count">{post.likes.length} Likes</span>
              </div>
              <div className="caption-block">
                <span className="caption-text">{post.body}</span>
              </div>
            </div>

            {/* Add comment */}
            <div className="comment-box">
              <span className="material-symbols-outlined">mood</span>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
              />
              <button onClick={addComment}>Post</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





// import React, { useState, useEffect } from 'react';
// import '../css/PostView.css';

// export default function PostView({ item, close }) {
//   const [commentText, setCommentText] = useState("");
//   const [post, setPost] = useState(item);

//   useEffect(() => {
//     // Fetch fresh post details on mount to get updated comments
//     fetch(`/post/${item._id}`, {
//       headers: {
//         Authorization: "Bearer " + localStorage.getItem("jwt"),
//       },
//     })
//       .then((res) => res.json())
//       .then((result) => {
//         console.log("Fetched post details:", result);
//         setPost(result);
//       })
//       .catch((err) => {
//         console.error("Failed to fetch post details", err);
//       });
//   }, [item._id]);

//   const addComment = () => {
//     if (!commentText.trim()) return;

//     fetch("/comment", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + localStorage.getItem("jwt"),
//       },
//       body: JSON.stringify({
//         postId: post._id,
//         text: commentText,
//       }),
//     })
//       .then((res) => res.json())
//       .then((updatedPost) => {
//         console.log("Comment added:", updatedPost);
//         setPost(updatedPost); // update post with latest comments
//         setCommentText("");   // clear input
//       })
//       .catch((err) => console.error("Comment error:", err));
//   };

//   if (!post) return null;

//   return (
//     <div className="post-detail">
//       <div className="post-detail-container">
//         <button className="close-btn" onClick={close}>×</button>

//         <div className="post-detail-content">
//           <img src={post.photo} alt="post" className="post-detail-img" />

//           <div className="post-detail-comments">
//             <div className="comment-scroll">
//               <div className="card-header">
//                 <div className="card-pic">
//                   <img
//                     src={post.postedBy?.photo || "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"}
//                     alt="Profile"
//                   />
//                 </div>
//                 <h5>{post.postedBy?.name || "User"}</h5>
//               </div>
//               {post.comments.length === 0 ? (
//                 <p className="no-comments">No comments yet.</p>
//               ) : (
//                 post.comments.map((c) => (
//                   <div key={c._id} className="comment-block">
//                     <strong className="comment-name">{c.postedBy?.name || "User"}</strong>
//                     <p className="comment-text">{c.text || c.comment}</p>
//                   </div>
//                 ))
//               )}
//             </div>

//             {/* Caption and likes */}
//             <div className="post-caption-likes">

//               <div className="likes-block">
//                 <span className="likes-count">{post.likes.length} Likes</span>
//               </div>
//               <div className="caption-block">
//                 {/* <span className="caption-user">{post.postedBy?.name || "User"}</span> */}
//                 <span className="caption-text">{post.body}</span>
//               </div>

//             </div>

//             {/* Add comment */}
//             <div className="comment-box">
//               <span className="material-symbols-outlined">mood</span>
//               <input
//                 type="text"
//                 value={commentText}
//                 onChange={(e) => setCommentText(e.target.value)}
//                 placeholder="Add a comment..."
//               />
//               <button onClick={addComment}>Post</button>
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
