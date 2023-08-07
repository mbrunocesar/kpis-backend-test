import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkUsersDto {
  @ApiProperty({ description: 'The user email from the leader.' })
  employee_email: string;

  @ApiProperty({ description: 'The user email from the employee.' })
  leader_email: string;
}
