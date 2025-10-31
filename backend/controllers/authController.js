import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // adjust the path to your User model
import EventSetting from "../models/EventSettings.js";


const registerUser = async (req, res) => {
  try {
    const { name, university, branch, semester, section, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await User.create({
      name,
      university,
      branch,
      semester,
      section,
      email,
      password_hash: hashedPassword
    });

    res.status(201).json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ message: "User is not active. Please contact admin." });
    }

    // Get global active round from EventSetting
    const activeRoundSetting = await EventSetting.findOne({ setting_key: "active_round" });
    const globalRound = activeRoundSetting ? parseInt(activeRoundSetting.setting_value) : null;

    if (globalRound === null) {
      return res.status(500).json({ message: "Global round not set. Contact admin." });
    }

    // Check if user's current round matches or exceeds global round
    if (user.current_round !== globalRound) {
      return res.status(403).json({ message: "You are not eligible for this round." });
    }

 
    const jwtSecret = process.env.JWT_SECRET;
    
    const token = jwt.sign(
      { id: user._id, email: user.email },
      jwtSecret,
      { expiresIn: '4h' } // token expires in 4 hours
    );

    // Successful login
    res.status(200).json({ message: "Login successful", token: token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export { registerUser, loginUser };