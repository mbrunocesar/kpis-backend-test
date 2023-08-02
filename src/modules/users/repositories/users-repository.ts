import { InjectConnection } from '@nestjs/typeorm';
import { BaseRepository } from '@shared/base-repository/base-repository';
import { IFindManyOptions } from '@shared/base-repository/helpers/paginate-helper/i-paginate';
import { IUsersRepository } from './i-users-repository';
import { Connection, In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRelationship } from '../entities/user-relationship.entity';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { PeriodicQueryDto } from '../dto/periodic-query.dto';

export class UsersRepository
  extends BaseRepository<User>
  implements IUsersRepository
{
  private usersRepository: Repository<User>;

  constructor(@InjectConnection() connection: Connection) {
    super();

    this.usersRepository = connection.getRepository(User);
  }

  create(createUserDto: CreateUserDto): User {
    return this.usersRepository.create(createUserDto);
  }

  save(user: User | CreateUserDto): Promise<User> {
    return this.usersRepository.save(user);
  }

  findAndCount(options?: IFindManyOptions): Promise<[User[], number]> {
    return this.usersRepository.findAndCount(options);
  }

  findOne(user_id: number, validPositions?: string[], relations?: string[]): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        user_id: user_id,
        status: true,
        position: validPositions ? In(validPositions) : null
      },
      relations
    });
  }

  findLogin(loginDto: LoginDto, validPositions?: string[], relations?: string[]): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        email: loginDto.email,
        status: true,
        position: validPositions ? In(validPositions) : null
      },
      relations
    });
  }

  getUsersArrivedBeforePeriod(periodicQueryDto: PeriodicQueryDto) {
    const userQuery = this.usersRepository.createQueryBuilder("user");
    const users = userQuery
      .select("COUNT(user.user_id) as total")
      .where(
        "(rescinded_at IS NULL OR rescinded_at > CURRENT_DATE() - INTERVAL :date MONTH) AND " +
        "(admitted_at < CURRENT_DATE() - INTERVAL :date MONTH) AND " +
        "user_id IN " + userQuery.subQuery().
          select("relationship.employee_id")
          .from(UserRelationship, "relationship")
          .where("relationship.leader_id = :leader_id")
          .getQuery())
      .setParameter("leader_id", periodicQueryDto.user_id)
      .setParameter("date", periodicQueryDto.number_of_months)
      .getRawOne();

    return users;
  }

  getUsersArrivingInPeriod(periodicQueryDto: PeriodicQueryDto) {
    const userQuery = this.usersRepository.createQueryBuilder("user");
    const users = userQuery
      .select(
        "COUNT(user.user_id) as total,"+
        "TIMESTAMPDIFF(MONTH, admitted_at, NOW()) as distance_in_months"
      )
      .where(
        "(admitted_at > CURRENT_DATE() - INTERVAL :date MONTH) AND " +
        "user_id IN " + userQuery.subQuery().
          select("relationship.employee_id")
          .from(UserRelationship, "relationship")
          .where("relationship.leader_id = :leader_id")
          .getQuery())
      .setParameter("leader_id", periodicQueryDto.user_id)
      .setParameter("date", periodicQueryDto.number_of_months)
      .groupBy('MONTH(user.admitted_at), YEAR(user.admitted_at)')
      .getRawMany();

    return users;
  }

  getUsersLeavingInPeriod(periodicQueryDto: PeriodicQueryDto) {
    const userQuery = this.usersRepository.createQueryBuilder("user");
    const users = userQuery
      .select(
        "COUNT(user.user_id) as total,"+
        "TIMESTAMPDIFF(MONTH, rescinded_at, NOW()) as distance_in_months"
      )
      .where(
        "(rescinded_at > CURRENT_DATE() - INTERVAL :date MONTH) AND " +
        "user_id IN " + userQuery.subQuery().
          select("relationship.employee_id")
          .from(UserRelationship, "relationship")
          .where("relationship.leader_id = :leader_id")
          .getQuery())
      .setParameter("leader_id", periodicQueryDto.user_id)
      .setParameter("date", periodicQueryDto.number_of_months)
      .groupBy('MONTH(user.rescinded_at), YEAR(user.rescinded_at)')
      .getRawMany();

    return users;
  }
}
