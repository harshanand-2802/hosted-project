import React, { useEffect, useState, useRef } from 'react';
import styles from '../css/Profile.module.css';
import PostDetail from '../components/PostDetail';
import ProfilePic from '../components/ProfilePic';

export default function Profile() {
  const picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
  const [pic, setPic] = useState([]);
  const [show, setShow] = useState(false);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState("");
  const [changePic, setChangePic] = useState(false);

  const [showFollowList, setShowFollowList] = useState(false);
  const [followListType, setFollowListType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const modalRef = useRef();
  const localUser = JSON.parse(localStorage.getItem("user"));

  const toggleDetails = (post) => {
    if (show) {
      setShow(false);
    } else {
      setPosts(post);
      setShow(true);
    }
  };

  const changeprofile = () => {
    setChangePic(!changePic);
  };

  const handleFollowClick = (type) => {
    setFollowListType(type);
    setSearchQuery("");
    setShowFollowList(true);
  };

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

  useEffect(() => {
    if (!localUser) return;

    fetch(`/user/${localUser._id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setPic(result.posts || []);
        setUser(result.user || localUser);
      })
      .catch((err) => console.log("Profile fetch error:", err));
  }, [localUser]);

  const removeFollower = (followerId) => {
    fetch("/remove-follower", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ userId: followerId }),
    })
      .then(res => res.json())
      .then(data => {
        setUser(prev => ({
          ...prev,
          followers: prev.followers.filter(f => f._id !== followerId),
        }));
      })
      .catch(err => console.error("Error removing follower:", err));
  };

  const removeFollowing = (followingId) => {
    fetch("/remove-following", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({ userId: followingId }),
    })
      .then(res => res.json())
      .then(data => {
        setUser(prev => ({
          ...prev,
          following: prev.following.filter(f => f._id !== followingId),
        }));
      })
      .catch(err => console.error("Error removing following:", err));
  };

  return (
    <div className={styles.profile}>
      <div className={styles["profile-frame"]}>
        <div className={styles["profile-pic"]}>
          <img
            onClick={changeprofile}
            src={user.photo ? user.photo : picLink}
            alt="profile"
          />
        </div>

        <div className={styles["profile-data"]}>
          <h1>{user?.name || "User"}</h1>
          <div className={styles["profile-info"]}>
            <p>{pic.length} Post{pic.length !== 1 ? "s" : ""}</p>
            <p
              onClick={() => handleFollowClick("followers")}
              style={{ cursor: "pointer" }}
            >
              {user?.followers?.length || 0}{" "}
              {user?.followers?.length === 1 ? "Follower" : "Followers"}
            </p>
            <p
              onClick={() => handleFollowClick("following")}
              style={{ cursor: "pointer" }}
            >
              {user?.following?.length || 0} Following
            </p>
          </div>
        </div>
      </div>

      <hr style={{ width: "90%", opacity: "0.8", margin: "25px auto" }} />

      <div className={styles.gallary}>
        {pic.map((pics) => (
          <img
            key={pics._id}
            src={pics.photo}
            className={styles.item}
            alt=""
            onClick={() => toggleDetails(pics)}
          />
        ))}
      </div>

      {show && <PostDetail item={posts} toggleDetails={toggleDetails} />}
      {changePic && <ProfilePic changeprofile={changeprofile} />}

      {showFollowList && (
        <div className={styles["follow-list-modal"]}>
          <div className={styles["follow-list-content"]} ref={modalRef}>
            <h3>{followListType.charAt(0).toUpperCase() + followListType.slice(1)}</h3>
            <button
              onClick={() => setShowFollowList(false)}
              className={styles["close-btn"]}
            >
              ×
            </button>

            <input
              type="text"
              placeholder={`Search ${followListType}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles["follow-search"]}
            />

            <ul>
              {(() => {
                // const filteredList = (user[followListType] || []).filter((f) =>
                //   f.name.toLowerCase().includes(searchQuery.toLowerCase())
                // );
                const seen = new Set();
                const filteredList = (user[followListType] || [])
                  .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .filter(f => {
                    if (seen.has(f._id)) return false;
                    seen.add(f._id);
                    return true;
                  });
                  
                if (filteredList.length === 0) {
                  return <p className={styles["no-results"]}>No results found.</p>;
                }

                return filteredList.map((f) => (
                  <li key={f._id} className={styles["follow-user"]}>
                    <a href={`/profile/${f._id}`} className={styles["follow-user-link"]}>
                      <img
                        src={f.photo || picLink}
                        alt={f.name}
                        className={styles["follow-user-pic"]}
                      />
                      <span>{f.name}</span>
                    </a>

                    {followListType === "followers" && (
                      <button
                        className={styles["remove-btn"]}
                        onClick={() => removeFollower(f._id)}
                      >
                        Remove
                      </button>
                    )}

                    {followListType === "following" && (
                      <button
                        className={styles["remove-btn"]}
                        onClick={() => removeFollowing(f._id)}
                      >
                        Unfollow
                      </button>
                    )}
                  </li>
                ));
              })()}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}


// import React, { useEffect, useState, useRef } from 'react';
// import '../css/Profile.css';
// import PostDetail from '../components/PostDetail';
// import ProfilePic from '../components/ProfilePic';

// export default function Profile() {
//   const picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
//   const [pic, setPic] = useState([]);
//   const [show, setShow] = useState(false);
//   const [posts, setPosts] = useState([]);
//   const [user, setUser] = useState("");
//   const [changePic, setChangePic] = useState(false);

//   const [showFollowList, setShowFollowList] = useState(false);
//   const [followListType, setFollowListType] = useState(""); // 'followers' or 'following'
//   const [searchQuery, setSearchQuery] = useState(""); // search bar

//   const modalRef = useRef(); // for outside click detection
//   const localUser = JSON.parse(localStorage.getItem("user"));

//   const toggleDetails = (post) => {
//     if (show) {
//       setShow(false);
//     } else {
//       setPosts(post);
//       setShow(true);
//     }
//   };

//   const changeprofile = () => {
//     setChangePic(!changePic);
//   };

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

//     if (showFollowList) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showFollowList]);

//   useEffect(() => {
//     if (!localUser) return;

//     fetch(`/user/${localUser._id}`, {
//       headers: {
//         Authorization: "Bearer " + localStorage.getItem("jwt"),
//       },
//     })
//       .then((res) => res.json())
//       .then((result) => {
//         setPic(result.posts || []);
//         setUser(result.user || localUser);
//       })
//       .catch((err) => console.log("Profile fetch error:", err));
//   }, [localUser]);

//   const removeFollower = (followerId) => {
//     fetch("/remove-follower", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + localStorage.getItem("jwt"),
//       },
//       body: JSON.stringify({ userId: followerId }),
//     })
//       .then(res => res.json())
//       .then(data => {
//         setUser(prev => ({
//           ...prev,
//           followers: prev.followers.filter(f => f._id !== followerId),
//         }));
//       })
//       .catch(err => console.error("Error removing follower:", err));
//   };

//   const removeFollowing = (followingId) => {
//     fetch("/remove-following", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer " + localStorage.getItem("jwt"),
//       },
//       body: JSON.stringify({ userId: followingId }),
//     })
//       .then(res => res.json())
//       .then(data => {
//         setUser(prev => ({
//           ...prev,
//           following: prev.following.filter(f => f._id !== followingId),
//         }));
//       })
//       .catch(err => console.error("Error removing following:", err));
//   };

//   return (
//     <div className='profile'>
//       {/* Profile frame */}
//       <div className="profile-frame">
//         {/* profile-pic */}
//         <div className="profile-pic">
//           <img
//             onClick={changeprofile}
//             src={user.photo ? user.photo : picLink}
//             alt="profile"
//           />
//         </div>

//         {/* profile data */}
//         <div className="profile-data">
//           <h1>{user?.name || "User"}</h1>
//           <div className="profile-info">
//             <p>{pic.length} Post{pic.length !== 1 ? "s" : ""}</p>
//             <p
//               onClick={() => handleFollowClick("followers")}
//               style={{ cursor: "pointer" }}
//             >
//               {user?.followers?.length || 0}{" "}
//               {user?.followers?.length === 1 ? "Follower" : "Followers"}
//             </p>
//             <p
//               onClick={() => handleFollowClick("following")}
//               style={{ cursor: "pointer" }}
//             >
//               {user?.following?.length || 0} Following
//             </p>
//           </div>
//         </div>
//       </div>

//       <hr style={{ width: "90%", opacity: "0.8", margin: "25px auto" }} />

//       {/* gallery */}
//       <div className="gallary">
//         {pic.map((pics) => (
//           <img
//             key={pics._id}
//             src={pics.photo}
//             className='item'
//             alt=""
//             onClick={() => toggleDetails(pics)}
//           />
//         ))}
//       </div>

//       {/* post details modal */}
//       {show && <PostDetail item={posts} toggleDetails={toggleDetails} />}

//       {/* change profile pic modal */}
//       {changePic && <ProfilePic changeprofile={changeprofile} />}

//       {/* followers/following modal */}
//       {showFollowList && (
//         <div className="follow-list-modal">
//           <div className="follow-list-content" ref={modalRef}>
//             <h3>{followListType.charAt(0).toUpperCase() + followListType.slice(1)}</h3>
//             <button onClick={() => setShowFollowList(false)} className="close-btn">×</button>

//             {/* 🔍 Search input */}
//             <input
//               type="text"
//               placeholder={`Search ${followListType}`}
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="follow-search"
//             />

//             {/* 👤 Follower/following list */}
//             <ul>
//               {(() => {
//                 const filteredList = (user[followListType] || []).filter((f) =>
//                   f.name.toLowerCase().includes(searchQuery.toLowerCase())
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

//                     {followListType === "followers" && (
//                       <button
//                         className="remove-btn"
//                         onClick={() => removeFollower(f._id)}
//                       >
//                         Remove
//                       </button>
//                     )}

//                     {followListType === "following" && (
//                       <button
//                         className="remove-btn"
//                         onClick={() => removeFollowing(f._id)}
//                       >
//                         Unfollow
//                       </button>
//                     )}
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
// import PostDetail from '../components/PostDetail';
// import ProfilePic from '../components/ProfilePic';

// export default function Profile() {

//   const picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
//   const [pic, setPic] = useState([]);
//   const [show, setShow] = useState(false);
//   const [posts, setPosts] = useState([]);
//   const [user, setUser] = useState("");
//   const [changePic, setChangePic] = useState(false);

//   const [showFollowList, setShowFollowList] = useState(false);
//   const [followListType, setFollowListType] = useState(""); // 'followers' or 'following'
//   const [searchQuery, setSearchQuery] = useState(""); // for search

//   const localUser = JSON.parse(localStorage.getItem("user"));

//   const toggleDetails = (post) => {
//     if (show) {
//       setShow(false);
//     } else {
//       setPosts(post);
//       setShow(true);
//     }
//   };

//   const changeprofile = () => {
//     setChangePic(!changePic);
//   };

//   const handleFollowClick = (type) => {
//     setFollowListType(type);
//     setSearchQuery(""); // reset search input
//     setShowFollowList(true);
//   };

//   useEffect(() => {
//     if (!localUser) return;

//     fetch(`/user/${localUser._id}`, {
//       headers: {
//         Authorization: "Bearer " + localStorage.getItem("jwt"),
//       },
//     })
//       .then((res) => res.json())
//       .then((result) => {
//         setPic(result.posts || []);
//         setUser(result.user || localUser);
//       })
//       .catch((err) => console.log("Profile fetch error:", err));
//   }, [localUser]);

//   return (
//     <div className='profile'>

//       {/* Profile frame */}
//       <div className="profile-frame">
//         {/* profile-pic */}
//         <div className="profile-pic">
//           <img
//             onClick={changeprofile}
//             src={user.photo ? user.photo : picLink}
//             alt="profile"
//           />
//         </div>

//         {/* profile data */}
//         <div className="profile-data">
//           <h1>{user?.name || "User"}</h1>
//           <div className="profile-info">
//             <p>{pic.length} Post{pic.length !== 1 ? "s" : ""}</p>
//             <p
//               onClick={() => handleFollowClick("followers")}
//               style={{ cursor: "pointer" }}
//             >
//               {user?.followers?.length || 0}{" "}
//               {user?.followers?.length === 1 ? "Follower" : "Followers"}
//             </p>
//             <p
//               onClick={() => handleFollowClick("following")}
//               style={{ cursor: "pointer" }}
//             >
//               {user?.following?.length || 0} Following
//             </p>
//           </div>
//         </div>
//       </div>

//       <hr style={{ width: "90%", opacity: "0.8", margin: "25px auto" }} />

//       {/* gallery */}
//       <div className="gallary">
//         {pic.map((pics) => (
//           <img
//             key={pics._id}
//             src={pics.photo}
//             className='item'
//             alt=""
//             onClick={() => toggleDetails(pics)}
//           />
//         ))}
//       </div>

//       {/* post details modal */}
//       {show && <PostDetail item={posts} toggleDetails={toggleDetails} />}

//       {/* change profile pic modal */}
//       {changePic && <ProfilePic changeprofile={changeprofile} />}

//       {/* followers/following modal */}
//       {showFollowList && (
//         <div className="follow-list-modal">
//           <div className="follow-list-content">
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
//               {(user[followListType] || [])
//                 .filter((f) =>
//                   f.name.toLowerCase().includes(searchQuery.toLowerCase())
//                 )
//                 .map((f) => (
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
//                 ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




























