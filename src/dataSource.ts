import "reflect-metadata"
import { DataSource } from "typeorm";
import {User} from './entity/User';
import { Spend } from "./entity/Spend";
import {Announcement} from './entity/Announcement'
import {Comment} from './entity/Comment'
import { Reaction } from "./entity/Reaction";
import {LeaveDetails} from './entity/leaveDetails'
import {Permissions} from './entity/UserPermission'
import * as dotenv from "dotenv"
dotenv.config();  
export const AppDataSource = new DataSource({
  type: "mysql", 
   host: process.env.HOST || "127.0.0.1",
  port: 3306,
  username: process.env.USER,
  password: process.env.PASS,
  database: process.env.DATABASE,
  entities: [User,Spend,Announcement,Comment,Reaction,LeaveDetails,Permissions],
  synchronize: false,
  migrations:["src/migrations/*.ts"], 
  logging: true,

});
