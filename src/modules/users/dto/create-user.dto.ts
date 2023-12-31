import { IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'The user name.' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The user email.' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The leader email.' })
  @IsOptional()
  leader_email: string;

  @ApiProperty({ description: 'The user position.' })
  @IsNotEmpty()
  position: string;

  leader_id: number;

  admitted_at: string;

  rescinded_at: string;
}
