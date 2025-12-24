import dotenv from "dotenv";
dotenv.config();   // ✅ MUST be first

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/userRoutes";
import allUsersRoutes from "./routes/allUsersRoutes";
import spendRoutes from "./routes/spendRoutes";
import announcementRoutes from "./routes/announcementsRoutes";
import reactionRoutes from "./routes/ReactionRoutes";
import commentRoutes from "./routes/commentRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import leave from "./routes/leave";
import permissionRoutes from './routes/permissionRoutes'
import "reflect-metadata";
import { AppDataSource } from "./dataSource";

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin:  ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}))

app.use("/user", userRoutes);
app.use("/user",allUsersRoutes)
app.use("/users", spendRoutes);
app.use("/announcements",announcementRoutes)
app.use(commentRoutes)
app.use(reactionRoutes)
app.use("/dashboard",dashboardRoutes)
app.use('/leaves',leave)
app.use('/permission',permissionRoutes)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
  