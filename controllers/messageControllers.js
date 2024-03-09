const asyncHandler =require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const chat = require("../models/chatModel")
const sendMessage = asyncHandler(async(req,res)=>{
   const {content , chatId} = req.body;

   if(!content || !chat){
    console.log("Invalid data passed into the Request");
    return res.status(400);
   }
   var newmessage = {
    sender:req.user._id,
    content:content,
    chat:chatId,
   };
   try {
    var message = await Message.create(newmessage);
    message = await message.populate("sender", "name img");
    message = await message.populate("chat");
    message = await User.populate(message,{
        path:'chat.users',
        select:"name img email",
    });
    await chat.findByIdAndUpdate(req.body.chatId,{
        latestMsg:message,
    })
   
    res.json(message)

   } catch (error) {
    res.status(400);
    throw new Error(error.message)
   }
})

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate({
        path: "sender",
        select: "name img email"
      })
      .populate({
        path: "chat",
        populate: {
          path: "users",
          select: "name img email"
        }
      });

    res.json(messages);

  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});


module.exports = {sendMessage,allMessages};