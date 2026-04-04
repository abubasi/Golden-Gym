require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./server/config/db");
const { bootstrapApplicationData } = require("./server/data/bootstrap");
const publicRoutes = require("./server/routes/publicRoutes");
const adminAuthRoutes = require("./server/routes/adminAuthRoutes");
const adminRoutes = require("./server/routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const publicDir = path.join(__dirname, "public");

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api", publicRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin", adminRoutes);

app.use(express.static(publicDir));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  return res.sendFile(path.join(publicDir, "index.html"));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  if (process.env.NODE_ENV !== "test") {
    console.error(err);
  }

  res.status(statusCode).json({
    message,
  });
});

const startServer = async () => {
  try {
    await connectDB();
    await bootstrapApplicationData();

    app.listen(PORT, () => {
      console.log(`Golden Gym server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the application", error);
    process.exit(1);
  }
};

startServer();
