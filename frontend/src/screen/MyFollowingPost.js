import React, { useEffect, useState } from 'react';
import styles from '../css/Home.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

export default function MyFollowingPost() {
  var picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [comment, setComment] = useState("");
  const [show, setShow] = useState(false);
  const [item, setItem] = useState([]);

  const notifyB = (msg) => toast.success(msg);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token || !user) {
      navigate('./signin');
      return;
    }

    fetch("/myfollowingpost", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(result => {
        setData(result);
      })
      .catch(err => console.log(err));
  }, [navigate, user]);

  const toggleComment = (posts) => {
    if (show) {
      setShow(false);
    } else {
      setShow(true);
      setItem(posts);
    }
  };

  const likePost = (id) => {
    fetch("/like", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt")
      },
      body: JSON.stringify({ postId: id })
    })
      .then(res => res.json())
      .then(result => {
        const newData = data.map(posts => posts._id === result._id ? result : posts);
        setData(newData);
      })
      .catch(err => console.log(err));
  };

  const unlikePost = (id) => {
    fetch("/unlike", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt")
      },
      body: JSON.stringify({ postId: id })
    })
      .then(res => res.json())
      .then(result => {
        const newData = data.map(posts => posts._id === result._id ? result : posts);
        setData(newData);
      })
      .catch(err => console.log(err));
  };

  const makeComment = (text, id) => {
    fetch("/comment", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        text: text,
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        const newData = data.map((posts) => 
          posts._id === result._id ? result : posts
        );
        setData(newData);
        setComment("");
        notifyB("Comment posted");
      });
  };

  return (
    <div className={styles.home}>
      {data.map(posts => (
        <div className={styles.card} key={posts._id}>
          <div className={styles.cardHeader}>
            <div className={styles.cardPic}>
              <img
                src={posts.postedBy.photo ? posts.postedBy.photo : picLink}
                alt="profile"
              />
            </div>
            <h5><Link to={`/profile/${posts.postedBy._id}`}>{posts.postedBy.name}</Link></h5>
          </div>

          <div className={styles.cardImage}>
            <img src={posts.photo} alt="post" />
          </div>

          <div className={styles.cardContent}>
            {user && posts.likes.includes(user._id) ? (
              <span
                className={`material-symbols-outlined ${styles.filledHeart}`}
                onClick={() => unlikePost(posts._id)}
              >
                favorite
              </span>
            ) : (
              <span
                className={`material-symbols-outlined ${styles.outlinedHeart}`}
                onClick={() => likePost(posts._id)}
              >
                favorite
              </span>
            )}
            <p>{posts.likes.length} Like{posts.likes.length !== 1 && 's'}</p>
            <p>{posts.body}</p>
            {/* <p style={{ fontWeight: "bold", cursor: "pointer" }} onClick={() => toggleComment(posts)}>View all comments</p> */}
            {posts.comments?.length > 0 && (
              <p
                style={{ fontWeight: "bold", cursor: "pointer" }}
                onClick={() => toggleComment(posts)}
              >
                View all {posts.comments.length} comment{posts.comments.length === 1 ? '' : 's'}
              </p>
            )}

          </div>

          <div className={styles.addComment}>
            <span className="material-symbols-outlined">mood</span>
            <input type="text" placeholder='Add a comment' value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className={styles.comment} onClick={() => makeComment(comment, posts._id)}>Post</button>
          </div>
        </div>
      ))}

      {show && (
        <div className={styles.showComment}>
          <div className={styles.container}>
            <div className={styles.postPic}>
              <img src={item.photo} alt="" />
            </div>

            <div className={styles.details}>
              {/* <div className={styles.cardHeader}>
                <div className={styles.cardPic}>
                  <img
                    src={item.postedBy.photo || picLink}
                    alt="profile"
                  />
                </div>
                <h5>{item.postedBy.name}</h5>
              </div> */}
              <Link
                to={`/profile/${item.postedBy._id}`}
                className={styles.cardHeader}
                onClick={() => setShow(false)} // optional: close modal after navigation
              >
                <div className={styles.cardPic}>
                  <img
                    src={item.postedBy.photo || picLink}
                    alt="profile"
                  />
                </div>
                <h5>{item.postedBy.name}</h5>
              </Link>


              <div className={styles.commentSection}>
                {/* {item.comments.map((cmt, idx) => (
                  <div className={styles.comm} key={`${cmt._id}-${idx}`}>
                    <div className={styles.commenter}>{cmt.postedBy.name}</div>
                    <div className={styles.commentText}>{cmt.comment}</div>
                  </div>

                ))} */}
                {item.comments.map((cmt, idx) => (
                  <div className={styles.comm} key={`${cmt._id}-${idx}`}>
                    {/* <div className={styles.commenter}>
                      <img
                        src={cmt.postedBy?.photo || picLink}
                        alt="profile"
                        className={styles.commenterPic}
                      />
                      {cmt.postedBy?.name || "Unknown"}
                    </div> */}
                    <Link
                      to={`/profile/${cmt.postedBy._id}`}
                      className={styles.commenter}
                      onClick={() => setShow(false)} // Optional: close modal after click
                    >
                      <img
                        src={cmt.postedBy?.photo || picLink}
                        alt="profile"
                        className={styles.commenterPic}
                      />
                      {cmt.postedBy?.name || "Unknown"}
                    </Link>
                    <div className={styles.commentText}>{cmt.comment}</div>
                  </div>
                ))}

              </div>

              <div className={styles.cardContent}>
                <p>{item.likes.length} Like{item.likes.length !== 1 && 's'}</p>
                <p>{item.body}</p>
              </div>

              <div className={styles.addComment}>
                <span className="material-symbols-outlined">mood</span>
                <input type="text" placeholder='Add a comment' value={comment} onChange={(e) => setComment(e.target.value)} />
                <button className={styles.comment} onClick={() => { makeComment(comment, item._id); toggleComment(); }}>Post</button>
              </div>
            </div>
              <button className={styles.closeComment} onClick={() => toggleComment()}>
                <span className={`material-symbols-outlined ${styles.materialSymbolsOutlinedComment}`}>close</span>
              </button>
          </div>


        </div>
      )}

      {/* {show && (
        <div
          className={styles.showComment}
          onClick={() => toggleComment()} // click outside closes
        >
          <div
            className={styles.container}
            onClick={(e) => e.stopPropagation()} // prevent inner click from closing
          >
            <div className={styles.postPic}>
              <img src={item.photo} alt="" />
            </div>

            <div className={styles.details}>
              <div className={styles.cardHeader}>
                <div className={styles.cardPic}>
                  <img
                    src={item.postedBy.photo || picLink}
                    alt="profile"
                  />
                </div>
                <h5>{item.postedBy.name}</h5>
              </div>

              <div className={styles.commentSection}>
                {item.comments.map((cmt, idx) => (
                  <div className={styles.comm} key={`${cmt._id}-${idx}`}>
                    <div className={styles.commenter}>{cmt.postedBy.name}</div>
                    <div className={styles.commentText}>{cmt.comment}</div>
                  </div>
                ))}
              </div>

              <div className={styles.cardContent}>
                <p>{item.likes.length} Like{item.likes.length !== 1 && 's'}</p>
                <p>{item.body}</p>
              </div>

              <div className={styles.addComment}>
                <span className="material-symbols-outlined">mood</span>
                <input
                  type="text"
                  placeholder='Add a comment'
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button
                  className={styles.comment}
                  onClick={() => {
                    makeComment(comment, item._id);
                    toggleComment();
                  }}
                >
                  Post
                </button>
              </div>
            </div>

            <button className={styles.closeComment} onClick={() => toggleComment()}>
              <span className={`material-symbols-outlined ${styles.materialSymbolsOutlinedComment}`}>close</span>
            </button>
          </div>
        </div>
      )} */}

    </div>
  );
}








// import React, { useEffect, useState } from 'react';
// import styles from '../css/Home.module.css';
// import { Link, useNavigate } from 'react-router-dom';
// import { toast } from "react-toastify";

// export default function MyFollowingPost() {
//   var picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
//   const navigate = useNavigate();
//   const [data, setData] = useState([]);
//   const [comment, setComment] = useState("");
//   const [show, setShow] = useState(false);
//   const [item, setItem] = useState([]);


//     // Toast functions
//   // const notifyA = (msg) => toast.error(msg);
//   const notifyB = (msg) => toast.success(msg);

//   // Get user safely from localStorage
//   const user = JSON.parse(localStorage.getItem("user"));

//   useEffect(() => {
//     const token = localStorage.getItem("jwt");
//     if (!token || !user) {
//       navigate('./signin');
//       return;
//     }

//     // Fetch all posts
//     fetch("/myfollowingpost", {
//       headers: {
//         Authorization: "Bearer " + token
//       }
//     })
//       .then(res => res.json())
//       .then(result => {
//         setData(result);
//       })
//       .catch(err => console.log(err));
//   }, [navigate, user]);


//   // to show and hide comments 

//   const toggleComment = (posts) => {
//     if (show) {
//       setShow(false);
//     } else {
//       setShow(true);
//       setItem(posts);
      
//     }
//   };
    
//   //like
//   const likePost = (id) => {
//     fetch("/like", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + localStorage.getItem("jwt")
//       },
//       body: JSON.stringify({ postId: id })
//     })
//       .then(res => res.json())
//       .then(result => {
//         const newData = data.map(posts => posts._id === result._id ? result : posts);
//         setData(newData);
//       })
//       .catch(err => console.log(err));
//   };

//   //unlike
//   const unlikePost = (id) => {
//     fetch("/unlike", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + localStorage.getItem("jwt")
//       },
//       body: JSON.stringify({ postId: id })
//     })
//       .then(res => res.json())
//       .then(result => {
//         const newData = data.map(posts => posts._id === result._id ? result : posts);
//         setData(newData);
//       })
//       .catch(err => console.log(err));
//   };


//   // funtcion to make comment 
//   const makeComment = (text, id) => {
//     fetch("/comment", {
//       method: "put",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + localStorage.getItem("jwt"),
//       },
//       body: JSON.stringify({
//         text: text,
//         postId: id,
//       }),
//     })
//       .then((res) => res.json())
//       .then((result) => {
//         const newData = data.map((posts) => 
//           posts._id === result._id ? result : posts
//         );
//         setData(newData);
//         setComment("");
//         notifyB("Comment posted");
//         console.log(result);
//       });
//   };


//   return (
//     <div className='home'>
//       {/* card */}
//       {data.map(posts => (
//         <div className="card" key={posts._id}>
//           {/* Card Header */}
//           <div className="card-header">
//             <div className="card-pic">
//               <img
//                 src={posts.postedBy.photo ? posts.postedBy.photo : picLink}
//                 alt="profile"
//               />
//             </div>
//             <h5><Link to={`/profile/${posts.postedBy._id}`}>{posts.postedBy.name}</Link> </h5>
//           </div>

//           {/* Card Image */}
//           <div className="card-image">
//             <img src={posts.photo} alt="post" />
//           </div>

//           {/* Card Content */}
//           <div className="card-content">
//             {user && posts.likes.includes(user._id) ? (
//               <span
//                 className="material-symbols-outlined material-symbols-outlined-red"
//                 onClick={() => unlikePost(posts._id)}
//               >
//                 favorite
//               </span>
//             ) : (
//               <span
//                 className="material-symbols-outlined"
//                 onClick={() => likePost(posts._id)}
//               >
//                 favorite
//               </span>
//             )}
//             <p>{posts.likes.length} Like{posts.likes.length !== 1 && 's'}</p>
//             <p>{posts.body}</p>
//             <p style={{fontWeight:"bold", cursor:"pointer"}} onClick={()=>{toggleComment(posts)}}>View all comments</p>
//           </div>

//           {/* Add Comment */}
//           <div className="add-comment">
//             <span className="material-symbols-outlined">mood</span>
//             <input type="text" placeholder='Add a comment' value={comment} onChange={(e)=>{setComment(e.target.value)}}/>
//             <button className='comment' onClick={()=>{makeComment(comment, posts._id)}}>Post</button>
//           </div>

//         </div>
//       ))}



//       {/* show comments */}
//       {show && (
//         <div className="showComment">

//             {/* container  */}
//             <div className="container">

//               <div className="postPic">
//                 <img src={item.photo} alt="" />
//               </div>

//               <div className="details">
//               {/* Card Header */}
//                 <div className="card-header" style={{borderBottom: "1px solid #00000029"}}>
//                   <div className="card-pic">
//                     <img
//                       src="https://images.unsplash.com/photo-1751139443669-7d0d8127476e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyMnx8fGVufDB8fHx8fA%3D%3D"
//                       alt="profile"
//                     />
//                   </div>
//                   <h5>{item.postedBy.name}</h5>
//                 </div>

//               {/* comment section */}
//                 <div className="comment-section" style={{borderBottom: "1px solid #00000029"}}>
//                   {
//                     item.comments.map((comment)=>{
//                       return (<p className='comm' key={comment._id}>
//                         <span className='commenter' style={{fontWeight:"bolder"}}>{comment.postedBy.name} </span>
//                         <span className='commentText' >{comment.comment}</span>
//                       </p>)
//                     })
//                   }
//                 </div>

//               {/* Card Content */}
//                 <div className="card-content">
//                   <p>{item.likes.length} Like{item.likes.length !== 1 && 's'}</p>
//                   <p>{item.body}</p>
//                 </div>

//               {/* Add Comment */}
//                 <div className="add-comment">
//                   <span className="material-symbols-outlined">mood</span>
//                   <input type="text" placeholder='Add a comment' value={comment} onChange={(e)=>{setComment(e.target.value)}}/>
//                   <button className='comment' onClick={()=>{makeComment(comment, item._id); toggleComment();}}>Post</button>
//                 </div>
//               </div>

//             </div>

//             {/* close comment  */}
//             <div className="close-comment">
//               <span className="material-symbols-outlined material-symbols-outlined-comment" onClick={()=>{toggleComment()}}>close</span>
//             </div>

//         </div>
//        )}

//     </div>
//   );
// }
