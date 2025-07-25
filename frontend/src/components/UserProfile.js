import React, { useEffect, useState, useRef } from 'react';
import '../css/UserProfile.css';
import { useParams } from "react-router-dom";
import PostView from '../components/PostView';

export default function UserProfile() {
  const { userid } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollow, setIsFollow] = useState(false);
  const [showFollowList, setShowFollowList] = useState(false);
  const [followListType, setFollowListType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loggedInUserFollowing, setLoggedInUserFollowing] = useState([]);
  const modalRef = useRef();

  const picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";

  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });

  const loggedInUserId = loggedInUser?._id;

  // const followUser = (userId) => {
  //   fetch("/follow", {
  //     method: "PUT",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: "Bearer " + localStorage.getItem("jwt"),
  //     },
  //     body: JSON.stringify({ followId: userId }),
  //   })
  //     .then(res => res.json())
  //     .then(() => {
  //       setIsFollow(true);
  //       setLoggedInUserFollowing(prev => [...prev, userId]);
  //       if (userId === user._id) {
  //         setUser(prev => ({
  //           ...prev,
  //           followers: [...prev.followers, { _id: loggedInUserId, name: loggedInUser.name, photo: loggedInUser.photo }]
  //         }));
  //       }
  //     });
  // };

    const followUser = (userId) => {
    fetch("/follow", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ followId: userId }),
    })
      .then(res => res.json())
      .then(() => {
        setLoggedInUserFollowing(prev => [...prev, userId]);

        // If this is the profile user, update the main follow button state
        if (userId === user._id) {
          setIsFollow(true);
          setUser(prev => ({
            ...prev,
            followers: [...prev.followers, { _id: loggedInUserId, name: loggedInUser.name, photo: loggedInUser.photo }]
          }));
        }
      });
  };

  // const unfollowUser = (userId) => {
  //   fetch("/unfollow", {
  //     method: "PUT",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: "Bearer " + localStorage.getItem("jwt"),
  //     },
  //     body: JSON.stringify({ followId: userId }),
  //   })
  //     .then(res => res.json())
  //     .then(() => {
  //       setIsFollow(false);
  //       setLoggedInUserFollowing(prev => prev.filter(id => id !== userId));
  //       if (userId === user._id) {
  //         setUser(prev => ({
  //           ...prev,
  //           followers: prev.followers.filter(f => f._id !== loggedInUserId)
  //         }));
  //       }
  //     });
  // };
  const unfollowUser = (userId) => {
    fetch("/unfollow", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ followId: userId }),
    })
      .then(res => res.json())
      .then(() => {
        setLoggedInUserFollowing(prev => prev.filter(id => id !== userId));

        if (userId === user._id) {
          setIsFollow(false);
          setUser(prev => ({
            ...prev,
            followers: prev.followers.filter(f => f._id !== loggedInUserId)
          }));
        }
      });
  };

  useEffect(() => {
    if (!loggedInUserId) {
      window.location.href = "/signin";
      return;
    }

    // Fetch profile user
    fetch(`/user/${userid}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt")
      }
    })
      .then(res => res.json())
      .then(result => {
        setUser(result.user);
        setPosts(result.posts || []);
        setIsFollow(result.user.followers.some(f => f._id === loggedInUserId));
      });

    // Fetch logged-in user's following list
    fetch(`/user/${loggedInUserId}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt")
      }
    })
      .then(res => res.json())
      .then(result => {
        setLoggedInUserFollowing(result.user.following.map(f => f._id));
      });

  }, [userid, loggedInUserId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowFollowList(false);
      }
    };

    if (showFollowList) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFollowList]);

  const togglePostModal = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleNewComment = (newComment) => {
    setSelectedPost(prev => ({
      ...prev,
      comments: [...prev.comments, newComment]
    }));
    setPosts(prev => prev.map(p => p._id === selectedPost._id ? {
      ...p,
      comments: [...p.comments, newComment]
    } : p));
  };

  const openFollowList = (type) => {
    setFollowListType(type);
    setShowFollowList(true);
  };

  return (
    <div className="profile">
      <div className="profile-frame">
        <div className="profile-pic">
          <img src={user?.photo || picLink} alt="profile" />
        </div>
        <div className="profile-data">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1>{user?.name || "Loading..."}</h1>
            {user && loggedInUserId !== user._id && (
              <button
                className="followBtn"
                onClick={() => isFollow ? unfollowUser(user._id) : followUser(user._id)}
              >
                {isFollow ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
          <div className="profile-info">
            <p>{posts.length} Post{posts.length !== 1 ? "s" : ""}</p>
            <p style={{ cursor: "pointer" }} onClick={() => openFollowList("followers")}>
              {user?.followers?.length || 0} Followers
            </p>
            <p style={{ cursor: "pointer" }} onClick={() => openFollowList("following")}>
              {user?.following?.length || 0} Following
            </p>
          </div>
        </div>
      </div>

      <hr style={{ width: "90%", margin: "25px auto" }} />

      <div className="gallary">
        {posts.map(post => (
          <img
            key={post._id}
            src={post.photo}
            className="item"
            onClick={() => togglePostModal(post)}
            alt="post"
          />
        ))}
      </div>

      {showPostModal && selectedPost && (
        <PostView
          item={selectedPost}
          close={() => setShowPostModal(false)}
          onComment={handleNewComment}
        />
      )}

      {showFollowList && (
        <div className="follow-list-modal">
          <div className="follow-list-content" ref={modalRef}>
            <h2>{followListType === "followers" ? "Followers" : "Following"}</h2>
            <span className="close-btn" onClick={() => setShowFollowList(false)}>×</span>
            <input
              type="text"
              placeholder={`Search ${followListType}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="follow-search"
            />
            {/* <ul>
              {(user?.[followListType] || [])
                .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .filter((f, index, self) =>
                  index === self.findIndex(u => u._id === f._id)
                )
                .map(f => (
                  <li key={f._id} className="follow-user-item">
                    <a href={`/profile/${f._id}`} className="follow-user-link">
                      <img src={f.photo || picLink} alt="dp" className="user-pic" />
                      <span>{f.name}</span>
                    </a>
                    {f._id !== loggedInUserId && (
                      // <button
                      //   className="followBtn"
                      //   onClick={() =>
                      //     loggedInUserFollowing.includes(f._id)
                      //       ? unfollowUser(f._id)
                      //       : followUser(f._id)
                      //   }
                      // >
                      //   {loggedInUserFollowing.includes(f._id) ? "Unfollow" : "Follow"}
                      // </button>
                    <button
                      className={`followBtn ${loggedInUserFollowing.includes(f._id) ? 'unfollow' : ''}`}
                      onClick={() =>
                        loggedInUserFollowing.includes(f._id)
                          ? unfollowUser(f._id)
                          : followUser(f._id)
                      }
                    >
                      {loggedInUserFollowing.includes(f._id) ? "Unfollow" : "Follow"}
                    </button>

                    )}
                  </li>
                ))}
            </ul> */}

            <ul>
              {[...(user?.[followListType] || [])]
                .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .filter((f, index, self) =>
                  index === self.findIndex(u => u._id === f._id)
                )
                .sort((a, b) => {
                  // Prioritize the logged-in user at the top
                  if (a._id === loggedInUserId) return -1;
                  if (b._id === loggedInUserId) return 1;
                  return 0;
                })
                .map(f => (
                  <li key={f._id} className="follow-user-item">
                    <a href={`/profile/${f._id}`} className="follow-user-link">
                      <img src={f.photo || picLink} alt="dp" className="user-pic" />
                      <span>
                        {f.name}
                        {f._id === loggedInUserId && (
                          <span style={{
                            marginLeft: "8px",
                            fontSize: "12px",
                            color: "#888",
                            fontStyle: "italic"
                          }}>
                            (you)
                          </span>
                        )}
                      </span>
                    </a>
                    {f._id !== loggedInUserId && (
                      <button
                        className={`followBtn ${loggedInUserFollowing.includes(f._id) ? 'unfollow' : ''}`}
                        onClick={() =>
                          loggedInUserFollowing.includes(f._id)
                            ? unfollowUser(f._id)
                            : followUser(f._id)
                        }
                      >
                        {loggedInUserFollowing.includes(f._id) ? "Unfollow" : "Follow"}
                      </button>
                    )}
                  </li>
                ))}
            </ul>

          </div>
        </div>
      )}
    </div>
  );
}






















// import React, { useEffect, useState, useRef } from 'react';
// import '../css/UserProfile.css';
// import { useParams } from "react-router-dom";
// import PostView from '../components/PostView';

// export default function UserProfile() {
//   const { userid } = useParams();
//   const [user, setUser] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [isFollow, setIsFollow] = useState(false);
//   const [showFollowList, setShowFollowList] = useState(false);
//   const [followListType, setFollowListType] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showPostModal, setShowPostModal] = useState(false);
//   const [selectedPost, setSelectedPost] = useState(null);
//   const modalRef = useRef();

//   const picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";

//   // Safe JSON.parse fallback
//   const [loggedInUser, setLoggedInUser] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem("user")) || {};
//     } catch {
//       return {};
//     }
//   });

//   const loggedInUserId = loggedInUser?._id;

//   const followUser = (userId) => {
//     fetch("/follow", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + localStorage.getItem("jwt"),
//       },
//       body: JSON.stringify({ followId: userId }),
//     })
//       .then(res => res.json())
//       .then(() => {
//         setIsFollow(true);
//         setUser(prev => ({
//           ...prev,
//           followers: prev.followers.some(f => f._id === loggedInUserId)
//             ? prev.followers
//             : [...prev.followers, { _id: loggedInUserId, name: loggedInUser.name, photo: loggedInUser.photo }]
//         }));
//       });
//   };

//   const unfollowUser = (userId) => {
//     fetch("/unfollow", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + localStorage.getItem("jwt"),
//       },
//       body: JSON.stringify({ followId: userId }),
//     })
//       .then(res => res.json())
//       .then(() => {
//         setIsFollow(false);
//         setUser(prev => ({
//           ...prev,
//           followers: prev.followers.filter(f => f._id !== loggedInUserId)
//         }));
//       });
//   };

//   useEffect(() => {
//     if (!loggedInUserId) {
//       window.location.href = "/signin"; // Redirect if not logged in
//       return;
//     }

//     fetch(`/user/${userid}`, {
//       headers: {
//         Authorization: "Bearer " + localStorage.getItem("jwt")
//       }
//     })
//       .then(res => res.json())
//       .then(result => {
//         setUser(result.user);
//         setPosts(result.posts || []);
//         setIsFollow(result.user.followers.some(f => f._id === loggedInUserId));
//       });
//   }, [userid, loggedInUserId]);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (modalRef.current && !modalRef.current.contains(e.target)) {
//         setShowFollowList(false);
//       }
//     };

//     if (showFollowList) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showFollowList]);

//   const togglePostModal = (post) => {
//     setSelectedPost(post);
//     setShowPostModal(true);
//   };

//   const handleNewComment = (newComment) => {
//     setSelectedPost(prev => ({
//       ...prev,
//       comments: [...prev.comments, newComment]
//     }));
//     setPosts(prev => prev.map(p => p._id === selectedPost._id ? {
//       ...p,
//       comments: [...p.comments, newComment]
//     } : p));
//   };

//   const openFollowList = (type) => {
//     setFollowListType(type);
//     setShowFollowList(true);
//   };

//   return (
//     <div className="profile">
//       <div className="profile-frame">
//         <div className="profile-pic">
//           <img src={user?.photo || picLink} alt="profile" />
//         </div>
//         <div className="profile-data">
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//             <h1>{user?.name || "Loading..."}</h1>
//             {user && loggedInUserId !== user._id && (
//               <button
//                 className="followBtn"
//                 onClick={() => isFollow ? unfollowUser(user._id) : followUser(user._id)}
//               >
//                 {isFollow ? "Unfollow" : "Follow"}
//               </button>
//             )}
//           </div>
//           <div className="profile-info">
//             <p>{posts.length} Post{posts.length !== 1 ? "s" : ""}</p>
//             <p style={{ cursor: "pointer" }} onClick={() => openFollowList("followers")}>
//               {user?.followers?.length || 0} Followers
//             </p>
//             <p style={{ cursor: "pointer" }} onClick={() => openFollowList("following")}>
//               {user?.following?.length || 0} Following
//             </p>
//           </div>
//         </div>
//       </div>

//       <hr style={{ width: "90%", margin: "25px auto" }} />

//       <div className="gallary">
//         {posts.map(post => (
//           <img
//             key={post._id}
//             src={post.photo}
//             className="item"
//             onClick={() => togglePostModal(post)}
//             alt="post"
//           />
//         ))}
//       </div>

//       {showPostModal && selectedPost && (
//         <PostView
//           item={selectedPost}
//           close={() => setShowPostModal(false)}
//           onComment={handleNewComment}
//         />
//       )}

//       {showFollowList && (
//         <div className="follow-list-modal">
//           <div className="follow-list-content" ref={modalRef}>
//             <h2>{followListType === "followers" ? "Followers" : "Following"}</h2>
//             <span className="close-btn" onClick={() => setShowFollowList(false)}>×</span>
//             <input
//               type="text"
//               placeholder={`Search ${followListType}`}
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="follow-search"
//             />
//             <ul>
//               {(user?.[followListType] || [])
//                 .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
//                 .filter((f, index, self) =>
//                   index === self.findIndex(u => u._id === f._id) // remove duplicates
//                 )
//                 .map(f => (
//                   <li key={f._id}>
//                     <a href={`/profile/${f._id}`} className="follow-user-link">
//                       <img src={f.photo || picLink} alt="dp" className="user-pic" />
//                       <span>{f.name}</span>
//                     </a>
//                   </li>
//                 ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }







































// import React, { useEffect, useState, useRef } from 'react';
// import '../css/Profile.css';
// import { useParams } from "react-router-dom";

// export default function UserProfile() {
//   const { userid } = useParams();
//   const [user, setUser] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [isFollow, setIsFollow] = useState(false);
//   const [showFollowList, setShowFollowList] = useState(false);
//   const [followListType, setFollowListType] = useState(""); // 'followers' or 'following'
//   const [searchQuery, setSearchQuery] = useState("");
//   const modalRef = useRef();

//   const picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
//   const loggedInUser = JSON.parse(localStorage.getItem("user"));
//   const loggedInUserId = loggedInUser?._id;

//   const followUser = (userId) => {
//     fetch("/follow", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + localStorage.getItem("jwt"),
//       },
//       body: JSON.stringify({ followId: userId }),
//     })
//       .then(res => res.json())
//       .then(() => {
//         setIsFollow(true);
//         setUser(prev => ({
//           ...prev,
//           followers: [...prev.followers, loggedInUserId]
//         }));
//       })
//       .catch(err => console.error("Error following user:", err));
//   };

//   const unfollowUser = (userId) => {
//     fetch("/unfollow", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + localStorage.getItem("jwt"),
//       },
//       body: JSON.stringify({ followId: userId }),
//     })
//       .then(res => res.json())
//       .then(() => {
//         setIsFollow(false);
//         setUser(prev => ({
//           ...prev,
//           followers: prev.followers.filter(id => id !== loggedInUserId)
//         }));
//       })
//       .catch(err => console.error("Error unfollowing user:", err));
//   };

//   useEffect(() => {
//     if (!userid) return;

//     fetch(`/user/${userid}`, {
//       headers: {
//         Authorization: "Bearer " + localStorage.getItem("jwt")
//       }
//     })
//       .then(res => res.json())
//       .then(result => {
//         setUser(result.user);
//         setPosts(result.posts || []);
//         setIsFollow(result.user.followers.some(f => f._id === loggedInUserId));
//       })
//       .catch(err => console.error("Error fetching user data:", err));
//   }, [userid]);

//   const handleFollowClick = (type) => {
//     setFollowListType(type);
//     setSearchQuery("");
//     setShowFollowList(true);
//   };

//   // Close modal on outside click
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (modalRef.current && !modalRef.current.contains(e.target)) {
//         setShowFollowList(false);
//       }
//     };
//     if (showFollowList) document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [showFollowList]);

//   return (
//     <div className="profile">
//       <div className="profile-frame">
//         <div className="profile-pic">
//           <img src={user?.photo || picLink} alt="profile" />
//         </div>

//         <div className="profile-data">
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//             <h1>{user?.name || "Loading..."}</h1>
//             {user && loggedInUserId !== user._id && (
//               <button
//                 className="followBtn"
//                 onClick={() =>
//                   isFollow ? unfollowUser(user._id) : followUser(user._id)
//                 }
//               >
//                 {isFollow ? "Unfollow" : "Follow"}
//               </button>
//             )}
//           </div>

//           <div className="profile-info">
//             <p>{posts.length} Post{posts.length !== 1 ? "s" : ""}</p>
//             <p style={{ cursor: "pointer" }} onClick={() => handleFollowClick("followers")}>
//               {user?.followers?.length || 0} {user?.followers?.length === 1 ? "Follower" : "Followers"}
//             </p>
//             <p style={{ cursor: "pointer" }} onClick={() => handleFollowClick("following")}>
//               {user?.following?.length || 0} Following
//             </p>
//           </div>
//         </div>
//       </div>

//       <hr style={{ width: "90%", opacity: "0.8", margin: "25px auto" }} />

//       <div className="gallary">
//         {posts.map(post => (
//           <img key={post._id} src={post.photo} className="item" alt="post" />
//         ))}
//       </div>

//       {showFollowList && (
//         <div className="follow-list-modal">
//           <div className="follow-list-content" ref={modalRef}>
//             <h3>{followListType.charAt(0).toUpperCase() + followListType.slice(1)}</h3>
//             <button onClick={() => setShowFollowList(false)} className="close-btn">×</button>

//             <input
//               type="text"
//               placeholder={`Search ${followListType}`}
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="follow-search"
//             />

//             <ul>
//               {(() => {
//                 const list = user?.[followListType] || [];
//                 const filteredList = list.filter((u) =>
//                   u.name.toLowerCase().includes(searchQuery.toLowerCase())
//                 );

//                 if (filteredList.length === 0) {
//                   return <p className="no-results">No results found.</p>;
//                 }

//                 return filteredList.map((f) => (
//                   <li key={f._id} className="follow-user">
//                     <a href={`/profile/${f._id}`} className="follow-user-link">
//                       <img
//                         src={f.photo || picLink}
//                         alt={f.name}
//                         className="follow-user-pic"
//                       />
//                       <span>{f.name}</span>
//                     </a>
//                   </li>
//                 ));
//               })()}
//             </ul>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// import React, { useEffect, useState } from 'react';
// import '../css/Profile.css';
// import { useParams } from "react-router-dom";

// export default function UserProfile() {
//   const { userid } = useParams();
//   const [user, setUser] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [isFollow, setIsFollow] = useState(false);

//   const picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";

//   const loggedInUser = JSON.parse(localStorage.getItem("user"));
//   const loggedInUserId = loggedInUser?._id;

//   // Follow user
//   const followUser = (userId) => {
//     fetch("/follow", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + localStorage.getItem("jwt"),
//       },
//       body: JSON.stringify({ followId: userId }),
//     })
//       .then(res => res.json())
//       .then(data => {
//         console.log("Followed:", data);
//         setIsFollow(true);
//         // Update user followers list locally
//         setUser(prev => ({
//           ...prev,
//           followers: [...prev.followers, loggedInUserId]
//         }));
//       })
//       .catch(err => console.error("Error following user:", err));
//   };

//   // Unfollow user
//   const unfollowUser = (userId) => {
//     fetch("/unfollow", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + localStorage.getItem("jwt"),
//       },
//       body: JSON.stringify({ followId: userId }),
//     })
//       .then(res => res.json())
//       .then(data => {
//         console.log("Unfollowed:", data);
//         setIsFollow(false);
//         // Remove logged-in user from followers list locally
//         setUser(prev => ({
//           ...prev,
//           followers: prev.followers.filter(id => id !== loggedInUserId)
//         }));
//       })
//       .catch(err => console.error("Error unfollowing user:", err));
//   };

//   useEffect(() => {
//     if (!userid) return;

//     fetch(`/user/${userid}`, {
//       headers: {
//         Authorization: "Bearer " + localStorage.getItem("jwt")
//       }
//     })
//       .then(res => {
//         if (!res.ok) throw new Error("Failed to fetch user data");
//         return res.json();
//       })
//       .then(result => {
//         console.log("User Data:", result);
//         setUser(result.user);
//         setPosts(result.posts || []);

//         const isAlreadyFollowing = result.user.followers.includes(loggedInUserId);
//         setIsFollow(isAlreadyFollowing);
//       })
//       .catch(err => console.error("Error fetching user data:", err));
//   }, [userid]);

//   return (
//     <div className="profile">
//       {/* Profile frame */}
//       <div className="profile-frame">

//         {/* Profile pic */}
//         <div className="profile-pic">
//           <img
//             src={user?.photo ? user.photo : picLink}
//             alt="profile"
//           />
//         </div>

//         {/* Profile data */}
//         <div className="profile-data">
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//             <h1>{user ? user.name : "Loading..."}</h1>
//             {user && loggedInUserId !== user._id && (
//               <button
//                 className="followBtn"
//                 onClick={() => {
//                   isFollow ? unfollowUser(user._id) : followUser(user._id);
//                 }}
//               >
//                 {isFollow ? "Unfollow" : "Follow"}
//               </button>
//             )}
//           </div>

//           <div className="profile-info">
//             <p>{posts.length} Post{posts.length !== 1 ? "s" : ""}</p>
//             <p>{user?.followers?.length || 0} {user?.followers?.length === 1 ? "Follower" : "Followers"}</p>
//             <p>{user?.following?.length || 0} Following</p>
//           </div>
//         </div>
//       </div>

//       <hr style={{ width: "90%", opacity: "0.8", margin: "25px auto" }} />

//       {/* Gallery */}
//       <div className="gallary">
//         {posts.map(post => (
//           <img key={post._id} src={post.photo} className="item" alt="post" />
//         ))}
//       </div>
//     </div>
//   );
// }





// import React, { useEffect, useState } from 'react';
// import '../css/Profile.css'
// import { useParams } from "react-router-dom";

// export default function UserProfile() {
//   const { userid } = useParams();
//   const [user, setUser] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [isFollow, setIsFollow] = useState(false);

  
//   const picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";

//   // Follow user
//   const followUser = (userId) => {
//     fetch("/follow", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + localStorage.getItem("jwt"),
//       },
//       body: JSON.stringify({ followId: userId }),
//     })
//       .then(res => res.json())
//       .then(data => {
//         console.log("Followed:", data);
//         setIsFollow(true);
//       })
//       .catch(err => console.error("Error following user:", err));
//   };

//   // Unfollow user
//   const unfollowUser = (userId) => {
//     fetch("/unfollow", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + localStorage.getItem("jwt"),
//       },
//       body: JSON.stringify({ followId: userId }),
//     })
//       .then(res => res.json())
//       .then(data => {
//         console.log("Unfollowed:", data);
//         setIsFollow(false);
//       })
//       .catch(err => console.error("Error unfollowing user:", err));
//   };

//   useEffect(() => {
//     if (!userid) return;

//     fetch(`/user/${userid}`, {
//       headers: {
//         Authorization: "Bearer " + localStorage.getItem("jwt")
//       }
//     })
//       .then(res => {
//         if (!res.ok) throw new Error("Failed to fetch user data");
//         return res.json();
//       })
//       .then(result => {
//         console.log("User Data:", result);
//         setUser(result.user);
//         setPosts(result.posts || []);

//         const loggedInUserId = JSON.parse(localStorage.getItem("user"))._id;
//         setIsFollow(result.user.followers.includes(loggedInUserId));
//       })
//       .catch(err => console.error("Error fetching user data:", err));
//   }, [userid]);


//   return (
//     <div className="profile">
//       {/* Profile frame */}
//       <div className="profile-frame">

//         {/* profile-pic */}
//         <div className="profile-pic">
//           <img
//             src={user?.photo ? user.photo : picLink}
//             alt="profile"
//           />
//         </div>

//         {/* profile data */}
//         <div className="profile-data">
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//             <h1>{user ? user.name : "Loading..."}</h1>
//             {user && (
//               <button
//                 className="followBtn"
//                 onClick={() => {
//                   isFollow ? unfollowUser(user._id) : followUser(user._id);
//                 }}
//               >
//                 {isFollow ? "Unfollow" : "Follow"}
//               </button>
//             )}
//           </div>

//           <div className="profile-info">
//             <p>{posts.length} Post{posts.length !== 1 ? "s" : ""}</p>
//             <p>{user?.followers?.length || 0} {user?.followers?.length === 1 ? "Follower" : "Followers"}</p>
//             <p>{user?.following?.length || 0} Following</p>
//           </div>
//         </div>
//       </div>

//       <hr style={{ width: "90%", opacity: "0.8", margin: "25px auto" }} />

//       {/* gallery */}
//       <div className="gallary">
//         {posts.map(post => (
//           <img key={post._id} src={post.photo} className="item" alt="post" />
//         ))}
//       </div>
//     </div>
//   );
// }
