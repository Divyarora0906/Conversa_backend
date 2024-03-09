const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("User Id params not sent");
    return res.sendStatus(400);
  }

  try {
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
    .populate({
      path: 'users',
      select: '-password', // Exclude password field
    })
    .populate("latestMsg")
    .populate({
      path: "latestMsg",
      populate: {
        path: "sender",
        select: "name img email", // Adjust fields as needed
      }
    });
  
  

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };
      const created = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: created._id })
        .populate({
          path: 'users',
          select: '-password', // Exclude password field
        })
        .populate("latestMsg")
        .populate({
          path: "latestMsg",
          populate: {
            path: "sender",
            select: "name img email",
          }
        });
      
      // Now that you have created the chat with full user details, you can return it
      res.status(200).send(FullChat);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});


const fetchChat = asyncHandler(async (req, res) => {
  try {
    const result = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    }).populate({
      path: 'users',
      select: '-password', // Exclude password field
    }).populate("groupAdmin", "-password");
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching chat");
  }
});
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ msg: "Fill all the Fields" });
  }
  var users = JSON.parse(req.body.users);
  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users aare required to form group");
  }
  users.push(req.user);
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    })     
  
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).json(fullGroupChat);
  } catch (error) {
    throw new Error(error.message);
  }
});
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!updatedChat) {
    return res.status(404);
  } else {
    res.json(updatedChat);
  }
});
const AddinGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
  } else {
    res.json(added);
  }
});
const removeFromGroup = asyncHandler(async(req,res)=>{
  const { chatId, userId } = req.body;
  const remove = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!remove) {
    res.status(404);
  } else {
    res.json(remove);
  }
})

module.exports = {
  accessChat,
  fetchChat,
  createGroupChat,
  renameGroup,
  AddinGroup,
  removeFromGroup
};
