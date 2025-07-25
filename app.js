// 1. Import required packages
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const { mongoUrl } = require('./keys.js');
const path = require("path");

// 2. Initialize express app
const app = express();
const PORT = process.env.PORT || 10000;

// 3. Create HTTP server from express app
const server = http.createServer(app);

// 4. Initialize socket.io server with CORS config
const io = new Server(server, {
  cors: {
    origin: "https://hosted-project-1.onrender.com",
    methods: ["GET", "POST", "DELETE"],
    credentials: true
  }
});

// 5. Middleware
app.use(cors({
  origin: "https://hosted-project-1.onrender.com",
  methods: ["GET", "POST", "DELETE"],
  credentials: true
}));
app.use(express.json());

// 6. MongoDB connection
mongoose.connect(mongoUrl);
mongoose.connection.on('connected', () => {
  console.log('✅ Successfully connected to MongoDB');
});
mongoose.connection.on('error', () => {
  console.log('❌ Failed to connect to MongoDB');
});

// 7. Models
require('./models/model.js');
require('./models/post.js');
require('./models/Message.js');
const Message = require('./models/Message.js');
const reelsRoutes = require('./routes/reels.js');

// 8. Routes
app.use('/reels', reelsRoutes);
app.use(require('./routes/auth.js'));
app.use(require('./routes/createPost.js'));
app.use(require('./routes/user.js'));
app.use(require('./routes/messages.js'));

// 9. Socket.io logic
io.on('connection', (socket) => {
  console.log('⚡ New client connected:', socket.id);

  socket.on('join', (username) => {
    socket.join(username);
    console.log(`✅ User joined room: ${username}`);
  });

  socket.on('send_message', async (data) => {
    const { sender, receiver, text, photo } = data;

    // ⚠️ Ensure Cloudinary photo URLs are secure (https)
    // If needed: photo = photo.replace("http://", "https://");

    const message = new Message({ sender, receiver, text, photo });
    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name username photo')
      .populate('receiver', 'name username photo');

    io.to(receiver).emit('receive_message', populatedMessage);
    io.to(sender).emit('receive_message', populatedMessage);
  });

  socket.on('delete_message', async ({ msgId, sender, receiver }) => {
    try {
      await Message.findByIdAndDelete(msgId);
      io.to(receiver).emit('message_deleted', { msgId });
      io.to(sender).emit('message_deleted', { msgId });
      console.log(`🗑️ Message ${msgId} deleted and notified both users`);
    } catch (err) {
      console.error("❌ Error deleting message:", err);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// 10. Serve frontend build for production
app.use(express.static(path.join(__dirname, "frontend/build")));
console.log("✅ Serving static from:", path.join(__dirname, "frontend/build"));

app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "frontend/build/index.html");
  console.log("Serving index.html from:", indexPath);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      res.status(500).send(err);
    }
  });
});

// 11. Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running with Socket.io on PORT ${PORT}`);
});



// // 1. Import required packages
// const express = require('express');
// const http = require('http'); // Needed to create server for socket.io
// const { Server } = require('socket.io');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const { mongoUrl } = require('./keys.js');

// const path = require("path")



// // 2. Initialize express app
// const app = express();
// const PORT = process.env.PORT || 10000;

// // 3. Create HTTP server from express app
// const server = http.createServer(app);

// // 4. Initialize socket.io server with CORS config
// const io = new Server(server, {
//     cors: {
//         origin: ["https://hosted-project-1.onrender.com"],
//         methods: ["GET", "POST", "DELETE"]
//     }
// });

// // 5. Middleware
// app.use(cors());
// app.use(express.json());

// // 6. MongoDB connection
// mongoose.connect(mongoUrl);
// mongoose.connection.on('connected', () => {
//     console.log('✅ Successfully connected to MongoDB');
// });
// mongoose.connection.on('error', () => {
//     console.log('❌ Failed to connect to MongoDB');
// });

// // 7. Models
// require('./models/model.js');
// require('./models/post.js');
// require('./models/Message.js');
// const Message = require('./models/Message.js');
// const reelsRoutes = require('./routes/reels.js');

// // 8. Routes
// app.use('/reels', reelsRoutes);
// app.use(require('./routes/auth.js'));
// app.use(require('./routes/createPost.js'));
// app.use(require('./routes/user.js'));
// app.use(require('./routes/messages.js'));


// io.on('connection', (socket) => {
//   console.log('⚡ New client connected:', socket.id);

//   // Listen for join room
//   socket.on('join', (username) => {
//     socket.join(username);
//     console.log(`✅ User joined room: ${username}`);
//   });

//   // socket.on('send_message', async (data) => {
//   //   const { sender, receiver, text } = data;

//   //   const message = new Message({ sender, receiver, text });
//   //   await message.save();

//   //   io.to(receiver).emit('receive_message', data);
//   //   io.to(sender).emit('receive_message', data);
//   // });

//   socket.on('send_message', async (data) => {
//     const { sender, receiver, text, photo } = data;

//     // Save new message
//     const message = new Message({ sender, receiver, text, photo });
//     await message.save();

//     // Populate sender and receiver before emitting
//     const populatedMessage = await Message.findById(message._id)
//       .populate('sender', 'name username photo')
//       .populate('receiver', 'name username photo');

//     // Emit populated message
//     io.to(receiver).emit('receive_message', populatedMessage);
//     io.to(sender).emit('receive_message', populatedMessage);
//   });

//   socket.on('delete_message', async ({ msgId, sender, receiver }) => {
//     try {
//       await Message.findByIdAndDelete(msgId);
//       io.to(receiver).emit('message_deleted', { msgId });
//       io.to(sender).emit('message_deleted', { msgId });
//       console.log(`🗑️ Message ${msgId} deleted and notified both users`);
//     } catch (err) {
//       console.error("❌ Error deleting message:", err);
//     }
//   });


//   socket.on('disconnect', () => {
//     console.log('❌ Client disconnected:', socket.id);
//   });
// });

// // serving the frontend
// // 🔥 Dynamically resolve build path for local and Render deployments
// app.use(express.static(path.join(__dirname, "frontend/build")));

// console.log("✅ Serving static from:", path.join(__dirname, "frontend/build"));

// app.get("*", (req, res) => {
//   const indexPath = path.join(__dirname, "frontend/build/index.html");
//   console.log("Serving index.html from:", indexPath);
//   res.sendFile(indexPath, (err) => {
//     if (err) {
//       console.error("Error serving index.html:", err);
//       res.status(500).send(err);
//     }
//   });
// });



// // 10. Start server (listen with http server for socket.io support)
// server.listen(PORT, () => {
//     console.log(`🚀 Server is running with Socket.io on http://localhost:${PORT}`);
// });
