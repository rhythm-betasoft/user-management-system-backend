import { Request, Response } from "express";
import { AppDataSource } from "../dataSource";
import { Announcement } from "../entity/Announcement";
import { User } from "../entity/User";

const announcementRepository = AppDataSource.getRepository(Announcement);
const userRepository = AppDataSource.getRepository(User);

export class AnnouncementController {
  async createAnnouncement(req: Request, res: Response) {
  const { title, content, userId } = req.body;
  try {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins are allowed to share announcements"
      });
    }
    const announcement = announcementRepository.create({
      title,
      content,
      author: user,
    });
    await announcementRepository.save(announcement);
    return res.status(201).json({
      message: "Announcement created successfully",
      announcement
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while creating announcement"
    });
  }
}

 async getAllAnnouncements(req: Request, res: Response) {
  try {
    const skip = req.query.skip ? JSON.parse(req.query.skip as string) : 0;
    const take = req.query.take ? JSON.parse(req.query.take as string) : 10;
    const sort = req.query.sort ? JSON.parse(req.query.sort as string) : [];
    const filter = req.query.filter ? JSON.parse(req.query.filter as string) : [];

    const query = announcementRepository
      .createQueryBuilder("announcement")
      .leftJoinAndSelect("announcement.author", "author");
    if (Array.isArray(filter) && filter.length > 0) {
      filter.forEach(([field, operator, value], index) => {
        const paramKey = `value${index}`;
        if (operator === "=") {
          if (index === 0) {
            query.where(`announcement.${field} = :${paramKey}`, { [paramKey]: value });
          } else {
            query.andWhere(`announcement.${field} = :${paramKey}`, { [paramKey]: value });
          }
        } else if (operator === "contains") {
          if (index === 0) {
            query.where(`announcement.${field} LIKE :${paramKey}`, { [paramKey]: `%${value}%` });
          } else {
            query.andWhere(`announcement.${field} LIKE :${paramKey}`, { [paramKey]: `%${value}%` });
          }
        }
      });
    }

    // Apply sort
    if (Array.isArray(sort) && sort.length > 0) {
      sort.forEach(({ selector, desc }) => {
        const order = desc ? "DESC" : "ASC";
        query.addOrderBy(`announcement.${selector}`, order);
      });
    }

    // Apply paging
    if (skip !== null && take !== null) {
      query.skip(skip).take(take);
    }

    // Execute query
    const [announcements, total] = await query.getManyAndCount();

    // Format response (no comments)
    const formatted = announcements.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      createdAt: a.createdAt,
      author: {
        id: a.author?.id,
        name: a.author?.name,
      },
      newComment: "", // optional placeholder if still needed
    }));

    return res.json({
      data: formatted,
      totalCount: total,
    });
  } catch (err) {
    console.error("Error fetching announcements:", err);
    res.status(500).json({ message: "Error fetching announcements", error: err });
  }
}


async getAnnouncementById(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const announcement = await announcementRepository.findOne({
      where: { id: Number(id) },
      relations: ["author", "comments", "comments.author"],
    });

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const formatted = {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      createdAt: announcement.createdAt,
      author: {
        id: announcement.author.id,
        name: announcement.author.name,
      },
      comments: announcement.comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        author: {
          id: c.author.id,
          name: c.author.name,
        },
      })),
      newComment: "",
    };

    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async updateAnnouncement(req: Request, res: Response) {
  const { id } = req.params;
  const { title, content } = req.body || {};

  try {
    const announcement = await announcementRepository.findOneBy({ id: Number(id) });
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    if (title) announcement.title = title;
    if (content) announcement.content = content;

    await announcementRepository.save(announcement);

    return res.status(200).json({
      message: "Announcement updated successfully",
      announcement
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error while updating announcement" });
  }
}

async deleteAnnouncement(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const announcement = await announcementRepository.findOneBy({ id: Number(id) });
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    await announcementRepository.remove(announcement);

    return res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error while deleting announcement" });
  }
}



}
