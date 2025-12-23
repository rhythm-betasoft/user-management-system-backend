import { Request, Response } from "express";
import { AppDataSource } from "../dataSource";
import { User } from "../entity/User";
import { LeaveDetails } from "../entity/leaveDetails";
import {Status} from '../constants/enums'
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
     const userid = (req as any).user.id;
      console.log(userid)
      const user = await userRepo.findOneBy({ id: userid });
      if (user) {
        const acceptedLeave = await leaveRepo.findOne({
          where: { user: { id: user.id },
           status:Status.APPROVED 
        },
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
          pendingLeaves: 10,
          user,
        });
        if (newLeave) {
          return res.json({ status: true, message: "Leave Applied" });
        }
      }
    } catch (error) {
      return res
        .status(500)
        .json({ status: false, message: "Error applying leave" });
    }
  }
  async showAllLeaves(req: Request, res: Response) {
    try {
      const { skip, take, requireTotalCount } = req.query;

      const usersWithLeaves = await userRepo
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.leaves", "leave")
        .getMany();

      const flattenedLeaves = usersWithLeaves.flatMap((user) =>
        user.leaves.map((leave) => ({
          user_id: user.id,
          username: user.name,
          email: user.email,
          id: leave.id,
          leaveType: leave.leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
          reason: leave.reason,
          status: leave.status,
          leaveDurationType: leave.leaveDurationType,
          applied_at: leave.applied_at,
          pendingLeaves: leave.pendingLeaves,
        }))
      );

      flattenedLeaves.sort(
        (a, b) =>
          new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
      );

      const pendingLeaves = flattenedLeaves.filter(
        (leave) => leave.status === Status.PENDING
      );

      let paginatedLeaves: typeof flattenedLeaves = [];
      if (skip && take) {
        const s = Number(skip);
        const t = Number(take);
        paginatedLeaves = flattenedLeaves.slice(s, s + t);
      } else {
        paginatedLeaves = flattenedLeaves;
      }

      const totalCount =
        requireTotalCount === "true" ? flattenedLeaves.length : undefined;

      return res.json({
        status: true,
        message: "Leaves fetched successfully",
        data: paginatedLeaves,
        pendingLeaves,
        totalCount,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "Error fetching leaves",
      });
    }
  }
  async showUserLeaves(req: Request, res: Response) {
    try {
      const userid = (req as any).user.id;
      console.log(userid)
      const user = await userRepo.findOneBy({ id: userid });
      if (!user) return res.status(404).json({ message: "User not found" });
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }
      const skipNum = Number(req.query.skip) || 0;
      const takeNum = Number(req.query.take) || 10;
      const [leaves, totalCount] = await leaveRepo
        .createQueryBuilder("leave")
        .where("leave.user_id = :id", { id: user.id })
        .orderBy("leave.applied_at", "DESC")
        .skip(skipNum)
        .take(takeNum)
        .getManyAndCount();
      const mappedLeaves = leaves.map((leave) => ({
        id: leave.id,
        leaveType: leave.leaveType,
        leaveDurationType: leave.leaveDurationType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        status: leave.status,
        applied_at: leave.applied_at,
        pendingLeaves: leave.pendingLeaves,
        username: user.name,
        email: user.email,
      }));
      return res.json({ status: true, data: mappedLeaves, totalCount });
    } catch (error: any) {
      return res.status(500).json({ status: false, message: error.message });
    }
  }
  async approveLeaves(req:Request,res:Response){
    try{
      const {leaveId}=req.body
      if(!leaveId){
        return res.status(400).json({status:false,message:"Leave id required"})
      }
      const leave=await leaveRepo.findOne({
        where:{id:leaveId},
      })
      if(!leave){ 
        return res.status(404).json({status:false,message:"Leaves not found"})
      }
      leave.status=Status.APPROVED
      leave.pendingLeaves-=1
      await leaveRepo.save(leave);
      return res.json({ status: true, data: leave,message:"Leave has been approved" });
    }
    catch(error){
      return res.status(500).json({ status: false, message: "Error approving leave", });
    }
  }
  async disapproveLeaves(req:Request,res:Response){
    try{
      const {leaveId,rejectionReason}=req.body
      if(!leaveId){
        return res.status(400).json({ status: false, message: "Leave not found" })
      }
      const leave=await leaveRepo.findOne({
        where:{id:leaveId},
      })
      if(!leave){
        return res.status(404).json({status:false,message:"Leave not found"})
      }
      leave.status=Status.DISAPPROVED
      leave.rejectionReason=rejectionReason
      await leaveRepo.save(leave);
      return res.json({status:true,message:"Disapproved"})
    }
    catch(error){
      return res.status(500).json({status:false,message:"error dissapproving"})
    }
  } 
}
