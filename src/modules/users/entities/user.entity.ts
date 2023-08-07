import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  OneToOne,
  OneToMany,
  ManyToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRelationship } from './user-relationship.entity';

@Entity({ name: 'Users' })
export class User {
  constructor(createUserDto?: CreateUserDto) {
    if (createUserDto) {
      this.name = createUserDto.name;
      this.email = createUserDto.email;
      this.position = createUserDto.position;
      this.leader_email = createUserDto.leader_email;
      this.leader_id = createUserDto.leader_id;
      this.admitted_at = createUserDto.admitted_at && createUserDto.admitted_at != ""
        ? createUserDto.admitted_at
        : null;
      this.rescinded_at = createUserDto.rescinded_at && createUserDto.rescinded_at != ""
        ? createUserDto.rescinded_at
        : null;

      if (this.rescinded_at) {
        this.status = false;
      }
    }
  }

  @PrimaryGeneratedColumn('increment')
  user_id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  leader_email: string;

  @Column({ type: 'varchar' })
  position: string;

  @Column('bool')
  status: boolean;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'datetime' })
  admitted_at: string;

  @Column({ type: 'datetime' })
  rescinded_at: string;

  @Column({ type: 'int' })
  leader_id: number;

  @OneToOne(() => User, (user) => user.user_id)
  @JoinColumn({ name: 'leader_id' })
  direct_leader: User;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'UsersRelationship',
    joinColumn: {
      name: 'employee_id',
      referencedColumnName: 'user_id',
    },
    inverseJoinColumn: {
      name: 'leader_id',
      referencedColumnName: 'user_id',
    },
  })
  leaders: User[];

  @OneToMany(() => UserRelationship, (userRelationship) => userRelationship.user)
  leaders_relationship: UserRelationship[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'UsersRelationship',
    joinColumn: {
      name: 'leader_id',
      referencedColumnName: 'user_id',
    },
    inverseJoinColumn: {
      name: 'employee_id',
      referencedColumnName: 'user_id',
    },
  })
  employees: User[];
}
