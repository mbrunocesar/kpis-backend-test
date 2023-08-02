import { Controller, Get, Post, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { LinkUsersDto } from '../dto/link-users.dto';
import { PeriodicQueryDto } from '../dto/periodic-query.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/login')
  login(@Query() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @Get('/employees')
  getEmployees(@Query() loginDto: LoginDto) {
    return this.usersService.getEmployees(loginDto);
  }

  @Get('/leaders')
  getLeaders(@Query() loginDto: LoginDto) {
    return this.usersService.getLeaders(loginDto);
  }

  @Post('/create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('/get-statistics')
  getStatistics(@Query() periodicQueryDto: PeriodicQueryDto) {
    return this.usersService.getStatistics(periodicQueryDto);
  }
}
