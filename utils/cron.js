const cron = require("node-cron");
const Blog = require("../model/Blog");

const cleanUpBin = () => {
  cron.schedule("0 0 1 * * *", async () => {
    const deletedBlogs = await Blog.find({ isDeleted: true });
    if (deletedBlogs > 0) {
      deletedBlogs.forEach(async (blog) => {
        const diff =
          (blog.deletetionDateTime - blog.creationDateTime) /
          (1000 * 60 * 60 * 24);

        if (diff >= 30) {
          try {
            await Blog.findByIdAndDelete(blog._id);
          } catch (err) {
            console.log(err);
          }
        }
      });
    }
  },{
    scheduled: true,
    timezone: "Asia/Kolkata",
  });
};

module.exports = {cleanUpBin};

