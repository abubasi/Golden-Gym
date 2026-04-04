const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Trainer = require("../models/Trainer");
const GymClass = require("../models/GymClass");
const { defaultTrainers, defaultClasses } = require("./defaultData");

const bootstrapAdmin = async () => {
  const adminName = process.env.ADMIN_NAME || "Golden Gym Admin";
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@goldengym.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
  const existingAdmin = await User.findOne({ email: adminEmail }).select("+passwordHash");

  if (existingAdmin) {
    const updates = {};

    if (existingAdmin.name !== adminName) {
      updates.name = adminName;
    }

    const hasMatchingPassword = await bcrypt.compare(adminPassword, existingAdmin.passwordHash);

    if (!hasMatchingPassword) {
      updates.passwordHash = await bcrypt.hash(adminPassword, 10);
    }

    if (Object.keys(updates).length) {
      existingAdmin.set(updates);
      await existingAdmin.save();
      console.log(`Synced admin account for ${adminEmail}`);
    }

    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await User.create({
    name: adminName,
    email: adminEmail,
    passwordHash,
    role: "admin",
  });

  console.log(`Seeded admin account for ${adminEmail}`);
};

const bootstrapCatalog = async () => {
  const trainerCount = await Trainer.countDocuments();
  const classCount = await GymClass.countDocuments();

  if (trainerCount === 0) {
    await Trainer.insertMany(defaultTrainers);
    console.log("Seeded default trainers");
  }

  if (classCount === 0) {
    await GymClass.insertMany(defaultClasses);
    console.log("Seeded default classes");
  }
};

const bootstrapApplicationData = async () => {
  await bootstrapAdmin();
  await bootstrapCatalog();
};

module.exports = {
  bootstrapApplicationData,
};
