const Joi = require("joi");
const Blog = require("../model/Blog");
const Follow = require("../model/Follow");

const createBlog = async (req, res) => {
  const { title, textBody } = req.body;
  const isValid = Joi.object({
    title: Joi.string().required(),
    textBody: Joi.string().min(30).max(1000).required(),
  }).validate(req.body);

  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: "Invalid input.",
    });
  }

  let blogObj;
  try {
    blogObj = new Blog({
      title,
      textBody,
      creationDateTime: new Date(),
      username: req.locals.username,
      userId: req.locals.userId,
      isDeleted: false,
    });

    await blogObj.save();
    res.status(201).send({
      status: 201,
      message: "Blog created successfully",
    });
  } catch (err) {
    return res.status(401).send({
      status: 401,
      message: "Failed to create a blog",
      data: err,
    });
  }
};

const getUserBlogs = async (req, res) => {
  const userId = req.locals.userId;
  const page = Number(req.query.page) || 1;
  const LIMIT = 10;
  let blogData;
  try {
    blogData = await Blog.find({ userId, isDeleted: false })
      .sort({ creationDateTime: -1 })
      .skip((page - 1) * LIMIT)
      .limit(LIMIT);
  } catch (err) {
    return res.status(401).send({
      status: 401,
      message: "Failed to fetch user blogs",
      data: err,
    });
  }

  res.status(200).send({
    status: 200,
    message: "Fetched user blogs successfully.",
    data: blogData,
  });
};

const deleteBlog = async (req, res) => {
  const userId = req.locals.userId;
  const blogId = req.params.blogId;
  let blogData;
  try {
    blogData = await Blog.findById(blogId);

    if (blogData.userId !== userId) {
      return res.status(401).send({
        status: 401,
        message: "Unauthorized to delete the blog.",
      });
    }
  } catch (err) {
    return res.status(400).send({
      status: 400,
      message: "Failed to fetch blog",
      data: err,
    });
  }

  try {
    const blogObj = {
      isDeleted: true,
      deletionDateTime: Date.now(),
    };
    await Blog.findByIdAndUpdate(blogId, blogObj);

    return res.status(200).send({
      status: 200,
      message: "Blog deleted successfully",
    });
  } catch (err) {
    return res.status(401).send({
      status: 401,
      message: "Failed to delete blog",
      data: err,
    });
  }
};

const editBlog = async (req, res) => {
  const isValid = Joi.object({
    blogId: Joi.string().required(),
    title: Joi.string().required(),
    textBody: Joi.string().min(30).max(1000).required(),
  }).validate(req.body);

  if (isValid.error) {
    return res.status(400).send({
      status: 400,
      message: "Invalid input.",
    });
  }

  const { title, blogId, textBody } = req.body;
  const userId = req.locals.userId;

  try {
    blogData = await Blog.findById(blogId);

    if (blogData.userId !== userId) {
      return res.status(401).send({
        status: 401,
        message: "Unauthorized to edit the blog.",
      });
    }
  } catch (err) {
    return res.status(401).send({
      status: 401,
      message: "Failed to fetch blog",
      data: err,
    });
  }

  const creationDateTime = blogData.creationDateTime;
  const currentTime = Date.now();

  const diff = (currentTime - creationDateTime) / (1000 * 60);
  if (diff > 30) {
    return res.status(400).send({
      status: 400,
      message: "Not allowed to edit blog after 30 minutes of posting.",
    });
  }

  try {
    await Blog.findByIdAndUpdate({ _id: blogId }, { title, textBody });
    return res.status(200).send({
      status: 200,
      message: "Blog updated successfully",
    });
  } catch (err) {
    return res.status(400).send({
      status: 400,
      message: "Failed to edit blog",
    });
  }
};

const getHomePageBlogs = async (req, res) => {
  const currentUserId = req.locals.userId;
  let followingList;
  try {
    followingList = await Follow.find({ currentUserId });
  } catch (err) {
    return res.status(400).send({
      status: 400,
      message: "Failed to fetch all blog",
    });
  }

  let followingUserIdList = followingList.map((followObj) => {
    return followObj.followingUserId;
  });
  
  try {
    const homePageBlogs = await Blog.find(
      {
        userId: { $in: followingUserIdList },
        isDeleted: false,
      }).sort({ creationDateTime: -1 });

    res.status(200).send({
      status: 200,
      message: "Fetched homepage blogs successfully",
      data: homePageBlogs,
    });
  } catch (err) {
    return res.status(400).send({
      status: 400,
      message: "Failed to fetch homepage blogs",
      data: err,
    });
  }
};

module.exports = {
  createBlog,
  getUserBlogs,
  deleteBlog,
  editBlog,
  getHomePageBlogs,
};
