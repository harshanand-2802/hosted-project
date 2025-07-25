import React, { useState, useEffect } from "react";
import "../css/PostDetail.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom"; // ✅ make sure this is imported


export default function PostDetail({ item, toggleDetails }) {
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(item.comments || []);
  const [post, setPost] = useState(item);

  const notifyError = (msg) => toast.error(msg);
  const notifySuccess = (msg) => toast.success(msg);

  const picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";

  useEffect(() => {
    // Fetch fresh post data
    fetch(`/post/${item._id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setPost(result);
        setComments(result.comments);
      })
      .catch((err) => {
        console.error("Failed to fetch post details", err);
        notifyError("Failed to load post details");
      });
  }, [item._id]);

  const removePost = (postId) => {
    if (window.confirm("Do you really want to delete this post?")) {
      fetch(`/deletePost/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
      })
        .then((res) => res.json())
        .then((result) => {
          toggleDetails();
          navigate("/");
          notifySuccess(result.message);
        })
        .catch((err) => {
          console.log(err);
          notifyError("Failed to delete post");
        });
    }
  };

  const makeComment = () => {
    if (!commentText.trim()) {
      return notifyError("Comment cannot be empty");
    }

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
      .then((result) => {
        setComments(result.comments);
        setCommentText("");
      })
      .catch((err) => {
        console.error(err);
        notifyError("Failed to add comment");
      });
  };

  const deleteComment = (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    fetch("/deletecomment", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        postId: post._id,
        commentId: commentId,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        setComments(result.comments);
        notifySuccess("Comment deleted");
      })
      .catch((err) => {
        console.error(err);
        notifyError("Failed to delete comment");
      });
  };

  return (
    <div className="showComment">
      <div className="container">
        <div className="postPic">
          <img src={post.photo} alt="Post" />
        </div>

        <div className="details">
          {/* Card Header */}
          {/* <div className="card-header">
            <div className="card-pic">
              <img
                 src={post.postedBy?.photo || picLink}
                alt="Profile"
              />
            </div>
            <h5>{post.postedBy?.name}</h5>

            <div className="deletePost" onClick={() => removePost(post._id)}>
              <span className="material-symbols-outlined">delete</span>
            </div>
          </div> */}
          <div className="card-header">
            <Link
              to={`/profile/${post.postedBy?._id}`}
              className="card-pic-name"
              onClick={toggleDetails} // Close modal when navigating
            >
              <div className="card-pic">
                <img src={post.postedBy?.photo || picLink} alt="Profile" />
              </div>
              <h5>{post.postedBy?.name}</h5>
            </Link>

            <div className="deletePost" onClick={() => removePost(post._id)}>
              <span className="material-symbols-outlined">delete</span>
            </div>
          </div>


          {/* Comment Section  */}
          <div className="comment-section">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div className="comm" key={comment._id}>
                  <div className="comment-header">
                    {/* <span className="commenter">{comment.postedBy?.name}</span> */}
                    {/* <div className="commenter-info">
                      <img
                        src={comment.postedBy?.photo || picLink}
                        alt="profile"
                        className="commenter-pic"
                      />
                      <span className="commenter">{comment.postedBy?.name}</span>
                    </div> */}
                    <Link
                      to={`/profile/${comment.postedBy?._id}`}
                      className="commenter-info"
                      onClick={toggleDetails} // Closes modal on navigation
                    >
                      <img
                        src={comment.postedBy?.photo || picLink}
                        alt="profile"
                        className="commenter-pic"
                      />
                      <span className="commenter">{comment.postedBy?.name}</span>
                    </Link>

                    
                    <span
                      className="material-symbols-outlined delete-comment-icon"
                      onClick={() => deleteComment(comment._id)}
                      title="Delete comment"
                    >
                      delete
                    </span>
                  </div>
                  <div className="commentText">{comment.comment}</div>
                </div>
              ))
            )}
          </div>


          {/* Card Content */}
          <div className="card-content">
            <p>{post.likes.length} Likes</p>
            <p>{post.body}</p>
          </div>

          {/* Add Comment */}
          <div className="add-comment">
            <span className="material-symbols-outlined">mood</span>
            <input
              type="text"
              placeholder="Add a comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button className="comment" onClick={makeComment}>
              Post
            </button>
          </div>
        </div>
      </div>

      {/* Close Modal */}
      <div className="close-comment" onClick={toggleDetails}>
        <span className="material-symbols-outlined">close</span>
      </div>
    </div>
  );
}



// import React from "react";
// import '../css/PostDetail.css'
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

// export default function PostDetail({ item, toggleDetails }) {
//   const navigate = useNavigate();

//   const notifyError = (msg) => toast.error(msg);
//   const notifySuccess = (msg) => toast.success(msg);

//   const removePost = (postId) => {
//     if (window.confirm("Do you really want to delete this post?")) {
//       fetch(`/deletePost/${postId}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: "Bearer " + localStorage.getItem("jwt"),
//         },
//       })
//         .then((res) => res.json())
//         .then((result) => {
//           console.log(result);
//           toggleDetails();
//           navigate("/");
//           notifySuccess(result.message);
//         })
//         .catch((err) => {
//           console.log(err);
//           notifyError("Failed to delete post");
//         });
//     }
//   };

//   return (
//     <div className="showComment">
//       <div className="container">
//         <div className="postPic">
//           <img src={item.photo} alt="Post" />
//         </div>

//         <div className="details">
//           {/* Card Header */}
//           <div className="card-header" style={{ borderBottom: "1px solid #00000029" }}>
//             <div className="card-pic">
//               <img
//                 src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cGVyc29ufGVufDB8MnwwfHw%3D&auto=format&fit=crop&w=500&q=60"
//                 alt="Profile"
//               />
//             </div>
//             <h5>{item.postedBy.name}</h5>

//             <div className="deletePost" onClick={() => removePost(item._id)}>
//               <span className="material-symbols-outlined">delete</span>
//             </div>
//           </div>

//           {/* Comment Section */}
//           <div className="comment-section" style={{ borderBottom: "1px solid #00000029" }}>
//             {item.comments.map((comment) => (
//               <p className="comm" key={comment._id}>
//                 <span className="commenter" style={{ fontWeight: "bolder" }}>
//                   {comment.postedBy.name}
//                 </span>{" "}
//                 <span className="commentText">{comment.comment}</span>
//               </p>
//             ))}
//           </div>

//           {/* Card Content */}
//           <div className="card-content">
//             <p>{item.likes.length} Likes</p>
//             <p>{item.body}</p>
//           </div>

//           {/* Add Comment */}
//           <div className="add-comment">
//             <span className="material-symbols-outlined">mood</span>
//             <input type="text" placeholder="Add a comment" />
//             <button className="comment">Post</button>
//           </div>
//         </div>
//       </div>

//       {/* Close Modal */}
//       <div className="close-comment" onClick={toggleDetails}>
//         <span className="material-symbols-outlined material-symbols-outlined-comment">
//           close
//         </span>
//       </div>
//     </div>
//   );
// }
