import { Request, Response } from "express";
import { AppDataSource } from "../dataSource";
import { User } from "../entity/User";
import {Spend} from "../entity/Spend"
const userRepository = AppDataSource.getRepository(User);

class AllUsersController {
async getAllUsers(req: Request, res: Response) {
  try {
    const skip = req.query.skip ? JSON.parse(req.query.skip as string) : null;
    const take = req.query.take ? JSON.parse(req.query.take as string) : null;
    const sort = req.query.sort ? JSON.parse(req.query.sort as string) : [];
    const filter = req.query.filter ? JSON.parse(req.query.filter as string) : [];

    const query = userRepository.createQueryBuilder("user").leftJoinAndSelect("user.spends", "spends");
    if (Array.isArray(filter) && filter.length > 0) {
      filter.forEach(([field, operator, value], index) => {
        const paramKey = `value${index}`;
        if (operator === "=") {
          if (index === 0) {
            query.where(`user.${field} = :${paramKey}`, { [paramKey]: value });
          } else {
            query.andWhere(`user.${field} = :${paramKey}`, { [paramKey]: value });
          }
        } else if (operator === "contains") {
          if (index === 0) {
            query.where(`user.${field} LIKE :${paramKey}`, { [paramKey]: `%${value}%` });
          } else {
            query.andWhere(`user.${field} LIKE :${paramKey}`, { [paramKey]: `%${value}%` });
          }
        }
      });
    }
    query.orderBy("user.pinned", "DESC");
    if (Array.isArray(sort) && sort.length > 0) {
      sort.forEach(({ selector, desc }, index) => {
        const order = desc ? "DESC" : "ASC";
       query.addOrderBy(`user.${selector}`, order);

      });
    }
    if (skip !== null && take !== null) {
      query.skip(skip).take(take);
    }

    const [users, total] = await query.getManyAndCount();

    const flattenedUsers = users.map(user => ({
      ...user,
      salary: user.spends?.reduce((sum, spend) => sum + (Number(spend.salary) || 0), 0) ?? 0,
    }));

    const totalSalary = await userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.spends", "spends") 
      .select("SUM(spends.salary)", "totalSalary")
      .getRawOne();

    return res.json({
      data: flattenedUsers,
      totalCount: total,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users", error: err });
  }
}

async deleteUser(req:Request,res:Response){
const {id}=req.params;
try{
    const resp=await userRepository.delete(id);
    return res.status(200).json({message:"USED HAS BEEN DELETED"})
}
catch(err){
    return res.status(500).json("error deleting")
}
}

async editUser(req: Request, res: Response) {
  const { id } = req.params;
  const fields = req.body;

  if (!Object.keys(fields).length) {
    return res.status(400).json({ message: "No fields to update" });
  }

  try {
    const user = await userRepository.findOneBy({ id: Number(id) });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await userRepository.save({ ...user, ...fields });

    return res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err: any) {
    console.error("Error updating user:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
}
async   togglePin(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const user = await userRepository.findOneBy({ id: Number(id) });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.pinned = !user.pinned;
    await userRepository.save(user);

    return res.status(200).json({
      message: `User ${user.pinned ? "pinned" : "unpinned"} successfully`,
      data: user,
    });
  } catch (err:any) {
    console.error("Error toggling pin:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}
async getReligionCounts(req: Request, res: Response) {
  try {
    const religionCounts = await userRepository
      .createQueryBuilder("user")
      .select("COALESCE(user.religion, 'Unknown') AS religion")
      .addSelect("COUNT(user.religion) AS user_count") 
      .groupBy("religion")
      .getRawMany();
    const formattedReligionCounts = religionCounts.map(item => ({
      religion: item.religion, 
      count: parseInt(item.user_count, 10)
    }));
    return res.json(formattedReligionCounts);
  } catch (err) {
    console.error("Error fetching religion counts:", err);
    return res.status(500).json({ message: "Error fetching religion counts", error: err });
  }
}
}
export default AllUsersController;








