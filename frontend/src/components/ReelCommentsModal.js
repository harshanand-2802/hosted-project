import React, { useState } from 'react';
import styles from '../css/ReelCommentsModal.module.css';

export default function ReelCommentsModal({ reel, onClose, onAddComment, onDeleteComment }) {
  const [comment, setComment] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user')); // Get current user

  const handleAddComment = () => {
    if (!comment.trim()) return;
    onAddComment(reel._id, comment);
    setComment('');
  };

  const isReelOwner = reel.postedBy?._id === currentUser._id; // Check if current user is reel owner

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Comments</h3>

        {/* List of comments */}
        <div className={styles.commentsList}>
          {reel.comments?.length ? (
            reel.comments.map((c, idx) => {
              const isCommentOwner = c.postedBy?._id === currentUser._id;
              return (
                <div key={idx} className={styles.commentItem}>
                  <img
                    src={c.postedBy?.photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt={c.postedBy?.name}
                    className={styles.commentUserPhoto}
                  />
                  <span className={styles.commentText}>
                    <strong>{c.postedBy?.name}:</strong> {c.text}
                  </span>

                  {/* Show delete button if user is comment owner OR reel owner */}
                  {(isCommentOwner || isReelOwner) && (
                    <button
                      className={styles.deleteCommentButton}
                      onClick={() => onDeleteComment(reel._id, c._id)}
                    >
                      ❌
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <p className={styles.noComments}>No comments yet.</p>
          )}
        </div>

        {/* Add comment */}
        <div className={styles.addComment}>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className={styles.commentInput}
          />
          <button onClick={handleAddComment} className={styles.commentButton}>
            Post
          </button>
        </div>
      </div>
    </div>
  );
}


// import React, { useState } from 'react';
// import styles from '../css/ReelCommentsModal.module.css';

// export default function ReelCommentsModal({ reel, onClose, onAddComment }) {
//   const [comment, setComment] = useState('');

//   const handleAddComment = () => {
//     if (!comment.trim()) return;
//     onAddComment(reel._id, comment);
//     setComment('');
//   };

//   return (
//     <div className={styles.modalBackdrop} onClick={onClose}>
//       <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
//         <h3 className={styles.modalTitle}>Comments</h3>

//         {/* List of comments */}
//         <div className={styles.commentsList}>
//           {reel.comments?.length ? (
//             reel.comments.map((c, idx) => (
//               <div key={idx} className={styles.commentItem}>
//                 <img
//                   src={c.postedBy?.photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
//                   alt={c.postedBy?.name}
//                   className={styles.commentUserPhoto}
//                 />
//                 <span className={styles.commentText}>
//                   <strong>{c.postedBy?.name}:</strong> {c.text}
//                 </span>
//               </div>
//             ))
//           ) : (
//             <p className={styles.noComments}>No comments yet.</p>
//           )}
//         </div>

//         {/* Add comment */}
//         <div className={styles.addComment}>
//           <input
//             type="text"
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//             placeholder="Add a comment..."
//             className={styles.commentInput}
//           />
//           <button onClick={handleAddComment} className={styles.commentButton}>
//             Post
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
