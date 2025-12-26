import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { User } from '../entity/User';
  
  @Entity() 
  export class Attendance {
    @PrimaryGeneratedColumn()
    id!: number; 
  
    @Column({ type: 'int' })
    year!: number;
  
    @Column({ type: 'int' })
    month!: number;
  
    @Column({ type: 'json', nullable: true })
    data: Record<string, string> = {};
    @ManyToOne(() => User, (user) => user.attendance, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;
  
    @CreateDateColumn({ type: 'datetime' })
    created_at!: Date;
  
    @UpdateDateColumn({ type: 'datetime' })
    updated_at!: Date;
  }
  