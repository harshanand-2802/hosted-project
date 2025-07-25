const express = require('express');
const router = express.Router();
const Reel = require('../models/Reel');
const requireLogin = require('../middlewares/requireLogin'); // if you have authentication middleware

// POST /reels - upload a new reel
router.post('/', requireLogin, async (req, res) => {
  const { videoUrl, caption } = req.body;
  if (!videoUrl) return res.status(422).json({ error: "Video URL required" });

  try {
    const reel = new Reel({
      videoUrl,
      caption,
      postedBy: req.user._id,
    });
    await reel.save();
    res.json(reel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// // GET /reels - fetch all reels
// router.get('/', async (req, res) => {
//   try {
//     const reels = await Reel.find()
//       .populate("postedBy", "_id name photo")
//       .populate("comments.postedBy", "_id name photo")
//       .sort('-createdAt');
//     res.json(reels);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// router.get('/', async (req, res) => {
//   try {
//     const reels = await Reel.find()
//       .populate("postedBy", "_id name photo")
//       .populate("comments.postedBy", "_id name photo") // FIX
//       .sort('-createdAt');
//     console.log("✅ Reels fetched successfully:", reels);
//     res.json(reels);
//   } catch (err) {
//     console.error("❌ Error fetching reels:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// GET /reels - fetch all reels
router.get('/', async (req, res) => {
  try {
    const reels = await Reel.find()
      .populate("postedBy", "_id name photo")
      .populate("comments.postedBy", "_id name photo")
      .sort('-createdAt');
    res.json(reels);
  } catch (err) {
    console.error("❌ Error fetching reels:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /reels/:id/like - like a reel
// router.post('/:id/like', requireLogin, async (req, res) => {
//   try {
//     const reel = await Reel.findByIdAndUpdate(
//       req.params.id,
//       { $addToSet: { likes: req.user._id } },
//       { new: true }
//     )
//     .populate("postedBy", "_id name photo")
//     .populate("comments.postedBy", "_id name photo");
//     res.json(reel);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// POST /reels/:id/like - like a reel
router.post('/:id/like', requireLogin, async (req, res) => {
  try {
    const reel = await Reel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    )
    .populate("postedBy", "_id name photo")
    .populate("comments.postedBy", "_id name photo");
    res.json(reel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /reels/:id/unlike - unlike a reel
router.post('/:id/unlike', requireLogin, async (req, res) => {
  try {
    const reel = await Reel.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: req.user._id } },
      { new: true }
    )
    .populate("postedBy", "_id name photo")
    .populate("comments.postedBy", "_id name photo");
    res.json(reel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// POST /reels/:id/comment - comment on a reel
// router.post('/:id/comment', requireLogin, async (req, res) => {
//   const { text } = req.body;
//   if (!text) return res.status(422).json({ error: "Comment text required" });

//   try {
//     const reel = await Reel.findByIdAndUpdate(
//       req.params.id,
//       { $push: { comments: { text, postedBy: req.user._id } } },
//       { new: true }
//     ).populate("comments.postedBy", "_id name photo")
//     .populate("comments.postedBy", "_id name photo");
//     res.json(reel);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// POST /reels/:id/comment - comment on a reel
router.post('/:id/comment', requireLogin, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(422).json({ error: "Comment text required" });

  try {
    const reel = await Reel.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { text, postedBy: req.user._id } } },
      { new: true }
    )
    .populate("postedBy", "_id name photo")
    .populate("comments.postedBy", "_id name photo");
    res.json(reel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Example Express route
router.delete('/:id', async (req, res) => {
  const reelId = req.params.id;

  // Debug print
  console.log("Deleting reel id:", reelId);

  const reel = await Reel.findById(reelId);
  if (!reel) return res.status(404).json({ message: "Reel not found" });

  // Optional authorization check
  const userId = req.body.userId;
  if (reel.postedBy.toString() !== userId) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await Reel.findByIdAndDelete(reelId);
  res.status(200).json({ message: "Reel deleted successfully" });
});


// DELETE /reels/:reelId/comment/:commentId - delete a comment
router.delete('/:reelId/comment/:commentId', requireLogin, async (req, res) => {
  try {
    const { reelId, commentId } = req.params;
    const reel = await Reel.findById(reelId);
    if (!reel) return res.status(404).json({ error: "Reel not found" });

    const comment = reel.comments.find(c => c._id.toString() === commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // Allow either the comment author OR the reel owner to delete the comment
    if (
      comment.postedBy.toString() !== req.user._id.toString() &&
      reel.postedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "Not authorized to delete this comment" });
    }

    await Reel.findByIdAndUpdate(reelId, {
      $pull: { comments: { _id: commentId } }
    });

    const updatedReel = await Reel.findById(reelId)
      .populate("postedBy", "_id name photo")
      .populate("comments.postedBy", "_id name photo");

    res.json(updatedReel);
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: "Server error" });
  }
});





module.exports = router;
