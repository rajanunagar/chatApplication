const express = require("express");
const connectDb = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();
const cors = require('cors');
const validateToken = require("./middleware/validateTokenHandler");
const Message = require('./models/messageModel');
const app = express();
const http = require('http').Server(app);
const port = process.env.PORT || 5000;
const multer = require('multer');
const path = require('path');
const asyncHandler = require('express-async-handler');
const jwt = require("jsonwebtoken");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/Images')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  }
})
const upload = multer({
  storage: storage
});
app.use(cors());
app.use(express.json());

const authSocketMiddleware = (socket, next) => {
  const token = socket.handshake.query?.token;
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.user = decoded;
    // return next(new Error("NOT AUTHORIZED"));
  } catch (err) {
    return next(new Error("NOT AUTHORIZED"));
  }
  next();
};

const socketIO = require('socket.io')(http, {
  cors: {
    origin: "*"
  }
});
connectDb();



app.use(express.static('public'));

// socketIO.use((socket, next) => {
//   authSocketMiddleware(socket, next);
// });

socketIO.on('connection', (socket) => {

  console.log(`⚡: ${socket.id} user just connected!`)

  socket.on("message", data => {
    socketIO.emit("messageResponse", data)
  })

  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    // console.log(`User joined conversation: ${conversationId}`);
  });

  socket.on('sendMessage', async (messageData) => {
    const { conversationId, sender, type, text, fileName } = messageData;
    const newMessage = new Message({
      conversationId,
      sender,
      type,
      text: type === 'text' ? text : undefined,
      fileName: type === 'file' ? fileName : undefined,
    });
    const savedMessage = await newMessage.save();
    socketIO.to(conversationId).emit('receiveMessage', { savedMessage, conversationId });
    socketIO.to(conversationId).emit('notification', { conversationId });
  });

  socket.on('deleteUserFromGroup', async (messageData) => {
    const { conversationid, userid } = messageData;
    socketIO.to(userid).emit('receiveDeleteUserFromGroup', { userid });
  });

  socket.on('joinUser', (userId) => {
    socket.join(userId);
  });

  socket.on('addUserToGroup', async (userId) => {
    console.log('hii',userId);
    socketIO.to(userId).emit('receiveAddUserToGroup', { userId });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected',socket?.user?.user?.username);
    socket.disconnect()
  });

});


app.use("/api/conversation", require("./routes/conversationRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/message", require("./routes/messageRotes"));
app.use("/api/validatetoken", validateToken, (req, res) => {
  res.status(200).json({ message: 'verified', success: true });
})
app.use('/api/file', upload.single('file'), asyncHandler(async (req, res) => {
  if (req.file) {
    res.send({ filePath: `${req.file.filename}` });
  }
  else {
    res.status(400);
    throw new Error('file not uploaded');
  }
}));
app.use(errorHandler);

http.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

