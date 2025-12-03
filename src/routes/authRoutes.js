import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import 'dotenv/config';

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All Fileds are Required." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password Must be More Than 6 digits." });
    }
    if (username.length < 4) {
      return res
        .status(400)
        .json({ message: "Username Must be More Than 4 characters." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exist." });
    }
    const userImg = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`;
    const user = new User({ email, username, password, userImg });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userImg: user.userImg,
      },
    });
  } catch (error) {
    console.log("Error in Registration", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All Fileds are Required." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User doesn't exist." });
    }
    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userImg: user.userImg,
      },
    });
  } catch (error) {
    console.log("Error in Login", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
