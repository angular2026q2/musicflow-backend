import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Current Recovery access token from email link.',
  })
  @IsString()
  access_token: string;

  @ApiProperty({ description: 'Refresh token from email link.' })
  @IsString()
  refresh_token: string;

  @ApiProperty({ example: 'NewStrongPassword123!', minLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  new_password: string;
}
