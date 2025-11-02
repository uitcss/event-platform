import bcrypt from "bcrypt";
import User from "../models/User.js"; // adjust the path to your User model
import EventSetting from "../models/EventSettings.js";


const addUser = async (req, res) => {
  try {
    const { name,  email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }



    // Create user
    const newUser = await User.create({
      name,
      email
    });

    res.status(201).json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const removeUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.deleteOne({ email });

    res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export { addUser, removeUser };