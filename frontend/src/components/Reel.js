import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from '../css/Reel.module.css';
import { Link } from 'react-router-dom';
import ReelCommentsModal from '../components/ReelCommentsModal';

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [selectedReel, setSelectedReel] = useState(null);
  const currentUserId = useSelector(state => state.user?._id);
  const token = localStorage.getItem('jwt');

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await fetch('/reels', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setReels(data);
        } else {
          console.error("Expected array but got:", data);
          setReels([]);
        }
      } catch (err) {
        console.error("Failed to fetch reels:", err);
        setReels([]);
      }
    };
    fetchReels();
  }, [token]);

  // Delete reel
  const handleDelete = async (reelId) => {
    try {
      const res = await fetch(`/reels/${reelId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: currentUserId })
      });

      if (res.ok) {
        setReels(prev => prev.filter(r => r._id !== reelId));
      } else {
        const errorText = await res.text();
        console.error("Delete failed:", errorText);
      }
    } catch (err) {
      console.error("Error deleting reel:", err);
    }
  };

  // Like / Unlike
  const handleLikeToggle = async (reel) => {
    if (!token) return alert("Please login first");

    const isLiked = reel.likes?.includes(currentUserId);
    try {
      const res = await fetch(`/reels/${reel._id}/${isLiked ? 'unlike' : 'like'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const updatedReel = await res.json();
      setReels(prev => prev.map(r => r._id === updatedReel._id ? updatedReel : r));
      if (selectedReel?._id === updatedReel._id) setSelectedReel(updatedReel);
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // Add comment
  const handleAddComment = async (reelId, text) => {
    try {
      const res = await fetch(`/reels/${reelId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      const updatedReel = await res.json();
      setReels(prev => prev.map(r => r._id === updatedReel._id ? updatedReel : r));
      setSelectedReel(updatedReel);
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  // Delete comment
const handleDeleteComment = async (reelId, commentId) => {
  const token = localStorage.getItem('jwt');
  if (!token) return alert("Please login first");

  try {
    const res = await fetch(`/reels/${reelId}/comment/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Delete comment failed:", errorText);
      return;
    }

    const updatedReel = await res.json();
    setReels(prev => prev.map(r => r._id === updatedReel._id ? updatedReel : r));
    setSelectedReel(updatedReel);
  } catch (err) {
    console.error("Error deleting comment:", err);
  }
};


  return (
    <div className={styles.reelsContainer}>
      {reels.map(reel => (
        <div key={reel._id} className={styles.reelItem}>
          <video
            src={reel.videoUrl}
            controls
            autoPlay
            loop
            muted
            className={styles.video}
          />
          <div className={styles.captionContainer}>
            <div className={styles.captionSection}>
              <p className={styles.caption}>{reel.caption}</p>
              <div className={styles.userBlock}>
                <Link to={`/profile/${reel.postedBy._id}`} className={styles.userLink}>
                  <div className={styles.userInfo}>
                    <img
                      src={reel.postedBy.photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                      alt={reel.postedBy.name}
                      className={styles.userPhoto}
                    />
                    <span className={styles.userName}>{reel.postedBy.name}</span>
                  </div>
                </Link>
                {reel.postedBy._id === currentUserId && (
                  <button
                    onClick={() => handleDelete(reel._id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Like & Comment Bar */}
              <div className={styles.actionBar}>
                <button 
                  className={styles.iconButton} 
                  onClick={() => handleLikeToggle(reel)}
                >
                  {reel.likes?.includes(currentUserId) ? "💔" : "❤️"} {reel.likes?.length || 0}
                </button>
                <button 
                  className={styles.iconButton} 
                  onClick={() => setSelectedReel(reel)}
                >
                  💬 {reel.comments?.length || 0}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {selectedReel && (
        <ReelCommentsModal
          reel={selectedReel}
          onClose={() => setSelectedReel(null)}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
        />
      )}
    </div>
  );
};

export default Reels;




// import React, { useEffect, useState } from 'react';
// import styles from '../css/Reel.module.css';

// const Reels = () => {
//   const [reels, setReels] = useState([]);

// useEffect(() => {
//   const fetchReels = async () => {
//     try {
//       const res = await fetch('/reels');
//       const data = await res.json();
//       console.log("Fetched reels:", data);
//       if (Array.isArray(data)) {
//         setReels(data);
//       } else {
//         console.error("Expected array but got:", data);
//         setReels([]);
//       }
//     } catch (err) {
//       console.error("Failed to fetch reels:", err);
//       setReels([]);
//     }
//   };
//   fetchReels();
// }, []);


//   return (
//     <div className={styles.reelsContainer}>
//       {reels.map(reel => (
//         <div key={reel._id} className={styles.reelItem}>
//           <video
//             src={reel.videoUrl}
//             controls
//             autoPlay
//             loop
//             muted
//             className={styles.video}
//           />
//           <div className={styles.captionContainer}>
//             <p className={styles.caption}>{reel.caption}</p>
//             <p className={styles.user}>Posted by:{reel.postedBy.name}</p>
//           </div>
//         </div>
//       ))}
//       {/* <div style={{ height: '100vh' }} />  */}
//     </div>
//   );
// };


// export default Reels;
