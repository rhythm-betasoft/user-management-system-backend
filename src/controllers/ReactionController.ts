import { Request, Response } from "express";
import { AppDataSource } from "../dataSource";
import { Reaction } from "../entity/Reaction";
import { Announcement } from "../entity/Announcement";
import { User } from "../entity/User";

const reactionRepository = AppDataSource.getRepository(Reaction);
const announcementRepository = AppDataSource.getRepository(Announcement);
const userRepository = AppDataSource.getRepository(User);


const arr = ["like", "love", "laugh", "wow", "sad", "clap"];

export class ReactionController {
  async addOrToggle(req: Request, res: Response) {
    const { announcementId, userId, type } = req.body;

    if (!arr.includes(type)) {
      return res.status(400).json("Invalid reaction type");
    }

    const user = await userRepository.findOneBy({ id: userId });
    const announcement = await announcementRepository.findOneBy({ id: announcementId });

    if (!user || !announcement) {
      return res.status(404).json("User or Announcement not found");
    }

   
    const existing = await reactionRepository.findOne({
      where: { user: { id: userId }, announcement: { id: announcementId }, type },
    });

    if (existing) {
      await reactionRepository.remove(existing);
      return res.status(200).json({ message: "Reaction removed" });
    }

    const reaction = reactionRepository.create({ type, user, announcement });
    await reactionRepository.save(reaction);
    return res.status(201).json(reaction);
  }

  async listForAnnouncement(req: Request, res: Response) {
    const { announcementId } = req.params;
    const reactions = await reactionRepository.find({
      where: { announcement: { id: Number(announcementId) } },
      relations: ["user"], 
    });
    return res.json(reactions);
  }
}
