import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { AppDataSource } from "../dataSource";
import { User } from "../entity/User";
import { LeaveDetails } from "../entity/leaveDetails";
const userRepo = AppDataSource.getRepository(User);
const leaveRepo = AppDataSource.getRepository(LeaveDetails);

export class LeaveController {
  async ApplyLeave(req: Request, res: Response) {
    try {
      const { leaveFormData } = req.body;
      if (!leaveFormData) {
        return res
          .status(400)
          .json({ status: false, message: "no data recieved" });
      }
      const { leaveType, leaveDurationType, startDate, endDate, reason } =
        leaveFormData;
      const authheader = req.headers.authorization;
      console.log("authheader",authheader)
      if (!authheader) {
        return res.json({ message: "Authorization header missing" });
      }
      const token = authheader.split(" ")[1];
      if (!token) {
        return res.json({ message: "Bearer token missing" });
      }
 
      const secret: string | undefined = process.env.ACCESS_SECRET;
 
      if (!secret) {
        return res.json({ message: "Secret key is undefined" });
      }
 
      const decoded: any = jwt.verify(token, secret);
      const userid = decoded.id;
      const user = await userRepo.findOneBy({ id: userid });
 
      if (user) {
        const acceptedLeave = await leaveRepo.findOne({
         where: { user: { id: user.id }, status: 1 },
          order: {
            applied_at: "DESC",
          },
        });
        if (acceptedLeave) {
          const newLeave = await leaveRepo.save({
            leaveType: leaveType,
            leaveDurationType: leaveDurationType,
            startDate: startDate,
            endDate: endDate || startDate,
            reason: reason,
            pendingLeaves: acceptedLeave.pendingLeaves,
            user,
          });
          if (newLeave) {
            return res.json({ status: true, message: "Leave Applied" });
          }
        }
        const newLeave = await leaveRepo.save({
          leaveType: leaveType,
          startDate: startDate,
          endDate: endDate || startDate,
          leaveDurationType: leaveDurationType,
          reason: reason,
          pendingLeaves: 12,
          user,
        });
        if (newLeave) {
          return res.json({ status: true, message: "Leave Applied" });
        }
    }
    } 
    catch (error) { console.error("Error applying leave:", error); return res.status(500).json({ status: false, message: "Error applying leave" }); }
  }
}
