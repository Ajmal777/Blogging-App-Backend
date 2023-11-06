const express = require('express');
const { createBlog, getUserBlogs, deleteBlog, editBlog, getHomePageBlogs } = require('../controllers/Blog.controller');
const { isAuth } = require('../middlewares/authMiddleware');
const app = express();

app.post('/create-blog', isAuth, createBlog);
app.get('/get-user-blogs', isAuth, getUserBlogs);
app.delete('/delete-blog/:blogId', isAuth, deleteBlog);
app.put('/edit-blog', isAuth, editBlog);
app.get('/get-homepage-blogs', isAuth, getHomePageBlogs);
module.exports = app;