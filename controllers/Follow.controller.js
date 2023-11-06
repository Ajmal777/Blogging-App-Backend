const Joi = require("joi");
const User = require("../model/User");
const Follow = require("../model/Follow");

const followUser = async (req, res) => {
  const currentUserId = req.locals.userId;
  const { followingUserId } = req.body;

  const isValid = Joi.object({
    followingUserId: Joi.string().required(),
  }).validate(req.body);

  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: "Invalid user id.",
    });
  }

  let followingUserData;
  try {
    followingUserData = await User.findById(followingUserId);
  } catch (err) {
    return res.status(401).send({
      status: 401,
      message: "Failed to fetch user data",
      data: err,
    });
  }

  try {
    const followObj = await Follow.findOne({ currentUserId, followingUserId });
    if (followObj) {
      return res.status(401).send({
        status: 401,
        message: "User already follows",
      });
    }
  } catch (err) {
    return res.status(401).send({
      status: 401,
      message: "Failed to fetch user data",
      data: err,
    });
  }

  const followObj = new Follow({
    currentUserId,
    followingUserId,
    creationDateTime: Date.now(),
  });

  try {
    await followObj.save();
    res.status(201).send({
      status: 201,
      message: "Followed successfully",
    });
  } catch (err) {
    return res.status(401).send({
      status: 401,
      message: "Failed to follow user",
      data: err,
    });
  }
};

const unfollowUser = async (req, res) => {
  const currentUserId = req.locals.userId;
  const { followingUserId } = req.body;

  const isValid = Joi.object({
    followingUserId: Joi.string().required(),
  }).validate(req.body);

  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: "Invalid user id.",
    });
  }

  let followingUserData;
  try {
    followingUserData = await User.findById(followingUserId);
  } catch (err) {
    return res.status(401).send({
      status: 401,
      message: "Failed to fetch user data",
      data: err,
    });
  }

  try {
    const followObj = await Follow.findOne({ currentUserId, followingUserId });
    if (!followObj) {
      return res.status(401).send({
        status: 401,
        message: "You don't follow this user",
      });
    }
  } catch (err) {
    return res.status(401).send({
      status: 401,
      message: "Failed to fetch user data",
      data: err,
    });
  }

  try {
    await Follow.findOneAndDelete({ currentUserId, followingUserId });
    res.status(201).send({
      status: 201,
      message: "Unfollowed successfully",
    });
  } catch (err) {
    return res.status(401).send({
      status: 401,
      message: "Failed to unfollow user",
      data: err,
    });
  }
};

module.exports = { followUser, unfollowUser };
