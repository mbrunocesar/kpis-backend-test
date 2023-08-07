import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateRequestDto } from '@shared/base-repository/helpers/paginate-helper/dto/paginate-request.dto';
import { IPaginate } from '@shared/base-repository/helpers/paginate-helper/i-paginate';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { LinkUsersDto } from '../dto/link-users.dto';
import { PeriodicQueryDto } from '../dto/periodic-query.dto';
import { User } from '../entities/user.entity';
import { UserRelationship } from '../entities/user-relationship.entity';
import { IUsersRepository } from '../repositories/i-users-repository';

const validPositions = ['Diretor', 'Supervisor', 'Engenheiro'];

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: IUsersRepository
  ) {}

  async login(loginDto: LoginDto) : Promise<User | { user_id, error }> {
    const user = await this.usersRepository.findLogin(loginDto);

    return user;
  }

  async loginAsManager(loginDto: LoginDto) : Promise<User> {
    const user = await this.usersRepository.findLogin(loginDto, validPositions);

    return user;
  }

  async loginAsManagerById(user_id: number) : Promise<User> {
    const user = await this.usersRepository.findOne(user_id, validPositions);

    return user;
  }

  async getEmployees(email: string, validPositions?: string[]) {
    const user = await this.usersRepository.findByEmail(email, validPositions, ['employees']);

    return user;
  }

  async getLeaders(email: string) {
    const user = await this.usersRepository.findByEmail(email, null, ['leaders', 'leaders_relationship']);

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const user = await this.usersRepository.save(createUserDto);

    if (!user.user_id) {
      return user;
    }

    const userId = { id: user.user_id };

    const linkUsersDto = new LinkUsersDto();
    linkUsersDto.leader_email = createUserDto.leader_email;
    linkUsersDto.employee_email = createUserDto.email;
    const success = await this.linkUsers(linkUsersDto);

    return success ? userId : user;
  }

  async linkUsers(linkUsersDto: LinkUsersDto) : Promise<{ success: boolean }> {
    const leader = await this.usersRepository.findByEmail(
      linkUsersDto.leader_email,
      validPositions,
      ['leaders', 'leaders_relationship']);
    const employee = await this.usersRepository.findByEmail(
      linkUsersDto.employee_email,
      null,
      ['leaders_relationship']);

    if (!employee.user_id || !leader.user_id) {
      return { success: false };
    }

    employee.leader_id = leader.user_id;
    employee.leader_email = leader.email;
    const result = await this.usersRepository.save(employee);

    // inherit leaders relationship
    const leaders_relationship = leader.leaders_relationship;
    for (const relationship of leaders_relationship) {
      delete relationship.relationship_id;
      delete relationship.user;
      relationship.employee_id = employee.user_id;
      relationship.directness_level = relationship.directness_level + 1;

      await this.usersRepository.saveRelationship(relationship);
    }

    // link to direct leader
    const newRelationShip = new UserRelationship({
      employee_id: employee.user_id,
      leader_id: leader.user_id,
      directness_level: 1
    });
    await this.usersRepository.saveRelationship(newRelationShip);

    return { success : !!result.user_id };
  }

  async fetchUserData(periodicQueryDto: PeriodicQueryDto) {
    const usersArrivingBefore = await this.usersRepository.getUsersArrivedBeforePeriod(periodicQueryDto);
    const usersArrivingAfter = await this.usersRepository.getUsersArrivingInPeriod(periodicQueryDto);
    const usersLeavingAfter = await this.usersRepository.getUsersLeavingInPeriod(periodicQueryDto);

    return { usersArrivingBefore, usersArrivingAfter, usersLeavingAfter };
  }

  mapStatistics(userData: any, number_of_months: number) {
    const response = {
      headcounts: null,
      turnovers: null,
    };

    let buffer_entry = {};
      for (const userBlock of userData.usersArrivingAfter) {
        buffer_entry[userBlock.distance_in_months] = parseInt(userBlock.total);
      }

      let buffer_exit = {};
      for (const userBlock of userData.usersLeavingAfter) {
        buffer_exit[userBlock.distance_in_months] = parseInt(userBlock.total);
      }

      let headcounts = [];
      let turnovers = [];

      let totalByNow = userData.usersArrivingBefore.total;
      for (let index = number_of_months - 1; index >= 0; index--) {
        if (buffer_entry[index]) {
          totalByNow = parseInt(totalByNow) + parseInt(buffer_entry[index]);
        }

        let turnover = 0;;
        if (buffer_exit[index]) {
          turnover = parseInt(buffer_exit[index]) / totalByNow * 100;
        
          totalByNow = parseInt(totalByNow) - parseInt(buffer_exit[index]);
        }
        
        turnovers.push({ month: index, value: turnover });
        headcounts.push({ month: index, value: parseInt(totalByNow) });
      }
      response.headcounts = headcounts;
      response.turnovers = turnovers;

      return response;
  }

  async getStatistics(periodicQueryDto: PeriodicQueryDto) {
    const user = await this.loginAsManagerById(periodicQueryDto.user_id);

    if (user && user.user_id) {
      const userData = await this.fetchUserData(periodicQueryDto);

      const response = this.mapStatistics(userData, periodicQueryDto.number_of_months);

      return response;
    }
    return {};
  }
}
