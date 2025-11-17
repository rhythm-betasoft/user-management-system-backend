import {Entity,PrimaryGeneratedColumn,Column,ManyToOne,Unique} from 'typeorm'
import {User} from './User'
import { Announcement } from './Announcement'

@Entity()
@Unique(["user","announcement","type"])
export class Reaction{
    @PrimaryGeneratedColumn()
    id! :number;

     @Column({ type: "varchar", length: 32 })
  type!: string; 

  @ManyToOne(() => User, (user) => user.reactions, { eager: true, onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Announcement, (announcement) => announcement.reactions, { onDelete: "CASCADE" })
  announcement!: Announcement;
}