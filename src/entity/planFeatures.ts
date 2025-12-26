import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("features")
export class Feature {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;
}