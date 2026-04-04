const express = require("express");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const adminUser = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");

    if (!adminUser) {
      return res.status(401).json({ message: "Invalid admin credentials." });
    }

    const isValidPassword = await adminUser.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid admin credentials." });
    }

    adminUser.lastLoginAt = new Date();
    await adminUser.save();

    const token = jwt.sign(
      {
        sub: adminUser._id.toString(),
        role: adminUser.role,
        email: adminUser.email,
      },
      process.env.JWT_SECRET || "golden-gym-dev-secret",
      { expiresIn: "12h" }
    );

    return res.json({
      token,
      admin: {
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
