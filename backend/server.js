import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import authRoutes from "./routes/authRoutes.js";
import { protect, allowRoles } from "./middleware/authMiddleware.js";
import { formatIndianTime } from "./utils/dateUtils.js";
import studentProfileRoutes from "./routes/studentProfileRoutes.js";
import GatePassRequest from "./models/GatePassRequest.js";
import gatePassRoutes from "./routes/gatePassRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";



dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/student-profiles", studentProfileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/gate-passes", gatePassRoutes);
app.use("/api/audit-logs", auditRoutes); 
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.send("Smart Hostel Gate Pass backend is running");
});

const PORT = process.env.PORT || 5000;

app.get("/test-user-model", (req, res) => {
  res.json({
    message: "User model is ready",
    modelName: User.modelName
  });
});



app.get("/api/test/profile", protect, (req, res) => {
  res.json({
    message: "Protected profile route",
    user: req.user
  });
});

app.get(
  "/api/test/warden-only",
  protect,
  allowRoles("warden", "admin", "superadmin"),
  (req, res) => {
    res.json({
      message: "Welcome warden/admin/superadmin",
      userRole: req.user.role
    });
  }
);

app.get("/api/test/gate-pass-model", (req, res) => {
  res.json({
    message: "GatePassRequest model is ready",
    modelName: GatePassRequest.modelName
  });
});




app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});