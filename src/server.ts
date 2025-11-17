import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from 'cors'
import userRoutes from "./routes/userRoutes";
import cookieParser from "cookie-parser";
import allUsersRoutes from './routes/allUsersRoutes'
import spendRoutes from "./routes/spendRoutes"
import announcementRoutes from './routes/announcementsRoutes'
import reactionRoutes from './routes/ReactionRoutes'
import commentRoutes from './routes/commentRoutes'
import "reflect-metadata"
import { AppDataSource } from "./dataSource"
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}))

app.use("/users", userRoutes);
app.use(allUsersRoutes)
app.use("/users", spendRoutes);
app.use(announcementRoutes)
app.use(commentRoutes)
app.use(reactionRoutes)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
  