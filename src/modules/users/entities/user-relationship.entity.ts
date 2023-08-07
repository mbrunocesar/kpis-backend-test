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
  constructor(params?: any) {
    if (params) {
      this.leader_id = params.leader_id;
      this.employee_id = params.employee_id;
      this.directness_level = params.directness_level;
    }
  }

  @PrimaryGeneratedColumn('increment')
  relationship_id: number;

  @Column({ type: 'int' })
  leader_id: number;

  @Column({ type: 'int' })
  employee_id: number;

  @Column({ type: 'int' })
  directness_level: number;

  @ManyToOne(() => User, (user) => user.user_id)
  @JoinColumn({ name: 'employee_id' })
  user: User;
}
