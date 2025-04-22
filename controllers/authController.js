const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};


const registerUser = async (req, res, next) => {
  const { username, email, password, profilePicture } = req.body;

  try {
    if (!username || !email || !password) {
      res.status(400);
      throw new Error('Please provide username, email, and password');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }
    const usernameExists = await User.findOne({ username });
     if (usernameExists) {
      res.status(400);
      throw new Error('Username is already taken');
    }

    const user = await User.create({
      username,
      email,
      password,
      profilePicture,
    });

    if (user) {
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        ...userResponse,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};


const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
         ...userResponse,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};