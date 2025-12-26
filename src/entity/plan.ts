import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

import{BillingCycle} from '../constants/enums'
@Entity("plans")
export class Plan {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: "enum", enum: BillingCycle })
  billingCycle!: BillingCycle;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({ type: "json", default: null })
  featureIds!: number[];

   @Column({ type: "varchar", length: 255 })
  stripePriceId!:string

  @CreateDateColumn()
  createdAt!: Date;
}