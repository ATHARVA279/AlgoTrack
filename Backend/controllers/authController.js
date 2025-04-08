const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signupUser = async (req, res) => {
  console.log('📩 Received signup request:', req.body);

  const { username, email, password } = req.body;

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️ User already exists with email:', email);
      return res.status(400).json({ msg: 'User already exists' });
    }

    const newUser = new User({ username, email, password });
    console.log('📦 New user object created:', newUser);

    await newUser.save();
    console.log('✅ New user saved to DB');

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    console.log('🔐 JWT token created:', token);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None', // Make sure frontend uses https on deployment
    });

    res.status(201).json({ user: { id: newUser._id, email }, token });
    console.log('🚀 Signup successful, response sent');
  } catch (err) {
    console.error('❌ Error during signup:', err);
    res.status(500).json({ msg: 'Server error during signup' });
  }
};



const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({ user: { id: user._id, email }, token });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { signupUser, loginUser };
