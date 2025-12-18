import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class LeaveDetails {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  leaveType!: string;

  @Column({ type: "varchar", length: 255 })
  leaveDurationType!: string;

  @CreateDateColumn({ type: "datetime" })
  applied_at: Date = new Date();

  @Column({ type: "datetime" })
  startDate!: Date;

  @Column({ type: "datetime", default: null })
  endDate!: Date | null;

  @Column({ type: "varchar", length: 500 })
  reason!: string;

  @Column()
  pendingLeaves!: number;

  @Column({ type: "int", default: 0 })
  status!: number;

  @ManyToOne(() => User, (user) => user.leaves, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;
}
