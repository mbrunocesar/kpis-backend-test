import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkUsersDto {
  @ApiProperty({ description: 'The user id from the leader.' })
  employee_id: number;

  @ApiProperty({ description: 'The user id from the employee.' })
  leader_id: number;
}
