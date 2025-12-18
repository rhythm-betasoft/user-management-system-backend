import { Request, Response } from "express";
import { AppDataSource } from "../dataSource";
import { Announcement } from "../entity/Announcement";
import { User } from "../entity/User";
import { LessThanOrEqual, MoreThanOrEqual, Between } from "typeorm";
const announcementRepository = AppDataSource.getRepository(Announcement);
const userRepository = AppDataSource.getRepository(User);
export class DashboardController {
  async getDashboardCards(req: Request, res: Response) {
    try {
      const usersCount = await userRepository.count();
      const announcementsCount = await announcementRepository.count();
      const maleCount = await userRepository.count({ where: { gender: "male" } });
      const femaleCount = await userRepository.count({ where: { gender: "female" } });
   
      return res.status(200).json({
        usersCount,
        announcementsCount,
        maleCount,
        femaleCount,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error Fetching Cards data" });
    }
  }
 async getAgeCount(req:Request,res:Response){
    try{
      const juniors = await userRepository.count({ where: { age: LessThanOrEqual(25) } });
      const seniors = await userRepository.count({ where: { age: Between(26, 39) } });
      const superSeniors = await userRepository.count({ where: { age: MoreThanOrEqual(40) } });
      return res.status(200).json({
        ageDistribution: { juniors, seniors, superSeniors },
      })
    }
    catch(error){
        return res.status(500).json({ message: "Error Fetching Age data" });
    }
  }
async getBloodGroupCount(req: Request, res: Response) {
    try {
        const bloodGroups = await userRepository
            .createQueryBuilder("user")
            .select("user.blood_group", "blood_group")
            .addSelect("COUNT(user.id)", "count")
            .groupBy("user.blood_group")
            .getRawMany();
        const formattedBloodGroups = bloodGroups.map(bg => {
            let groupName = bg.blood_group;
            if (groupName === '' || groupName === null || groupName === undefined) {
                groupName = 'Unknown';
            }
            
            return {
                blood_group: groupName,
                count: Number(bg.count),
            };
        });
        return res.status(200).json(formattedBloodGroups); 

    } catch (error) {
        return res.status(500).json({ message: "Error Fetching BloodGroup data" });
    }
}
}