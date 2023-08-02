import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginateRequestDto {
  @ApiProperty({ description: 'Page to get data.' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page: number;

  @ApiProperty({ description: 'Total items per page.' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  count: number;
}
