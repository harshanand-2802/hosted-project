import React, { useEffect, useState } from 'react';
import styles from '../css/Home.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import throttle from 'lodash/throttle';

export default function Home() {
  const picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [comment, setComment] = useState("");
  const [show, setShow] = useState(false);
  const [item, setItem] = useState({});
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const notifyB = (msg) => toast.success(msg);


  // const user = React.useMemo(() => JSON.parse(localStorage.getItem("user")), []);
  const user = React.useMemo(() => {
  const storedUser = localStorage.getItem("user");
  try {
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    console.error("Invalid user in localStorage:", e);
    return null;
  }
}, []);


  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token || !user) {
      navigate('/signin');
      return;
    }

    fetchPosts(0);

    const throttledHandleScroll = throttle(handleScroll, 300);
    window.addEventListener("scroll", throttledHandleScroll);
    return () => window.removeEventListener("scroll", throttledHandleScroll);
  }, [navigate]);

  const fetchPosts = async (currentSkip) => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/allposts?limit=${limit}&skip=${currentSkip}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        }
      });
      const result = await res.json();

      const merged = [...data, ...result];
      const uniquePosts = Array.from(new Map(merged.map(p => [p._id, p])).values());

      setData(uniquePosts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
      const newSkip = skip + limit;
      setSkip(newSkip);
      fetchPosts(newSkip);
    }
  };

  const toggleComment = (posts) => {
    setShow(!show);
    if (!show) {
      setItem(posts);
      setComment("");
    }
  };

  const likePost = async (id) => {
    try {
      const res = await fetch("/like", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt")
        },
        body: JSON.stringify({ postId: id })
      });
      const result = await res.json();
      updatePost(result);
    } catch (err) {
      console.error(err);
    }
  };

  const unlikePost = async (id) => {
    try {
      const res = await fetch("/unlike", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt")
        },
        body: JSON.stringify({ postId: id })
      });
      const result = await res.json();
      updatePost(result);
    } catch (err) {
      console.error(err);
    }
  };

  const makeComment = async (text, id) => {
    try {
      const res = await fetch("/comment", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
        body: JSON.stringify({ text, postId: id }),
      });
      const result = await res.json();
      updatePost(result);
      setComment("");
      notifyB("Comment posted");
    } catch (err) {
      console.error(err);
    }
  };

  const updatePost = (updated) => {
    setData(prev => prev.map(p => p._id === updated._id ? updated : p));
    if (show && item._id === updated._id) {
      setItem(updated);
    }
  };

  return (
    <div className={styles.home}>
      {data.map((post, index) => (
        <div className={styles.card} key={`${post._id}-${index}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardPic}>
              <img src={post.postedBy?.photo || picLink} alt="profile" />
            </div>
            <h5>
              {post.postedBy ? (
                <Link to={`/profile/${post.postedBy._id}`}>{post.postedBy.name}</Link>
              ) : (
                <span>User deleted</span>
              )}
            </h5>
          </div>

          <div className={styles.cardImage}>
            <img src={post.photo} alt="post" />
          </div>

          <div className={styles.cardContent}>
            {/* {user && post.likes.includes(user._id) ? (
              <span className={`material-symbols-outlined ${styles.red}`} onClick={() => unlikePost(post._id)}>favorite</span>
            ) : (
              <span className="material-symbols-outlined" onClick={() => likePost(post._id)}>favorite</span>
            )} */}
            {user && post.likes.includes(user._id) ? (
              <span className={`material-symbols-outlined ${styles.filledHeart}`} onClick={() => unlikePost(post._id)}>favorite</span>
            ) : (
              <span className={`material-symbols-outlined ${styles.outlinedHeart}`} onClick={() => likePost(post._id)}>favorite</span>
            )}

            <p>{post.likes.length} Like{post.likes.length !== 1 && 's'}</p>
            <p>{post.body}</p>
            {/* <p style={{ fontWeight: "bold", cursor: "pointer" }} onClick={() => toggleComment(post)}>View all comments</p> */}
            {post.comments?.length > 0 && (
                <p
                  style={{ fontWeight: "bold", cursor: "pointer" }}
                  onClick={() => toggleComment(post)}
                >
                  View all {post.comments.length} comment{post.comments.length === 1 ? '' : 's'}
                </p>
              )}

          </div>

          <div className={styles.addComment}>
            <span className="material-symbols-outlined">mood</span>
            <input
              type="text"
              placeholder='Add a comment'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className={styles.comment} onClick={() => makeComment(comment, post._id)}>Post</button>
          </div>
        </div>
      ))}

      {show && item && (
        <div className={styles.showComment}>
          <div className={styles.container}>
            <div className={styles.postPic}>
              <img src={item.photo} alt="" />
            </div>

            <div className={styles.details}>
              {/* <div className={styles.cardHeader}>
                <div className={styles.cardPic}>
                  <img src={item.postedBy.photo || picLink} alt="profile" />
                </div>
                <h5>{item.postedBy.name}</h5>
              </div> */}
              <Link
                to={`/profile/${item.postedBy._id}`}
                className={styles.profileLink}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent modal close
                  setShow(false);      // Optional: close modal after navigation
                }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardPic}>
                    <img src={item.postedBy.photo || picLink} alt="profile" />
                  </div>
                  <h5>{item.postedBy.name}</h5>
                </div>
              </Link>
              <div className={styles.commentSection}>
                {item.comments.length === 0 ? (
                  <p className={styles.noComments}>No comments yet.</p>
                ) : (
                  item.comments.map((cmt, idx) => (
                    <div className={styles.comm} key={`${cmt._id}-${idx}`}>
                      {/* <div className={styles.commenter}>
                            <img
                              src={cmt.postedBy.photo || picLink}
                              alt="profile"
                              className={styles.commenterPic}
                            />
                        {cmt.postedBy.name}</div> */}
                        <Link
                          to={`/profile/${cmt.postedBy._id}`}
                          className={styles.commenter}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <img
                            src={cmt.postedBy.photo || picLink}
                            alt="profile"
                            className={styles.commenterPic}
                          />
                          {cmt.postedBy.name}
                        </Link>
                      <div className={styles.commentText}>{cmt.comment}</div>
                    </div>

                  ))
                )}
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
                <button className={styles.comment} onClick={() => { makeComment(comment, item._id); toggleComment(); }}>Post</button>
              </div>
            </div>

            <button className={styles.closeComment} onClick={() => toggleComment()}>
              <span className={`material-symbols-outlined ${styles.materialSymbolsOutlinedComment}`}>close</span>
            </button>
          </div>
        </div>
      )}
      
      {/* {show && item && (
      <div
        className={styles.showComment}
        onClick={() => toggleComment()} // Click outside closes modal
      >
        <div
          className={styles.container}
          onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
        >
          <div className={styles.postPic}>
            <img src={item.photo} alt="" />
          </div>

          <div className={styles.details}>
            <div className={styles.cardHeader}>
              <div className={styles.cardPic}>
                <img src={item.postedBy.photo || picLink} alt="profile" />
              </div>
              <h5>{item.postedBy.name}</h5>
            </div>

            <div className={styles.commentSection}>
              {item.comments.length === 0 ? (
                <p className={styles.noComments}>No comments yet.</p>
              ) : (
                item.comments.map((cmt, idx) => (
                  <div className={styles.comm} key={`${cmt._id}-${idx}`}>
                    <div className={styles.commenter}>{cmt.postedBy.name}</div>
                    <div className={styles.commentText}>{cmt.comment}</div>
                  </div>
                ))
              )}
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
              <button className={styles.comment} onClick={() => { makeComment(comment, item._id); toggleComment(); }}>Post</button>
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

