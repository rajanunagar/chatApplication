const asyncHandler = require("express-async-handler");
const Conversation = require('../models/conversationModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const conversationModel = require("../models/conversationModel");
const Message = require('../models/messageModel');
const { message } = require("../joiSchema/userjoiSchema");

const getUsernameFromUserid = async  (list)=>{
  const result =   await User.find(
        { _id: { $in: list.map((rec)=>rec.userIds) } },
        {  username: 1 }
      );
  const ans = result.map((rec)=>{
     const t = list.find((item)=>item.userIds===rec._doc._id.toString());
     if(t)
     t.username= rec._doc.username;
     return t;
  })
return ans;
    }   

const getConversationOfUser = asyncHandler(async (req, res) => {
    /******************************************************************* */

       console.log(req.user.id)
        const Conversations = await Conversation.aggregate([
          {
            $match: {
                'users.userIds': mongoose.Types.ObjectId(req.user.id)
              }
          },
          {
            $lookup: {
              from: 'messages', 
              localField: '_id',
              foreignField: 'conversationId',
              as: 'messages'
            }
          },
         { $unwind: { path: '$messages', preserveNullAndEmptyArrays: true } },
         { $sort: { 'messages.createdAt': -1 } },
          {
            $group: {
              _id: '$_id',
              conversationData: { $first: '$$ROOT' },
              lastMessageCreatedAt: { $first: '$messages.createdAt' }
            }
          },
          {
            $project: {
              conversationData: 1,
              lastMessageCreatedAt: 1,
            messages:1
            }
          }
        ]);
    
        // console.log( Conversations);
        // const Conversations = await Conversation.find({ 'users.userIds': req.user.id });
        for (let i = 0; i < Conversations.length; i++) {
            if (!Conversations[i].conversationData.isGroup && Conversations[i].conversationData.admin.toString() !== req.user.id) {
                const admin = await User.findById(Conversations[i].conversationData.admin, { _id: 0, username: 1 });
                Conversations[i].conversationData.title = admin.username;
            }
        }
        const conversationList=[];
        for(let i=0;i<Conversations.length;i++){
            const obj = JSON.parse(JSON.stringify(Conversations[i].conversationData));
            delete obj.messages;
            const item = obj.users.find((item)=>item.userIds.toString()===req.user.id);
            let date = null;
            if(item){
                date = item.readAt;
            }
            const query = { conversationId:obj._id };
            if (date) {
                query.createdAt = { $gt: new Date(date) }; 
            }
            const messages = await Message.find(query).exec();
            obj.count = messages.length;
            obj.users = await getUsernameFromUserid(obj.users);
            obj.lastMessageCreatedAt=Conversations[i].lastMessageCreatedAt;
            conversationList.push(obj);
        }




    /***********************************************************/ 
    
   /* const Conversations = await Conversation.find({ 'users.userIds': req.user.id });
    for (let i = 0; i < Conversations.length; i++) {
        if (!Conversations[i].isGroup && Conversations[i].admin.toString() !== req.user.id) {
            const admin = await User.findById(Conversations[i].admin, { _id: 0, username: 1 });
            Conversations[i].title = admin.username;
        }
    }
    const conversationList=[];
    for(let i=0;i<Conversations.length;i++){
        const obj = JSON.parse(JSON.stringify(Conversations[i]._doc));
        const item = obj.users.find((item)=>item.userIds.toString()===req.user.id);
        let date = null;
        if(item){
            date = item.readAt;
        }
        const query = { conversationId:obj._id };
        if (date) {
            query.createdAt = { $gt: new Date(date) }; 
        }
        const messages = await Message.find(query).exec();
        obj.count = messages.length;
        obj.users = await getUsernameFromUserid(obj.users);
        conversationList.push(obj);
    }
        */
    res.status(200).json(conversationList);
});

const getGroupMember = asyncHandler(async (req, res) => {
    const conversation = await Conversation.findById(req.params.id).populate('users.userIds', 'username');
    if (!conversation) {
        throw new Error('Conversation not found');
    }
    console.log(conversation);
    const memberlist = conversation.users.map(user => {
        const obj = { username: user.userIds.username, id: user.userIds._id };
        return obj;
    });
    res.status(200).json(memberlist);
});
const createConversation = asyncHandler(async (req, res) => {
    const { title, isGroup } = req.body;
    if (!title) {
        res.status(400);
        throw new Error("All fields are mandatory !");
    }
    let addUser;
    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404);
        throw new Error('User Not Found');
    }
    if (!isGroup) {
        if (user.username === title) {
            res.status(404);
            throw new Error('Please add username except yours');
        }
        addUser = await User.findOne({ username: title });
        if (!addUser) {
            res.status(400);
            throw new Error('Conversation User not found');
        }
        const isAlreadyAdded = await Conversation.findOne({ admin: req.user.id, "users.userIds": addUser._id,isGroup:{$ne:true} });
        if (isAlreadyAdded) {
            res.status(400);
            throw new Error('Conversation already added');
        }
    }
    try {
        const ConversationResponse = await Conversation.create({
            title,
            admin: req.user.id,
            users: isGroup ? [{userIds:req.user.id}] : [{userIds:req.user.id}, {userIds:addUser._id}],
            isGroup: isGroup
        });
        res.status(201).json(ConversationResponse);
    }
    catch (error) {
        res.status(400);
        throw error;
    }
}
);

const exitFromConversation = asyncHandler(async (req, res) => {
    const ConversationResponse = await Conversation.findById(req.params.id);
    if (!ConversationResponse) {
        res.status(404);
        throw new Error("Conversation not found");
    }
    let ConversationsRes;
    if (ConversationResponse.author.toString() === req.user.id) {
        ConversationsRes = await Conversation.deleteOne({ _id: req.params.id });
    }
    else {
        console.log(ConversationResponse)
        ConversationsRes = await Conversation.findOneAndUpdate({ _id: req.params.id }, { $pull: { userIds: req.user.id } }, { new: true });
    }
    res.status(200).json(ConversationsRes);
});

const addUserToConversation = asyncHandler(async (req, res) => {
    const { username } = req.body;
    if (!username) {
        res.status(400);
        throw new Error("Username are mandatory !");
    }
    const ConversationResponse = await Conversation.findById(req.params.id);
    if (!ConversationResponse) {
        res.status(404);
        throw new Error("Conversation not found");
    }
    const user = await User.findOne({ username });
    if (user) {
        let ConversationsRes;
        if (ConversationResponse.admin.toString() !== req.user.id) {
            res.status(403);
            throw new Error("User don't have permission to update other user Conversations");
        }
        else {
            const conversation = await Conversation.findOne({ _id: req.params.id, 'users.userIds': user._id });
            if (conversation) {
                res.status(403);
                throw new Error("User already added");
            }
            ConversationsRes = await Conversation.findOneAndUpdate({ _id: req.params.id }, { $push: { users: {userIds:user._id} } }, { new: true });
        }
        res.status(200).json(ConversationsRes);
    }
    else {
        res.status(404);
        throw new Error("User Does'nt exist");
    }
});

const deleteMemberFromGroup = asyncHandler(async (req, res) => {
    const ConversationResponse = await Conversation.findById(req.params.id);
    if (!ConversationResponse) {
        res.status(404);
        throw new Error("Conversation not found");
    }
    let ConversationsRes;
    console.log(ConversationResponse);
    if (ConversationResponse.admin.toString() === req.user.id) {
        if (req.params.userid === req.user.id) {
            ConversationsRes = await Conversation.deleteOne({ _id: req.params.id });
        }
        else {
            ConversationsRes = await Conversation.findOneAndUpdate({ _id: req.params.id }, { $pull: { users:{userIds: req.params.userid} } }, { new: true });

        }
        res.status(200).json(ConversationsRes);

    } else {
        res.status(403);
        throw new Error("User don't have permission to update other user Conversations");
    }
});

const updateReadTimeUser = asyncHandler(async (req, res) => {
    const date = new Date();
    console.log(date);
    const ConversationResponse = await Conversation.findById(req.params.id);
    if (!ConversationResponse) {
        res.status(404);
        throw new Error("Conversation not found");
    }
    const result = await Conversation.updateOne(
        { 
            _id: req.params.id,
            'users.userIds': req.user.id
        },
        { 
            $set: { 
                'users.$.readAt': date 
            }
        },
            { new: true }
    );

    res.status(200).json(result);
});

module.exports = {
    getConversationOfUser,
    createConversation,
    exitFromConversation,
    addUserToConversation,
    getGroupMember,
    deleteMemberFromGroup,
    updateReadTimeUser
};
