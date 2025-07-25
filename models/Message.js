// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const messageSchema = new Schema({
//   sender: { type: String, required: true },   // Username or userId
//   receiver: { type: String, required: true }, // Username or userId of recipient
//   text: { type: String, required: true },
// }, { timestamps: true });



// module.exports = mongoose.model('Message', messageSchema);

// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const messageSchema = new Schema({
//   sender: { type: Schema.Types.ObjectId, ref: 'USER', required: true }, // store userId
//   receiver: { type: Schema.Types.ObjectId, ref: 'USER', required: true }, // store userId
//   text: { type: String, required: true },
// }, { timestamps: true });

// module.exports = mongoose.model('Message', messageSchema);

const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'USER', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'USER', required: true },
  text: { type: String, default: "" }, // Make text optional
  image: { type: String }, // Base64 image string or image URL
  photo: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }

}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
