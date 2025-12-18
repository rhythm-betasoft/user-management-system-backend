import { Request, Response } from "express";
import { AppDataSource } from "../dataSource";
import { Comment } from "../entity/Comment";
import { User } from "../entity/User";
import { Announcement } from "../entity/Announcement";

const commentRepository = AppDataSource.getRepository(Comment);
const userRepository = AppDataSource.getRepository(User);
const announcementRepository = AppDataSource.getRepository(Announcement);

export class CommentController {
 async createComment(req: Request, res: Response) {
  const { content, userId, announcementId } = req.body;

  const user = await userRepository.findOneBy({ id: userId });
  const announcement = await announcementRepository.findOneBy({ id: announcementId });

  if (!user || !announcement) {
    return res.status(404).json({ message: "User or Announcement not found" });
  }

  const comment = commentRepository.create({ content, author: user, announcement });
  await commentRepository.save(comment);

  return res.status(201).json({
    message: "Comment created successfully",
    comment: {
      id: comment.id,
      content: comment.content,
      author: { id: user.id, name: user.name },
      announcementId: announcement.id,
      createdAt: comment.createdAt
    }
  });
}

async getComments(req: Request, res: Response) {
  const { announcementId } = req.params;
  const comments = await commentRepository.find({
    where: { announcement: { id: Number(announcementId) } },
    relations: ["author"],
  });
  const formatted = comments.map(c => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt,
    author: {
      id: c.author.id,
      name: c.author.name
    }
  }));

  return res.json(formatted);
}

}