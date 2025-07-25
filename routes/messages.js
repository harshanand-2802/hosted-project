const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Message = require('../models/Message.js');

// Get chat messages and mark as read
router.get('/messages/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name username photo')
      .populate('receiver', 'name username photo');

    // Mark messages sent TO user1 from user2 as read
    await Message.updateMany(
      { sender: user2, receiver: user1, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (err) {
    console.error("Failed to fetch messages:", err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Delete a message
router.delete('/message/:id', async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);
    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (err) {
    console.error("Failed to delete message:", err);
    res.status(500).json({ error: 'Server error while deleting message' });
  }
});

// Get unread message counts per user
router.get('/unread-messages/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const unreadCounts = await Message.aggregate([
      { $match: { receiver: new mongoose.Types.ObjectId(userId), read: false } },
      { $group: { _id: "$sender", count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users', // Ensure your user collection is 'users'
          localField: '_id',
          foreignField: '_id',
          as: 'sender'
        }
      },
      { $unwind: "$sender" },
      {
        $project: {
          _id: 0,
          userId: "$sender._id",
          username: "$sender.username",
          name: "$sender.name",
          photo: "$sender.photo",
          count: 1
        }
      }
    ]);

    res.json(unreadCounts);
  } catch (err) {
    console.error("Error fetching unread messages:", err);
    res.status(500).json({ error: 'Failed to fetch unread message counts' });
  }
});

module.exports = router;



// const express = require('express');
// const router = express.Router();
// const Message = require('../models/Message.js');

// // router.get('/messages/:user1/:user2', async (req, res) => {
// //   const { user1, user2 } = req.params;

// //   try {
// //     const messages = await Message.find({
// //       $or: [
// //         { sender: user1, receiver: user2 },
// //         { sender: user2, receiver: user1 },
// //       ]
// //     }).sort({ createdAt: 1 });

// //     res.json(messages);
// //   } catch (err) {
// //     res.status(500).json({ error: 'Failed to fetch messages' });
// //   }
// // });

// // router.get('/messages/:user1/:user2', async (req, res) => {
// //   const { user1, user2 } = req.params;

// //   try {
// //     const messages = await Message.find({
// //       $or: [
// //         { sender: user1, receiver: user2 },
// //         { sender: user2, receiver: user1 },
// //       ]
// //     })
// //     .sort({ createdAt: 1 })
// //     .populate('sender', 'name username photo')
// //     .populate('receiver', 'name username photo');

// //     res.json(messages);
// //   } catch (err) {
// //     res.status(500).json({ error: 'Failed to fetch messages' });
// //   }
// // });

// router.get('/messages/:user1/:user2', async (req, res) => {
//   const { user1, user2 } = req.params;

//   try {
//     const messages = await Message.find({
//       $or: [
//         { sender: user1, receiver: user2 },
//         { sender: user2, receiver: user1 },
//       ]
//     })
//     .sort({ createdAt: 1 })
//     .populate('sender', 'name username photo')
//     .populate('receiver', 'name username photo');

//     // Mark all messages sent TO user1 as read
//     await Message.updateMany(
//       { sender: user2, receiver: user1, read: false },
//       { $set: { read: true } }
//     );

//     res.json(messages);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch messages' });
//   }
// });

// router.delete('/message/:id', async (req, res) => {
//   try {
//     const deletedMessage = await Message.findByIdAndDelete(req.params.id);
//     if (!deletedMessage) {
//       return res.status(404).json({ error: 'Message not found' });
//     }
//     res.status(200).json({ success: true, message: 'Message deleted' });
//   } catch (err) {
//     console.error("Failed to delete message:", err);
//     res.status(500).json({ error: 'Server error while deleting message' });
//   }
// });


// router.get('/unread-messages/:userId', async (req, res) => {
//   const { userId } = req.params;

//   try {
//     // Aggregate unread messages grouped by sender
//     const unreadCounts = await Message.aggregate([
//       { $match: { receiver: new mongoose.Types.ObjectId(userId), read: false } },
//       { $group: { _id: "$sender", count: { $sum: 1 } } },
//       { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'sender' } },
//       { $unwind: "$sender" },
//       { $project: { _id: 0, userId: "$sender._id", username: "$sender.username", name: "$sender.name", photo: "$sender.photo", count: 1 } }
//     ]);

//     res.json(unreadCounts);
//   } catch (err) {
//     console.error("Error fetching unread messages:", err);
//     res.status(500).json({ error: 'Failed to fetch unread message counts' });
//   }
// });




// module.exports = router;



