import { Request, Response } from "express";
import { AppDataSource } from "../dataSource";
import { Permissions } from "../entity/UserPermission";
import {User} from '../entity/User'
const permissionRepository = AppDataSource.getRepository(Permissions);
const userRepository=AppDataSource.getRepository(User)
export class PermissionController {
  async createPermission(req: Request, res: Response) {
    const { permission } = req.body;
    if (permission.length == 0) {
      return res.status(400).json({ message: "Request body cannot be empty" });
    }
    try {
      const permissions = permissionRepository.create({
        permission,
      });
      await permissionRepository.save(permissions);
      return res.status(201).json({
        message: "permission created successfully",
        permissions,
      });
    } catch (error) {
      return res.status(500).json({
        message: "error creating permission",
      });
    }
  }
  async getPermissionlist(req: Request, res: Response) {
    const permissions = await permissionRepository.find();
    return res.json({
      data: permissions,
    });
  }

  async updateUserPermission(req: Request, res: Response) {
    try {
      const { userid,permissions } = req.body;
      if(!userid){
        return res.status(400).json({message:"userid is required"})
      }
      const user = await userRepository.findOneBy({ id: userid });
      if(!user){
        return res.status(400).json({message:"user not found .."})
      }
      if(permissions!==undefined ){
        user.permissions=permissions;
      }
      await userRepository.save(user)
      return res.status(200).json({message:"Permissions added for user",user})
    }
     catch (err) {
      return res.status(500).json({message:"unable to assign permissions"})
     }
  }
}
