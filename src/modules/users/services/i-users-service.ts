import { PaginateRequestDto } from '@shared/base-repository/helpers/paginate-helper/dto/paginate-request.dto';
import { IPaginate } from '@shared/base-repository/helpers/paginate-helper/i-paginate';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { LinkUsersDto } from '../dto/link-users.dto';

import { User } from '../entities/user.entity';

export interface IUsersService {
  create(createUserDto: CreateUserDto): Promise<{ id: number }>;

  login(loginDto: LoginDto): Promise<User>;
}
