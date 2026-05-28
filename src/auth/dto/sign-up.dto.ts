import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @ApiProperty({ example: 'user@example.io' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPassword123!', minLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  password: string;

  @ApiProperty({ example: 'john_smith', minLength: 3 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(32)
  username: string;

  @ApiPropertyOptional({ example: 'John Smith', minLength: 3 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  full_name?: string | null;
}
