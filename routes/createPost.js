const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const POST = mongoose.model("POST");
const USER = mongoose.model("USER"); // Make sure USER model is loaded

// ==================== GET all posts ====================
router.get("/allposts", requireLogin, (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;
  // console.log("Limit received:", req.query.limit, "Parsed:", limit);
  POST.find()
    .populate("postedBy", "_id name photo")
    .populate("comments.postedBy", "_id name photo")
    .skip(skip)
    .limit(limit)
    .sort("-createdAt")
    .then(posts => res.json(posts))
    .catch(err => {
      console.error("Error fetching posts:", err);
      res.status(500).json({ error: "Failed to fetch posts" });
    });
});

// ==================== CREATE a new post ====================
router.post("/createpost", requireLogin, (req, res) => {
  const { body, pic } = req.body;

  if (!body || !pic) {
    return res.status(422).json({ error: "Please add all the fields" });
  }

  const post = new POST({
    body,
    photo: pic,
    postedBy: req.user
  });

  post.save()
    .then(result => res.json({ post: result }))
    .catch(err => {
      console.error("Error creating post:", err);
      res.status(500).json({ error: "Failed to create post" });
    });
});

// ==================== GET my posts ====================
router.get("/myposts", requireLogin, (req, res) => {
  POST.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .sort("-createdAt")
    .then(myPosts => res.json(myPosts))
    .catch(err => {
      console.error("Error fetching my posts:", err);
      res.status(500).json({ error: "Failed to fetch your posts" });
    });
});

// ==================== LIKE a post ====================
router.put("/like", requireLogin, (req, res) => {
  POST.findByIdAndUpdate(
    req.body.postId,
    { $push: { likes: req.user._id } },
    { new: true }
  )
    .populate("postedBy", "_id name photo")
    .then(result => res.json(result))
    .catch(err => {
      console.error("Error liking post:", err);
      res.status(422).json({ error: err.message });
    });
});

// ==================== UNLIKE a post ====================
router.put("/unlike", requireLogin, (req, res) => {
  POST.findByIdAndUpdate(
    req.body.postId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .populate("postedBy", "_id name photo")
    .then(result => res.json(result))
    .catch(err => {
      console.error("Error unliking post:", err);
      res.status(422).json({ error: err.message });
    });
});

// ==================== COMMENT on a post ====================
router.put("/comment", requireLogin, (req, res) => {
  const comment = {
    comment: req.body.text,
    postedBy: req.user._id
  };

  POST.findByIdAndUpdate(
    req.body.postId,
    { $push: { comments: comment } },
    { new: true }
  )
    .populate("comments.postedBy", "_id name photo")
    .populate("postedBy", "_id name photo")
    .then(result => res.json(result))
    .catch(err => {
      console.error("Error commenting on post:", err);
      res.status(422).json({ error: err.message });
    });
});
// ==================== DELETE a comment ====================
router.put("/deletecomment", requireLogin, (req, res) => {
  const { postId, commentId } = req.body;

  POST.findByIdAndUpdate(
    postId,
    { $pull: { comments: { _id: commentId } } },
    { new: true }
  )
    .populate("comments.postedBy", "_id name photo")
    .populate("postedBy", "_id name photo")
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.error("Error deleting comment:", err);
      res.status(422).json({ error: err.message });
    });
});

// ==================== GET a single post ====================
router.get("/post/:postId", requireLogin, (req, res) => {
  POST.findById(req.params.postId)
    .populate("postedBy", "_id name photo")
    .populate("comments.postedBy", "_id name photo")
    .then(post => {
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    })
    .catch(err => {
      console.error("Error fetching post:", err);
      res.status(500).json({ error: "Failed to fetch post" });
    });
});

// Api to delete post

router.delete("/deletePost/:postId", requireLogin, (req, res) => {
  POST.findOne({ _id: req.params.postId })
    .populate("postedBy", "_id")
    .then((post) => {
      if (!post) {
        return res.status(422).json({ error: "Post not found" });
      }

      if (post.postedBy._id.toString() === req.user._id.toString()) {
        return post.deleteOne().then(() => {
          return res.json({ message: "Successfully deleted" });
        });
      } else {
        return res.status(403).json({ error: "Unauthorized" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Server error" });
    });
});



// To show posts from users I am following
router.get("/myfollowingpost", requireLogin, (req, res) => {
    POST.find({ postedBy: { $in: req.user.following } })
        .populate("postedBy", "_id name photo")
        .populate("comments.postedBy", "_id name photo")
        .then(posts => {
            res.json(posts);
        })
        .catch(err => {
            console.error("Error fetching following posts:", err);
            res.status(500).json({ error: "Failed to fetch following posts" });
        });
});

// Route to update profile picture
router.put("/uploadProfilePic", requireLogin, async (req, res) => {
  try {
    const user = await USER.findByIdAndUpdate(
      req.user._id,
      { photo: req.body.pic },
      { new: true }
    );
    res.json({ message: "Profile picture updated", user });
  } catch (err) {
    console.error("Error updating profile picture:", err);
    res.status(500).json({ error: "Failed to update profile picture" });
  }
});
module.exports = router;