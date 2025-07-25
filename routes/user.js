const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const POST = mongoose.model("POST");
const USER = mongoose.model("USER");
const requireLogin = require("../middlewares/requireLogin");




// To get user profile
router.get("/user/:id", (req, res) => {
  USER.findById(req.params.id)
    .select("-password")
    .populate("followers", "_id name photo")
    .populate("following", "_id name photo")
    .then(user => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      POST.find({ postedBy: req.params.id })
        .populate("postedBy", "_id")
        .then(posts => {
          return res.status(200).json({ user, posts });
        })
        .catch(err => {
          console.error("Error fetching posts:", err);
          return res.status(422).json({ error: "Error fetching posts" });
        });
    })
    .catch(err => {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Server error" });
    });
});




// to follow user
router.put("/follow", requireLogin, (req, res) => {
  USER.findByIdAndUpdate(
    req.body.followId,
    { $push: { followers: req.user._id } },
    { new: true }
  )
    .then(result => {
      return USER.findByIdAndUpdate(
        req.user._id,
        { $push: { following: req.body.followId } },
        { new: true }
      );
    })
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(422).json({ error: err });
    });
});

// to unfollow user
router.put("/unfollow", requireLogin, (req, res) => {
  USER.findByIdAndUpdate(
    req.body.followId,
    { $pull: { followers: req.user._id } },
    { new: true }
  )
    .then(result => {
      return USER.findByIdAndUpdate(
        req.user._id,
        { $pull: { following: req.body.followId } },
        { new: true }
      );
    })
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(422).json({ error: err });
    });
});

// Only remove follower from my account (not mutual)
router.put("/remove-follower", requireLogin, async (req, res) => {
  try {
    const updatedUser = await USER.findByIdAndUpdate(
      req.user._id,
      { $pull: { followers: req.body.userId } },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(422).json({ error: "Failed to remove follower" });
  }
});

// Only remove someone I'm following (not mutual)
router.put("/remove-following", requireLogin, async (req, res) => {
  try {
    const updatedUser = await USER.findByIdAndUpdate(
      req.user._id,
      { $pull: { following: req.body.userId } },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(422).json({ error: "Failed to remove following" });
  }
});


// to upload profile pic
router.put("/uploadProfilePic", requireLogin, (req, res) => {
  USER.findByIdAndUpdate(
    req.user._id,
    { $set: { photo: req.body.pic } }, // fixed here
    { new: true }
  )
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(422).json({ error: err });
    });
});

// ✅ Route to get all users (for chat list)
router.get("/allusers", (req, res) => {
  USER.find({}, "username name photo")
    .then(users => {
      res.json(users);
    })
    .catch(err => {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Failed to fetch users" });
    });
});

// router.get("/followed-users", requireLogin, async (req, res) => {
//   try {
//     const loggedInUser = await USER.findById(req.user._id).populate("following followers", "username");
    
//     // Combine both lists and remove duplicates if any
//     const combined = [...loggedInUser.following, ...loggedInUser.followers];
//     const uniqueUsers = Array.from(new Set(combined.map(u => u._id.toString()))).map(id =>
//       combined.find(u => u._id.toString() === id)
//     );

//     res.json(uniqueUsers);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Failed to fetch followed users" });
//   }
// });


router.get('/followed-users', requireLogin, async (req, res) => {
  try {
    const loggedInUser = await USER.findById(req.user._id)
      .populate('following', 'username name photo _id') // populate following users
      .populate('followers', 'username name photo _id') // populate followers

    // Combine followers and following into one unique list
    const combined = [...loggedInUser.following, ...loggedInUser.followers];

    // Remove duplicates by _id
    const uniqueUsers = Array.from(new Map(combined.map(u => [u._id.toString(), u])).values());

    res.json(uniqueUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch followed and follower users' });
  }
});




module.exports = router;