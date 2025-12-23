import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";

const ACCESS_SECRET = process.env.ACCESS_SECRET as string;
console.log("AS", ACCESS_SECRET);

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}
export const authMiddleware = (req:Request,res: Response,next: NextFunction)=>{
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
