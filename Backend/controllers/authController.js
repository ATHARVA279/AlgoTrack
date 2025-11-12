const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signupUser = async (req, res) => {
  const { username, email, password, leetcodeUsername } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    if (leetcodeUsername) {
      const existingLeetCodeUser = await User.findOne({ leetcodeUsername });
      if (existingLeetCodeUser) {
        return res.status(400).json({ msg: "LeetCode username already linked to another account" });
      }
    }

    const newUser = new User({ 
      username, 
      email, 
      password,
      leetcodeUsername: leetcodeUsername || undefined
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ 
      user: { 
        id: newUser._id, 
        username: newUser.username,
        email: newUser.email,
        leetcodeUsername: newUser.leetcodeUsername
      },
      token: token 
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error during signup" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ 
      success: true, 
      user: { 
        id: user._id, 
        username: user.username,
        email: user.email,
        leetcodeUsername: user.leetcodeUsername
      },
      token: token 
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};



function calculateStreak(solvedQuestions) {
  const dates = solvedQuestions
    .map((q) => new Date(q.solvedAt).toDateString())
    .sort((a, b) => new Date(b) - new Date(a));

  const uniqueDates = [...new Set(dates)];
  let streak = 0;
  let currentDate = new Date();

  for (const dateStr of uniqueDates) {
    const date = new Date(dateStr);
    if (date.toDateString() === currentDate.toDateString()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (
      date.toDateString() ===
      new Date(currentDate.setDate(currentDate.getDate() - 1)).toDateString()
    ) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

const getMe = async (req, res) => {
  try {
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ msg: "No token. Unauthorized." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const streak = calculateStreak(user.solvedQuestions);

    const userObject = {
      ...user.toObject(),
      streak,
    };
    
    res.json({
      success: true,
      user: userObject,
    });
  } catch (err) {
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};

const updateLeetCodeUsername = async (req, res) => {
  try {
    const { leetcodeUsername } = req.body;
    
    let token = req.cookies.token;
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ msg: "No token. Unauthorized." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (leetcodeUsername) {
      const existingUser = await User.findOne({ 
        leetcodeUsername, 
        _id: { $ne: decoded.id } 
      });
      if (existingUser) {
        return res.status(400).json({ msg: "LeetCode username already linked to another account" });
      }
    }

    const user = await User.findByIdAndUpdate(
      decoded.id, 
      { leetcodeUsername: leetcodeUsername || undefined },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      success: true,
      message: "LeetCode username updated successfully",
      user: user.toObject()
    });

  } catch (err) {
    res.status(500).json({ msg: "Server error during update" });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error during logout" });
  }
};

module.exports = {
  signupUser,
  loginUser,
  getMe,
  updateLeetCodeUsername,
  logoutUser,
};
