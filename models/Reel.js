// // const mongoose = require('mongoose');

// // const reelSchema = new mongoose.Schema({
// //   videoUrl: { type: String, required: true },
// //   caption: String,
// //   postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// //   likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
// //   comments: [{
// //     text: String,
// //     postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// //   }],
// // }, { timestamps: true });

// // module.exports = mongoose.model("Reel", reelSchema);


// const mongoose = require('mongoose');
// const { ObjectId } = mongoose.Schema.Types;

// const reelSchema = new mongoose.Schema({
//   videoUrl: {
//     type: String,
//     required: true
//   },
//   caption: String,
//   postedBy: {
//     type: ObjectId,
//     ref: 'User'
//   },
//   likes: [{
//     type: ObjectId,
//     ref: 'User'
//   }],
//   comments: [{
//     text: String,
//     postedBy: {
//       type: ObjectId,
//       ref: 'User'
//     }
//   }]
// }, { timestamps: true });

// module.exports = mongoose.model('Reel', reelSchema);

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const reelSchema = new mongoose.Schema({
  videoUrl: {
    type: String,
    required: true
  },
  caption: String,
  postedBy: {
    type: ObjectId,
    ref: 'USER'
  },
  likes: [{
    type: ObjectId,
    ref: 'USER'
  }],
  comments: [{
    text: String,
    postedBy: {
      type: ObjectId,
      ref: 'USER'
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Reel', reelSchema);
