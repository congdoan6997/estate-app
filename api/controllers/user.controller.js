import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  const tokenUserId = req.userId;
  if (id !== tokenUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const tokenUserId = req.userId;
  if (id !== tokenUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { password, avatar, ...inputs } = req.body;
  try {
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        ...inputs,
        ...(hashedPassword && { password: hashedPassword }),
        ...(avatar && { avatar }),
      },
    });
    const { password: userPass, ...userInfo } = user;
    res.status(200).json(userInfo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const tokenUserId = req.userId;
  if (id !== tokenUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { id } = req.params;
    const user = await prisma.user.delete({
      where: {
        id,
      },
    });
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const savePost = async (req, res) => {
  const { postId } = req.body;
  const userId = req.userId;
  try {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        postId,
        userId,
      },
    });
    console.log(savedPost);
    if (savedPost) {
      await prisma.savedPost.delete({
        where: {
          id: savedPost.id,
        },
      });
      res.status(200).json({ message: "Post unsaved from saved posts" });
    } else {
      await prisma.savedPost.create({
        data: {
          postId,
          userId,
        },
      });
      res.status(200).json({ message: "Post saved to saved posts" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const profilePosts = async (req, res) => {
  const userId = req.userId;
  try {
    const userPosts = await prisma.post.findMany({
      where: {
        userId,
      },
    });
    const saved = await prisma.savedPost.findMany({
      where: {
        userId,
      },
      include: {
        post: true,
      },
    });
    const savedPosts = saved.map((item) => item.post);
    res.status(200).json({ userPosts, savedPosts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
