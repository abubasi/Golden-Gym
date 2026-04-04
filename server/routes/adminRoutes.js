const express = require("express");

const { requireAdmin } = require("../middleware/auth");
const Contact = require("../models/Contact");
const Membership = require("../models/Membership");
const Payment = require("../models/Payment");
const Trainer = require("../models/Trainer");
const GymClass = require("../models/GymClass");

const router = express.Router();

router.use(requireAdmin);

router.get("/dashboard", async (req, res, next) => {
  try {
    const [memberships, contacts, payments, trainers, classes] = await Promise.all([
      Membership.find().sort({ createdAt: -1 }).lean(),
      Contact.find().sort({ createdAt: -1 }).lean(),
      Payment.find().sort({ createdAt: -1 }).lean(),
      Trainer.find().sort({ displayOrder: 1, createdAt: 1 }).lean(),
      GymClass.find().sort({ displayOrder: 1, createdAt: 1 }).lean(),
    ]);

    const summary = {
      membershipCount: memberships.length,
      pendingMemberships: memberships.filter((item) => item.status === "new").length,
      contactCount: contacts.length,
      paymentCount: payments.length,
      paidPayments: payments.filter((item) => item.status === "paid").length,
      trainerCount: trainers.length,
      classCount: classes.length,
      revenueCollected: payments
        .filter((item) => item.status === "paid")
        .reduce((sum, item) => sum + item.amount, 0),
    };

    res.json({
      summary,
      memberships,
      contacts,
      payments,
      trainers,
      classes,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/memberships/:id", async (req, res, next) => {
  try {
    const { status, paymentStatus, notes } = req.body;

    const membership = await Membership.findByIdAndUpdate(
      req.params.id,
      {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
        ...(typeof notes === "string" ? { notes } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!membership) {
      return res.status(404).json({ message: "Membership not found." });
    }

    if (paymentStatus) {
      await Payment.findOneAndUpdate(
        { membershipId: membership._id },
        { status: paymentStatus },
        { new: true }
      );
    }

    return res.json({
      message: "Membership updated successfully.",
      membership,
    });
  } catch (error) {
    return next(error);
  }
});

router.patch("/payments/:id", async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        ...(status ? { status } : {}),
        ...(typeof notes === "string" ? { notes } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    await Membership.findByIdAndUpdate(payment.membershipId, {
      paymentStatus: payment.status,
    });

    return res.json({
      message: "Payment updated successfully.",
      payment,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/trainers", async (req, res, next) => {
  try {
    const trainer = await Trainer.create(req.body);

    return res.status(201).json({
      message: "Trainer created successfully.",
      trainer,
    });
  } catch (error) {
    return next(error);
  }
});

router.put("/trainers/:id", async (req, res, next) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found." });
    }

    return res.json({
      message: "Trainer updated successfully.",
      trainer,
    });
  } catch (error) {
    return next(error);
  }
});

router.delete("/trainers/:id", async (req, res, next) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found." });
    }

    return res.json({ message: "Trainer removed successfully." });
  } catch (error) {
    return next(error);
  }
});

router.post("/classes", async (req, res, next) => {
  try {
    const gymClass = await GymClass.create(req.body);

    return res.status(201).json({
      message: "Class created successfully.",
      gymClass,
    });
  } catch (error) {
    return next(error);
  }
});

router.put("/classes/:id", async (req, res, next) => {
  try {
    const gymClass = await GymClass.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!gymClass) {
      return res.status(404).json({ message: "Class not found." });
    }

    return res.json({
      message: "Class updated successfully.",
      gymClass,
    });
  } catch (error) {
    return next(error);
  }
});

router.delete("/classes/:id", async (req, res, next) => {
  try {
    const gymClass = await GymClass.findByIdAndDelete(req.params.id);

    if (!gymClass) {
      return res.status(404).json({ message: "Class not found." });
    }

    return res.json({ message: "Class removed successfully." });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
