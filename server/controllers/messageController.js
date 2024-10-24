const asyncHandler = require("express-async-handler");
const Message = require('../models/messageModel');
const mongoose = require('mongoose');

const getMessageByConversationId = asyncHandler(async (req, res) => {
    const Messages = await Message.find({ conversationId:req.params.id });
    res.status(200).json(Messages);
});

const createMessage = asyncHandler(async (req, res) => {
    const { title,isGroup } = req.body;
    if (!title) {
        res.status(400);
        throw new Error("All fields are mandatory !");
    }
    let addUser
    if(!isGroup){
        const user = await User.findById(req.user.id);
        if (!user) {
          res.status(404);
          throw new Error('User Not Found');
        }
      if(user.username===title){
        res.status(404);
        throw new Error('Please add username except yours');
      }
      addUser = await User.findOne({username:title});
     if(!addUser){
        res.status(400);
         throw new Error('Message User not found');
     }
     const isAlreadyAdded = await Message.findOne({userIds:addUser._id});
     if(isAlreadyAdded){
        res.status(400);
        throw new Error('Message already added');
     }
    }
    try {
        const MessageResponse = await Message.create({
            title,
            admin: req.user.id,
            userIds: isGroup?[req.user.id]:[req.user.id,addUser._id],
            isGroup:isGroup
        });
        res.status(201).json(MessageResponse);
    }
    catch (error) {
        res.status(400);
        throw error;
    }
}
);

const getMessage = asyncHandler(async (req, res) => {
    const MessageResponse = await Message.find();
    if (!MessageResponse) {
        res.status(404);
        throw new Error("Message not found");
    }
    res.status(200).json(MessageResponse);
});

const updateMessage = asyncHandler(async (req, res) => {
    const MessageResponse = await Message.findById(req.params.id);
    if (!MessageResponse) {
        res.status(404);
        throw new Error("Message not found");
    }

    if (MessageResponse.author.toString() !== req.user.id) {
        res.status(403);
        throw new Error("User don't have permission to update other user Messages");
    }

    const updatedMessage = await Message.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.status(200).json(updatedMessage);
});

const deleteMessage = asyncHandler(async (req, res) => {
    const MessageResponse = await Message.findById(req.params.id);
    if (!MessageResponse) {
        res.status(404);
        throw new Error("Message not found");
    }
    if (MessageResponse.author.toString() !== req.user.id) {
        res.status(403);
        throw new Error("User don't have permission to update other user Messages");
    }
    await Message.deleteOne({ _id: req.params.id });
    res.status(200).json(MessageResponse);
});

const exitFromMessage = asyncHandler(async (req, res) => {
    const MessageResponse = await Message.findById(req.params.id);
    if (!MessageResponse) {
        res.status(404);
        throw new Error("Message not found");
    }
    let MessagesRes;
    if (MessageResponse.author.toString() === req.user.id) {
        MessagesRes = await Message.deleteOne({ _id: req.params.id });
    }
    else {
        console.log(MessageResponse)
        MessagesRes = await Message.findOneAndUpdate({ _id: req.params.id }, { $pull: { userIds: req.user.id } }, { new: true });
    }
    res.status(200).json(MessagesRes);
});

const addUserToMessage = asyncHandler(async (req, res) => {
    const { username } = req.body;
    if (!username) {
        res.status(400);
        throw new Error("Username are mandatory !");
    }
    const MessageResponse = await Message.findById(req.params.id);
    if (!MessageResponse) {
        res.status(404);
        throw new Error("Message not found");
    }
    const email = username;
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
        let MessagesRes;
        if (MessageResponse.author.toString() !== req.user.id) {
            res.status(403);
            throw new Error("User don't have permission to update other user Messages");
        }
        else {
            MessagesRes = await Message.findOneAndUpdate({ _id: req.params.id }, { $push: { userIds: user._id } }, { new: true });
        }
        res.status(200).json(MessagesRes);
    }
    else {
        res.status(404);
        throw new Error("User Does'nt exist");
    }
});


module.exports = {
    getMessageByConversationId,
    createMessage,
    getMessage,
    updateMessage,
    deleteMessage,
    exitFromMessage,
    addUserToMessage
};
