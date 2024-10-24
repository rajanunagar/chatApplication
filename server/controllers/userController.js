const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const dotenv = require("dotenv").config();
const userValidationError = require("../joiSchema/userjoiSchema");
const mongoose = require("mongoose");
const Conversation = require('../models/conversationModel');

const registerUser = asyncHandler(async (req, res) => {
  const {  password, username } = req.body;

  const ans = await userValidationError.validateAsync(req.body);
  const userAvailable = await User.findOne({ username });
  if (userAvailable) {
    res.status(400);
    throw new Error("This username is already ocupied");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({
      password: hashedPassword,
      username
    });
    if (user) {
      res.status(201).json(user);
    } else {
      res.status(400);
      throw new Error("User data is not valid");
    }
  }
  catch (error) {
    res.status(400);
      
  }
});


const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }
  const user = await User.findOne({ username });
  if (user && (await bcrypt.compare(password, user.password))) {
    const claims = {
      id: user._id,
      username: user.username
    }
    const accessToken = jwt.sign(
      {
        user: claims,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "120m" }
    );
    res.status(200).json({...claims, accessToken });
  } else {
    res.status(401);
    throw new Error("Invalid credentials");
  }
});

const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

const deleteUser = asyncHandler(async (req, res) => {

  const id = req.user.id;
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error('User Not Found');
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await User.findByIdAndRemove(id).session(session);
    await Conversation.updateMany({"users.userIds": id }, { $pull:{users: { userIds: id } }}).session(session);
    await Conversation.deleteMany({ admin: id }).session(session);
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(400);
    throw new Error(error);
  }
});

const logout = asyncHandler(async (req, res) => {
  
  const user = await User.findOne({username:req.user.username });
  if(!user){
    res.status(400);
    throw new Error("User Not Found");
  }
    if(!user.isLogedIn){
    res.status(400);
    throw new Error("User already loged out from device");
    }
    await User.findByIdAndUpdate(user._id, { isLogedIn:false });
    res.status(200).json({message:'success' });
});

module.exports = { registerUser, loginUser, currentUser, deleteUser,logout };
