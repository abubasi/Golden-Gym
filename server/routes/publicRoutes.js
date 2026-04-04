const express = require("express");

const Contact = require("../models/Contact");
const Membership = require("../models/Membership");
const Payment = require("../models/Payment");
const Trainer = require("../models/Trainer");
const GymClass = require("../models/GymClass");
const { defaultPlans } = require("../data/defaultData");

const router = express.Router();

const formatReference = () => `GGPAY-${Date.now().toString(36).toUpperCase()}`;

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

router.get("/plans", (req, res) => {
  res.json(defaultPlans);
});

router.get("/trainers", async (req, res, next) => {
  try {
    const trainers = await Trainer.find({ active: true }).sort({ displayOrder: 1, createdAt: 1 }).lean();
    res.json(trainers);
  } catch (error) {
    next(error);
  }
});

router.get("/classes", async (req, res, next) => {
  try {
    const classes = await GymClass.find({ active: true }).sort({ displayOrder: 1, createdAt: 1 }).lean();
    res.json(classes);
  } catch (error) {
    next(error);
  }
});

router.post("/contact", async (req, res, next) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required." });
    }

    const contact = await Contact.create({
      fullName,
      email,
      phone,
      subject,
      message,
      source: "website",
    });

    return res.status(201).json({
      message: "Your message has been sent. Our team will reach out soon.",
      contactId: contact._id,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/memberships", async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      plan,
      billing,
      amount,
      startDate,
      fitnessGoal,
      paymentMethod,
      notes,
    } = req.body;

    if (!fullName || !email || !phone || !plan || !billing) {
      return res.status(400).json({
        message: "Name, email, phone, plan, and billing cycle are required.",
      });
    }

    const selectedPlan = defaultPlans.find(
      (item) => item.name === plan && item.billingVisibility.includes(billing)
    );

    if (!selectedPlan) {
      return res.status(400).json({ message: "Selected plan is not available for that billing cycle." });
    }

    const resolvedAmount = Number(amount || selectedPlan[billing]);

    if (!Number.isFinite(resolvedAmount) || resolvedAmount <= 0) {
      return res.status(400).json({ message: "A valid amount is required." });
    }

    const paymentReference = formatReference();

    const membership = await Membership.create({
      fullName,
      email,
      phone,
      plan,
      billing,
      amount: resolvedAmount,
      startDate,
      fitnessGoal,
      paymentMethod,
      paymentReference,
      notes,
    });

    const payment = await Payment.create({
      membershipId: membership._id,
      memberName: fullName,
      email,
      plan,
      amount: resolvedAmount,
      method: paymentMethod || "cash",
      reference: paymentReference,
      status: "pending",
      provider: "manual-ready",
      notes:
        "Demo payment record created. Connect Razorpay or Stripe keys later for live checkout.",
    });

    return res.status(201).json({
      message: "Membership submitted successfully. Payment request has been recorded.",
      membershipId: membership._id,
      paymentId: payment._id,
      paymentReference,
      paymentStatus: payment.status,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
