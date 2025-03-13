import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("whitelist")
export class Whitelist {
  @PrimaryColumn()
  phone_number: string;

  @Column("numeric")
  max_limit: number;

  @Column({ nullable: true })
  industry: string;

  @Column("numeric")
  min_amount: number;

  @Column("numeric")
  max_amount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
