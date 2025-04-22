const User = require("../models/User");
const Post = require("../models/Post");

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } },
      });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password")
      .populate({
        path: "posts",
        select: "-user",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "likes comments",
        },
      });

    if (!user) {
      res.status(404);
      throw new Error(`User not found with username: ${req.params.username}`);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  getUserProfile,
};
