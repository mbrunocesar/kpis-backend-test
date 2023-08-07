import { Controller, Get, Post, Param, Body, UseGuards, Query } from '@nestjs/common';
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
    return this.usersService.loginAsManager(loginDto);
  }

  @Get('/employees')
  getEmployees(@Query() loginDto: LoginDto) {
    return this.usersService.getEmployees(loginDto.email);
  }

  @Get('/leaders')
  getLeaders(@Query() loginDto: LoginDto) {
    return this.usersService.getLeaders(loginDto.email);
  }

  @Post('/create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('/link-users')
  linkUsers(@Body() linkUsersDto: LinkUsersDto) {
    return this.usersService.linkUsers(linkUsersDto);
  }

  @Get('/get-statistics')
  getStatistics(@Query() periodicQueryDto: PeriodicQueryDto) {
    return this.usersService.getStatistics(periodicQueryDto);
  }
}
