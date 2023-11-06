const joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const Follow = require("../model/Follow");
const BCRYPT_SALT = Number(process.env.BCRYPT_SALT);
// POST - Register User
const registerUser = async (req, res) => {
  // Data validataion
  const isValid = joi
    .object({
      name: joi.string().required(),
      username: joi.string().min(3).max(25).alphanum(),
      password: joi.string().min(8).required(),
      email: joi.string().email().required(),
    })
    .validate(req.body);

  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: "Invalid input",
      data: isValid.error,
    });
  }
  const { name, email, username, password } = req.body;
  try {
    const userExists = await User.find({ $or: [{ username }, { email }] });
    if (userExists.length != 0) {
      return res.status(400).send({
        status: 400,
        message: "Username / Email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT);
    const userObj = new User({
      name: name,
      username: username,
      email: email,
      password: hashedPassword,
    });

    try {
      await userObj.save();
      return res.status(201).send({
        status: 201,
        message: "User registered successfully",
      });
    } catch (err) {
      return res.status(400).send({
        status: 400,
        message: "Failed to save user data in DB.",
        data: err,
      });
    }
  } catch (err) {
    return res.status(400).send({
      status: 400,
      message: "Error in validation.",
      data: err,
    });
  }
};

// POST - Login User
const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const isValid = joi
    .object({
      username: joi.string().required(),
      password: joi.string().required(),
    })
    .validate(req.body);

  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: "Invalid Username / Password",
      data: isValid.error,
    });
  }
  let userData;
  try {
    userData = await User.findOne({ username });
    if (!userData) {
      return res.status(400).send({
        status: 400,
        message: "No user found! please register first to login.",
      });
    }
  } catch (err) {
    return res.status(400).send({
      status: 400,
      message: "Error while fetching user data.",
      data: err,
    });
  }

  const isPasswordSame = await bcrypt.compare(password, userData.password);

  if (!isPasswordSame) {
    return res.status(400).send({
      status: 400,
      message: "Incorrect password!",
    });
  }

  const payload = {
    username: userData.username,
    name: userData.name,
    email: userData.email,
    userId: userData._id,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return res.status(200).send({
    status: 200,
    message: "Successfully logged in",
    data: { token: token },
  });
};

const getAllUsers = async (req, res) => {
  const userId = req.locals.userId;
  let usersData;
  try {
    usersData = await User.find({ _id: { $ne: userId } });
  } catch (err) {
    return res.status(400).send({
      status: 400,
      message: "Failed to fetch all users",
      data: err,
    });
  }

  let followingList;
  try {
    followingList = await Follow.find({ currentUserId: userId });
  } catch (err) {
    return res.status(400).send({
      status: 400,
      message: "Failed to fetch all users list",
    });
  }

  let followingMap = new Map();
  followingList.forEach((user) => followingMap.set(user.followingUserId, true));

  const usersList = usersData.map((user) => {
    return {
      name: user.name,
      username: user.username,
      email: user.email,
      _id: user._id,
      follow: followingMap.get(user._id.toString()) ? true : false,
    };
  });

  return res.status(200).send({
    status: 200,
    message: "Successfully fetched all users",
    data: usersList,
  });
};

module.exports = { registerUser, loginUser, getAllUsers };
