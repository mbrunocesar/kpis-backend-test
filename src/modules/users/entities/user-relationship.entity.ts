import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'UsersRelationship' })
export class UserRelationship {
  constructor() {}

  @PrimaryGeneratedColumn('increment')
  relationship_id: number;

  @Column({ type: 'int' })
  employee_id: number;

  @Column({ type: 'int' })
  leader_id: number;

  @Column({ type: 'int' })
  directness_level: number;

  @ManyToOne(() => User, (user) => user.user_id)
  @JoinColumn({ name: 'employee_id' })
  user: User;
}
