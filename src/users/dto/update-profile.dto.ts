import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'john_smith', minLength: 3 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  username?: string;

  @ApiPropertyOptional({ example: 'john_smith' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  full_name?: string;
}
