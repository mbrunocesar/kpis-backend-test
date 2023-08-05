import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateRequestDto } from '@shared/base-repository/helpers/paginate-helper/dto/paginate-request.dto';
import { IPaginate } from '@shared/base-repository/helpers/paginate-helper/i-paginate';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { LinkUsersDto } from '../dto/link-users.dto';
import { PeriodicQueryDto } from '../dto/periodic-query.dto';
import { User } from '../entities/user.entity';
import { IUsersRepository } from '../repositories/i-users-repository';

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

  async loginAsManager(user_id: number) : Promise<User> {
    const validPositions = ['Director', 'Supervisor', 'Engineer'];
    const user = await this.usersRepository.findOne(user_id, validPositions);

    return user;
  }

  async getEmployees(loginDto: LoginDto, validPositions?: string[]) {
    const user = await this.usersRepository.findLogin(loginDto, validPositions, ['employees']);

    if (!user) {
      return { error: 'unauthorized' };
    }
    return user;
  }

  async getLeaders(loginDto: LoginDto) {
    const user = await this.usersRepository.findLogin(loginDto, null, ['leaders', 'leaders_relationship']);

    if (!user) {
      return { error: 'unauthorized' };
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    if (createUserDto.leader_email) {
      const leader = await this.login({ email: createUserDto.leader_email });
      createUserDto.leader_id = leader.user_id;
    }

    const user = await this.usersRepository.save(createUserDto);
    return { id: user.user_id };
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
    const validPositions = ['Director', 'Supervisor', 'Engineer'];
    const user = await this.loginAsManager(periodicQueryDto.user_id);

    if (user && user.user_id) {
      const userData = await this.fetchUserData(periodicQueryDto);

      const response = this.mapStatistics(userData, periodicQueryDto.number_of_months);

      return response;
    }
    return {};
  }
}
