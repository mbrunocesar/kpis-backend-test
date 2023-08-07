import { IBaseRepository } from '@shared/base-repository/i-base-repository';
import { User } from '../entities/user.entity';
import { UserRelationship } from '../entities/user-relationship.entity';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { PeriodicQueryDto } from '../dto/periodic-query.dto';

export interface IUsersRepository extends IBaseRepository<User> {
  create(createUserDto: CreateUserDto): User;

  save(user: User | CreateUserDto): Promise<User>;

  saveRelationship(relationship: UserRelationship): Promise<UserRelationship>;

  findOne(user_id: number, validPositions?: string[], relations?: string[]): Promise<User>;

  findByEmail(email: string, validPositions?: string[], relations?: string[]): Promise<User>;

  findLogin(loginDto: LoginDto, validPositions?: string[], relations?: string[]): Promise<User>;

  getUsersArrivedBeforePeriod(periodicQueryDto: PeriodicQueryDto);

  getUsersArrivingInPeriod(periodicQueryDto: PeriodicQueryDto);

  getUsersLeavingInPeriod(periodicQueryDto: PeriodicQueryDto);
}
