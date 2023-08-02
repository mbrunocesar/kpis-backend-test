import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateRequestDto } from '@shared/base-repository/helpers/paginate-helper/dto/paginate-request.dto';
import { IPaginate } from '@shared/base-repository/helpers/paginate-helper/i-paginate';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { LinkUsersDto } from '../dto/link-users.dto';
import { PeriodicQueryDto } from '../dto/periodic-query.dto';
import { User } from '../entities/user.entity';
import { IUsersRepository } from '../repositories/i-users-repository';
import { hash, compare } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: IUsersRepository,

    private jwtService: JwtService,
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

  async getStatistics(periodicQueryDto: PeriodicQueryDto) {
    const validPositions = ['Director', 'Supervisor', 'Engineer'];
    const user = await this.loginAsManager(periodicQueryDto.user_id);

    const response = {
      headcounts: null,
      turnovers: null,
    };

    if (user && user.user_id) {
      const usersArrivingBefore = await this.usersRepository.getUsersArrivedBeforePeriod(periodicQueryDto);
      const usersArrivingAfter = await this.usersRepository.getUsersArrivingInPeriod(periodicQueryDto);
      const usersLeavingAfter = await this.usersRepository.getUsersLeavingInPeriod(periodicQueryDto);

      let buffer_entry = {};
      for (const userBlock of usersArrivingAfter) {
        buffer_entry[userBlock.distance_in_months] = parseInt(userBlock.total);
      }

      let buffer_exit = {};
      for (const userBlock of usersLeavingAfter) {
        buffer_exit[userBlock.distance_in_months] = parseInt(userBlock.total);
      }

      let headcounts = {};
      let turnovers = {};

      let totalByNow = usersArrivingBefore.total;
      for (let index = periodicQueryDto.number_of_months - 1; index >= 0; index--) {
        if (buffer_entry[index]) {
          totalByNow = parseInt(totalByNow) + parseInt(buffer_entry[index]);
        }

        if (buffer_exit[index]) {
          turnovers[index] = parseInt(buffer_exit[index]) / totalByNow * 100;
          totalByNow = parseInt(totalByNow) - parseInt(buffer_exit[index]);
        } else {
          turnovers[index] = 0;
        }
        headcounts[index] = parseInt(totalByNow);
      }
      response.headcounts = {...headcounts};
      response.turnovers = {...turnovers};

      return response;
    }
    return {};
  }
}
