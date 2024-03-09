const express = require("express");
const app = express();
const chats = require("./data/data");
const dotenv = require("dotenv");
const cors = require("cors")
const connectDB = require("./config/db")
const userRoutes = require("./routes/userRoutes")
const chatRoutes = require("./routes/chatRoutes")
const messageRoutes = require("./routes/messageRoutes")
const path = require("path");

dotenv.config();
const corsOptions = {
  origin: 'https://conversaweb-chat.netlify.app' 
};
connectDB();
app.use(cors(corsOptions));
app.use(express.json());
app.get("/", (req, res) => {
  res.send("API is Started");
});
app.get("/api/chats", (req, res) => {
  res.send(chats);
});

app.use('/api/user',userRoutes)
app.use('/api/chat',chatRoutes)
app.use('/api/message',messageRoutes)




const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, (req, res) => console.log(`Server Started at PORT ${PORT}`));

const io = require('socket.io')(server,{
  pingTimeout:60000,
  cors:{
    origin:"https://conversaweb-chat.netlify.app",
  },
});

io.on("connection",(socket)=>{
  console.log("connected to socket.io")
  socket.on('setup',(userdata)=>{
      socket.join(userdata.data?._id);
      socket.emit('connected')
      
  })
  socket.on("joinchat",(room)=>{
    socket.join(room);
    console.log(('User Join Room'+room));
  });
  socket.on("typing",(room)=>socket.in(room).emit("typing"));
  socket.on("stoptyping",(room)=>socket.in(room).emit("stoptyping"));


  socket.on("newMessg",(newMessgRecieved)=>{
      var chat= newMessgRecieved.chat;
      if(!chat.users) return console.log('chat.users not defined');
   console.log(newMessgRecieved.sender._id)
      chat.users.forEach(user=>{
        if(user._id === newMessgRecieved.sender._id) return;

        socket.in(user._id).emit("messagerecieved",newMessgRecieved)
      })
  })

})

