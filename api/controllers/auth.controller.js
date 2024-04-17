import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
export const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    //hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // create the user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    // return res.json(newUser);
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // res.setHeader("Set-Cookie", `test value; HttpOnly; Path=/; Max-Age=1000`);
    const age = 7 * 24 * 60 * 60 * 1000;
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: age,
    });

    const { password: passwordUser, ...userInfo } = user;
    res
      .cookie("token", token, {
        httpOnly: true,
        // path: "/",
        maxAge: age,
        //  secure: true
      })
      .status(200)
      .json(userInfo);

    // return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
export const logout = (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logout successful" });
};
