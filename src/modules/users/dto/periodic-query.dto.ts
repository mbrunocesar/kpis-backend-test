import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PeriodicQueryDto {
  @ApiProperty({ description: 'The user id.' })
  user_id: number;

  @ApiProperty({ description: 'The number of months to analyse.' })
  number_of_months: number;
}
